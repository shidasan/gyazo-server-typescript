///<reference path='./d.ts/node/node.d.ts'/>
///<reference path='./d.ts/express/express.d.ts'/>
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var CONFIG = require('config');

var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(path.join(__dirname, CONFIG.Files)));
    app.use(express.bodyParser({ uploadDir: CONFIG.Files }));
});

app.post('/upload', function (req, res) {
    var sourcepath = req.files.imagedata.path;
    var md5 = crypto.createHash('md5');

    var s = fs.createReadStream('./' + sourcepath);
    s.on('data', function (d) {
        md5.update(d);
    });

    s.on('end', function () {
        var digest = md5.digest('hex');
        var targetpath = CONFIG.Files + digest + '.png';
        fs.rename(sourcepath, targetpath, function (err) {
            if (err) {
                console.log(err);
                res.send(400);
            }
            res.send('http://' + CONFIG.Host + '/' + path.basename(CONFIG.Files + digest));
        });
    });
});

app.get(/([0-9a-f]+)/, function (req, res) {
    var fileid = req.params[0];
    var filepath = CONFIG.Files + fileid + CONFIG.FileType;
    fs.stat(filepath, function (err, stats) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        var params = {
            ImageSource: 'http://' + CONFIG.Host + '/' + fileid + CONFIG.FileType,
            Domain: CONFIG.Host
        };
        res.render('index', params);
    });
});

app.get('/', function (req, res) {
    res.send('This site serves as Gyazo. (More detail at gyazo.com)');
});

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}
