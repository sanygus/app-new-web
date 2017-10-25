//let devTmpl;
const devicesID = [];
const prevDataHash = {};

const loadTemplate = (cb) => {
  fetch('/static/devTmpl.ejs')
    .then((r) => { return r.text() })
    .then(cb);
}

const getState = (cb) => {
  fetch('http://geoworks.pro:3000/state')
    .then((r) => { return r.json() })
    .then((state) => {
      if (window.location.href.indexOf('?upr') > 0) {
        const fstate = state.filter((dev) => {
          return (dev.devid === 4)
        });
        cb(fstate);
      } else { cb(state) }
    });//filter
}

const getDevData = (devid, cb) => {
  //for (let dev of devs) {}
  fetch(`/getdata/${devid}`)
    .then((r) => { return r.json() })
    .then(cb);
}

$( document ).ready(() => {
  moment.locale("ru");
  loadTemplate((tmpl) => {
    //devTmpl = tmpl;
    getState((devsState) => {
      $( "#dataContainer" ).html(ejs.render(tmpl, { devs: devsState }));
      renderData(devsState);
      setTimeout(getStreamState, 2000);
      //setTimeout(checkIntro, 2000);
    });
  });
});

const updateData = () => {
  getState(renderData);
}

const renderData = (devsState) => {
  devicesID.length = 0;
  for (let dev of devsState) {
    devicesID.push(dev.devid);
    if ($("div").is("#device-" + dev.devid + "-block")) {
      let block = $("#device-" + dev.devid + "-block");
      let tmphtml = '';

      block.find(".dev-label").html(dev.label);
      if (dev.up) {
        tmphtml += `<span class="uk-label" style="font-size: 80%;">Включен</span> `
      } else {
        tmphtml += `<span class="uk-label" style="font-size: 80%;background: #777;">Выключен</span> `
      }
      tmphtml += `<img src="/static/img/${Math.round(dev.charge * 4)}-4.png"> <span style="font-size: 12px;">${(dev.charge * 100).toFixed(1)}%</span>`
      block.find(".dev-status").html(tmphtml); tmphtml = '';

      getDevData(dev.devid, (data) => {
        if (JSON.stringify(data).slice(-50) !== prevDataHash[dev.devid]) {
          prevDataHash[dev.devid] = JSON.stringify(data).slice(-50);
          let lastPhoto = '../default.jpg';
          if (data.files && data.files.length > 0) {
            lastPhoto = data.files[data.files.length - 1];
          }
          block.find(".dev-img").attr("src", `/static/photos/${dev.devid}/${lastPhoto}`);
          //block.find(".dev-img").attr("title", `${lastPhoto.replace('.jpg','')}`);
          if (data.sensors && data.sensors.length > 0) {
            let lastSens = data.sensors[data.sensors.length - 1];
            block.find(".dev-sens-temp").html(lastSens.temp);
            block.find(".dev-sens-press").html(lastSens.press);
            block.find(".dev-sens-date").html(moment(lastSens.date).format("lll"));
            if (intro._currentStep === undefined) { drawChart(dev.devid, data); }
          }
          console.log(`data updated ${new Date()}`);
        } else {
          console.log(`data not updated ${new Date()}`);
        }
        $( "#globalLoader" ).hide(1000);
      });
    } else {
          //change
    }
  }
  setTimeout(updateData, 60000);
}

/*const checkIntro = () => {

}*/
