const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const fs = require('fs');
const db = require('./db');
const async = require('async');
const mpdConverter = require('./mpd-converter');
const stream = require('./stream');

const photosdir = __dirname + '/static/photos';

app.use(cors());
//express.static.mime.define({'application/xml': ['mpd']});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/html/index.html');
});

app.get('/getdata/:devid', (req, res) => {
  const devid = parseInt(req.params.devid);
  async.parallel(
    {
      sensors: (callback) => {
        db.getSensors(devid, callback);
      },
      files: (callback) => {
        fs.readdir(`${photosdir}/${devid}`, (err, filesarr) => {
          if (filesarr) { filesarr.sort(); }
          callback(err, filesarr);
        });
      },
    },
    (err, results) => {
      if (err) { console.log(err); }
      res.type('application/json').status(200).send(results);
    }
  );
});

app.get('/stream/start/:devid', (req, res) => {
  const devid = parseInt(req.params.devid);
  stream.start(devid);
  res.type('application/json').status(200).send({ ok: true });
});

app.get('/stream/state/:devsid', (req, res) => {
  const devsid = req.params.devsid.split(',').map((dev) => parseInt(dev));
  res.type('application/json').status(200).send(stream.state(devsid));
});

app.get('/static/stream/:devid/manifest.mpd', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  mpdConverter(`static/stream/${req.params.devid}/manifest.mpd`, (err, data) => {
    res.end(data);
  });
});

app.use('/static', express.static(__dirname + '/static'));

app.listen(5000);
