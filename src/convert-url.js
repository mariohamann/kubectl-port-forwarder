require('dotenv').config()
const fs = require('fs')
const chalk = require('chalk');

urlConverter = (url) => {
  const convertedUrl = new URL(url);
  if (convertedUrl.hostname === 'localhost') {
    fs.readFile('tmp', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      if (data) {
        convertedUrl.protocol = 'https://';
        convertedUrl.host = `${data}.${convertedUrl.port === '8080' ? 'author' : 'public'}.${process.env.BASEURL}`;
        convertedUrl.port = '';
        console.log(`
🎉  Your new URL: ${chalk.green.bold(convertedUrl.href)}
`);
      }
    })
  } else {
    const splittedHost = convertedUrl.host.split('.');
    if (splittedHost.length !== 7) {
      convertedUrl.pathname = `${splittedHost.splice(0, 1)[0]}-site${convertedUrl.pathname}`;
      convertedUrl.host = splittedHost.join('.')
    }

    convertedUrl.host = splittedHost[1] === 'author' ? 'localhost:8080' : 'localhost:8081';
    convertedUrl.protocol = 'http';
    console.log(`🔗 Your new URL: ${chalk.green.bold(convertedUrl.href)}`);
  }

}

module.exports = urlConverter;
