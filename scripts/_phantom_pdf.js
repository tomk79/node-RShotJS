(function() {
	var system = require('system');
	console.debug(system.args);
	var fs = require('fs');
	var options = {
		url: system.args[1],
		saveTo: system.args[2],
		width: system.args[3],
		height: system.args[4],
		userAgent: system.args[5]
	};

	if( !options.url ){
		console.log("[ERROR] No URL given."+"\n");
		return phantom.exit();
	}
	if( !options.saveTo ){
		console.log("[ERROR] No output path given."+"\n");
		return phantom.exit();
	}
	if( !options.width ){
		options.width = 1024;
	}
	if( !options.height ){
		options.height = 100;
	}
	if( !options.userAgent ){
		options.userAgent = 'Google Chrome';
	}
	console.debug(options.url);
	console.debug(options.saveTo);
	console.debug(options.width);
	console.debug(options.height);
	console.debug(options.userAgent);

	var webpage = require('webpage').create();
	webpage.viewportSize = {
		width: options.width,
		height: options.height
	};
	webpage.settings.userAgent = options.userAgent;
	webpage.paperSize = {
		format: 'A3',
		orientation: 'portrait',
		border: '1cm'
	};
	webpage.onLoadFinished = function() {
		console.log('page Load Finished.');
	};
	webpage.open(options.url, function(status) {
		if (status === 'success') {
			window.setTimeout( function(){
				webpage.render( options.saveTo, {format: 'pdf', quality: 100} );
				return phantom.exit();
			}, 1000 );
			return;
		}else{
			console.log('Error: on page loading. ('+status+' : '+options.url+')');
			return phantom.exit();
		}
	});

}).call(this);
