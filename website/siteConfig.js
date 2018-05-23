
const siteConfig = {
  title: 'after-work.js',
  tagline: 'Testing, made simple',
  disableTitleTagline: true,
  url: 'https://qlik-oss.github.io/after-work.js',
  baseUrl: '/',
  projectName: 'after-work.js',
  // cname: 'aw.com',
  organizationName: 'qlik-oss',
  headerLinks: [
    { doc: 'installation', label: 'Docs' },
    // { doc: 'tutorial', label: 'Tutorial' },
    // { page: 'examples', label: 'Examples' },
    { search: true },
    { href: 'https://github.com/qlik-oss/after-work.js', label: '\uf09b' },
  ],
  headerIcon: 'img/aw.svg',
  disableHeaderTitle: true,
  footerIcon: 'img/aw.svg',
  ogImage: 'img/aw.svg',
  // gaTrackingId: '',
  favicon: 'img/aw.png',
  colors: {
    primaryColor: '#333',
    secondaryColor: '#555',
  },
  copyright: `Copyright © ${new Date().getFullYear()} QlikTech International AB`,
  highlight: {
    theme: 'atom-one-light',
  },
  scripts: [
    'https://buttons.github.io/buttons.js',
    // `${baseUrl}js/landing.js`
  ],
  stylesheets: [
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  ],
  repoUrl: 'https://github.com/qlik-oss/after-work.js',
  editUrl: 'https://github.com/qlik-oss/after-work.js/tree/master/docs/',
  // algolia: {
  //   apiKey: '3acaf839e39f2abc9d53e17093978fe3',
  //   indexName: 'aw',
  //   algoliaOptions: {
  //     hitsPerPage: 7,
  //   },
  // },
};

module.exports = siteConfig;
