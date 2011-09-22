// Tweeter.js  
// Copyright (c) 2011 James Schubert  
// Released under the [MIT License](http://bit.ly/mit-license)  
//
// A node.js module with simple OAuth 1.0a dancing with Twitter's API.
// It also provides a simple structure for lazy-loading (mixins?) API wrappers.
//  
// All requests emit `data`, `close`, `end`, and `error` events.
// These events are passed back from the internal `http` and `https` clients.
//  
// Tweeter.js doesn't provide any session management. It's a new project, so that should 
// be coming in the future.
var EventEmitter = require('events').EventEmitter,
    util = require('./util'),       // includes util.format, remove in later version
    https = require('https'),       // for SSL requests
    http = require('http'),         // for normal requests
    qs = require('querystring'),    // create and parse parameter strings
    crypto = require('crypto'),     // provides HMAC-SHA1
    url = require('url'),           // parses values sent from twitter to oauthCallback 
    Log = require('./tweeter.log'), // simple logging with configurable streams
    noop = function() { };          // caches an empty function

// Creates a Tweeter object.  
// Throws `Error` if a configuration object is _not_ passed in  
// Throws `Error` if configuration object doesn't have required elements
// 
//      Configuration object structure:
//      {
//          consumerKey:        'YOUR_KEY',     // *
//          consumerSecret:     'YOUR_SECRET',  // *
//          oauthCallback:      'FULL_URL',     // **
//          token:              'YOUR_TOKEN',   // **
//          tokenSecret:        'YOUR_SECRET',  // **
//          accessToken:        'YOUR_TOKEN',   // **
//          accessTokenSecret:  'YOUR_SECRET',  // **
//          verifier:           'VERIFIER',     // **
//          authorizeUrl:       'TWITTER_URL',  // ***
//          test_nonce:         'TEST_NONCE',   // ****
//          test_timestamp:     'TEST_TIME'     // ****
//      }
// 
// \* REQUIRED  
// \*\* usually set internally  
// \*\*\* Provides a default  
// \*\*\*\* For testing purposes  
//
//  Tweeter.js can be used easily with everyauth.  If so, everyauth remains 
// responsible for the authentication and session management.  Pass the access token
// and access token secret into the configuration object and Tweeter.js doesn't do 
// authentication, just API request calls.
var Tweeter = exports = module.exports = function Tweeter(o) {
    if(!o || typeof o !== 'object') {
        throw Error('Invalid initialization object');
    }

    if( typeof o.consumerKey !== 'string' || typeof o.consumerSecret !== 'string') {
        throw Error('Required call: new Tweeter({ consumerKey: "your key", consumerSecret: "your secret" }');
    }

    this.config = o;

    this._init();
};

// Initializes Tweeter object and attached APIs.  
// The API 'mixin' structure allows for lazy-loading only desired APIs
Tweeter.prototype._init = function() {
    var self = this;
    self.apiBase = 'api.twitter.com';
    self.useSSL = false;
    self.api = {};
    for(var api in self.include){
        if(typeof self.include[api] === 'function') {
            self.api[api] = new self.include[api];
            self.api[api].tweeter = this;
        } else { self.log( self.logLevel.ERROR, "Could not create %j", api); }
    }
};

// Instantiates tweeter.log object. -1 disables log output.
Tweeter.prototype.logger = new Log(-1);

// TODO: Remove this for a defined getter/setter.  
// Example:  
// `tweeter.setLogLevel(1)` sets INFO and higher logging.
//  
// I'd much rather a more robust getter/setter:  
// `tweeter.logLevel = 1` and  
// `tweeter.logLevel = tweeter.logLevels.DEBUG`
Tweeter.prototype.setLogLevel = function(level) {
    this.logger.logLevel = level;
};

// TODO: Remove this at some point?   
// Convenience object allows you to call  
// `tweeter.logLevels.DEBUG`  
// instead of  
// `tweeter.log.logLevels.DEBUG`
Tweeter.prototype.logLevels = Log.prototype.logLevels;

// Placeholder for API function references to be included.  
// These will appear at `tweeter.api.[api_name]`  
// For example, `tweeter.api.lists`
Tweeter.prototype.include = {};

// Creates a base options object for `host` and `headers` values.
Tweeter.prototype.__defineGetter__('base', function() {
    var self = this;
    return { 
        host: self.apiBase,
        headers: {
            'Content-Type':'application/json',
            'X-Target-URI': util.format('http%s://%s', (self.useSSL?'s':''), self.apiBase),
            'Connection':'Keep-Alive'
        }
    };
});

