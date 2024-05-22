import { expect } from 'chai';
import mongoose from 'mongoose';
import sinon from 'sinon';
import logsMongoSaver from '../index.js'; // Assurez-vous que le chemin est correct
import * as logsFunc from '../logs_db_functions.js'; // Assurez-vous que le chemin est correct

const mongooseUri = 'mongodb://172.17.0.2:27017/sauvdrive';
let saver;

describe('logsMongoSaver Module', function() {
    before(async function() {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true });
        saver = new logsMongoSaver();
    });

    after(async function() {
        await mongoose.disconnect();
    });


    it('should connect to MongoDB', function() {
        expect(mongoose.connection.readyState).to.equal(1);
    });

    it('should save data when connected', async function() {
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

        await saver.requestListener({ method: 'GET', url: '/test', ip: '127.0.0.1', headers: {}, httpVersion: '1.1' }, { statusCode: 200, message: 'Test message' });

        sinon.assert.calledOnce(logsFunc.add);
        sinon.assert.calledWith(logsFunc.add, logdata);
    });

    it('should handle uncaughtException', async function() {
        saver.setupProcessListeners();
        const error = new Error('Test Error');

        process.emit('uncaughtException', error);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type).to.equal('uncaughtException');
        expect(log.error).to.equal(error);
    });

    it('should handle unhandledRejection', async function() {
        saver.setupProcessListeners();
        const error = new Error('Test Rejection');

        process.emit('unhandledRejection', error);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type). to.equal('unhandledRejection');
        expect(log.error). to.equal(error);
    });

    it('should handle process exit', async function() {
        saver.setupProcessListeners();

        process.emit('exit', 0);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type).to.equal('exit');
        expect(log.statuscode).to.equal(0);
    });

    it('should handle process warnings', async function() {
        saver.setupProcessListeners();
        const warning = { message: 'Test Warning' };

        process.emit('warning', warning);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type).to.equal('warning');
        expect(log.error).to.equal(warning);
    });

    it('should handle multiple resolves', async function() {
        saver.setupProcessListeners();
        const promise = Promise.resolve();
        const reason = 'Test Reason';

        process.emit('multipleResolves', 'resolve', promise, reason);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type).to.equal('multipleResolves');
        expect(log.error).to.equal(reason);
    });

    it('should handle signals', async function() {
        saver.setupSignalListeners();
        const signal = 'SIGTERM';

        process.emit(signal);

        sinon.assert.calledOnce(logsFunc.add);
        const log = logsFunc.add.getCall(0).args[0];
        expect(log.type).to.equal('signal');
        expect(log.signal).to.equal(signal);
    });
});

