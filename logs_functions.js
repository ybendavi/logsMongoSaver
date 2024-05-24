import mongoose, { set } from 'mongoose';
import process from 'node:process';
import { clear } from 'node:console';
import * as logsFunc from './logs_db_functions.js';  // Assurez-vous que le chemin est correct
import { on } from 'node:events';

const signals = [
    'SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGPIPE', 'SIGQUIT', 'SIGTERM',
    'SIGUSR1', 'SIGUSR2', 'SIGCHLD', 'SIGCONT', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU',
    'SIGBUS', 'SIGFPE', 'SIGILL', 'SIGSEGV', 'SIGTRAP', 'SIGSYS'
];

let queue = [];

let onprocess = false;

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
        timestamp: Date.now(),
    };
    queue.push(logdata);
    handleQueue();
    desactivateSignalListeners();
    process.kill(process.pid, signal);
    activateSignalListeners();
}

const uncaughtExceptionHandler = function (err) {
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
        timestamp: Date.now(),
    };
    queue.push(logdata);
    handleQueue();
};

const unhandledRejectionHandler = function (err, promise) {
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
        timestamp: Date.now(),
    };
    queue.push(logdata);
    handleQueue();
};

const exitHandler = function (code) {
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
        timestamp: Date.now(),
    };
    queue.push(logdata);
    handleQueue();
    console.log('apres handleQueue', queue);
};

const warningHandler = function (warning) {
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
        timestamp: Date.now(),
    };
    console.log('warning', warning);
    queue.push(logdata);
    handleQueue();
};

const multipleResolvesHandler = function (type, promise, reason) {
    let logdata = {
        method: '',
        url: '',
        ip: '',
        header: {},
        httpVersion: '',
        statuscode: '',
        error: reason,
        message: `${type}: ${reason}`,
        type: 'multipleResolves',
        signal: '',
        promise: '',
        reason: reason,
        timestamp: Date.now(),
    };
    queue.push(logdata);
    handleQueue();

};

function activateSignalListeners() {
    try {
        signals.forEach((sig) => process.on(sig, handleSignal));
    } catch (err) {
        console.error(err);
    }
}

function isConnected() {
    if (mongoose.connection.readyState === 1) {
        return true;
    } else {
        console.error('MongoDB not connected');
        return false;
    }
}

function desactivateSignalListeners() {
    try {
        signals.forEach((sig) => process.removeListener(sig, handleSignal));
    } catch (err) {
        console.error(err);
    }
}

function activateListOfSignalListeners(list) {
    list.forEach((sig) => process.on(sig, handleSignal));
}

function desactivateListOfSignalListeners(list) {
    list.forEach((sig) => process.removeListener(sig, handleSignal));
}

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

function setupProcessListeners() {
    if (isConnected()) {
        process.on('uncaughtException', uncaughtExceptionHandler);
        process.on('unhandledRejection', unhandledRejectionHandler);
        process.on('exit', exitHandler);
        process.on('warning', warningHandler);
        process.on('multipleResolves', multipleResolvesHandler);
    }
}

function disableProcessListeners() {
    process.removeListener('uncaughtException', uncaughtExceptionHandler);
    process.removeListener('unhandledRejection', unhandledRejectionHandler);
    process.removeListener('exit', exitHandler);
    process.removeListener('warning', warningHandler);
    process.removeListener('multipleResolves', multipleResolvesHandler);
}

function handleQueue() {
    console.log('onprocess', onprocess, 'queue', queue.length, 'isConnected', isConnected());
    if (onprocess || queue.length === 0) return;
    onprocess = true;
    console.log('in handleQueue');
    while (queue.length > 0)
    {
        const log = queue.shift();
        saveLog(log).then(res => {
        if (!res) {
            console.log('Error saving log', log);
        }
    });
    }
    onprocess = false;
}

async function saveLog(logdata) {
    console.log("in saveLog");
    if (isConnected()) {
        try {
            const result = await logsFunc.add(logdata);
            console.log("LOGsuccess: ", result);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    } else {
        console.log("LOG: ", logdata);
        return true;
    }
}



export {
    activateSignalListeners,
    isConnected,
    desactivateSignalListeners,
    activateListOfSignalListeners,
    desactivateListOfSignalListeners,
    enableListOfEventHandler,
    disableListOfEventHandler,
    setupProcessListeners,
    disableProcessListeners,
    saveLog,
};
