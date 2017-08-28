const xmldoc = require('xmldoc');
const fs = require('fs');

module.exports = (file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
          return callback(err);
        }
        const manifest = new xmldoc.XmlDocument(data.toString());

        const Representation = manifest.childNamed('Period').childNamed('AdaptationSet').childNamed('Representation');
        Representation.attr.bandwidth = "6356";

        callback(null, `<?xml version="1.0" encoding="utf-8"?>` + manifest.toString({compressed:true}));
    });
}