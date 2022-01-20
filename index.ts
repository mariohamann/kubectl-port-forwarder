const util = require('util');
const inquirer = require("inquirer");
const exec = util.promisify(require('child_process').exec);
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
const terminalLink = require('terminal-link');

class PortForwarder {
  availableNamespaces = ['integration'];
  selectedNamespace = '';
  availableInstances = ['author', 'public'];
  selectedInstance = '';

  constructor() {
    this.initPortForwarder();
  }

  async initPortForwarder() {
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
    const { exec } = require('child_process');
    console.log(`🏃 Forwarding started. ${terminalLink('Login to Magnolia', 'http://localhost:8080/.magnolia/sys_login')}`);
    exec('open http://localhost:8080/.magnolia/sys_login');
    exec(`kubectl -n ${this.selectedNamespace} port-forward ui-magnolia-${this.selectedInstance}-0 8080:8080`, (error, stdout, stderr) => {
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
      'integration', // already set initally
    ]
    let output = input.split("\n") // convert lines to array
    output =  output.slice(1, output.length - 1) // remove first and last line
    output = output.map((pod) => pod.split("Active")[0].trim()); // convert to podnames
    output = output.filter((pod) => !unneededPods.includes(pod)); // filter correct podnames
    return output;
  }
}

new PortForwarder;
