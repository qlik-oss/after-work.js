const inquirer = require('inquirer');
const checkboxPlus = require('inquirer-checkbox-plus-prompt');

const promptModule = inquirer.createPromptModule({ output: process.stderr });
promptModule.registerPrompt('checkbox-plus', checkboxPlus);

let currentPrompt;
const prompt = (questions) => {
  if (currentPrompt) {
    currentPrompt.ui.close();
  }
  currentPrompt = promptModule(questions);
  return currentPrompt;
};

module.exports = prompt;
