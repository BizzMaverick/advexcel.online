let logs = [];

exports.AuditService = {
  log: (entry) => {
    logs.push({ timestamp: new Date(), ...entry });
  },

  getLogs: async () => logs
};
