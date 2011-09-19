// A wrapper for Twitter's timelines API
var timelines = function timelines(tweeter) {

    // mark 'timelines' API for inclusion
    if(tweeter && typeof tweeter.prototype.include === 'object') {
        if(!(timelines in tweeter.prototype.include)) {
            tweeter.prototype.include['timelines'] = timelines;
        }
    }

    return {
        home_timeline: this.home_timeline,
        mentions: this.mentions,
        public_timeline: this.public_timeline,
        retweeted_by_me: this.retweeted_by_me,
        retweets_to_me: this.retweets_to_me,
        user_timeline: this.user_timeline,
        retweeted_to_user: this.retweeted_to_user,
        retweeted_by_user: this.retweeted_by_user
    };
};

// ## home_timeline(opt,fn)  
// See [GET statuses/home_timeline](https://dev.twitter.com/docs/api/1/get/statuses/home\_timeline)  
// Example:  
//      
//      tweeter.api.timelines.home_timeline(opt,fn);
timelines.prototype.home_timeline = function(opt,fn) {
    return this.tweeter.get('/1/statuses/home_timeline.json', opt, fn);
};

// ## mentions(opt,fn)
// See [GET statuses/mentions](https://dev.twitter.com/docs/api/1/get/statuses/mentions)   
// Example:  
//      
//      tweeter.api.timelines.mentions(opt,fn);
timelines.prototype.mentions = function(opt,fn) {
    return this.tweeter.get('/1/statuses/mentions.json', opt, fn);
};

// ## public_timeline(opt,fn)
// See [GET statuses/public\_timeline](https://dev.twitter.com/docs/api/1/get/statuses/public\_timeline)  
// Example:  
//      
//      tweeter.api.timelines.public_timeline(opt,fn);
timelines.prototype.public_timeline = function(opt,fn) {
    return this.tweeter.get('/1/statuses/public_timeline.json', opt, fn);
};

// ## retweeted\_by\_me(opt,fn)
// See [GET statuses/retweeted\_by\_me](https://dev.twitter.com/docs/api/1/get/statuses/retweeted\_by\_me)  
// Example:
//      
//      tweeter.api.timelines.retweeted_by_me(opt,fn);
timelines.prototype.retweeted_by_me = function(opt,fn) {
    return this.tweeter.get('/1/statuses/retweeted_by_me.json', opt, fn);
};

// ## retweeted\_to\_me(opt,fn)
// See [GET statuses/retweeted\_to\_me](https://dev.twitter.com/docs/api/1/get/statuses/retweeted\_to\_me)  
// Example:  
//      
//      tweeter.api.timelines.retweeted_to_me(opt,fn);
timelines.prototype.retweets_to_me = function(opt,fn) {
    return this.tweeter.get('/1/statuses/retweeted_to_me.json', opt, fn);
};

// ## retweets\_of\_me(opt,fn)
// See [GET statuses/retweets\_of\_me](https://dev.twitter.com/docs/api/1/get/statuses/retweets\_of\_me)  
// Example:  
//      
//      tweeter.api.timelines.retweets_of_me(opt,fn);
timelines.prototype.retweets_of_me = function(opt,fn) {
    return this.tweeter.get('/1/statuses/retweets_of_me.json', opt, fn);
};

// ## user_timeline(opt,fn)
// See [GET statuses/user\_timeline](https://dev.twitter.com/docs/api/1/get/statuses/user\_timeline)  
// 
// Always specify either an `user_id` or `screen_name` when requesting a user timeline.  
//  
// Example:  
//      
//      tweeter.api.timelines.user_timeline(opt,fn);
timelines.prototype.user_timeline = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to user_timeline");
    if(!opt.user_id && !opt.screen_name) throw Error("Always specify either an user_id or screen_name when requesting a user timeline.");
    return this.tweeter.get('/1/statuses/user_timeline.json', opt, fn);
};

// ## retweeted\_to\_user(opt,fn)  
// See [GET statuses/retweeted\_to\_user](https://dev.twitter.com/docs/api/1/get/statuses/retweeted\_to\_user)  
//  
// A `screen_name` or `user_id` is requried.  
//  
// Example:  
//      
//      tweeter.api.timelines.retweeted_to_user(opt,fn);
timelines.prototype.retweeted_to_user = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_to_user");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required.");
    return this.tweeter.get('/1/statuses/retweeted_to_user.json', opt, fn);
};

// ## retweeted\_by\_user(opt,fn)
// See [GET statuses/retweeted\_by\_user](https://dev.twitter.com/docs/get/statuses/retweeted\_by\_user)  
// 
// A `screen_name` or `user_id` is requried.  
//  
// Example:  
//      
//      tweeter.api.timelines.retweeted_by_user(opt,fn);
timelines.prototype.retweeted_by_user = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by_user");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required."); 
    return this.tweeter.get('/1/statuses/retweeted_by_user.json', opt, fn);
};

module.exports = exports = timelines;
