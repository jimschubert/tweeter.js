var EventEmitter = require('events').EventEmitter,
    util = require('./util'),
    https = require('https'),
    http = require('http'),
    qs = require('querystring'),
    crypto = require('crypto'),
    url = require('url'),
    noop = function() { };

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

Tweeter.prototype._init = function() {
    var self = this;
    self.streams.debug = process.stdout;
    self.streams.info = process.stdout;
    self.streams.error = process.stderr;
    self.apiBase = 'api.twitter.com';
    self.useSSL = false;

    self.api = {};
    for(var api in self.include){
        if(typeof self.include[api] === 'function') {
            self.api[api] = new self.include[api];
            self.api[api].tweeter = this;
        } else { console.log("Could not create %j", api); }
    }
};

Tweeter.prototype.include = {};

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

Tweeter.prototype.logLevel = {
    get DEBUG() { return 'debug'; },
    get INFO() { return 'info'; },
    get ERROR() { return 'error'; }
};

Tweeter.prototype.streams = {
    get debug() {
        return this._debug;
    },
    set debug(val) {
        if(!(val instanceof EventEmitter) && typeof val.write !== 'function' ){
            throw Error("debug must be set as a valid Stream");
        }
        this._debug = val;
    },
    get info() {
        return this._info;
    },
    set info(val) {
        if(!(val instanceof EventEmitter) && typeof val.write !== 'function' ){
            throw Error("info must be set as a valid Stream");
        }
        this._info = val;
    },
    get error() {
        return this._error;
    },
    set error(val) {
        if(!(val instanceof EventEmitter) && typeof val.write !== 'function' ) {
            throw Error("error must be set as a valid Stream");
        }
        this._error = val;
    }
};

// extend method modified from underscore.js _.extend
//     Underscore.js 1.1.7
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore
Tweeter.prototype.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
        for (var prop in source) {
            if(source[prop] !== void 0) obj[prop] = source[prop];
        }
    });
    return obj;
};

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

// Caution: side effects. These are on purpose.
Tweeter.prototype.prepareCall = function(path, opt, fn) {
    if(typeof opt === 'function') {
        fn = opt;
        opt = { };
    } else { opt = opt || { }; }

    var query = qs.stringify(opt);
    var req = { path: path + (query?'?'+query:'') };
    return req;
};

Tweeter.prototype.execute = function(path, options, cb) {
    var self = this, req, client, fn = cb || noop;
    self.log(self.logLevel.INFO, 'execute() path %s', path );
    self.log(self.logLevel.INFO, 'execute() options %j', options );

    var header = {
        Authorization: self.oauthHeader(options.method, path)
    };
    self.extend(options.headers, header);

    console.log('execute() headers: %j', options.headers );

    client = self.useSSL ? https : http;
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
    req.end();
};

Tweeter.prototype.get = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, req, { method: 'GET' }), cb );
    return this;
};

Tweeter.prototype.post = function(path, options, cb) {
    var req = this.prepareCall(path, options, cb);
    this.execute(path, this.extend({}, this.base, options, req, { method: 'POST' }), cb );
    return this;
};

Tweeter.prototype.put = function(path, options, cb) {
    if(typeof options === 'function') {
        cb = options;
        options = {};
    } else { options = options || {}; }

    this.execute(path, this.extend(options, { method: 'PUT' }), cb );
    return this;
};

Tweeter.prototype.delete = function(path, options, cb) {
    if(typeof options === 'function') {
        cb = options;
        options = {};
    } else { options = options || {}; }

    this.execute(path, this.extend(options, { method: 'DELETE' }), cb );
    return this;
};

Tweeter.prototype.head = function(path, options, cb) {
    if(typeof options === 'function') {
        cb = options;
        options = {};
    } else { options = options || {}; }

    this.execute(path, this.extend(options, { method: 'HEAD' }), cb );
    return this;
};

Tweeter.prototype.log = function(level, msg) {
    try {
        var stream = this.streams[level];
        stream.write( util.format.apply(this, Array.prototype.slice.call(arguments,1) ) + '\n');
    } catch (err) { 
        console.error("Error logging %j with arguments %j\n", level, arguments);
        if(err){
            console.error("Error:\n%j\n", err);
        }
    }
};

