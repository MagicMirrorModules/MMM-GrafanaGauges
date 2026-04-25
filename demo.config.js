let config = {
  address: '0.0.0.0',
  ipWhitelist: [],
  logLevel: ['INFO', 'LOG', 'WARN', 'ERROR', 'DEBUG'],
  modules: [
    {
      module: 'clock',
      position: 'middle_center',
    },
    {
      module: 'MMM-GrafanaGauges',
      position: 'top_right',
      header: 'Grafana test',
      config: {
        version: 6,
        id: 'as8fA8na',
        host: 'localhost',
        port: 3000,
        https: false,
        dashboardname: 'flowers',
        orgId: 1,
        showIDs: [8, 9, 10, 12, 13],
        width: '220',
        height: '220',
        refreshInterval: 60,
      },
    },
  ],
}

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== 'undefined') {
  module.exports = config
}
