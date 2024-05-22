import mongoose from 'mongoose';
import process from 'node:process';
import * as logsFunc from './logs_db_functions.js';

const signals = [
    'SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGPIPE', 'SIGQUIT', 'SIGTERM',
    'SIGUSR1', 'SIGUSR2', 'SIGCHLD', 'SIGCONT', 'SIGSTOP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU',
    'SIGBUS', 'SIGFPE', 'SIGILL', 'SIGSEGV', 'SIGTRAP', 'SIGSYS'
  ];

function saveLog(logdata) {
    if (isConnected()) { logsFunc.add(logdata); }
    else { console.log("LOG: ", logdata); }
}
function activateSignalListeners() {
    signals.forEach((sig) => process.on(sig, handleSignal));
}
function isConnected() {
    if (mongoose.connection.readyState === 1)
    {
         return true;
    }else{
        console.error('MongoDB not connected');
        return false;
    }
}

function desactivateSignalListeners() {
    signals.forEach((sig) => process.removeListener(sig, handleSignal));
}

function activateListOfSignalListeners(list) {
    list.forEach((sig) => process.on(sig, handleSignal));
}

function desactivateListOfSignalListeners(list) {
    list.forEach((sig) => process.removeListener(sig, handleSignal));
}

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
        timestamp: new Date().getTime(),
    }
    saveLog(logdata);
    desactivateSignalListeners();
    process.kill(process.pid, signal);
    activateSignalListeners();
}

const uncaughtExceptionHandler = function(err) {
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
        timestamp: new Date().getTime(),
    };
    saveLog(logdata);
};

const unhandledRejectionHandler = function(err) {
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
        timestamp: new Date().getTime(),
    };
    saveLog(logdata);
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
        timestamp: new Date().getTime(),
    };
    saveLog(logdata);
};

const warningHandler = function(warning) {
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
        timestamp: new Date().getTime(),
    };
    saveLog(logdata);
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
        timestamp: new Date().getTime(),
    };
    saveLog(logdata);
};

const eventHandlers = {
    'uncaughtException': uncaughtExceptionHandler,
    'unhandledRejection': unhandledRejectionHandler,
    'exit': exitHandler,
    'warning': warningHandler,
    'multipleResolves': multipleResolvesHandler
};

function enableListOfEventHandler(eventsType) {
    eventsType.forEach((eventType) => {
        const handler = eventHandlers[eventType];
        if (handler) {
            process.on(eventType, handler);
        } else {
            console.error(`No handler found for event type: ${eventType}`);
        }
    });
}

function disableListOfEventHandler(eventsType) {
    eventsType.forEach((eventType) => {
        const handler = eventHandlers[eventType];
        if (handler) {
            process.removeListener(eventType, handler);
        } else {
            console.error(`No handler found for event type: ${eventType}`);
        }
    });
}

class logsMongoSaver {
    constructor() {
    }
    setupProcessListeners() {
        if (isConnected()) {
        process.on('uncaughtException', uncaughtExceptionHandler);
        process.on('unhandledRejection', unhandledRejectionHandler);
        process.on('exit', exitHandler);
        process.on('warning', warningHandler);
        process.on('multipleResolves', multipleResolvesHandler);
        }
    }
    disableProcessListeners() {
        process.removeListener('uncaughtException', uncaughtExceptionHandler);
        process.removeListener('unhandledRejection', unhandledRejectionHandler);
        process.removeListener('exit', exitHandler);
        process.removeListener('warning', warningHandler);
        process.removeListener('multipleResolves', multipleResolvesHandler);
    }

    enableListOfProcessListener(eventsType) {
        if (isConnected()) {
            enableListOfEventHandler(eventsType);
        }
    }

    disableListOfProcessListener(eventsType) {
            disableListOfEventHandler(eventsType);
    }

    setupSignalListener() {
        if (isConnected()) {
            activateSignalListeners();
        }
    }

    disableSignalListeners() {
        desactivateSignalListeners();
    }

    enableListOfSignalListeners(list) {
        if (isConnected()) {
            activateListOfSignalListeners(list);
        }
    }

    disableListOfSignalListeners(list) {
        desactivateListOfSignalListeners(list);
    }

    requestListener(req, res) {
        let logdata = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            header: req.headers,
            httpVersion: req.httpVersion,
            statuscode: res.statusCode,
            url : req.url,
            error: '',
            message: res.message,
            type: 'http',
            signal: '',
            timestamp: new Date().getTime(),
        }
        saveLog(logdata);
    }
}
export default logsMongoSaver;
