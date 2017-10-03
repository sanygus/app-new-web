/*UIkit.modal($("#modal-media-video")).show();*/

const players = {};
const prevState = {};

const getStreamState = () => {
  if (devicesID.length > 0) {
    fetch(`/stream/state/${devicesID.join(',')}`)
      .then((r) => { return r.json() })
      .then((state) => {
        console.log(state);
        for (let dev in state) {
          renderVCDev(parseInt(dev), state[dev]);
        }
        //TODO: if all is 0, reload after TO
      });
  }
}

const renderVCDev = (devid, state) => {//devid is int
  if (typeof(state) === "string") {
    console.error(`dev ${devid} - ${state}`);
    UIkit.notification("Извините, включение временно недоступно. Попробуйте позднее", {status:'warning'});//Извините, произошла ошибка. Попробуйте позднее
  } else {
    const deviceBlock = $("#device-" + devid + "-block");
    switch(state) {
      case 0:
        if (prevState[devid] !== 0) {
          renderStateTemplate(deviceBlock, "init");
          deviceBlock.find(".startStreamButton").click(() => {
            fetch(`/stream/start/${devid}`)
              .then((r) => { return r.json() })
              .then((resp) => {
                if (resp.ok) { setTimeout(getStreamState, 1000); }
              });
          });
        }
        break;
      case 1:
        if (prevState[devid] !== 1) {
          renderStateTemplate(deviceBlock, "load");
          deviceBlock.find('.dev-img').css("filter", "blur(4px)");
          deviceBlock.find('#streamProgress')[0].value = 1/6;
          deviceBlock.find('#streamProgressValue').html("1/6");
          deviceBlock.find('#streamLoadState').html("Ожидание включения");
          setTimeout(() => {
            if (prevState[devid] === 1) {
              deviceBlock.find('#streamProgress')[0].value = 2/6;
              deviceBlock.find('#streamProgressValue').html("2/6");
              deviceBlock.find('#streamLoadState').html("Загрузка компьютера");
            }
          }, 39000);
        }
        setTimeout(getStreamState, 5000);
        break;
      case 2:
        if (prevState[devid] !== 2) {
          if (prevState[devid] !== 1) {
            renderStateTemplate(deviceBlock, "load");
            deviceBlock.find('.dev-img').css("filter", "blur(4px)");
          } else { console.log('prev is first'); console.log(prevState[devid]); }
          deviceBlock.find('#streamProgress')[0].value = 3/6;
          deviceBlock.find('#streamProgressValue').html("3/6");
          deviceBlock.find('#streamLoadState').html("Включено, инициализация камеры");
          UIkit.notification("Устройство включено", {status:'success'});
        }
        setTimeout(getStreamState, 3000);
        break;
      case 3:
        if (prevState[devid] !== 3) {
          renderStateTemplate(deviceBlock, "preview");
          deviceBlock.find('#streamProgress')[0].value = 4/6;
          deviceBlock.find('#streamProgressValue').html("4/6");
          deviceBlock.find('#streamLoadState').html("Получено изображение, инициализация потока");
          deviceBlock.find('.dev-img').css("filter", '');
          deviceBlock.find('.dev-img').attr('src',`/static/photos/${devid}/beforeStream.jpg?${Math.random()}`);
        }
        setTimeout(getStreamState, 1000);
        break;
      case 4:
        if (prevState[devid] !== 4) {
          if (prevState[devid] !== 3) {
            renderStateTemplate(deviceBlock, "preview");
            deviceBlock.find('.dev-img').css("filter", '');
            deviceBlock.find('.dev-img').attr('src',`/static/photos/${devid}/beforeStream.jpg?${Math.random()}`);
          }
          deviceBlock.find('#streamProgress')[0].value = 5/6;
          deviceBlock.find('#streamProgressValue').html("5/6");
          deviceBlock.find('#streamLoadState').html("Инициализация конвертера");
        }
        setTimeout(getStreamState, 1000);
        break;
      case 5:
        if (prevState[devid] !== 5) {
          if (prevState[devid] !== 3 && prevState[devid] !== 4) {
            renderStateTemplate(deviceBlock, "preview");
            deviceBlock.find('.dev-img').css("filter", '');
            deviceBlock.find('.dev-img').attr('src',`/static/photos/${devid}/beforeStream.jpg?${Math.random()}`);
          }
          renderStateTemplate(deviceBlock, "video");

          setTimeout(() => {
            UIkit.modal.confirm('Трансляция будет завершена через несколько секунд. Вы желаете продолжить трансляцию?').then(() => {
              fetch(`http://geoworks.pro:3000/${devid}/nosleep`).then((r) => {
                if (r.status === 200) { UIkit.notification("Трансляция поддержана", {status:'success'}); }
                else { UIkit.notification("Не удалось поддержать трансляцию", {status:'warning'}); }
              });
            }, () => {});
          }, 330000);//TODO: reinit after self

          if (prevState[devid] < 5) {
            deviceBlock.find("#streamLiveLabel").before(`<progress class="uk-progress" id="streamProgress" min="0" max="1"></progress>`);
            let liveProgressTO = setInterval(() => {
              deviceBlock.find("#streamProgress")[0].value += 0.01;
            }, 39000 / 100);
            setTimeout(() => {
              playerInit(devid);
              clearInterval(liveProgressTO);
              deviceBlock.find("#streamProgress").remove();
            }, 39000);
          } else if (prevState[devid] === undefined) {
            playerInit(devid);
          }
          //setTimeout();//playerInit
        }
        setTimeout(getStreamState, 30000);
        break;
      default: console.log(`uncertain state dev ${devid}`); break;
    }
    prevState[devid] = state;
  }
}


