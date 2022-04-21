#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require("inquirer");
inquirer.registerPrompt('search-list', require('inquirer-search-list'));

const modules = {
  '⏩ port-forward': {
    shortcuts: ['f', 'forward', 'port-forward'],
    command: () => {
      const portForwarder = require('./src/port-forwarder.js');
      portForwarder();
    }
  },
  '🔗 convert-url': {
    shortcuts: ['c', 'convert', 'convert-url'],
    command: (url) => {
      const urlConverter = require('./src/convert-url.js');
      urlConverter(url ? url : (process.argv[3] ? process.argv[3] : ''));
    }
  },
  '🎉 create-params': {
    shortcuts: ['p', 'params', 'create-params'],
    command: () => {
      const paramsCreator = require('./src/create-params.js');
      paramsCreator();
    }
  }
};

(() => {

  // if process.argv[2] is an URL then convert it
  if (process.argv[2] && process.argv[2].match(/^(http|https):\/\//)) {
    modules['🔗 convert-url'].command(process.argv[2]);
    return;
  }

  let shortcutFound = false;

  Object.values(modules).forEach(module => {
    if (module.shortcuts.includes(process.argv[2])) {
      module.command();
      shortcutFound = true;
      return;
    }
  })

  if (shortcutFound) return;

  console.log(chalk.bold('🧠 Available shortcuts:'));
  Object.values(modules).forEach(module => {
    console.log(chalk.green(`  ${module.shortcuts.join(' | ')}`));
  })
  console.log('\n');

  inquirer
    .prompt([
      {
        type: "search-list",
        message: " Select command:",
        name: "command",
        choices: Object.keys(modules).map(key => key),
      }
    ])
    .then((answer) => {
      modules[answer.command].command();
    })
    .catch(e => console.log(e));

  return;
})();
