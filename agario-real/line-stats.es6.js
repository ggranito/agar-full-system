const username = "CS6700";
const fs = require('fs');
const _ = require('lodash');
const AgarioClient = require('agario-client'); //Use next line in your scripts
const RL = require('./rl.js'); //reinforcejs
//Load vector utilities
const Vec = require('./vector').Vec;
const line_intersect = require('./vector').line_intersect;
const line_point_intersect = require('./vector').line_point_intersect;
let stats;


//AGAR CLIENT STATE
const client = new AgarioClient('worker'); //create new client and call it "worker" (not nickname)
client.debug = 1; //setting debug to 1 (available 0-5)
let interval_id = 0; //here we will store setInterval's ID
let map; //stupid client doesn't remember map sizes but fires event..........
//
const targetTypes = {
  NONE: 0,
  CELL: 1,
  VIRUS: 2,
  WALL: 3
};
const actionTypes = {
  UP: 0,
  LEFT: 1,
  DOWN: 2,
  RIGHT: 3
};

const sensorCount = 8;
const sensorRange = 500;
const sensors = _.map(_.range(sensorCount), (i, index, all) => {
  const rad = i * ((2 * Math.PI) / all.length);
  return new Vec(Math.cos(rad) * sensorRange, Math.sin(rad) * sensorRange);
});

//REINFORCEJS State
let agent;

//Setup Functions
const agarSetup = () => {
  client.on('lostMyBalls', () => {
      client.log('Died, respawning');
      client.spawn(username);
  });

  client.on('connected', () => { //when we connected to server
      client.log('Connected, spawning');
      client.spawn(username); //spawning new ball
      const getData = () => {
        let mySize = 0;
        for (const b of client.my_balls) {
          mySize += client.balls[b].size;
        }
        fs.writeSync(stats, mySize + "\n");
        client.disconnect(); //spawning new ball
        agarStart();
      }
      setTimeout(getData, 100000);
      interval_id = setInterval(onTick, 100); //we will search for target to eat every 100ms
  });

  client.on('reset', () => { //when client clears everything (connection lost?)
      clearInterval(interval_id);
  });

  client.on('connectionError', (e) => {
      client.log('Connection failed with reason: ' + e);
      client.log('Server address set to: ' + client.server + ' please check if this is correct and working address');
  });

  client.on('mapSizeLoad', (minX, minY, maxX, maxY) => {
    map = {minX, maxX, minY, maxY};
  });
};

const agarStart = () => {
  const srv = "127.0.0.1:443";
  console.log('Connecting to ' + srv);
  client.connect('ws://' + srv); //do not forget to add ws://
};

let prob = 0;
const reinforceSetup = (model) => {
  if (_.isNumber(model)) {
    prob = model;
  }

  const env = {
    getNumStates: () => sensorCount * 3 + 4,
    getMaxNumActions: () => 4
  };

  const spec = {
    alpha: 0.005,
    epsilon: 0.2,
    experience_add_every: 2,
    experience_size: 10000,
    gamma: 0.9,
    learning_steps_per_iteration: 5,
    num_hidden_units: 100,
    tderror_clamp: 1,
    update: "qlearn"
  };

  agent = new RL.DQNAgent(env, spec);
  if (_.isObject(model)) {
    agent.fromJSON(model);
  }
};

// MAIN HELPER FUNCTIONS
const sees = (sensor, position, ball) => {
  const res = line_point_intersect(position, position.add(sensor), new Vec(ball.x, ball.y), ball.size);
  if (_.isObject(res)) {
    return res.up.dist_from(position);
  } else {
    return false;
  }
};

const getCurrentState = () => {
  let myCt = client.my_balls.length;
  if (myCt === 0) {
    return false;
  }
  let myX = 0;
  let myY = 0;
  let mySize = 0;
  for (const b of client.my_balls) {
    const ball = client.balls[b];
    myX += ball.x;
    myY += ball.y;
    mySize += ball.size;
  }
  const me = {
    totalSize: mySize,
    totalBalls: myCt,
    pAvg: new Vec(myX/myCt, myY/myCt)
  };

  const sensorDetections = _.map(sensors, () => {
    return {
      dist: sensorRange,
      targetType: targetTypes.NONE,
      targetSize: -1
    };
  });

  for (const b in client.balls) {
    const ball = client.balls[b];
    if (ball.visible && !ball.mine && !ball.destroyed) {
      for (let i=0; i<sensors.length; i++) {
        const seen = sees(sensors[i], me.pAvg, ball);
        if (_.isNumber(seen) && seen < sensorDetections[i].dist) {
          sensorDetections[i] = {
            dist: seen,
            targetType: ball.virus ? targetTypes.VIRUS : targetTypes.CELL,
            targetSize: ball.size
          };
        }
      }
    }
  }

  //do walls
  for (let i=0; i< sensors.length; i++) {
    const sensor = sensors[i];
    const pos = sensor.add(me.pAvg);
    let wallDist = sensorRange + 1;
    if (pos.x < map.minX) {
      wallDist = Math.min(wallDist, Math.abs(sensorRange * (1 - ((map.minX - pos.x) / sensor.x))));
    }
    if (pos.y < map.minY) {
      wallDist = Math.min(wallDist, Math.abs(sensorRange * (1 - ((map.minY - pos.y) / sensor.y))));
    }
    if (pos.x > map.maxX) {
      wallDist = Math.min(wallDist, Math.abs(sensorRange * (1 - ((pos.x - map.maxX) / sensor.x))));
    }
    if (pos.y > map.maxY) {
      wallDist = Math.min(wallDist, Math.abs(sensorRange * (1 - ((pos.y - map.maxY) / sensor.y))));
    }

    if (wallDist <= sensorDetections[i].dist) {
      sensorDetections[i] = {
        dist: wallDist,
        targetType: targetTypes.WALL,
        targetSize: -1
      };
    }
  }

  return {
    score: client.score,
    me,
    sensorDetections
  };
};

