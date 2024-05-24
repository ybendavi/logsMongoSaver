import logsModel from './logs_model.js';


export  function add(log) {
    const newLogs = new logsModel({
        method: log.method,
        url: log.url,
        ip: log.ip,
        header: log.header,
        httpVersion: log.httpVersion,
        statuscode: log.statusCodeRes,
        error: log.error,
        timestamp: log.timestamp,
        message: log.message,
        type: log.type,
        signal: log.signal,
        promise: log.promise,
        reason: log.reason,
    });
    console.log('dans le add');
    return newLogs.save()
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

export async function getAll() {
    try {
        const result = await logsModel.find({});
        return result;
    } catch (err) {
        return false;
    }
}

export async function getHttpLogs() {
    try {
        const result = await logsModel.find({ type: 'http' });
        return result;
    } catch (err) {
        return false;
    }
}

export async function getHttpLogsByMethod(method) {
    try {
        const result = await logsModel.find({ method: method });
        return result;
    } catch (err) {
        return false;
    }
}

export async function getProcessLogs() {
    try {
        const result = await logsModel.find({
            type: {
                $in: ['uncaughtException', 'unhandledRejection', 'warning', 'exit', 'multipleResolves'],
            },
        });
        return result;
    } catch (err) {
        return false;
    }
}

export async function getByType(type) {
    try {
        const result = await logsModel.find({ type: type });
        return result;
    } catch (err) {
        return false;
    }
}

export async function getById(id) {
    try {
        const result = await logsModel.find({ id: id });
        return result;
    } catch (err) {
        return false;
    }
}

