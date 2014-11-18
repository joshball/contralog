'use strict';

var contraLog = require('../lib/')(module);

var dumpAll=function(logger, msg){
    console.log('\n-----------------------------');
    console.log('---- GROUP: %s', msg);
    console.log('-----------------------------');
    logger.trace(msg);
    logger.debug(msg);
    logger.info(msg);
    logger.warn(msg);
    logger.error(msg);
    logger.exception(msg);
    console.log('-----------------------------');
}
contraLog.setOptions({level: 'error'});
dumpAll(contraLog, 'should dump only errors');
contraLog.setLevel('info');
dumpAll(contraLog, 'should dump only info, warnings and errors');
contraLog.resetOptions('level', 'warn');
dumpAll(contraLog, 'should dump everything');
