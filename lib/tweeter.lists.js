// A wrapper for Twitter's lists API
var Lists = function Lists(tweeter) {

    // mark 'lists' API for inclusion
    if(tweeter && typeof tweeter.prototype.include === 'object') {
        if(!(Lists in tweeter.prototype.include))
        {
            tweeter.prototype.include['lists'] = Lists;
        }
    }

    return {
        lists: this.lists,
        members: this.members
    };
};

// ## lists(opt,fn)
// See [GET lists](https://dev.twitter.com/docs/api/1/get/lists).  
// Example:  
//      
//      tweeter.api.lists.lists(opt, fn);
Lists.prototype.lists = function(opt,fn) {
    return this.tweeter.get('/1/lists.json', opt, fn);
};

// ## members(opt,fn)
// See [GET lists/members](https://dev.twitter.com/docs/api/1/get/lists/members).  
// Example:   
//      
//      tweeter.api.lists.members(opt,fn);
//
// Either a `list_id` or a `slug` is required.  
// If providing a `list_slug`, an `owner_screen_name` or `owner_id` is also required.
Lists.prototype.members = function(opt,fn) {
    return this.tweeter.get('/1/lists/members.json', opt, fn);
};

module.exports = exports = Lists;
