/*eslint no-undef: 0*/
Promise.all( files.map( file => {
	return System.import( file );
} ) ).then( run );
