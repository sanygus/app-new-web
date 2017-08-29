let manifsetURL = null;
const errorHandler = (error) => {
  player.attachSource(null);
  console.log("err, restarting...");
  setTimeout(() => {
    player.attachSource(manifsetURL);
  }, 3000);
}

const player = dashjs.MediaPlayer().create();
player.getDebug().setLogToBrowserConsole(false);
player.initialize(document.getElementById('livestream'), null, true);
player.on(dashjs.MediaPlayer.events['ERROR'], errorHandler);
player.on(dashjs.MediaPlayer.events['PLAYBACK_ERROR'], () => {
  $( ".livestream-spinner" ).fadeIn(2000);
  errorHandler();
});
player.on(dashjs.MediaPlayer.events['CAN_PLAY'], () => {
  labelAnimateTimer = setInterval(labelAnimate, 2000);
  $( ".livestream-spinner" ).fadeOut(2000);
});

$( ".openlive" ).click(function () {
  const devid = $( this ).attr("devid");
  $( "#livestream-location" ).text($( "#location-" + devid ).text());
  manifsetURL = "/static/stream/" + devid + "/manifest.mpd";
  player.attachSource(manifsetURL);
  UIkit.modal($( "#modal-media-livestream" )).show();
});

$( "#modal-media-livestream" ).on('hide.uk.modal', function () {
  manifsetURL = null;
  player.attachSource(manifsetURL);
  clearInterval(labelAnimateTimer);
})

let labelState = true;
let labelAnimateTimer;
const labelAnimate = () => {
	$( "#livestream-label" ).animate({opacity: labelState ? 0.6 : 1}, 2000);
	labelState = !labelState;
}

