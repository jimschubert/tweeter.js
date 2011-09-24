# tweeter.js
A node.js wrapper around the twitter API :)

# Installation

## From npm
You can easily install tweeter.js from the npm repository:

    $ npm install tweeter

This will install tweeter into `./node_modules/tweeter`.

## From the Respository
First, clone the repository:

    $ git clone git@github.com:jimschubert/tweeter.js.git
    $ cd tweeter.js

To get started, first, run:

    $ make create_conf

Then, edit `conf.js` and update it with your `consumerKey`, `consumerSecret`, and `oauthCallback`.

Now, you're ready to open a node REPL environment and start playing with tweeter.js.

Fully annotated source is available [here](http://jimschubert.github.com/tweeter.js/tweeter.html)

# Testing
tweeter.js uses nodeunit for testing.  Be sure to install dependencies via npm:

    $ npm install -d

This will install all dependencies as specified in `package.json`.

You can then run tests:

    $ node test/tweeter.test.js

The test currently opens `google-chrome` and directs to Twitter's authentication page for the application you've specified in `./conf` (created in the previous section).  It then calls `tweeter.get('/1/statuses/home_timeline.json',...` and dumps the results to the response of the locally running server.

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

    var Tweeter = require('tweeter');
    var conf = require('./my_config');
    var tweeter = new Tweeter(conf);

    tweeter.get('/1/statuses/home_timeline', function(err,data) {
        // do something
    });

You may also choose to include some of the wrappers:

    var Tweeter = require('tweeter');
    var conf = require('./my_config');
    require('tweeter/lib/tweeter.lists')(Tweeter);
    require('tweeter/lib/tweeter.timelines')(Tweeter);

    var tweeter = new Tweeter(conf);

    tweeter.api.timelines.home_timeline(function(err,data) {
        // do something
    });

These wrappers will throw an `Error` if required options are missing, so they provide a huge benefit over hard-coded API calls.

# License

tweeter.js is Copyright 2011, Jim Schubert and is released under the [MIT License](http://bit.ly/mit-license)
