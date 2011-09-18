var Tweeter = require('../lib/tweeter'),
    conf = require('../conf'),
    http = require('http'),
    child = require('child_process'),
    util = require('util'),
    fs = require('fs');

var filename = 'jelly.jpg';
var baseFile = __dirname + '/' + filename;

require('../lib/tweeter.tweets')(Tweeter);
var tweeter = new Tweeter(conf);
tweeter.setLogLevel(0);

tweeter.authenticate(function(err,data) {
    child.exec('google-chrome ' + data.authUrl);
});

http.createServer(function(req,res) {
    if(req.url.match(/auth\/twitter\/callback/)) {
        // console.log('Callback: %j', util.inspect(req) );
        tweeter.parseCallback(req.url, function() {
           // console.log('Request: %j', util.inspect(req.status) );
            var file = fs.readFileSync(baseFile, 'base64');
            tweeter.api.tweets.update_with_media({ 
                    status: "Testing tweeter.js" + new Date(), 
                    'media[]': file.toString(),
                    filename: filename,
                    filetype: 'image/jpeg'
                }, function(err,data) {
                    res.end( util.format('Response data: %j', data) );
                }
            ).on('data', function(err, data) {
                console.log('Error received: %j\nData received: %j',err, data);
            })
            .on('error', function(err,data) {
                    res.end( util.format("Err: %j\nData: %j", err, data) );
            });
        });
    }
}).listen(8080);
