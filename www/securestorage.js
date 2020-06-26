var SecureStorage, SecureStorageAndroid, SecureStorageBrowser;

var SUPPORTED_PLATFORMS = ['android', 'ios', 'windows'];

var _checkCallbacks = function (success, error) {
    if (typeof success != 'function') {
        throw new Error('SecureStorage failure: success callback parameter must be a function');
    }
    if (typeof error != 'function') {
        throw new Error('SecureStorage failure: error callback parameter must be a function');
    }
};

//Taken from undescore.js
var _isString = function isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
};

var _checkIsString = function(value){
    if (!_isString(value)) {
        throw new Error('Value is not a String');
    }
};

/**
 * Helper method to execute Cordova native method
 *
 * @param   {String}    nativeMethodName Method to execute.
 * @param   {Array}     args             Execution arguments.
 * @param   {Function}  success          Called when returning successful result from an action.
 * @param   {Function}  error            Called when returning error result from an action.
 *
 */
var _executeNativeMethod = function (success, error, nativeMethodName, args) {
    var fail;
    // args checking
    _checkCallbacks(success, error);

    // By convention a failure callback should always receive an instance
    // of a JavaScript Error object.
    fail = function(err) {
        // provide default message if no details passed to callback
        if (typeof err === 'undefined') {
            error(new Error('Error occured while executing native method.'));
        } else {
            // wrap string to Error instance if necessary
            error(_isString(err) ? new Error(err) : err);
        }
    };

    cordova.exec(success, fail, 'SecureStorage', nativeMethodName, args);
};

SecureStorageAndroid = function (success, error, service, options) {
    var platformId = cordova.platformId;
    var opts = options && options[platformId] ? options[platformId] : {};

    this.service = service;

    try {
        _executeNativeMethod(success, error, 'init', [this.service, opts]);
    } catch (e) {
        error(e);
    }
    return this;
};

SecureStorageBrowser = function (success, error, service) {    
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageBrowser.prototype = {
    get: function (success, error, key) {
        var value;
        try {
            _checkCallbacks(success, error);
            value = localStorage.getItem('_SS_' + key);
            if (!value) {
                error(new Error('Key "' + key + '" not found.'));
            } else {
                success(value);
            }
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _checkIsString(value);
            _checkCallbacks(success, error);
            localStorage.setItem('_SS_' + key, value);
            success(key);
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
    },

    keys: function (success, error) {
        var i, len, key, keys = [];
        try {
            _checkCallbacks(success, error);
            for (i = 0, len = localStorage.length; i < len; ++i) {
                key = localStorage.key(i);
                if ('_SS_' === key.slice(0, 4)) {
                    keys.push(key.slice(4));
                }
            }
            success(keys);
        } catch (e) {
            error(e);
        }
    },

    clear: function (success, error) {
        var i, key;
        try {
            _checkCallbacks(success, error);
            i = localStorage.length;
            while (i-- > 0) {
                key = localStorage.key(i);
                if (key && '_SS_' === key.slice(0, 4)) {
                    localStorage.removeItem(key);
                }
            }
            success();
        } catch (e) {
            error(e);
        }
    }
};

SecureStorageAndroid.prototype = {
    get: function (success, error, key) {
        try {
            if (!_isString(key)) {
                throw new Error('Key must be a string');
            }
            _executeNativeMethod(success, error, 'get', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            if (!_isString(value)) {
                throw new Error('Value must be a string');
            }
            _executeNativeMethod(success, error, 'set', [this.service, key, value]);
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            if (!_isString(key)) {
                throw new Error('Key must be a string');
            }
            _executeNativeMethod(success, error, 'remove', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    keys: function (success, error) {
        try {
            _executeNativeMethod(success, error, 'keys', [this.service]);
        } catch (e) {
            error(e);
        }
    },

    clear: function (success, error) {
        try {
            _executeNativeMethod(success, error, 'clear', [this.service]);
        } catch (e) {
            error(e);
        }
    },

    secureDevice: function (success, error) {
        try {
            _executeNativeMethod(success, error, 'secureDevice', []);
        } catch (e) {
            error(e);
        }
    }

};

if (cordova.platformId === 'android') {
    SecureStorage = SecureStorageAndroid;
}

if (cordova.platformId === 'browser') {
    SecureStorage = SecureStorageBrowser;
}

if (!cordova.plugins) {
    cordova.plugins = {};
}

if (!cordova.plugins.SecureStorage) {
    cordova.plugins.SecureStorage = SecureStorage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
}
