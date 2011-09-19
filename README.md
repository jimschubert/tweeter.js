# tweeter.js
A node.js wrapper around the twitter API :)

To get started, first, run:

    $ make create_conf

Then, edit `conf.js` and update it with your `consumerKey`, `consumerSecret`, and `oauthCallback`.

Fully annotated source is available [here](http://jimschubert.github.com/tweeter.js/tweeter.html)

# Testing
tweeter.js uses nodeunit.  If you haven't used submodules before, after cloning the project execute in terminal:

   $ make submodules

This will initialize submodules and update them (clone).

# Documentation
tweeter.js documentation is created using [docco](https://github.com/jashkenas/docco).  
First, install Pygments. Follow the instructions on [Pygment's download](http://pygments.org/download/) site.
Then, install CoffeeScript:

    sudo npm install -g coffee-script

Finally, install docco:

    sudo npm install -g docco

You may choose to leave off the `-g` option if you don't want to install globally.

# Mixin strategy
tweeter.js uses a 'mixin strategy' for applying API wrappers. I'm not sure that 'mixin strategy' is the correct name for this.

You may choose to only include tweeter.js:

    var Tweeter = require('./tweeter');
    var conf = require('./my_config');
    var tweeter = new Tweeter(conf);

    tweeter.get('/1/statuses/home_timeline', function(err,data) {
        // do something
    });

You may also choose to include some of the wrappers:

    var Tweeter = require('./tweeter');
    var conf = require('./my_config');
    require('./tweeter.lists')(Tweeter);
    require('./tweeter.timelines')(Tweeter);

    var tweeter = new Tweeter(conf);

    tweeter.api.timelines.home_timeline(function(err,data) {
        // do something
    });

These wrappers will throw an `Error` if required options are missing, so they provide a huge benefit over hard-coded API calls.

# License

tweeter.js is Copyright 2011, Jim Schubert and is released under the [MIT License](http://bit.ly/mit-license)