// extend method modified from underscore.js `_.extend`  
//     > Underscore.js 1.1.7
//     > (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     > Underscore is freely distributable under the MIT license.
//     > Portions of Underscore are inspired or borrowed from Prototype,
//     > Oliver Steele's Functional, and John Resig's Micro-Templating.
//     > For all details and documentation:
//     > 
//     > [underscore.js](http://documentcloud.github.com/underscore)
Tweeter.prototype.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
        for (var prop in source) {
            if(source[prop] !== void 0) obj[prop] = source[prop];
        }
    });
    return obj;
};

// The generic version of the main functions.  
// Example:  
// `tweeter.apiCall('get', '/1/statuses/home_timeline.json', null, callback);`
//  
// This is the same as:  
// `tweeter.get('/1/statuses/home_timeline.json', null, callback);`  
//  
// Or, you could include the timelines API module:  
//  
//      var Tweeter = require('./tweeter');
//      require('./tweeter.timelines')(Tweeter);
//      
//      var tweeter = new Tweeter(my_conf);
//      tweeter.api.timelines.home_timeline(options, callback);
Tweeter.prototype.apiCall = function(method, path, opt, fn) {
    var self = this;
    if(! (method in ['get','post','delete','put', 'head']) ){
        method = 'get';
    }
    var req = self.prepareCall(path, opt, fn);
    req.method = method;
    self[method].call(this, path, self.extend({}, self.base, req), fn);
    return this;
};

// _Caution: side effects. These are on purpose._  
// Checks parameters as they are passed in, cleans things up.
// Also, creates the full querystring from the path and options
Tweeter.prototype.prepareCall = function(path, opt, fn) {
    if(typeof opt === 'function') {
        fn = opt;
        opt = { };
    } else { opt = opt || { }; }

    var query = qs.stringify(opt);
    var req = { path: path + (query?'?'+query:'') };
    return req;
};

// Creates a new client request for each call
Tweeter.prototype.execute = function(path, options, cb) {
    var self = this, req, client, fn = cb || noop;

    var header = {
        Authorization: self.oauthHeader(options.method, options.path || path)
    };  
    self.extend(options.headers, header);

    self.log(self.logLevels.INFO, 
        'execute() path: %s\n\toptions: %j\n', 
            path, options );

    // client is either node.js https or http object, depending in useSSL
    client = (self.useSSL) ? https : http;

    // Tweeter inherits from EventEmitter for great control over events.
    // It also allows you to pass in a callback with the signature  
    // `function(err,data) { }`
    req = client.request(options, function(res) {
        res.setEncoding('utf8');
        var responseData = [];
        res.on('data', function(d) {
            responseData += d;
            self.emit('data', d);
        });
        res.on('end', function() {
            fn.call(this, null, responseData);
            self.emit('end');
        });
        res.on('close', function() { 
            req.emit('end'); 
        });
    });    

    req.on('error', function(err) {
        fn.call(this, err, null);
        self.emit('error', err);
    });
    
    if(options.body) {
        req.write(options.body, 'utf8');
    }

    req.end();
};

// ## get(path, options, cb)  
// A convenience method for HTTP GET requests
Tweeter.prototype.get = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, req, { method: 'GET' }), cb );
    return this;
};

// ## post(path, options, get)  
// A convenience method for HTTP POST requests
Tweeter.prototype.post = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, req, { method: 'POST' }), cb );
    return this;
};

// TODO: This is a little broken atm  
// This method is a work-in-progress.  
// This is supposed to wrap the update\_with\_media requirements, 
// and most likely doesn't belong in this module at all.
//
// This is the only time `apiBase` should be modified.
// The multipart form-data section seems to be messed up, because
// responses from twitter's API just say there is an error updating the status
// with no status code returned.
Tweeter.prototype.upload = function(path, options, cb) {
    var apiBase = this.apiBase;

    // Get the media to upload
    var media = options['media[]'];
    var filename = options.filename;
    var filetype = options.filetype;
    // These don'e need to be in options object anymore
    delete options['media[]'];
    delete options['filename'];
    delete options['filetype'];
    var boundary = ((new Date()).getTime()) + '.' + Math.random();

    var req = this.prepareCall(path, {}, cb);

    // Set Multipart header information
    var multipart = this.extend({}, this.base);
    this.apiBase = 'upload.twitter.com';
    multipart.host = 'upload.twitter.com';
    multipart.headers['Content-Type'] = 'multipart/form-data' + (media != null ? '; boundary=' + boundary : '');
    multipart.headers['X-Target-URI'] = 'https://upload.twitter.com';

    // Create the Multipart body
    var body = '';
    for(var key in options) {
        body = body + 
            util.format('--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n',
                boundary, key, options[key]);
    }
    
    if(media) {
        body = body + util.format('--%s\r\n' + 
            'Content-Disposition: form-data; name="media[]"; filename="%s"\r\n' +
            'Content-Type: %s\r\n\r\n%s\r\n',
            boundary, filename || 'new-file.png', filetype || 'image/png', media
        );
    }

    body = body + util.format('--%s--\r\n', boundary);

    multipart.headers['Content-length'] = body.length;
    options.body = body;

    // Start the upload
    this.useSSL = true;
    this.execute(path, this.extend({}, multipart, options, req, { method: 'POST' }), 
        function() {
            if(cb && typeof cb === 'function') {
                cb();
            }
            // reset apiBase.
            this.apiBase = apiBase;
        });
    return this;
};

