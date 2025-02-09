const pino = require('pino');

module.exports = pino({
  level: process.env.PINO_LOG_LEVEL || 'info',
  formatters: {
    bindings: (bindings) => {
        return { 
            pid: bindings.pid, 
            host: bindings.hostname,
            node_version: process.version,
        };
    },
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
