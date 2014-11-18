'use strict';



var windowsColors = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white'
];

var loggingLevels = {};

var i = 1;
var first = windowsColors[0];
windowsColors.forEach(function(color) {
    loggingLevels[color] = {name: color, num: i++, color: color};
    var brightColor = color + 'Bright';
    loggingLevels[brightColor] = {name: brightColor, num: i++, color: brightColor};
});

console.log(JSON.stringify(loggingLevels, undefined, 4));
var contraLog = require('../lib/')(module, {levels: loggingLevels, level: first});

//contraLog.setOption('levels', loggingLevels);
//contraLog.setOption('level', last);

Object.keys(loggingLevels).forEach(function(level){
    console.log('\n%s:', level);
    contraLog[level]('Logging: ' + level);
});
//var dumpAll=function(logger, msg){
//    logger.trace(msg);
//    logger.debug(msg);
//    logger.info(msg);
//    logger.warn(msg);
//    logger.error(msg);
//    var e = new Error('Some error');
//    logger.exception(e);
//    console.log('-----------------------------');
//}
//dumpAll(contraLog, 'These colors should look good for windows');
//dumpAll(contraLog, 'I love Windows');