const getStateTemplate = {
  "init": () => {
    return `<div class="uk-transition-fade uk-position-cover uk-position-medium uk-overlay uk-overlay-default uk-flex uk-flex-center uk-flex-middle">
              <button class="uk-button uk-button-danger uk-button-large uk-margin-top uk-margin-bottom">
                <span uk-icon="icon: video-camera;ratio: 1.5"></span>
                  Онлайн видео
              </button>
              <div uk-drop="mode: click;pos: top-center;">
                <div class="uk-card uk-card-body uk-card-default uk-padding-small">
                  <p>Вы готовы немного подождать?</p>
                  <button class="uk-button uk-button-primary uk-button-small uk-width-1-1 startStreamButton">Да</button>
                </div>
              </div>
            </div>`
  },
  "load": () => {
    return `<div class="uk-position-cover uk-overlay uk-padding-remove uk-overlay-default">
              <progress class="uk-progress" id="streamProgress" min="0" max="1"></progress>
              <div id="streamProgressValue" class="uk-text-center"></div>
              <div uk-spinner class="uk-position-center streamLoadSpinner"></div>
              <div id="streamLoadState" class="uk-position-center" style="transform:translate(-50%,150%);"></div>
            </div>`
  },
  "preview": () => {
    return `<div class="uk-position-cover uk-overlay uk-padding-remove">
              <progress class="uk-progress" id="streamProgress" min="0" max="1"></progress>
              <div id="streamProgressValue" class="uk-text-center"></div>
              <div uk-spinner class="uk-position-center streamLoadSpinner"></div>
              <div id="streamLoadState" class="uk-position-center" style="transform:translate(-50%,150%);"></div>
            </div>`
  },
  "video": () => {
    return `<div class="uk-position-cover uk-overlay uk-padding-remove">
              <div class="uk-position-top-right" id="streamLiveLabel" style="opacity:0;"><span class="uk-label uk-label-danger">LIVE</span></div>
              <video uk-video id="videoContainer"></video>
              <div uk-spinner class="uk-position-center streamLoadSpinner"></div>
              <div class="uk-position-bottom-right"><a href="#" uk-icon="icon: expand" id="expandVideo"></a></div>
            </div>`
  },
}

const renderStateTemplate = (devBlk, tmpl) => {
  devBlk.find('#atopimg').html(getStateTemplate[tmpl]());
}

const playerInit = (devid) => {
  if (players[devid]) {
    $(".streamLoadSpinner").show(1);
    players[devid].reset();
  }
  const player = dashjs.MediaPlayer().create();
  player.getDebug().setLogToBrowserConsole(false);
  player.initialize(
    $("#device-" + devid + "-block").find("#videoContainer")[0],
    `/static/stream/${devid}/manifest.mpd`,
    true
  );
  //player.on(dashjs.MediaPlayer.events['CAN_PLAY'], console.log);
  player.on(dashjs.MediaPlayer.events['PLAYBACK_PLAYING'], () => {
    if (player.isDynamic()) { liveLabelAnimate(devid); }
    $(".streamLoadSpinner").hide(500);
    playingCheck(devid);
  });
  player.on(dashjs.MediaPlayer.events['PLAYBACK_PAUSED'], console.log);
  player.on(dashjs.MediaPlayer.events['ERROR'], () => {
    setTimeout(() => { playerInit(devid); }, 3000);
  });
  player.on(dashjs.MediaPlayer.events['PLAYBACK_ERROR'], () => {
    setTimeout(() => { playerInit(devid); }, 3000);
  });

  players[devid] = player;

  $("#device-" + devid + "-block").find("#expandVideo").click(() => {
    $("#device-" + devid + "-block").find("#videoContainer")[0].webkitRequestFullScreen();
  });
}

const liveLabelAnimate = (devid) => {
  const elem = $("#device-" + devid + "-block").find("#streamLiveLabel");
  if (elem[0]) {
    elem.animate({opacity: 1}, 1000, () => {
      elem.animate({opacity: 0.5}, 1000, () => {
        if (!players[devid].isPaused()) { liveLabelAnimate(devid); }
        else { elem.animate({opacity: 0}, 500); }
      });
    });
  }
}

const playingCheck = (devid) => {
  if (players[devid] && players[devid].isReady()) {
    if (players[devid].lastCheckTime && (players[devid].time() === players[devid].lastCheckTime)) {
      playerInit(devid);
      console.log('reinit');
    } else {
      setTimeout(() => {
        playingCheck(devid);
      }, 2000);
    }
    players[devid].lastCheckTime = players[devid].time();
  }
}
