var timelines = function timelines(tweeter) {
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

timelines.prototype.home_timeline = function(opt,fn) {
    return this.tweeter.get('/1/statuses/home_timeline.json', opt, fn);
};

timelines.prototype.mentions = function(opt,fn) {
    return this.tweeter.get('/1/statuses/mentions.json', opt, fn);
};

timelines.prototype.public_timeline = function(opt,fn) {
    return this.tweeter.get('/1/statuses/public_timeline.json', opt, fn);
};

timelines.prototype.retweeted_by_me = function(opt,fn) {
    return this.tweeter.get('/1/statuses/retweeted_by_me.json', opt, fn);
};

timelines.prototype.retweets_to_me = function(opt,fn) {
    return this.tweeter.get('/1/statuses/retweeted_to_me.json', opt, fn);
};

timelines.prototype.user_timeline = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to user_timeline");
    if(!opt.user_id && !opt.screen_name) throw Error("Always specify either an user_id or screen_name when requesting a user timeline.");
    return this.tweeter.get('/1/statuses/user_timeline.json', opt, fn);
};

timelines.prototype.retweeted_to_user = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_to_user");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required.");
    return this.tweeter.get('/1/statuses/retweeted_to_user.json', opt, fn);
};

timelines.prototype.retweeted_by_user = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by_user");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required."); 
    return this.tweeter.get('/1/statuses/retweeted_by_user.json', opt, fn);
};

module.exports = exports = timelines;
