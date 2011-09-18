var tweets = function tweets(tweeter) {
    if(tweeter && typeof tweeter.prototype.include === 'object') {
        if(!(tweets in tweeter.prototype.include)) {
            tweeter.prototype.include['tweets'] = tweets;
        }
    }

    return {
        retweeted_by: this.retweeted_by
    };
};

tweets.prototype.retweeted_by = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/'+opt.id+'/retweeted_by.json',opt,fn);
};

tweets.prototype.retweeted_by_ids = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by_ids");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/'+opt.id+'/retweeted_by/ids.json',opt,fn);
};

tweets.prototype.retweets = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweets");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/retweets/'+opt.id+'.json',opt,fn);
};

tweets.prototype.show = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to show");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/show.json',opt,fn);
};

module.exports = exports = tweets;
