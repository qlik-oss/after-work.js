const React = require('react');
const { MarkdownBlock } = require('../../core/CompLibrary.js');

const examples = [{
  title: 'Node',
  imgs: ['img/node.svg'],
  links: {
    gh: 'https://github.com/qlik-oss/after-work.js/tree/master/examples/node#this-is-a-sample-for-node-and-after-workjs',
  },
  tags: {
    env: ['node'],
    context: ['unit'],
  },
}, {
  title: 'ES5',
  imgs: ['img/js-logo.svg', 'img/require-js.svg'],
  links: {
    gh: 'https://github.com/qlik-oss/after-work.js/tree/master/examples/requirejs#this-is-a-sample-for-requirejs',
  },
  tags: {
    env: ['node'],
    context: ['unit'],
  },
}, {
  title: 'ES2015+',
  imgs: ['img/es-logo.svg', 'img/require-js.svg'],
  links: {
    gh: 'https://github.com/qlik-oss/after-work.js/tree/master/examples/es2015#this-is-a-sample-for-es2015-and-requirejs',
  },
  tags: {
    env: ['node'],
    context: ['unit'],
  },
}, {
  title: 'Typescript',
  imgs: ['img/typescript.svg', 'img/require-js.svg'],
  links: {
    gh: 'https://github.com/qlik-oss/after-work.js/tree/master/examples/typescript#this-is-a-sample-for-typescript',
  },
  tags: {
    env: ['node'],
    context: ['unit'],
  },
}];

const Sample = (props, ix) => (
  <div className="cell" key={ix}>
    <div className="card">
      <a href={props.links.gh} target="_blank" rel="noopener noreferrer">
        {
          props.imgs.map(img => (<div
            key={img}
            style={{
            backgroundImage: `url(${img})`,
          }}
           />))
        }
      </a>
      <div className="info">
        <h3>{props.title}</h3>
        <div>
          <span>{props.description}</span>
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
    <h2>{props.title}</h2>
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
              <header className="postHeader"><h1>Examples</h1></header>
              <MarkdownBlock>
                Boilerplate configurations depending on your context
              </MarkdownBlock>
              <Category title="Configurations">{generateGrid(examples)}</Category>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Examples;
