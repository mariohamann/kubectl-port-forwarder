
const fuzzy = require('fuzzy');
const inquirer = require("inquirer");
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
const chalk = require('chalk');

const repos = {
  '💻 main: cms-components': 'cmsWebComponentsVersion',
  '💻 main: component-library': 'componentLibraryVersion',
  '💻 main: tracking': 'trackingWebComponentsVersion',
  '📱 app:  searches': 'searchWebComponentsVersion',
  '📱 app:  funds': 'fundsWebComponentsVersion',
  '📱 app:  product-finder': 'productFinderWebComponentsVersion',
  '📱 app:  bplv': 'bplvWebComponentsVersion',
  '📱 app:  bank-search': 'bankSearchWebComponentsVersion',
};

let selectedRepos = [];

let repoParams = new URLSearchParams();

const createParams = () => {
  getNeededRepos();
}

const getBranch = (repo) => {
  inquirer
    .prompt([{ name: repo, message: `${repo}:` },])
    .then((answers) => {
      repoParams.set(repos[repo], answers[repo]);
      const repoPositionInArray = selectedRepos.indexOf(repo);
      if (repoPositionInArray + 1 < selectedRepos.length) {
        const nextRepo = selectedRepos[repoPositionInArray + 1];
        getBranch(nextRepo);
      }
      else {
        console.log(`
🎉 Your new Params: ${chalk.green.bold(
          `?${repoParams.toString().replaceAll('%2F', '_')}
`
        )}`);
        if (repoParams.has('trackingWebComponentsVersion')) {
          console.warn(`${chalk.yellow(`⚠️  Warning: Tracking is only available on public, not on author!
`)}`);
        }
      }
    })
}

const getNeededRepos = () => {
  inquirer.prompt([{
    type: 'checkbox-plus',
    name: 'repos',
    message: 'Select needed repos',
    pageSize: 10,
    highlight: true,
    searchable: true,
    source: function (answersSoFar, input) {

      input = input || '';

      return new Promise(function (resolve) {
        const fuzzyResult = fuzzy.filter(input, Object.keys(repos));
        const data = fuzzyResult.map(function (element) {
          return element.original;
        });
        resolve(data);
      });
    }
  }]).then(function (answers) {
    if (answers.repos.length === 0) {
      console.log('🏝  No repo selected – enjoy your free day!')
      return;
    }
    selectedRepos = answers.repos;
    getBranch(selectedRepos[0]);
  });
}

module.exports = createParams;
