const path = require('path');
const fs = require('fs');
const globby = require('globby');

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

  const files = globby.sync(`${example.p}/test/**/*.spec.{js,ts}`);
  for (const file of files) {
    md += `\`\`\`javascript\n${fs.readFileSync(file, 'utf8')}\`\`\`\n\n`;
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../docs/${example.name}-examples.md`),
    md,
    'utf8',
  );
  // console.error(example.name);
  // console.error(md);
}
