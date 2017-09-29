UIkit.modal($("#modal-media-video")).show();
const player = dashjs.MediaPlayer().create();
player.getDebug().setLogToBrowserConsole(false);
player.initialize(document.querySelector("#video-container"), "/static/stream/1/manifest.mpd", true);

const getStreamState = () => {
  if (devicesID.length > 0) {
    fetch(`/stream/state/${devicesID.join(',')}`)
      .then((r) => { return r.json() })
      .then((state) => {
        for (let dev in state) {
          renderVCDev(dev, state[dev]);
        }
      });
  }
}

const renderVCDev = (devid, state) => {
  if (typeof(state[dev]) === "string") {
    console.error(state[dev]);//Извините, произошла ошибка. Попробуйте позднее
  } else {
    let stateString = "";
    switch(state[dev]) {
      //case 0: break;//to default
      case 1: stateString = "Ожидание включения";/*TO - загружаемся */ break;
      case 2: stateString = "Устройство включено, ждём запуск потока"; break;
      case 3: /*video poster*/ break;
      default: stateString = "Отключено. Есть архив";

        break;
    }


  }
}


const a = `
                        <div class="uk-transition-fade uk-position-cover uk-position-medium uk-overlay uk-overlay-default uk-text-center">
                            <button class="uk-button uk-button-danger uk-button-large uk-margin-top uk-margin-bottom">
                                <span uk-icon="icon: video-camera;ratio: 1.5"></span>
                                Онлайн видео
                            </button>
                            <button class="uk-button uk-button-secondary uk-button-small uk-margin-top uk-margin-bottom">
                                <span uk-icon="icon: play-circle;"></span>
                                Последний сеанc
                            </button>
                        </div>`