Tweeter.prototype.oauthHeader = function(method, request, mergeProps) {
    var self = this,
        d = new Date(),
        parts = request.split('?'),
        path = parts[0],
        query = parts.length > 1 ? parts[1] : '';

    var headerObj = {
        oauth_consumer_key: self.config.consumerKey,
        oauth_nonce: Math.ceil( d.getTime() / Math.random() ),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: ''+( (d.getTime() - d.getMilliseconds() )/1000),
        oauth_version: '1.0'
    };  

    if(self.config.accessToken) {
        headerObj.oauth_token = self.config.accessToken;
    } else if(self.config.token && !headerObj.oauth_token) {
        headerObj.oauth_token = self.config.token;
    }
    self.extend(headerObj, mergeProps);

    if( path.match(/\/oauth\//gi) ) {
        headerObj.oauth_callback = qs.escape(self.config.oauthCallback);
    }

    var signature = self.oauthSignature(method, path, headerObj, query);
    headerObj.oauth_signature = qs.escape(signature);

    var header = 'OAuth realm="Twitter API",';
    var oauthParts = [];
    for (var h in headerObj) {
        oauthParts.push(h + '="'+headerObj[h]+'"');
    }
    header+= oauthParts.join(',');
    self.log(self.logLevel.DEBUG, 'Header: %j\n', header);
    return header;
};

Tweeter.prototype.oauthSignature = function(method, path, props, query) {
    var self = this;
    var composite = qs.escape(self.config.consumerSecret) + '&' + 
        qs.escape(self.config.accessTokenSecret||'');

    console.log('Composite: %s\nconsumerSecret: %s\naccessTokenSecret: %s\n', 
        composite, self.config.consumerSecret, self.config.accessTokenSecret);

    var hmac = crypto.createHmac('sha1', new Buffer(composite) );
    var sig = self.createSignatureBaseString(method, path, props, query);
    console.log(sig);
    hmac.update(sig);
    var hmacDigest = hmac.digest('base64');
    self.log(self.logLevel.DEBUG, 'HMAC-SHA1: %s\nHashing: %s\nSalt: %s\n',
        hmacDigest, sig, composite);
    return hmacDigest;
};

Tweeter.prototype.createSignatureBaseString = function(method, path, props, query) {
    var self = this,
        oauthProperties;
    if(props) {
        oauthProperties = [];
        if(query) oauthProperties.push(query);

        for( var key in props ) {
            if(props[key]) {
                oauthProperties.push( qs.escape(key)+'%3D'+qs.escape(props[key]) );
            }
        }

        oauthProperties.sort();
        console.log('Sorted array: ' +util.inspect(oauthProperties) );
    }
    var uri = util.format('http%s://%s%s', (self.useSSL?'s':''), self.apiBase, path||'');
    var sig = method+'&'+qs.escape(uri) +'&' + oauthProperties.join('%26');

    self.log(self.logLevel.DEBUG, 'Signature: %s\n', sig);
    return sig;
};

Tweeter.prototype.authenticate = function(cb) {
    var self = this,
        cb = cb || noop;
    if(self.isAuthenticated && !self.authenticationError) {
        cb();
        return;
    }
    return self.getRequestToken(cb);
};

// returns the authorizationUrl to the callback's data object
// function(err,data) is expected
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

        cb(null, { authUrl: util.format('%s?oauth_token=%s', 
            (self.config.authorizeUrl||'http://api.twitter.com/oauth/authorize'),
            self.config.token)
        });
    });
};

// Note: fn can be your call to the api.
Tweeter.prototype.parseCallback = function(reqUrl,fn) {
    var self = this;
    var values = url.parse(reqUrl||'');
    var response = qs.parse(values.query);
    if(response && self.config.token == response.oauth_token) {
        self.config.verifier = response.oauth_verifier;
    }  
    console.log('calling getAccessToken');
    self.getAccessToken(fn);
};

Tweeter.prototype.getAccessToken = function(fn) {
    var self = this,
        fn = fn||noop;
        console.log('in get access token');
    return self.get('/oauth/access_token', { }, function(err,data) {
        if(err) { fn.call(self, err, null); }
        if(data) {
            var response = qs.parse(data);
            if(response) {
                self.config.accessToken = response.oauth_token;
                self.config.accessTokenSecret =
                    response.oauth_token_secret;
            }
        }
        fn.call(self);        
    });
};

/**
 * Inherite from `EventEmitter`.
 */
Tweeter.prototype.__proto__ = EventEmitter.prototype;
