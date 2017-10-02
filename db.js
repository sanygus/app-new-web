const { MongoClient } = require('mongodb');
let db;

MongoClient.connect('mongodb://localhost:27017/exapp', function(err, dblink) {
  if (err) {
    console.error(err);
  }
  db = dblink;
});

module.exports.getSensors = (devid, callback) => {
  db.collection('sensors').find({ devid }, { _id: 0, devid: false }).sort({ "date": 1 }).limit(100).toArray(callback);
}

/*module.exports.getStream = (callback) => {
  db.collection('stream').find({}, { _id: 0 }).toArray((err, data) => {
    const obj = {};
    let tdevid;
    for (let devstream of data) {
      if (devstream.devid) {
        tdevid = devstream.devid;
        delete devstream.devid;
        obj[tdevid] = devstream;
      }
    }
    callback(err, obj);
  });
}*/