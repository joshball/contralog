'use strict';
var ContraLogLevels = require('./ContraLogLevels');
var _ = require('lodash');

var defaultOptions = {
    level: 'trace',
    timestampFormat: 'HH:mm ss.SSS',
    lineFormatVar: '#',
    indent: 4,
    lineFormat: '[#level][#mod:#line] #msg',
    dumpWithLines: false,
    dumpLocation: true,
    dumpStack: true
};

var ContraLogOptions = function (options) {
    options = _.extend({}, defaultOptions, options);

    this.levels = new ContraLogLevels(options.levels);
    delete options.levels;
    var self = this;

    this.validateOption = function(option, value) {
        if(option === 'levels'){
            throw new Error('Please set levels with setLevels call')
        }
        if(option === 'level'){
            if(!self.levels[value]){
                throw new Error('Invalid Log Level: ' + value);
            }
        }
        return value;
    };

    var getValidOption = function(option){
        var value = options[option];
        return self.validateOption(option, value);
    };

    this.level = getValidOption('level');
    this.timestampFormat = getValidOption('timestampFormat');
    this.lineFormatVar = getValidOption('lineFormatVar');
    this.indent = getValidOption('indent');

    this.lineFormat = getValidOption('lineFormat');
    this.dumpWithLines = getValidOption('dumpWithLines');
    this.dumpLocation = getValidOption('dumpLocation');
    this.dumpStack = getValidOption('dumpStack');


    this.validateOptions = function(options){
        Object.keys(options)
            .forEach(function(key){
                self.validateOption(key, options[key]);
            });
        return this;
    };

    this.setOption = function(option, value){
        this.validateOption(options, value);
        this[option] = value;
        return this;
    };

    this.setOptions = function(options){
        this.validateOptions(options);
        var self = this;
        Object.keys(options)
            .forEach(function(key){
                self[key] = options[key];
            });
        return this;
    };

    this.reset = function(){
        this.setOptions(defaultOptions);
        return this;
    };

    this.setOptions(options);
};

module.exports = ContraLogOptions;