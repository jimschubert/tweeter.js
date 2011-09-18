var conf = require('../conf');
var Tweeter = require('../lib/tweeter');
var child = require('child_process');
var http = require('http');
var tweeter = new Tweeter(conf);
var testCase = require('nodeunit').testCase;

exports.auth = testCase({
    'tweeter.authentiate()': function(test) {
            test.expect(1);
            tweeter.setLogLevel(4);
            tweeter.authenticate(function(err, data){
            child.exec('google-chrome ' + data.authUrl);

            http.createServer(function(req,res) {
                if(req.url.match(/auth\/twitter\/callback/)){
                    tweeter.parseCallback(req.url, function() {
                        tweeter.get('/1/statuses/home_timeline.json', {},
                            function(err,data) {
                                test.same(err, null, "Request should not cause an error");
                                res.write(data);
                                res.end('');
                                test.done();
                        });
                    });
                }
            }).listen(8080);
        });
    },

    'Acquiring a request token': function(test) {
        // these won't match 100% to twitter's docs because the oauth_callback in the docs isn't properly encoded.
        test.expect(3);
        var expectedSignatureBaseString = 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttp%3A%2F%2Flocalhost%3A3005%2Fthe_dance%2Fprocess_callback%3Fservice_provider_id%3D11%26oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DQP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323042%26oauth_version%3D1.0';
        var expectedSignature = 'Ewqbgi+AMRZGMcqwQTjhE5/ZD80=';
        var expectedOAuthHeader = 'OAuth realm="Twitter API",oauth_consumer_key="GDdmIQH6jhtmLUypg82g",oauth_nonce="QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1272323042",oauth_version="1.0",oauth_callback="http%3A%2F%2Flocalhost%3A3005%2Fthe_dance%2Fprocess_callback%3Fservice_provider_id%3D11",oauth_signature="8wUi7m5HFQy76nowoCThusfgB%2BQ%3D"';
        
        // We have conf (our config object) and props because we need to test 
        // The assumption that the props passed into createSignatureBaseString are correct
        // and test that the signature created from the oauthSignature method is correct
        var conf = {
            consumerKey: 'GDdmIQH6jhtmLUypg82g',
            consumerSecret: 'MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98',
            oauthCallback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11',
            test_nonce: 'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
            test_timestamp: '1272323042'
        };

        var props = {
            oauth_consumer_key: conf.consumerKey,
            oauth_nonce: conf.test_nonce,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: conf.test_timestamp,
            oauth_callback: conf.oauthCallback,
            oauth_version: '1.0'
        };
        var tweeter = new Tweeter(conf);
        tweeter.useSSL = true;
        var actual = tweeter.createSignatureBaseString(
            'POST', '/oauth/request_token', props, null);

        test.equal(actual, expectedSignatureBaseString, "createSignatureBaseString failed");
        
        actual = tweeter.oauthSignature(
            'POST', '/oauth/request_token', props, null);

        test.equal(actual, expectedSignature, "oauthSignature failed");

        actual = tweeter.oauthHeader('POST', '/oauth/request_token', {});
        test.equal(actual, expectedOAuthHeader, "oauthHeader failed");
        test.done();
    }
});
