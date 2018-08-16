const React = require('react');
const { MarkdownBlock } = require('../../core/CompLibrary.js');
const globby = require('globby');
const path = require('path');

const root = path.resolve(process.cwd(), '../');
const examplesPath = path.resolve(root, 'examples');
const examplesPkgs = globby.sync(`${examplesPath}/*/README.md`);

const examples = examplesPkgs.map((e) => {
  const dir = path.dirname(e);
  const base = path.basename(dir);
  const baseUrl = 'https://github.com/qlik-oss/after-work.js/tree/master';
  const examplePath = dir.slice(process.cwd().split('/website').shift().length);
  const gh = `${baseUrl}${examplePath}#${base}`;
  const node = base.startsWith('node');
  const chrome = base.startsWith('chrome');
  const ptor = base.startsWith('protractor');
  const puppet = base.startsWith('puppeteer');
  const r = base.startsWith('react');
  const js = base.endsWith('js');
  const ts = base.endsWith('ts');
  const imgs = [];
  let title = '';

  if (node) {
    imgs.push('img/node.svg');
    title = 'Node';
  }
  if (chrome) {
    imgs.push('img/require-js.svg');
    title = 'Chrome';
  }
  if (js) {
    imgs.push('img/es-log.svg');
    title += ' with javascript';
  }
  if (ts) {
    imgs.push('img/typescript.svg');
    title += ' with typescript';
  }
  if (ptor) {
    imgs.push('img/protractor.svg');
    title = 'Protractor';
  }
  if (puppet) {
    imgs.push('https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png');
    title = 'Puppeteer';
  }
  if (r) {
    imgs.push('img/react.svg');
    title = 'React';
  }
  return {
    title,
    gh,
    imgs,
  };
});

const Sample = (props, ix) => (
  <div className="cell" key={ix}>
    <div className="card">
      <a href={props.gh} target="_blank" rel="noopener noreferrer">
        {
          props.imgs.map(img => (
            <div
              key={img}
              style={{
                backgroundImage: `url(${img})`,
              }}
            />
          ))
        }
      </a>
      <div className="info">
        <h3>
          {props.title}
        </h3>
        <div>
          <span>
            {props.description}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Empty = i => (
  <div className="cell" key={i} />
);

const Category = props => (
  <div className="category">
    <h2>
      {props.title}
    </h2>
    <div className="gallery">
      {props.children}
    </div>
  </div>
);

function generateGrid(items) {
  const emptyGridItems = [1000, 1001, 1002].map(Empty);
  return items.map(Sample).concat(emptyGridItems);
}

class Examples extends React.Component {
  render() {
    return (
      <div className="docMainWrapper wrapper">
        <div className="container mainContainer">
          <div className="wrapper">
            <div className="post">
              <header className="postHeader">
                <h1>
                  Examples
                </h1>
              </header>
              <MarkdownBlock>
                Boilerplate examples depending on your context
              </MarkdownBlock>
              <Category title="Examples">
                {generateGrid(examples)}
              </Category>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Examples;
