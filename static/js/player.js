let player;
let devIDStream;
const PlayerInit = (manifestURL) => {
  const errorHandler = (/*error*/) => {
    PlayerReset();
    console.log('playing error, restarting');
    setTimeout(() => {
      if ($('#modal-media-livestream').css('display') === 'block') {
        PlayerInit(manifestURL);
      }
    }, 2000);
  }
  player = dashjs.MediaPlayer().create();
  player.getDebug().setLogToBrowserConsole(false);
  player.initialize(document.getElementById('livestream'), manifestURL, true);
  player.on(dashjs.MediaPlayer.events['ERROR'], errorHandler);
  player.on(dashjs.MediaPlayer.events['PLAYBACK_ERROR'], (e) => {
    $( ".livestream-spinner" ).fadeIn(1000);
    errorHandler(e);
  });
  player.on(dashjs.MediaPlayer.events['CAN_PLAY'], () => {
    if (streams[devIDStream]) {
      if (streams[devIDStream].live) {
        labelAnimateTimer = setInterval(labelAnimate, 1000);
      } else {
        $('#livestream').attr('controls', "")
      }
      streamTimeTimer = setInterval(() => {
        let streamPlaybackTime = new Date(streams[devIDStream].date);
        streamPlaybackTime.setSeconds(streamPlaybackTime.getSeconds() + player.time());
        $( "#livestream-time" ).text(streamPlaybackTime.toLocaleTimeString());
      }, 1000);
      $( ".livestream-spinner" ).fadeOut(1000);
    }
  });
  player.on(dashjs.MediaPlayer.events['PLAYBACK_PLAYING'], () => {

  });
  player.on(dashjs.MediaPlayer.events['PLAYBACK_PAUSED'], () => {
    clearInterval(labelAnimateTimer);
    clearInterval(streamTimeTimer);
  });
}
const PlayerReset = () => {
  setTimeout(() => {
    player.pause();
    player.reset();
    player = null;
  }, 10);
}

$( ".openlive" ).click(function () {
  devIDStream = $( this ).attr("devid");
  $( "#livestream-location" ).text($( "#location-" + devIDStream ).text());
  UIkit.modal($( "#modal-media-livestream" )).show();
  PlayerInit("/static/stream/" + devIDStream + "/manifest.mpd");
});
  

$( "#modal-media-livestream" ).on('hide.uk.modal', function () {
  PlayerReset();
  $( ".livestream-spinner" ).fadeIn(2000);
  clearInterval(labelAnimateTimer);
  clearInterval(streamTimeTimer);
  if $('#livestream').attr('controls') {
    $('#livestream').removeAttr('controls');
  }
  $( "#livestream-time" ).text('');
});

let labelState = true;
let labelAnimateTimer;
const labelAnimate = () => {
  $( "#livestream-label" ).animate({opacity: labelState ? 0.4 : 1}, 1000);
  labelState = !labelState;
}
let streamTimeTimer;

$( ".livestream-fullscreen" ).click(() => {
  document.getElementById('livestream').webkitEnterFullScreen();
});
