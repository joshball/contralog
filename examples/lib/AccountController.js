'use strict';
var conLog = require('../../lib')(module);
var accountService = require('./accountService');

var AccountController = function () {


    var cLog = conLog.ctor('AccountController');

    accountService.connect();
    cLog.trace('connected');

    this.getAll = function(){
        var mLog = cLog.method('getAll');
        return mLog.ret(accountService.getAll());
    };
    this.get = function(accountId){
        var mLog = cLog.method('get', accountId);
        var account = accountService.get(accountId);
        return mLog.ret(account);
    };
};

module.exports = AccountController;