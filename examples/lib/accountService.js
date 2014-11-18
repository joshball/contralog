'use strict';
var conLog = require('../../lib')(module);


var fLog = conLog.func('*** ACCOUNT SERVICE accountService');

var accounts = [
    {id: 1, name: 'abby'},
    {id: 2, name: 'bill'},
    {id: 3, name: 'cate'},
    {id: 4, name: 'dave'}
];

var accountService = {
    connect: function () {
        var mLog = fLog.method('*** ACCOUNT SERVICE connecting');
        return mLog.ret(true);
    },
    getAll: function () {
        var mLog = fLog.method('*** ACCOUNT SERVICE get');
        return mLog.ret(accounts);

    },
    get: function (accountId) {
        var mLog = fLog.method('*** ACCOUNT SERVICE get');
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].id === accountId) {
                return mLog.ret(accountId);
            }
        }
        mLog.warn('*** ACCOUNT SERVICE no account found for: %s', accountId);
        return mLog.ret();
    }

};

module.exports = accountService;