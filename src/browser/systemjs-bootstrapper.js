/* eslint no-undef: 0*/
Promise.all(files.map(file => System.import(file))).then(run);
