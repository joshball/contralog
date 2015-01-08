contralog
=========

Debug/tracing library for node.

// always require it with the current module global
var cl = require('contralog')(module);

//
// logging is off by default. Turn it on if you want to log to the console
//

cl.on();
// cl.off(); // turn it off again

//
// Standard logging:
//

cl.error('some error');
cl.warn('some warning');
cl.info('some info');
cl.debug('some debug');
cl.trace('some trace');


//
// Change the logging level:
//

cl.setLevel('warn');

cl.ctor();
cl.ret();
cl.exception(exception);
cl.log(logMessageLevelName, message);
cl.logRaw(logMessageLevelName, message);
cl.stack(level, num, logLevel);
cl.lineBreak(lineString, color);
cl.dumpWithHeader(title, thing);
cl.wrap(title, message);
cl.dumpWithStack(title, thing, stackStart, stackEnd);
