import {
    activateSignalListeners,
    isConnected,
    desactivateSignalListeners,
    activateListOfSignalListeners,
    desactivateListOfSignalListeners,
    enableListOfEventHandler,
    disableListOfEventHandler,
    setupProcessListeners,
    disableProcessListeners,
} from './logs_functions.js';
import * as logsFunc from './logs_db_functions.js';

class ProcessEventQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    enqueue(event, data) {
        console.log("enqueue:", event, data);
        this.queue.push({ event, data });
        this.processQueue();
        console.log("obj:", this);
    }

    async processQueue() {
        if (this.processing) return;

        this.processing = true;
        while (this.queue.length > 0) {
            const { event, data } = this.queue.shift();
            try {
                await this.handleEvent(event, data);
                console.log("passed handleEvent");
            } catch (err) {
                console.error(`Failed to process event ${event}:`, err);
            }
        }

        this.processing = false;
    }

    async handleEvent(event, data) {
        try {
            console.log("savelog");
            await disableProcessListeners();
            await this.saveLog(data);
            console.log("disableProcessListeners");
            console.log("emitter");
           // await desactivateSignalListeners();
            console.log("emitter");
            await this.emitter(event, data);
            console.log("setupProcessListeners");
            await setupProcessListeners();
            console.log("activateSignalListeners");
            //await activateSignalListeners();
        }
        catch (err) {  
            console.error(err);
        }

    }

    async emitter(event, data) {
        return new Promise((resolve, reject) => {
        try {
        switch (event) {
            case 'uncaughtException':
                process.emit('uncaughtException', data.error);
                resolve();
                break;
            case 'unhandledRejection':
                process.emit('unhandledRejection', data.error, data.promise);
                resolve();
                break;
            case 'exit':
                process.exit(data.statusCode);
                resolve();
                break;
            case 'warning':
                process.emit('warning', {message: data.error});
                resolve();
                break;
            case 'multipleResolves':
                process.emit('multipleResolves', data.type, data.promise, data.reason);
                resolve();
                break;
            case 'signal':
                process.kill(process.pid, data.signal);
                resolve();
                break;
            default:
                console.warn(`Unhandled event type: ${event}`);
        }
    }
    catch (err) {
        reject(err);
    }
});
    }
    async saveLog(logdata) {
        console.log("in saveLog");
        if (isConnected()) {
            try {
                console.log("in try");
                const result = await logsFunc.add(logdata);
                console.log("passed add");
                return result;
            } catch (err) {
                console.error(err);
                return false;
            }
        } else {
            console.log("LOG: ", logdata);
            return true;
        }
    }
}

export default  ProcessEventQueue;
