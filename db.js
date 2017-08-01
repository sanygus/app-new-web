const { MongoClient } = require('mongodb');
let db;

MongoClient.connect('mongodb://localhost:27017/exapp', function(err, dblink) {
  if (err) {
    console.error(err);
  }
  db = dblink;
});

module.exports.getSensors = (callback) => {
  let cursor = db.collection('sensors').find().sort({ "resDate": -1 });
  const tempData = [];
  const pressData = [];
  const sens1Data = [];
  const sens2Data = [];
  const sens3Data = [];
  const sens4Data = [];
  cursor.each((err,doc)=>{
    if (doc) {
      if (doc.temp !== undefined) {
        let insObj = { date: doc.resDate }
        insObj[doc.dev] = doc.temp;
        tempData.push(insObj);
      }
      if (doc.press !== undefined) {
        let insObj = { date: doc.resDate }
        insObj[doc.dev] = doc.press;
        pressData.push(insObj);
      }
      if (doc.gas1 !== undefined) {
        let insObj = { date: doc.resDate }
        insObj[doc.dev] = doc.gas1[0];
        sens1Data.push(insObj);
        insObj[doc.dev] = doc.gas1[1];
        sens2Data.push(insObj);
        insObj[doc.dev] = doc.gas1[2];
        sens3Data.push(insObj);
        insObj[doc.dev] = doc.gas1[3];
        sens4Data.push(insObj);
      }
    } else {
      callback(null, {
        tempData, pressData, sens1Data, sens2Data, sens3Data, sens4Data
      });
    }
  });
}