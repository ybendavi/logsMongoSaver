

import ProcessEventQueue from './process_event_queue.js';
import {
    activateSignalListeners,
    isConnected,
    desactivateSignalListeners,
    //activateListOfSignalListeners,
    //desactivateListOfSignalListeners,
    enableListOfEventHandler,
    disableListOfEventHandler,
    setupProcessListeners,
    disableProcessListeners,
    saveLog,
} from './logs_functions.js';


class logsMongoSaver {
    constructor() {
    }
   setupProcessListeners() {
         setupProcessListeners();
    }

    disableProcessListeners() {
         disableProcessListeners();
    }

    enableListOfProcessListener(eventsType) {
            enableListOfEventHandler(eventsType);
    }

    disableListOfProcessListener(eventsType) {
            disableListOfEventHandler(eventsType);
    }

    setupSignalListener() {
          activateSignalListeners();
    }

     disableSignalListeners() {
        desactivateSignalListeners();
    }

   enableListOfSignalListeners(list) {
        if (isConnected()) {
           // activateListOfSignalListeners(list);
        }
    }

    disableListOfSignalListeners(list) {
        //desactivateListOfSignalListeners(list);
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
            timestamp: Date.now(),
        }
        try {
            return saveLog(logdata);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}
export default logsMongoSaver;
