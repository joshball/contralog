'use strict';

var cl = require('../lib/')(module);
cl.on();
cl.debug('now you should see three more calls');

function m1(){
    m2();
}
function m2(){
    m3();
}
function m3(){
    var e = new Error('My Error Exception');
    cl.exception(e);
}

m1();