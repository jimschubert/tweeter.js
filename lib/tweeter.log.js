var util = require('./util'),
    EventEmitter = require('events').EventEmitter,
    slice = Array.prototype.slice;

var Log = module.exports = exports = function Log(level) {
    this.streams.debug = process.stdout;
    this.streams.info = process.stdout;
    this.streams.warn = process.stdout;
    this.streams.error = process.stderr;

    this.logLevel = level || -1;
}

// [DISABLED] else [DEBUG > INFO > WARN > ERROR]
Log.prototype.logLevels = {
    DISABLED:   { value: -1, stream: 'none' },
    DEBUG:      { value: 0, stream: 'debug' },
    INFO:       { value: 1, stream: 'info' },
    WARN:       { value: 2, stream: 'warn' },
    ERROR:      { value: 3, stream: 'error' }
}

var requiresStream = function(val) {
    if(!(val instanceof EventEmitter) && typeof val.write !== 'function') {
        throw Error("Invalid Stream");
    }
}

Log.prototype.streams = {
    get none() { return { write: function() { }}; },
    get debug() { return this._debug; },
    set debug(val) {
        requiresStream(val);
        this._debug = val;
    },
    get info() { return this._info; },
    set info(val) {
        requiresStream(val);
        this._info = val;
    },
    get error() { return this._error; },
    set error(val) {
        requiresStream(val);
        this._error = val;
    }
}

var colors = [32, 30, 37, 35, 34];
Log.prototype.log = function(level, msg) {
    var original = level;
    try {
        if(typeof level === 'string'){
            level = this.logLevels[level.toUpperCase()];
        }
        // get logLevel value
        if( (this.logLevel > -1) && (level.value >= this.logLevel) ) {
            var stream = this.streams[level.stream];
            stream.write( util.format.call(this, '[\033[%sm%s\033[39m]\t', colors[level.value], level.stream) );
            stream.write( util.format.apply(this, slice.call(arguments,1) ) + '\n');
        }
    } catch (err) { 
        console.error("logging is improperly configured!\nIs %j a supported logLevel?\nError:\n%j\n",original, err);
    }
}
