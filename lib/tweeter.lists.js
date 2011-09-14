var Lists = function Lists(tweeter) {
    if(tweeter && tweeter.prototype && typeof tweeter.prototype.include === 'object') {
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

Lists.prototype.lists = function(opt,fn) {
    return this.tweeter.get('/1/lists.json', opt, fn);
};

Lists.prototype.members = function(opt,fn) {
    return this.tweeter.get('/1/lists/members.json', opt, fn);
};

module.exports = exports = Lists;
