(() => {
  if (process?.argv[2] === 'params') {
    const createParams = require('./src/create-params.js');
    createParams();
    return;
  }

  if (process?.argv[2]) {
    const urlConverter = require('./src/convert-url.js');
    urlConverter(process?.argv[2]);
    return;
  }

  const portForwarder = require('./src/port-forwarder.js');
  portForwarder();
})();

