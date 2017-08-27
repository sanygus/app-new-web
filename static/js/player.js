const player = dashjs.MediaPlayer().create();
player.getDebug().setLogToBrowserConsole(true);
player.initialize(document.getElementById('livestream'), null, true);
/*player.on(dashjs.MediaPlayer.events['CAN_PLAY'], this.onCanPlay);
player.on(dashjs.MediaPlayer.events['ERROR'], this.onError);
player.on(dashjs.MediaPlayer.events['PLAYBACK_ERROR'], (e) => {
    console.log(e)
});*/
$( ".openlive" ).click(function () {
  console.log($( this ).attr("devid"));
  player.attachSource("/static/stream/infDev4/manifest.mpd");
  //player.attachSource("https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd");
  UIkit.modal($( "#modal-media-livestream" )).show();

});
$( "#modal-media-livestream" ).on('hide.uk.modal', function () {
  player.attachSource(null);
})