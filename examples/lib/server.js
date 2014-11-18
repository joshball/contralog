'use strict';
var conLog = require('../../lib')(module);

var AccountController = require('./AccountController');

conLog.debug('Creating AccountController');
var ac  = new AccountController();


conLog.trace('server started');

module.exports = {
    testGetAll: function(){
        conLog.trace('server calling ac.getAll');
        return ac.getAll();
    },
    testGet: function(accountId){
        conLog.trace('server calling ac.get(%d)', accountId);
        return ac.get(accountId);
    }
};