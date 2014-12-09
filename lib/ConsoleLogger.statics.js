'use strict';

var util = require('util');

module.exports = function(ConsoleLogger){

    ConsoleLogger.jsonString = function (obj, indent) {
        try {
            return JSON.stringify(obj || {}, undefined, indent || 4);
        }
        catch(e){
            return util.inspect(obj);
        }
    };

    ConsoleLogger.jsonLines = function (obj, indent) {
        var json = ConsoleLogger.jsonString(obj, indent);
        return json.split('\n');
    };

};
