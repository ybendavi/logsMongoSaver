
let queue = [];

function handleSignal(signal) {
    console.log(`Received signal ${signal}`);
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: '',
        message: `Received signal ${signal}`,
        type: 'signal',
        signal: signal,
        promise: '',
        reason: '',
        timestamp: new Date().getTime(),
    }
    //processEventQueueObj.push(logdata);
    //processprocessEventQueueObj();
    queue.push(logdata);
    console.log('Received signal', signal);
}

const uncaughtExceptionHandler = function(err) {
    //console.log("uncaughtException", err);
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: err,
        message: '',
        type: 'uncaughtException',
        signal: '',
        promise: '',
        reason: '',
        timestamp: new Date().getTime(),
    };
    queue.push(logdata);
};

const unhandledRejectionHandler =  function(err, promise) {

    //console.log("unhandledRejectionHandler", err);
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: err,
        message: '',
        type: 'unhandledRejection',
        signal: '',
        promise: promise,
        reason: '',
        timestamp: new Date().getTime(),
    };
    console.log('unhandledRejectionHandler', err);
    queue.push(logdata);
};

const exitHandler = function(code) {
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: code,
        error: '',
        message: `exit with code ${code}`,
        type: 'exit',
        signal: '',
        promise: '',
        reason: '',
        timestamp: new Date().getTime(),
    };
    console.log('exit with codeeeeeeeeeeeee', code);
    queue.push(logdata);
    console.log('queue', queue);
};

const warningHandler =  function(warning) {

    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: warning.message,
        message: '',
        type: 'warning',
        signal: '',
        promise: '',
        reason: '',
        timestamp: new Date().getTime(),
    };
    console.log('warning', warning);
    queue.push(logdata);
};

const multipleResolvesHandler = function(type, promise, reason) {
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: reason,
        message: `${type}: ${promise}`,
        type: 'multipleResolves',
        signal: '',
        promise: promise,
        reason: reason,
        timestamp: new Date().getTime(),
    };
    console.log(`multipleResolve${type}: ${promise}`);
    queue.push(logdata);
};
