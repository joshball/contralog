'use strict';

var contraLog = require('../lib/')(module, {useNull:true});

contraLog.error('SHOULD NOT LOG THIS');