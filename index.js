const express = require('express');
const app = express();
const fs = require('fs');
const db = require('./db');
const photosdir = __dirname + '/../app-new/photos';

app.set('view engine', 'ejs');

app.use('/photos', express.static(photosdir));

app.get('/', function(req, res) {
  const filesall = {
    'infDev2': [],
    'infDev3': [],
  }
  fs.readdir(photosdir+'/infDev2', (err, files) => {
    filesall['infDev2'].push(...files.reverse());
    fs.readdir(photosdir+'/infDev3', (err, files) => {
      filesall['infDev3'].push(...files.reverse());
      db.getSensors((data) => {
        res.render('index', {'sensors': data, files: filesall});
      })
    });
  });

});

app.listen(5000);