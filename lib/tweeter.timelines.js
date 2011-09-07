var timelines = function timelines(tweeter) {
    if(tweeter && tweeter.prototype && typeof tweeter.prototype.include === 'object') {
        if(!(timelines in tweeter.prototype.include))
        {
            tweeter.prototype.include['timelines'] = timelines;
        }
    }

    return {
        home_timeline: this.home_timeline
    };
};

timelines.prototype.home_timeline = function(opt,fn) {
    return this.tweeter.get('/1/statuses/home_timeline.json', opt, fn);
};

module.exports = exports = timelines;
