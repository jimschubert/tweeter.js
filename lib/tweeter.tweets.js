// A wrapper for Twitter's tweets API
var tweets = function tweets(tweeter) {

    // mark 'tweets' API for inclusion
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

// ## retweeted_by(opt,fn)
// See [GET statuses/:id/retweeted\_by](https://dev.twitter.com/docs/api/1/get/statuses/%3Aid/retweeted\_by)  
//  
// An `id` is required.  
// 
// Example: 
//      
//      tweeter.api.tweets.retweeted_by(opt,fn);
tweets.prototype.retweeted_by = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/'+opt.id+'/retweeted_by.json',opt,fn);
};

// ## retweeted_by_ids(opt,fn)
// See [GET statuses/:id/retweeted\_by/ids](https://dev.twitter.com/docs/api/1/get/statuses/%3Aid/retweeted\_by/ids)  
// 
// An `id` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.retweeted_by_ids(opt,fn);
tweets.prototype.retweeted_by_ids = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweeted_by_ids");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/'+opt.id+'/retweeted_by/ids.json',opt,fn);
};

// ## retweets(opt,fn)
// See [GET statuses/retweets/:id](https://dev.twitter.com/docs/api/1/get/statuses/retweets/%3Aid)  
// 
// An `id` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.retweets(opt,fn);
tweets.prototype.retweets = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweets");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/retweets/'+opt.id+'.json',opt,fn);
};

// ## show(opt,fn)
// See [GET statuses/show/:id](https://dev.twitter.com/docs/api/1/get/statuses/show/%3Aid)  
//  
// An `id` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.show(opt,fn);
tweets.prototype.show = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to show");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.get('/1/statuses/show.json',opt,fn);
};

// ## destroy(opt,fn)
// See [POST statuses/destroy/:id](https://dev.twitter.com/docs/api/1/post/statuses/destroy/%3Aid)  
// 
// An `id` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.destroy(opt,fn);
tweets.prototype.destroy = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to destroy");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.post('/1/statuses/destroy/'+opt.id+'.json', opt,fn);
};

// ## retweet(opt,fn)
// See [POST statuses/retweet/:id](https://dev.twitter.com/docs/api/1/post/statuses/retweet/%3Aid)  
// 
// An `id` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.retweet(opt,fn);
tweets.prototype.retweet = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.id) throw Error("An id is required");
    return this.tweeter.post('/1/statuses/retweet/'+opt.id+'.json',opt,fn);
};

// ## update(opt,fn)
// See [POST statuses/update](https://dev.twitter.com/docs/api/1/post/statuses/update)  
// 
// A `status` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.update(opt,fn);
tweets.prototype.update = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.status) throw Error("A status is required");
    return this.tweeter.post('/1/statuses/update.json',opt,fn);
};

// ## udpate\_with\_media(opt,fn)
// See [POST statuses/update\_with\_media](https://dev.twitter.com/docs/api/1/post/statuses/update\_with\_media)  
// 
// A `status` and a `media[]` is required.  
//  
// Example:  
//      
//      tweeter.api.tweets.update_with_media(opt,fn);
tweets.prototype.update_with_media = function(opt,fn) {
    if(typeof opt !== 'object') throw Error("Invalid option to retweet");
    if(!opt.status) throw Error("A status is required");
    if(!opt['media[]']) throw Error("A 'media[]' key is required");
    return this.tweeter.upload('/1/statuses/update_with_media.json',opt,fn);
};
module.exports = exports = tweets;
