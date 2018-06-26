const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
// const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  render() {
    let className = "button";
    if (this.props.scream) {
      className += ' scream';
    }
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className={className} href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
      <div className="wrapper">
      </div>
    </div>
  </div>
);

const Logo = props => (
  <div className="logo">
    <img src={props.img_src} />
  </div>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || '';
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('aw.svg')} />
        <h2 className="projectTitle">
          <small>Testing, made simple</small>
        </h2>
        <PromoSection>
          <Button href={docUrl('installation.html')}>Get started</Button>
          <Button href={pageUrl('examples.html')} scream="true">Examples</Button>
        </PromoSection>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock contents={props.children} layout={props.layout} />
  </Container>
);

const SnapshotTesting = () => (
  <Block>
    {[
      {
        content: 'Uses 💖 jest-snapshot for snapshot testing',
        title: 'Snapshot Testing',
      },
    ]}
  </Block>
);

const Transform = () => (
  <Block>
    {[
      {
        content: 'Uses Babel and Typescript for transpiling\n\nCache for blazing fast reruns 🔥',
        title: 'Transform',
      },
    ]}
  </Block>
);

const Mocking = () => (
  <Block>
    {[
      {
        content: 'Automagically 🧙‍ mocking features\n\nEven virtual/external dependencies',
        title: 'Snapshot Testing',
      },
    ]}
  </Block>
);

const Configurable = () => (
  <Block>
    {[
      {
        content: 'Highly configurable 🔨 for all test contexts',
        title: 'Configurable',
      },
    ]}
  </Block>
);

const Mocha = () => (
  <Block>
    {[
      {
        content: 'Uses Mocha ☕️ as test runner',
        title: 'Mocha',
      },
    ]}
  </Block>
);

const Chai = () => (
  <Block>
    {[
      {
        content: 'Uses Chai 🍵 for assertions',
        title: 'Chai',
      },
    ]}
  </Block>
);

const Sinon = () => (
  <Block>
    {[
      {
        content: 'Uses Sinon for spies and mocks 🕵️‍',
        title: 'Sinon',
      },
    ]}
  </Block>
);

const Nyc = () => (
  <Block>
    {[
      {
        content: 'Uses NYC for coverage reporting ✅',
        title: 'NYC',
      },
    ]}
  </Block>
);

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <SnapshotTesting />
          <Transform />
          <Mocking />
          <Configurable />
          <Mocha />
          <Chai />
          <Sinon />
          <Nyc />
        </div>
      </div>
    );
  }
}

module.exports = Index;
