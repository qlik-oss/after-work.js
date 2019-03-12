const path = require('path');
const fs = require('fs');
const table = require('markdown-table');
const globby = require('globby');

const optionPaths = globby
  .sync('commands/**/src/options.js')
  .map(p => path.resolve(p));
const cmds = optionPaths.map((p) => {
  const name = p
    .split('/')
    .splice(-3)
    .shift();
  const options = require(p);
  return {
    name,
    options,
  };
});

for (const cmd of cmds) {
  const name = cmd.name.replace('cdp', 'chrome');
  const options = Object.keys(cmd.options).map(key => ({
    key,
    ...cmd.options[key],
  }));

  let md = '';

  for (const [i, opt] of options.entries()) {
    const {
      key, description, type, alias,
    } = opt;
    if (i === 0) {
      md += `---
id: ${name}-options
title: ${name.charAt(0).toUpperCase() + name.slice(1)}
---\n\n`;
      md += '## Options\n\n';
    }
    md += `### --${key}\n\n`;
    const optTable = table(
      [
        ['Description', 'Type', 'Default', ...(alias ? ['Alias'] : [])],
        [description, type, opt.default, ...(alias ? [alias] : [])],
      ],
      {
        align: ['l', 'l', type === 'number' ? 'r' : 'l'],
      },
    );
    md += `${optTable}\n\n`;
    md += '---\n\n';
  }
  fs.writeFileSync(
    path.resolve(__dirname, `../docs/${cmd.name}-options.md`),
    md,
    'utf8',
  );
}
