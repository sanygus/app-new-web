const express = require('express');
const app = express();
const fs = require('fs');
const db = require('./db');
const async = require('async');
const photosdir = __dirname + '/../app-new/photos';

app.set('view engine', 'ejs');

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
      res.render('index', results);
    }
  );
});

app.listen(5000);