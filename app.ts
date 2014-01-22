///<reference path='./d.ts/node/node.d.ts'/>
///<reference path='./d.ts/express/express.d.ts'/>

import express = require('express');
import http = require('http');
import fs = require('fs');
import path = require('path');
import crypto = require('crypto');

var  CONFIG = require('config');

var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.static(path.join(__dirname, CONFIG.Files)));
    app.use(express.bodyParser({ uploadDir: CONFIG.Files }));
});

app.post('/upload', function(req, res) {
    var sourcepath = req.files.imagedata.path;
    var md5 = crypto.createHash('md5');
    
    var s = fs.createReadStream('./' + sourcepath);
    s.on('data', function(d) {
        md5.update(d);
    });
    
    s.on('end', function() {
        var digest = md5.digest('hex');
        var targetpath = CONFIG.Files + digest + '.png';
        fs.rename(sourcepath, targetpath, function(err?) {
          if (err) {
            throw err;
          }
          res.send('http://' + CONFIG.Host + '/' + path.basename(targetpath));
        });
    });
});

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}
