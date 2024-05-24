import mongoose from 'mongoose';

/**
 * Schéma de la base de donnée des logs
 */
const logsSchema = mongoose.Schema({
    type: {type: String, required: true},
    method: {type: String, default: ''},
    ip: {type: String, default: ''},
    url: {type: String, default: ''},
    header: {type: Map, of: String, default: {}},
    httpversion: {type: String, default: ''},
    statutcode: {type: String, default: ''},
    error: {type: String, default: ''},
    message: {type: String, default: ''},
    signal: {type: String, default: ''},
    promise: {type: String, default: ''},
    reason: {type: String, default: ''},
    timestamp: {type: Number, default: Date.now},
});

export default mongoose.model('Logs', logsSchema);
