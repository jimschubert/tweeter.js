// A wrapper for Twitter's friends API
var Friends = function Friends(tweeter) {

    // mark 'friends' API for inclusion
    if(tweeter && typeof tweeter.prototype.include === 'object') {
        if(!(Friends in tweeter.prototype.include)){
            tweeter.prototype.include['friends'] = Friends;
        }
    }

    return {
        follower_ids: this.follower_ids, 
        friend_ids: this.friend_ids,
        friendships_exists: this.friendships_exists, 
        friendships_incoming: this.friendships_incoming,
        friendships_outgoing: this.friendships_outgoing,
        friendships_show: this.friendships_show,
        friendships_create: this.friendships_create,
        friendships_destroy: this.friendships_destroy,
        friendships_lookup: this.friendships_lookup,
        friendships_update: this.friendships_update, 
        friendships_no_retweets: this.friendships_no_retweets       
    };
};

// ## follower_ids(opt,fn)  
// See [GET followers/ids](https://dev.twitter.com/docs/api/1/get/followers/ids).  
// Example:  
//   
//      tweeter.api.friends.followers_ids(opt,fn);
//
// Either a `screen_name` or a `user_id` should be provided.
Friends.prototype.follower_ids = function(opt,fn) {
    if(typeof opt !== 'object')
        throw Error("Invalid option to follower_ids");
    if(!opt.screen_name && !opt.user_id)
        throw Error("Either a screen_name or a user_id is required");

    return this.tweeter.get('/1/followers/ids.json', opt, fn);
};

// ## friend_ids(opt,fn)  
// See [GET friends/ids])(https://dev.twitter.com/docs/api/1/get/friends/ids).  
// Example:  
//   
//      tweeter.api.friends.friend_ids(opt,fn);  
//      
// Either a screen_name or a user_id should be provided.  
Friends.prototype.friend_ids = function(opt,fn) {
   if(typeof opt !== 'object')
        throw Error("Invalid option to friend_ids");
    if(!opt.screen_name && !opt.user_id)
        throw Error("Either a screen_name or a user_id is required");

    return this.tweeter.get('/1/friends/ids.json', opt, fn);
};

// ## friendships_exists(opt, fn)
// See [GET friendships/exists](https://dev.twitter.com/docs/api/1/get/friendships/exists).  
// Example:  
//   
//      tweeter.api.friends.friendships_exists(opt,fn);  
//      
// You'll need an "a" and a "b" to make this request:  
//   
//      { 
//          screen_name_a: 'jimschubert',  
//          screen_name_b: 'ipreferjim'  
//      }  
Friends.prototype.friendships_exists = function(opt,fn) {
    if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_exists");
    if( (opt.screen_name_a && !opt.screen_name_b)
        || (!opt.screen_name_a && opt.screen_name_b) )
        throw Error("screen_name_a and screen_name_b are required");
    if( (opt.user_name_a && !opt.user_name_b)
        || (!opt.user_name_a && opt.user_name_b) )
        throw Error("user_name_a and user_name_b are required");

    return this.tweeter.get('/1/friendships/exists.json', opt, fn);
};

// ## friendships_incoming(opt, fn)  
// See [GET friendships/incoming](https://dev.twitter.com/docs/api/1/get/friendships/incoming).  
// Example:  
//      
//      tweeter.api.friends.friendships_incoming(opt,fn);  
//  
Friends.prototype.friendships_incoming = function(opt,fn) {
     if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_incoming");

    return this.tweeter.get('/1/friendships/incoming.json', opt, fn);
};


// ## friendships_outgoing(opt, fn)  
// See [GET friendships/outgoing](https://dev.twitter.com/docs/api/1/get/friendships/outgoing).  
// Example:  
//      
//      tweeter.api.friends.friendships_outgoing(opt,fn);  
//  
Friends.prototype.friendships_outgoing = function(opt,fn) {
     if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_outgoing");

    return this.tweeter.get('/1/friendships/outgoing.json', opt, fn);
};

// ## friendships_show(opt, fn)  
// See [GET friendships/show](https://dev.twitter.com/docs/api/1/get/friendships/show).  
// Example:  
//      
//      tweeter.api.friends.friendships_show(opt,fn);  
//      
Friends.prototype.friendships_show = function(opt,fn) {
     if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_show");

    return this.tweeter.get('/1/friendships/show.json', opt, fn);
};

// ## friendships_create(opt, fn)  
// See [POST friendships/create](https://dev.twitter.com/docs/api/1/post/friendships/create).  
// Example:
//  
//      tweeter.api.friends.friendships_create(opt,fn);  
//  
Friends.prototype.friendships_create = function(opt,fn) {
     if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_create");

    return this.tweeter.post('/1/friendships/create.json', opt, fn);
};

// ## friendships_destroy(opt, fn)  
// See [POST friendships/destroy](https://dev.twitter.com/docs/api/1/post/friendships/destroy).  
// Example:  
//      
//      tweeter.api.friends.friendships_destroy(opt,fn);  
// 
// Either `user_id` or `screen_name` must be provided.  
Friends.prototype.friendships_destroy = function(opt,fn) {
    if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_destroy");
    if(!opt.user_id && !opt.screen_name)
        throw Error("Either a user_id or screen_name is required");

    return this.tweeter.post('/1/friendships/destroy.json', opt, fn);
};

// ## friendships_lookup(opt,fn)  
// See [GET friendships/lookup](https://dev.twitter.com/docs/api/1/get/friendships/lookup).  
// Example:  
//      
//      tweeter.api.friends.friendships_lookup(opt,fn);  
//      
Friends.prototype.friendships_lookup = function(opt,fn) {
    if(typeof opt !== 'object')
       throw Error("Invalid option to friendships_lookup");

    return this.tweeter.get('/1/friendships/lookup.json', opt, fn);
};

// ## friendships_update(opt,fn)  
// See [POST friendships/update](https://dev.twitter.com/docs/api/1/post/friendships/update).  
// Example:  
//      
//      tweeter.api.friends.friendships_update(opt,fn);  
//      
// The target `user_id` or `screen_name` is required.  
Friends.prototype.friendships_update = function(opt,fn) {
    if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_update");
    if(!opt.user_id && !opt.screen_name)
        throw Error("The target user_id or screen_name is required.");

    return this.tweeter.post('/1/friendships/update.json', opt, fn);
};

// ## freindships\_no\_retweets(opt,fn) 
// See [GET friendships/no\_retweet\_ids](https://dev.twitter.com/docs/api/get-friendshipsno_retweet_ids).  
// Example:  
//  
//      tweeter.api.friends.friendships\_no\_retweets(opt,fn);  
//  
Friends.prototype.friendships_no_retweets = function(opt,fn) {
    if(typeof opt !== 'object')
        throw Error("Invalid option to friendships_no_retweets");

    this.tweeter.useSSL = true;
    return this.tweeter.get('/1/friendships/no_retweet_ids.json', opt, fn);
};

module.exports = exports = Friends;