const serialize = (state, velocity) => {
  const me = [state.me.totalSize, state.me.totalBalls, velocity.x, velocity.y];
  const sensors = _.flatten(_.map(state.sensorDetections, (sd) => {
    return [sd.dist, sd.targetType, sd.targetSize];
  }));
  return me.concat(sensors);
};


// MAIN LOOP
let prevScore = null;
let prevPos = null;
let roundsToSkip = 0;
const onTick = () => {
  if (roundsToSkip > 0) {
    roundsToSkip -= 1;
    return;
  }
  const startTime = Date.now();
  const state = getCurrentState();
  if (!_.isObject(state)) {
    if (_.isNumber(prevScore)) {
      console.log("---------------Dead, reward: " + (-prevScore) + "--------------");
      agent.learn(-prevScore);
      //clear experience
      agent.exp = []; // experience
      agent.expi = 0; // where to insert
      agent.t = 0;
    }
    prevScore = null;
    return;
  }
  const reward = _.isNumber(prevScore) ? state.score - prevScore : null;
  if (_.isNumber(reward)) {
    //agent.learn(reward);
  }

  const velocity = _.isObject(prevPos) ? new Vec(state.me.pAvg.x - prevPos.x, state.me.pAvg.y - prevPos.x) : new Vec(0,0);
  const prevPos = state.me.pAvg;
  let action;
  let xPot = 0;
  let yPot = 0;
  _.forEach(state.sensorDetections, (sd, i) => {
    const s = sensors[i].normalizeClone();
    if (sd.targetType === targetTypes.CELL) {
      if (sd.targetSize < state.me.size) {
        xPot += sd.targetSize/(sd.dist * sd.dist) * s.x;
        yPot += sd.targetSize/(sd.dist * sd.dist) * s.y;
      } else {
        xPot -= sd.targetSize/(sd.dist * sd.dist) * s.x;
        yPot -= sd.targetSize/(sd.dist * sd.dist) * s.y;
      }
    } else if (sd.targetType === targetTypes.VIRUS && sd.targetSize + 50 < state.me.totalSize && state.me.totalBalls === 1) {
        xPot -= sd.targetSize/(sd.dist * sd.dist) * s.x;
        yPot -= sd.targetSize/(sd.dist * sd.dist) * s.y;
    }
  });
  let wDist = state.me.pAvg.x - map.minX;
  if (wDist < 500) {
    xPot -= 5/(wDist * wDist);
  }
  wDist = map.maxX - state.me.pAvg.x;
  if (wDist < 500) {
    xPot += 5/(wDist * wDist);
  }

  wDist = state.me.pAvg.y - map.minY;
  if (wDist < 500) {
    yPot -= 5/(wDist * wDist);
  }
  wDist = map.maxY - state.me.pAvg.y;
  if (wDist < 500) {
    yPot += 30/(wDist * wDist);
  }

  if (Math.abs(xPot) > Math.abs(yPot)) {
    if (xPot > 0) {
      action = actionTypes.LEFT;
    } else {
      action = actionTypes.RIGHT;
    }
  } else {
    if (yPot > 0) {
      action = actionTypes.DOWN;
    } else {
      action = actionTypes.UP;
    }
  }
  let moveTo;
  if (Math.abs(xPot) < 0.0001 && Math.abs(yPot) < 0.0001) {
    roundsToSkip = 10;
    action = 3 - Math.floor(Math.random() * 4);
  }

  if (Math.random() > prob) {
    action = 3 - Math.floor(Math.random() * 4);
    roundsToSkip = 0;
  }

  //const action = agent.act(serialize(state, velocity));
  if (action === actionTypes.UP) {
    moveTo = new Vec(state.me.pAvg.x, state.me.pAvg.y + 500);
  } else if (action === actionTypes.RIGHT) {
    moveTo = new Vec(state.me.pAvg.x + 500, state.me.pAvg.y);
  } else if (action === actionTypes.DOWN) {
    moveTo = new Vec(state.me.pAvg.x, state.me.pAvg.y - 500);
  } else if (action === actionTypes.LEFT) {
    moveTo = new Vec(state.me.pAvg.x - 500, state.me.pAvg.y);
  }
  client.moveTo(moveTo.x, moveTo.y);
  const closest = _.min(state.sensorDetections, (sd) => sd.dist);
  console.log({
    action: action,
    reward: reward,
    time: Date.now() - startTime,
    dist: closest.dist
  });
  prevScore = state.score;
};

const startSave = () => {
  const start = Date.now();
  const save = () => {
    //fs.writeFile("./models/model_"+Math.floor((Date.now() - start)/60000) + ".json", JSON.stringify(agent.toJSON()));
    setTimeout(save, 600000);//10 min
  }
  save();
};

//START
agarSetup();
const args = process.argv.slice(2);
if (_.isString(args[0])) {
  console.log("Loading model: " + args[0]);
  const totalMins = 16500;
  const mins = Number.parseInt(args[0]);
  const model = Math.max(Math.min(mins / totalMins, 0.99) ,0)
  reinforceSetup(model);
  stats = fs.openSync('stats/line' + mins + '.data', 'w');
  fs.writeSync(stats, "line, " + mins + ", 100s interval\n");
} else {
  reinforceSetup(0);
}
agarStart();
startSave();
