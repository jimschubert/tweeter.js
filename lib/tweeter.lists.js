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
        members: this.members,
        members_create: this.members_create,
        members_destroy: this.members_destroy
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
    if(typeof opt !== 'object') 
        throw Error("Invalid option to members");
    if(!opt.list_id && !opt.slug) 
        throw Error("Either a list_id or a slug is required for members.");
    return this.tweeter.get('/1/lists/members.json', opt, fn);
};

// ## members_create(opt,fn)
// See [POST lists/members/create](https://dev.twitter.com/docs/api/1/post/lists/members/create).
// Example:  
//      
//      tweeter.api.lists.members_create(opt,fn);
//      
// Either a `list_id` or a `slug` is required.  
// If providing a `list_slug`, an `owner_screen_name` or `owner_id` is also required.
Lists.prototype.members_create = function(opt,fn) {
    if(typeof opt !== 'object') 
        throw Error("Invalid option to members_create");
    if(!opt.list_id && !opt.slug) 
        throw Error("Either a list_id or a slug is required for members_create.");
    if(opt.slug && !(opt.owner_screen_name || opt.owner_id)) 
        throw Error("If providing a list_slug, an owner_screen_name or owner_id is also required.");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required for members_create");

    this.tweeter.useSSL = true;
    return this.tweeter.post('/1/lists/members/create.json', opt, fn);
};

// ## members_destroy(opt,fn)
// See [POST lists/members/destroy](https://dev.twitter.com/docs/api/1/post/lists/members/destroy).
// Example:  
//      
//      tweeter.api.lists.members_destroy(opt,fn);
//      
// Either a `list_id` or a `slug` is required.  
// If providing a `list_slug`, an `owner_screen_name` or `owner_id` is also required.
Lists.prototype.members_destroy = function(opt,fn) {
    if(typeof opt !== 'object') 
        throw Error("Invalid option to members_create");
    if(!opt.list_id && !opt.slug) 
        throw Error("Either a list_id or a slug is required for members_create.");
    if(opt.slug && !(opt.owner_screen_name || opt.owner_id)) 
        throw Error("If providing a list_slug, an owner_screen_name or owner_id is also required.");
    if(!opt.user_id && !opt.screen_name) throw Error("A screen_name or user_id is required for members_create");

    this.tweeter.useSSL = true;
    return this.tweeter.post('/1/lists/members/destroy.json', opt, fn);
};


module.exports = exports = Lists;
