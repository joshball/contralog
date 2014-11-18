

// https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
//    The structured stack trace is an Array of CallSite objects, each of which represents a stack frame. A CallSite object defines the following methods
//
//    getThis: returns the value of this
//    getTypeName: returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
//    getFunction: returns the current function
//    getFunctionName: returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
//    getMethodName: returns the name of the property of this or one of its prototypes that holds the current function
//    getFileName: if this function was defined in a script returns the name of the script
//    getLineNumber: if this function was defined in a script returns the current line number
//    getColumnNumber: if this function was defined in a script returns the current column number
//    getEvalOrigin: if this function was created using a call to eval returns a CallSite object representing the location where eval was called
//    isToplevel: is this a toplevel invocation, that is, is this the global object?
//        isEval: does this call take place in code defined by a call to eval?
//        isNative: is this call in native V8 code?
//        isConstructor: is this a constructor call?
var getStack = function (stackNum) {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return isNaN(stackNum) ? stack : stack[stackNum];
};


var getStackNum = function(stackNum){
    stackNum = stackNum || 1;
    return getStack()[stackNum];
};

var safeCall = function(stackNum, method){
    try {
        return getStackNum(stackNum)[method]();
    }catch(e){
        return 'UNSUP';
    }
};


var getLine = function(stackNum){
    return getStackNum(stackNum).getLineNumber();
};
var getFileName = function(stackNum){
    return getStackNum(stackNum).getFileName();
};
var getFunctionName = function(stackNum){
    return getStackNum(stackNum).getFunctionName();
};
var getMethodName = function(stackNum){
    return getStackNum(stackNum).getMethodName();
};
var getTypeName = function(stackNum){
    return safeCall(stackNum, 'getTypeName');
};
var getColumnNumber = function(stackNum){
    return getStackNum(stackNum).getColumnNumber();
};
var isConstructor = function(stackNum){
    return getStackNum(stackNum).isConstructor();
};
var getEvalOrigin = function(stackNum){
    return getStackNum(stackNum).getEvalOrigin();
};
var isEval = function(stackNum){
    return getStackNum(stackNum).isEval();
};
var isNative = function(stackNum){
    return getStackNum(stackNum).isNative();
};
var isToplevel = function(stackNum){
    return getStackNum(stackNum).isToplevel();
};

module.exports = {
    getStack: getStack,
    getLine: getLine,
    getFileName: getFileName,
    getFunctionName: getFunctionName,
    getMethodName: getMethodName,
    getTypeName: getTypeName,
    getColumnNumber: getColumnNumber,
    isConstructor: isConstructor,
    getEvalOrigin: getEvalOrigin,
    isEval: isEval,
    isNative: isNative,
    isToplevel: isToplevel,
    setFuncs: function(){
        Object.defineProperty(global, '__stack', {
            get: getStack
        });
        Object.defineProperty(global, '__line', {
            get: getLine
        });
    }
};