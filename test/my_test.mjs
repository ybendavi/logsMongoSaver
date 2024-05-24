import mongoose, { set } from 'mongoose';
import logsMongoSaver from '../index.js'; // Assurez-vous que le chemin est correct
import * as logsFunc from '../logs_db_functions.js'; // Assurez-vous que le chemin est correct

const mongooseUri = 'mongodb://172.17.0.2:27017/sauvdrive';
let saver = new logsMongoSaver();

async function     connectToMongoDB() {
    // Connect to MongoDB using Mongoose
    console.log('uri:', mongooseUri);
     await mongoose.connect(mongooseUri, { })
   //  console.log('isconnectedornot:', mongoose.connection.readyState);
};

async function    disconnectToMongoDB() {
     mongoose.disconnect();
};

function    testConnectToMongoDB() {
    return (mongoose.connection.readyState);
};

async function testRequestListener() {
    const logdata = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        header: {},
        httpVersion: '1.1',
        statuscode: 200,
        error: '',
        message: 'Test message',
        type: 'http',
        signal: '',
        timestamp: new Date().getTime(),
    };

    saver.requestListener({ method: 'GET', url: '/test', ip: '127.0.0.1', headers: {}, httpVersion: '1.1' }, { statusCode: 200, message: 'Test message' });
};

async function testUncaughtException() {
    const error = new Error('Test Error');

    process.emit('uncaughtException', error);
}

async function testUnhandledRejection() {
    const error = new Error('Test Rejection');
    process.emit('unhandledRejection', error);
}

async function testProcessExit() {
    process.exit(1);
}

async function testWarning() {
    const warning = { message: 'Test Warning' };

    process.emit('warning', warning);
}

async function testMultipleResolves() {
    const promise = Promise.resolve();
    const reason = 'Test Reason';

    process.emit('multipleResolves', 'resolve', promise, reason);
} 

async function testSignal() {
    const signal = 'SIGCONT';
    console.log('signal:', signal);
    process.kill(process.pid, signal);
    console.log('signal sent');
}

async function tests() {
     testSignal();
    console.log('Test signal');
   testUncaughtException();
    console.log('Test uncaught exception');
    testUnhandledRejection();
    console.log('Test unhandled rejection');
     testWarning();
    console.log('Test warning');
     testMultipleResolves();
    console.log('Test multiple resolves');
     testRequestListener();
    console.log('Test request listener');
}

async function unitTests() {
    console.log('Start tests');
    await connectToMongoDB();
    console.log('Connect to MongoDB');
    console.log('Test connection to MongoDB:', testConnectToMongoDB());
    if (testConnectToMongoDB() === 1) {
        console.log('setup process listeners');
        saver.setupProcessListeners();
        console.log('setup signal listener');
        saver.setupSignalListener();
        console.log('listener activated');
        const db = mongoose.connection;
        //console.log ('db:', db);
        const changeStream = db.collection('logs').watch();
       // console.log('changeStream:', changeStream);
       /*changeStream.on('change', (change) => {
           console.log("changes:", change);
        });*/
        console.log('Connected to MongoDB');
        tests();
 
       // changeStream.close();
       await new Promise((resolve) => setTimeout((resolve) => {
        disconnectToMongoDB();
        if (testConnectToMongoDB() === 0) {
            console.log('Disconnected from MongoDB');
            console.log('Testing with MongoDB disconnected');
            tests();
        }
    }, 2000));

    }
    console.log('end of tests');
    console.log('Test process exit');
}

(async () => {
    setTimeout(() => {
        testProcessExit();
    }, 5000);
   await unitTests();
})();
