var Tweeter = require('../lib/tweeter');
var tweeter = new Tweeter({consumerKey:'yourkey', consumerSecret: 'yourSecret'});
tweeter.get();
tweeter.put();
tweeter.post();
tweeter.delete();
console.log(tweeter.base);

tweeter.useSSL = true;
console.log(tweeter.base);

tweeter.apiCall('get', '/1/statuses/home_timeline.json', { user_id: 144 }, function(d) { console.log(d); });
