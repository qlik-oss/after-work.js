const siteConfig = {
  title: "after-work.js",
  tagline: "Testing, made simple",
  disableTitleTagline: true,
  url: "https://qlik-oss.github.io/after-work.js",
  baseUrl: "/",
  projectName: "after-work.js",
  // cname: 'aw.com',
  organizationName: "qlik-oss",
  headerLinks: [
    { blog: true, label: "Blog" },
    { doc: "installation", label: "Docs" },
    { search: true },
    { href: "https://github.com/qlik-oss/after-work.js", label: "\uf09b" },
  ],
  headerIcon: "img/aw.svg",
  disableHeaderTitle: true,
  footerIcon: "img/aw.svg",
  ogImage: "img/aw.svg",
  favicon: "img/aw.png",
  colors: {
    primaryColor: "#333",
    secondaryColor: "#555",
  },
  copyright: `Copyright © ${new Date().getFullYear()} QlikTech International AB`,
  highlight: {
    theme: "atom-one-light",
  },
  scripts: [
    "https://buttons.github.io/buttons.js",
    "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js",
    "/js/code-block-buttons.js",
  ],
  stylesheets: [
    "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "/css/code-block-buttons.css",
  ],
  repoUrl: "https://github.com/qlik-oss/after-work.js",
  editUrl: "https://github.com/qlik-oss/after-work.js/edit/master/docs/",
  algolia: {
    apiKey: "7391fc0b98505aa291842bf80570754f",
    indexName: "aw",
    algoliaOptions: {
      hitsPerPage: 7,
    },
  },
  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100,
  },
  onPageNav: "separate",
};

module.exports = siteConfig;
