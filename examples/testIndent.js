'use strict';

var contraLog = require('../lib/')(module);

var obj = {
    sub: {
        subSub: {
            list: [1,2,3,4,5,6,7,8]
        }
    },
    name: 'abby',
    long: 'super duper ruper cooper'
};

var dumpAll=function(logger, msg){
    console.log('\n-----------------------------');
    console.log('---- GROUP: %s', msg);
    console.log('-----------------------------');
    logger.trace(msg, obj);
    logger.debug(msg);
    logger.info(msg);
    logger.warn(msg);
    logger.error(msg);
    logger.exception(msg);
    console.log('-----------------------------');
}

var levelTwo = contraLog.method('level2');
var levelThree = levelTwo.method('level3');
var levelFour = levelThree.method('level3');

dumpAll(contraLog, 'root');
dumpAll(levelFour, 'L4');
dumpAll(levelTwo, 'L2');