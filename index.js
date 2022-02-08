const util = require('util');
const inquirer = require("inquirer");
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
const fs = require('fs')
require('dotenv').config()

class PortForwarder {
  availableNamespaces = ['integration'];
  selectedNamespace = '';
  availableInstances = ['both (8080+8081)', 'author (8080)', 'public (8081)'];
  selectedInstance = '';
  urlToConvert = '';

  constructor() {
    if (process?.argv[2]) {
      this.convertUrl(process?.argv[2]);
      return;
    }
    this.getNamespaces();
  }

  async getNamespaces() {
    const { stdout, stderr } = await exec('kubectl get namespace');
    if(stderr){
      console.error(stderr);
      return;
    }

    this.availableNamespaces = [...this.availableNamespaces, ...PortForwarder.convertOutputToNamespaces(stdout)].filter((pod) => pod.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/igm));
    this.setNamespace();
  }

  setNamespace(){
    inquirer
      .prompt([
          {
              type: "search-list",
              message: "Select namespace:",
              name: "namespace",
              choices: this.availableNamespaces,
          }
      ])
      .then((answer) => {
          this.selectedNamespace = answer.namespace;
          this.setInstance();
      })
      .catch(e => console.log(e));
  }

  convertUrl(url) {
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
          console.log(`🔗 Your new URL: ${chalk.green.bold(convertedUrl.href)}`);
        }
      })
    } else {
      const splittedHost = convertedUrl.host.split('.');
      if (splittedHost.length !== 7) {
        convertedUrl.pathname = `${splittedHost.splice(0, 1)[0].replace('-testing', '-testing-site')}${convertedUrl.pathname}`;
        convertedUrl.host = splittedHost.join('.')
      }

      convertedUrl.host = splittedHost[1] === 'author' ? 'localhost:8080' : 'localhost:8081';
      convertedUrl.protocol = 'http';
      console.log(`🔗 Your new URL: ${chalk.green.bold(convertedUrl.href)}`);
    }

  }

   setInstance(){
    inquirer
      .prompt([
          {
              type: "search-list",
              message: "Select instance:",
              name: "instance",
              choices: this.availableInstances,
          }
      ])
      .then((answer) => {
          this.selectedInstance = answer.instance;
          this.executeForwarding();
      })
      .catch(e => console.log(e));
  }

  executeForwarding(){
    const isBoth = this.selectedInstance.includes('both');
    const isPublic = !this.selectedInstance.includes('author');
    const isAuthor = !this.selectedInstance.includes('public');
    fs.writeFile('tmp', this.selectedNamespace, err => {
      if (err) {
        console.error(err)
        return
      }
    })

    const { exec } = require('child_process');
    console.log(`🏃 Forwarding started. ${isAuthor ? `\n- Login to Magnolia (Author): ${chalk.green.bold('http://localhost:8080/.magnolia/sys_login')}` : ''} ${isPublic ? `\n- Login to Magnolia (Public): ${chalk.green.bold('http://localhost:8081/.magnolia/sys_login')}` : ''}`);
    const bash = `${isBoth ? `(trap 'kill 0' SIGINT; ` : ''}
      ${isAuthor ? `kubectl -n ${this.selectedNamespace} port-forward ui-magnolia-author-0 8080:8080` : ''}
      ${isBoth ? ` & ` : ''}
      ${isPublic ? `kubectl -n ${this.selectedNamespace} port-forward ui-magnolia-public-0 8081:8080` : ''}
      ${isBoth ? ` )` : ''}`;
    exec(bash.replace(/(\r\n|\n|\r)/gm, ""), (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    });
  }

  static convertOutputToNamespaces(input){
    const unneededPods =[
      'default',
      'kube-node-lease',
      'kube-public',
      'kube-system',
      'velero',
      'tigera-operator',
      'gatekeeper-system',
      'calico-system',
      'akv2k8s',
      'integration' // already set initally
    ]
    let output = input.split("\n") // convert lines to array
    output =  output.slice(1, output.length - 1) // remove first and last line
    output = output.map((pod) => pod.split("Active")[0].trim()); // convert to podnames
    output = output.filter((pod) => !unneededPods.includes(pod)); // filter correct podnames
    return output;
  }
}

new PortForwarder;
