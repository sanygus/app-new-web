const express = require('express');
const request = require('request');
const app = express();
const fs = require('fs');
const db = require('./db');
const async = require('async');
const photosdir = __dirname + '/../app-new/photos';
let state = [];

express.static.mime.define({'text/plain': ['mpd','m4s']});

app.set('view engine', 'ejs');

app.use('/static', express.static(__dirname + '/static'));
app.use('/photos', express.static(photosdir));

app.get('/', function(req, res) {
  async.parallel({
      sensors: db.getSensors,
      files: (callback) => {
        fs.readdir(photosdir, (err, devDirs) => {
          const files = {};
          async.each(devDirs, (devDir, cbDevDir) => {
            fs.readdir(`${photosdir}/${devDir}`, (err, filesList) => {
              files[devDir] = filesList.sort().reverse();
              cbDevDir(err);
            });
          }, (err) => {
            callback(err, files);
          });
        });
      },
    },
    (err, results) => {
      Object.assign(results, { state });
      res.render('index', results);
    }
  );
});


const getState = () => {
  request('http://geoworks.pro:3000/state', (error, resp, body) => {
    if (resp && resp.statusCode === 200) {
      const newstate = [];
      try {
        newstate.push(...JSON.parse(body));
      } catch(e) {}
      async.each(newstate, (dev, callback) => {
        if (dev.status.event === "wakeup") {
          request(`http://geoworks.pro:3000/${dev.iddev}/diag`, (error, resp, body) => {
            const { state: devstate } = JSON.parse(body);
            dev.stream = devstate === "streaming Video";
            callback();
          });
        } else {
          callback();
        }
      }, () => {//end each
        state = [];
        state.push(...newstate);
      });
    }/* else {}*/
  });
}
setInterval(getState, 5 * 60 * 1000);
getState();

app.listen(5000);