<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Eat cells smaller than you and don't get eaten by the bigger ones, as an MMO">
<meta name="keywords" content="agario, agar, io, cell, cells, virus, bacteria, blob, game, games, web game, html5, fun, flash">
<meta name="robots" content="index, follow">
<meta name="viewport" content="minimal-ui, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta property="fb:app_id" content="677505792353827"/>
<meta property="og:title" content="Agar.io"/>
<meta property="og:description" content="Eat cells smaller than you and don't get eaten by the bigger ones, as an MMO"/>
<meta property="og:url" content="http://agar.io"/>
<meta property="og:image" content="http://agar.io/img/1200x630.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:type" content="website"/>
<title>Agar.io</title>
<link id="favicon" rel="icon" type="image/png" href="favicon-32x32.png"/>
 
<script type='text/javascript'>
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
(function() {
var gads = document.createElement('script');
gads.async = true;
gads.type = 'text/javascript';
var useSSL = 'https:' == document.location.protocol;
gads.src = (useSSL ? 'https:' : 'http:') + 
'//www.googletagservices.com/tag/js/gpt.js';
var node = document.getElementsByTagName('script')[0];
node.parentNode.insertBefore(gads, node);
})();
</script>
<link href='https://fonts.googleapis.com/css?family=Ubuntu:700' rel='stylesheet' type='text/css'>
<link href="css/bootstrap.min.css" rel="stylesheet">
<script src="js/jquery.js"></script>
<script src="main_out.js?544"></script>
<script>

var hasBottomAd = false;

var dfp = null;
var dfpBottom = null;

if(window.location.search.indexOf('fb') != -1){
	dfp = '/53945695/agar_facebook/agar/300x250';
}else{
	if(window.ABGroup < 50){
		dfp = '/53945695/agar/300x250_RL';
	}else{
		dfp = '/53945695/agar/300x250_CRL';
	}
	//dfp = '/53945695/agar/300x250';
	dfpBottom = '/53945695/agar/728x90';
}

if(window.innerHeight > 960 && dfpBottom != null){
	hasBottomAd = true;
}

googletag.cmd.push(function() {
	window.mainAd = googletag.defineSlot(dfp, [300, 250], 'a300x250').addService(googletag.pubads());
	if(hasBottomAd) googletag.defineSlot(dfpBottom, [728, 90], 'a728x90').addService(googletag.pubads());
	googletag.enableServices();
});

</script>
<style>body{padding:0;margin:0;overflow:hidden;}#canvas{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;}.checkbox label{margin-right:10px;}form{margin-bottom:0px;}.btn-play,.btn-settings,.btn-spectate{display:block;height:35px;}.btn-play{width:85%;float:left;}.btn-settings{width:13%;float:right;}.btn-spectate{display:block;float:right;}#adsBottom{position:absolute;left:0;right:0;bottom:0;}#adsBottomInner{margin:0px auto;width:728px;height:90px;border:5px solid white;border-radius:5px 5px 0px 0px;background-color:#FFFFFF;box-sizing:content-box;}.region-message{display:none;margin-bottom:12px;margin-left:6px;margin-right:6px;text-align:center;}#nick,#locationKnown #region{width:65%;float:left;}#locationUnknown #region{margin-bottom:15px;}#gamemode,#spectateBtn{width:33%;float:right;}#helloDialog{width:350px;background-color:#FFFFFF;margin:10px auto;border-radius:15px;padding:5px 15px 5px 15px;position:absolute;top:50%;left:50%;margin-right:-50%;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%);}#a300x250{width:300px;height:250px;background-repeat:no-repeat;background-size:contain;background-position:center center;}</style>
</head>
<body>
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.3&appId=677505792353827";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<div id="overlays" style="display:none; position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 200;">
<div id="helloDialog">
<form role="form">
<div class="form-group">
<div style="float: left; margin-left: 20px;"><h2>Agar.io</h2></div>
<div class="fb-like" style="float: right; margin-top: 30px;" data-href="https://www.facebook.com/playagar.io" data-layout="button" data-action="like" data-show-faces="true" data-share="true"></div>
<br clear="both"/>
</div>
<div class="form-group">
<input id="nick" class="form-control" placeholder="Nick" maxlength="15"/>
<select id="gamemode" class="form-control" onchange="setGameMode($(this).val());" required>
<option selected value="">FFA</option>
<option value=":teams">Teams</option>
<option value=":experimental">Experimental</option>
</select>
<br clear="both"/>
</div>
<div id="locationUnknown">
<select id="region" class="form-control" onchange="setRegion($('#region').val());" required>
<option selected disabled value=""> -- Select a Region -- </option>
<option value="US-Fremont">US West</option>
<option value="US-Atlanta">US East</option>
<option value="BR-Brazil">South America</option>
<option value="EU-London">Europe</option>
<option value="RU-Russia">Russia</option>
<option value="TK-Turkey">Turkey</option>
<option value="JP-Tokyo">East Asia</option>
<option value="CN-China">China</option>
<option value="SG-Singapore">Oceania</option>
</select>
</div>
<div>
<div class="text-muted region-message CN-China">
 
