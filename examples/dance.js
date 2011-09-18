var conf = require('../conf');
var Tweeter = require('../lib/tweeter');
var child = require('child_process');
var http = require('http');

var tweeter = new Tweeter(conf);
tweeter.authenticate(function(err, data){
    console.log('\nauthUrl:\n%j\n', data.authUrl || 'NONE');
    child.exec('google-chrome ' + data.authUrl);
});

http.createServer(function(req,res) {
    if(req.url.match(/auth\/twitter\/callback/)){
        tweeter.parseCallback(req.url, function() {
            tweeter.get('/1/statuses/home_timeline.json', {},
            function(err,data) {
                res.write(data);
            });
        });
    } else { console.log("failure :("); }
}).listen(8080);
