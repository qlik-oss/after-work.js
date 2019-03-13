const path = require('path');
const fs = require('fs');
const globby = require('globby');

const baseUrl = 'https://github.com/qlik-oss/after-work.js/tree/master';

const examplePaths = globby.sync('examples/*', {
  expandDirectories: false,
  onlyDirectories: true,
});
const examples = examplePaths.map(p => ({
  name: p.split('/').pop(),
  p,
}));

for (const example of examples) {
  let md = '';
  md += `---
id: ${example.name}-examples
title: ${example.name.charAt(0).toUpperCase() + example.name.slice(1)}
---\n\n`;

  const appendFile = (file) => {
    md += `\`\`\`javascript\n${fs.readFileSync(file, 'utf8')}\`\`\`\n\n`;
    md += `**[${file}](${baseUrl}/${file})**\n\n`;
  };

  const fixtureFiles = globby.sync(`${example.p}/test/**/*.fix.html`);
  for (const file of fixtureFiles) {
    appendFile(file);
  }

  const files = globby.sync(`${example.p}/test/**/*.spec.{js,ts}`);
  for (const file of files) {
    appendFile(file);
  }

  if (example.name === 'protractor') {
    const protractorConfigFiles = globby.sync(`${example.p}/aw.config.*.js`);
    for (const file of protractorConfigFiles) {
      appendFile(file);
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../docs/${example.name}-examples.md`),
    md,
    'utf8',
  );
}
