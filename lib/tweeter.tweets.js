var tweets = function tweets(tweeter) {
    if(tweeter && typeof tweeter.prototype.include === 'object') {
        if(!(tweets in tweeter.prototype.include)) {
            tweeter.prototype.include['tweets'] = tweets;
        }
    }

    return {
        retweeted_by: this.retweeted_by,
        retweeted_by_ids: this.retweeted_by_ids,
        retweets: this.retweets,
        show: this.show,
        destroy: this.destroy,
        retweet: this.retweet,
        update: this.update,
        update_with_media: this.update_with_media
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

tweets.prototype.destroy = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to destroy");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.post('/1/statuses/destroy/'+opt.id+'.json', opt,fn);
};

tweets.prototype.retweet = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.post('/1/statuses/retweet/'+opt.id+'.json',opt,fn);
};

tweets.prototype.update = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.status) throw Error("A status is required");
    return this.tweeter.post('/1/statuses/update.json',opt,fn);
};

tweets.prototype.update_with_media = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.status) throw Error("A status is required");
    if(!opt['media[]']) throw Error("A 'media[]' key is required");
    return this.tweeter.upload('/1/statuses/update_with_media.json',opt,fn);
};
module.exports = exports = tweets;