// ## put(path, options, cb)  
// A convenience method for HTTP PUT requests
Tweeter.prototype.put = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, { method: 'PUT' }), cb );
    return this;
};

// ## delete(path, options, cb)  
// A convenience method for HTTP DELETE requests
Tweeter.prototype.delete = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, { method: 'DELETE' }), cb );
    return this;
};

// ## head(path, options, cb)  
// A convenience method for HTTP HEAD requests
Tweeter.prototype.head = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, { method: 'HEAD' }), cb );
    return this;
};

// ## log(level, msg)  
// A convenience method for logging.  
// `level` may be a number 0-5 or `logLevel` object.
// msg may be a string or a formattable string followed by options.  
// 
// Example with a string:  
//
//      tweeter.log(tweeter.logLevels.DEBUG,
//          'My debug log message');
// 
// Example with a format string:
//
//      tweeter.log(0, 
//          'Object: %j\nString: %s\nNumber: %d',
//          { asdf: 'asdf' }, 'some string', 5);
Tweeter.prototype.log = function(level, msg) {
    this.logger.log.apply(this.logger, arguments);
};

// Generates the oauth header object
Tweeter.prototype.oauthHeader = function(method, request, mergeProps) {
    var self = this,
        d = new Date(),
        parts = request.split('?'),
        path = parts[0],
        query = parts.length > 1 ? parts[1] : '';

    var headerObj = {
        oauth_consumer_key: self.config.consumerKey,
        oauth_nonce: self.config.test_nonce || Math.ceil( d.getTime() / Math.random() ),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: self.config.test_timestamp || (''+( (d.getTime() - d.getMilliseconds() )/1000)),
        oauth_version: '1.0'
    };  

    // only add the access token if it exists
    if(self.config.accessToken) {
        headerObj.oauth_token = self.config.accessToken;
    } else if(self.config.token && !headerObj.oauth_token) {
        // if the request token exists, but the access token doesn't, add the request token
        headerObj.oauth_token = self.config.token;
    }
    self.extend(headerObj, mergeProps);

    // If the requested path contains /oauth/*, we have to provide the callback
    if( path.match(/\/oauth\//gi) ) {
        headerObj.oauth_callback = qs.escape(self.config.oauthCallback);
    }

    // Gets the oauth signature and adds it to the header
    var signature = self.oauthSignature(method, path, headerObj, query);
    headerObj.oauth_signature = qs.escape(signature);

    // concat the header object into a csv string
    var header = 'OAuth realm="Twitter API",';
    var oauthParts = [];
    for (var h in headerObj) {
        oauthParts.push(h + '="'+headerObj[h]+'"');
    }
    header+= oauthParts.join(',');

    self.log(self.logLevels.DEBUG, 
        'oauthHeader()\n\tHeader: %j\n', header);
    
    return header;
};

// Creates the HMAC-SHA1 encrypted signature string
Tweeter.prototype.oauthSignature = function(method, path, props, query) {
    var self = this;

    // twitter expects either  
    // `consumerSecret&accessTokenSecret` or `consumerSecret&`
    var composite = qs.escape(self.config.consumerSecret) + '&' + 
        qs.escape(self.config.accessTokenSecret||'');

    self.log(self.logLevels.DEBUG, 
        'oauthSignature() options:\n\tComposite: %s\n\tconsumerSecret: %s\n\taccessTokenSecret: %s\n', 
            composite, self.config.consumerSecret, self.config.accessTokenSecret);

    var hmac = crypto.createHmac('sha1', new Buffer(composite) );
    var sig = self.createSignatureBaseString(method, path, props, query);

    hmac.update(sig);
    var hmacDigest = hmac.digest('base64');

    self.log(self.logLevels.DEBUG, 
        'oauthSignature() encryption parts:\n\tHMAC-SHA1: %s\n\tHashing: %s\n\tSalt: %s\n',
            hmacDigest, sig, composite);

    return hmacDigest;
};

// Creates the signature base string which is to be encrypted.  
// For an example, see [Signing Requests](https://dev.twitter.com/docs/auth/oauth#Signing_Requests)  
Tweeter.prototype.createSignatureBaseString = function(method, path, props, query) {
    var self = this,
        oauthProperties;
    if(props) {
        oauthProperties = [];

        // If the query string is included, it must be added.
        if(query) {
            var q = qs.parse(query);
            for( var k in q ) {
                oauthProperties.push( qs.escape(k + '=' + q[k]) );
            }
        }

        // properties should be sorted by key, _then_ by property.
        // if we push everything as a single string to the array, then sort the array,
        // we end up with the same effect and less error-prone code.
        for( var key in props ) {
            if(props[key]) {
                oauthProperties.push( qs.escape(key)+'%3D'+qs.escape(props[key]) );
            }
        }

        oauthProperties.sort();
        self.log(self.logLevels.DEBUG, 
            'createSignatureBaseString()\n\tSorted array: %j', oauthProperties );
    }
    var uri = util.format('http%s://%s%s', (self.useSSL?'s':''), self.apiBase, path||'');
    var sig = method+'&'+qs.escape(uri) +'&' + oauthProperties.join('%26');

    self.log(self.logLevels.DEBUG, 
        'createSignatureBaseString()\n\tSignature: %s\n', sig);
    return sig;
};

// ## authenticate(callback)
// Begins the OAuth 'dance'.
Tweeter.prototype.authenticate = function(cb) {
    var self = this,
        cb = cb || noop;

    // These aren't currently set anywhere.
    if(self.isAuthenticated && !self.authenticationError) {
        cb();
        return;
    }
    return self.getRequestToken(cb);
};

// returns the authorizationUrl to the callback's data object
// `function(err,data)` is expected callback signature.  
// To access the authorizationUrl, use:  
// `data.authUrl`
Tweeter.prototype.getRequestToken = function(cb) {
    cb = cb||noop;
    var self = this;
    self.useSSL = true;

    return this.post('/oauth/request_token', { }, function(err,data) {
        if(data && data.match(/Failed/gi)) {
            cb(new Error(data));
            return;
        }

        var response = qs.parse(data);
        if(response.oauth_callback_confirmed) {
            self.config.token = response.oauth_token;
            self.config.tokenSecret = response.oauth_token_secret;
        } else {
            cb(new Error("Callback was not accepted by Twitter API"));
            return;
        }

        // TODO: just return the string as data instead of creating a new object
        cb(null, { authUrl: util.format('%s?oauth_token=%s', 
            (self.config.authorizeUrl||'http://api.twitter.com/oauth/authorize'),
            self.config.token)
        });
    });
};

// ## parseCallback(requestUrl, callback)
// Parses the callback URL (token and verifier)  
// For an example, see the [API docs](https://dev.twitter.com/docs/auth/oauth#Sending_the_user_to_authorization)
//    
// Note: fn can be your call to the api.
Tweeter.prototype.parseCallback = function(reqUrl,fn) {
    var self = this;
    var values = url.parse(reqUrl||'');
    var response = qs.parse(values.query);

    self.log(self.logLevels.DEBUG, 
        'parseCallback()\n\tvalues:%j\n\tresponse%j', values, response);

    if(response && self.config.token == response.oauth_token) {
        self.config.verifier = response.oauth_verifier;
    }  
    self.getAccessToken(fn);
};

// Requests an access token from twitter's API
Tweeter.prototype.getAccessToken = function(fn) {
    var self = this,
        fn = fn||noop;

    self.log(self.logLevels.DBUG, 'getAccessToken()');

    return self.get('/oauth/access_token', { }, function(err,data) {
        if(err) { fn.call(self, err, null); }
        if(data) {
            var response = qs.parse(data);
            if(response) {
                self.log(self.logLevels.DEBUG, 'getAccessToken()\n\tresponse: %j', response);
                self.config.accessToken = response.oauth_token;
                self.config.accessTokenSecret =
                    response.oauth_token_secret;
            }
        }
        fn.call(self);        
    });
};

/**
 * Inherit from `EventEmitter`.
 */
Tweeter.prototype.__proto__ = EventEmitter.prototype;