</div>
</div>
<div class="form-group">
<button disabled type="submit" id="playBtn" onclick="setNick(document.getElementById('nick').value); return false;" class="btn btn-play btn-primary btn-needs-server">Play</button>
<button onclick="$('#settings, #instructions').toggle();return false;" class="btn btn-info btn-settings"><i class="glyphicon glyphicon-cog"></i></button>
<br clear="both"/>
</div>
<div id="settings" class="checkbox" style="display:none;">
<div class="form-group">
<div id="locationKnown"></div>
<button id="spectateBtn" onclick="spectate(); return false;" disabled class="btn btn-warning btn-spectate btn-needs-server">Spectate</button>
<br clear="both"/>
</div>
<div style="margin: 6px;">
<label><input type="checkbox" onchange="setSkins(!$(this).is(':checked'));"> No skins</label>
<label><input type="checkbox" onchange="setNames(!$(this).is(':checked'));"> No names</label>
<label><input type="checkbox" onchange="setDarkTheme($(this).is(':checked'));"> Dark Theme</label>
<label><input type="checkbox" onchange="setColors($(this).is(':checked'));"> No colors</label>
<label><input type="checkbox" onchange="setShowMass($(this).is(':checked'));"> Show mass</label>
</div>
</div>
</form>
<div id="instructions">
<hr/>
<center><span class="text-muted">
Move your mouse to control your cell<br/>
Press <b>Space</b> to split<br/>
Press <b>W</b> to eject some mass<br/>
</span></center>
</div>
<hr/>
<center>
<div id="a300x250"></div>
<small class="text-muted text-center">Advertisement</small>
</center>
<hr style="margin-bottom: 7px; "/>
<div style="margin-bottom: 5px; line-height: 32px; margin-left: 6px; height: 32px;">
<center>
<a href="privacy.txt" class="text-muted">Privacy</a>
|
<a href="terms.txt" class="text-muted">Terms of Service</a>
|
<a href="changelog.txt" class="text-muted">Changelog</a>
</center>
</div>
 
</div>
</div>
<div id="connecting" style="display:none;position: absolute; left: 0; right: 0; top: 0; bottom: 0; z-index: 100; background-color: rgba(0,0,0,0.5);">
<div style="width: 350px; background-color: #FFFFFF; margin: 100px auto; border-radius: 15px; padding: 5px 15px 5px 15px;">
<h2>Connecting</h2>
<p> If you cannot connect to the servers, check if you have some anti virus or firewall blocking the connection.
</div>
</div>
<script>

if(hasBottomAd){
	document.write('<div id="adsBottom" style="z-index: 200;"><div id="adsBottomInner"><div id="a728x90"></div></div></div>');
}

googletag.cmd.push(function() { googletag.display('a300x250'); });
if(hasBottomAd) googletag.cmd.push(function() { googletag.display('a728x90'); });

$(function(){
	setInterval(function(){
		$('#a300x250').css('background-image', "url('blocker.png')");
	}, 3000);
});

</script>
<canvas id="canvas" width="800" height="600"></canvas>
<div style="font-family:'Ubuntu'">&nbsp;</div>
<script async>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-62402209-1', 'auto');
ga('send', 'pageview');

//ga('send', 'event', 'Protocol', window.location.protocol, {'nonInteraction': 1});

</script>
</body>
</html>
