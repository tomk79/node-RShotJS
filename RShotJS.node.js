/**
 * node RShotJS.node.js
 * @author Tomoya Koyanagi
 */
(function() {
	console.log('---------');
	console.log('Starting "RShotJS.node.js"');
	console.log('script filename = '+__filename);
	console.log('working dir = '+__dirname);


	var fs = require('fs');
	var csv = require('csv');//https://github.com/wdavidw/node-csv
	var phantom = require('phantomjs');//https://github.com/alexscheelmeyer/node-phantom
	var exec = require('child_process').exec;

	var conf = {
		siteName: '---',// サイト名
		pathCsv: __dirname+'/data.csv',// CSVファイルパス
		pathOutput: __dirname+'/RShotJS_output/',// 出力ディレクトリパス
		port: 80, // nodeサーバーのポート番号
		unit: 1, // 1回の処理件数
		userAgent: { // USER_AGENTの定義
			pc:{width:1280, height:1024, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'},
			sp:{width: 320, height: 568, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'}
		},
		version: '1.0.0-nb' // RShotJS.node.js のバージョン
	};

	console.log('version '+conf.version);
	console.log('---------');
	console.log('config = ');

	// オプションを整理
	var idx = 2;
	var options = (function(){
		var rtn = {};
		for( var idx = 0; process.argv.length > idx; idx ++ ){
			if(process.argv[idx].match(new RegExp('^(.*?)\=(.*)$'))){
				rtn[RegExp.$1] = RegExp.$2;
			}
		}
		return rtn;
	})();

	if( options.pathConf ){
		// コンフィグファイルの指定があったら
		// 他のオプションより先に読み込む
		(function(){
			var confJson = require( options.pathConf );
			// オプションをコンフィグに反映
			if( confJson.siteName )   { conf.siteName = confJson.siteName; }
			if( confJson.pathCsv )    { conf.pathCsv = confJson.pathCsv; }
			if( confJson.pathOutput ) { conf.pathOutput = confJson.pathOutput; }
			if( confJson.port )       { conf.port = confJson.port; }
			if( confJson.unit )       { conf.unit = confJson.unit; }
			if( confJson.userAgent )  { conf.userAgent = confJson.userAgent; }
		})();
	}

	// オプションをコンフィグに反映
	if( options.siteName )   { conf.siteName = options.siteName; }
	if( options.pathCsv )    { conf.pathCsv = options.pathCsv; }
	if( options.pathOutput ) { conf.pathOutput = options.pathOutput; }
	if( options.port )       { conf.port = options.port; }
	if( options.unit )       { conf.unit = options.unit; }

	console.log(conf);
	console.log('');
	console.log('---------');
	console.log('');



	// utils
	function h(str){
		return str;
	}
	function md5(str){
		return require('crypto').createHash('md5').update(str, 'utf8').digest('hex');
	}
	function fileSaveContents( filename , str ){
		var fd = fs.openSync(filename, "w");
		fs.writeSync(fd, str, 0, "ascii");
		fs.closeSync(fd);
		return true;
	}
	function dateFormat(){
		var d = new Date();
		return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + '';
	}
	// / utils

	// --------------------------------------
	// setup webserver
	(function(){
		var http = require('http');
		var url = require('url');

		var server = http.createServer(function(request, response) {
			// アクセスされたURLを解析してパスを抽出
			var parsedUrl = url.parse(request.url, true);
			var params = parsedUrl.query;
			var path = parsedUrl.pathname;


			// ディレクトリトラバーサル防止
			if (path.indexOf("..") != -1) {
				path = '/';
			}
			if(path.length-1 == path.lastIndexOf('/')) {
				// リクエストが「/」で終わっている場合、index.htmlをつける。
				path += 'index.html';
			}
			fs.readFile(conf.pathOutput + path, function(error, bin){
				if(error) {
					response.writeHead(404, 'NotFound', {'Content-Type': 'text/html'});
					response.write('<!DOCTYPE html>');
					response.write('<html>');
					response.write('<head>');
					response.write('<title>Not found.</title>');
					response.write('</head>');
					response.write('<body>');
					response.write('<h1>404 Not found.</h1>');
					response.write('<p>File NOT found.</p>');
					response.write('</body>');
					response.write('</html>');
					response.end();
				} else {
					var pathExt = (function (path) {
						var i = path.lastIndexOf('.');
						return (i < 0) ? '' : path.substr(i + 1);
					})(path);
					var mime = 'text/html';
					switch( pathExt ){
						case 'html': case 'htm':             mime = 'text/html';break;
						case 'js':                           mime = 'text/javascript';break;
						case 'css':                          mime = 'text/css';break;
						case 'gif':                          mime = 'image/gif';break;
						case 'jpg': case 'jpeg': case 'jpe': mime = 'image/jpeg';break;
						case 'png':                          mime = 'image/png';break;
						case 'svg':                          mime = 'image/svg+xml';break;
					}

					response.writeHead(200, { 'Content-Type': mime });
					response.write(bin);
					response.end();
				}
			});

		});

		// 指定ポートでLISTEN状態にする
		server.listen( conf.port );

	})();






	var tasks = [];
	var taskProgress = 0;
	var done = 0;
	var htmlPdf = '';
	function loadCSV(){
		fs.readFile(conf.pathCsv, function(error, csvData){
			if( error ){
				console.log('error: '+ conf.pathCsv +' could not open.');
				process.exit();
			}

			csv()
				.from.string(
					csvData,
					{}
				)
				.to.array(function(data){
					var num = 0;
					for( var i in data ){
						var row = {};
						var idx = 0;
						row['num'] = (++num);
						row['page_id'] = data[i][idx++];
						row['title'] = data[i][idx++];
						row['url'] = data[i][idx++];
						tasks.push(row);
					}
					generateImage();
				})
			;

		});
	}

	function generateImage(){
		console.log('');
		console.log('-- processing tasks.');

		var userAgentLength = (function(ary){
			var i = 0;
			for( var deviceType in conf.userAgent ){ i ++; }
			return i;
		})(conf.userAgent);

		while( 1 ){
			if( tasks.length <= taskProgress ){
				console.log('All task clear.');
				console.log('');
				break;
			}

			var row = tasks[taskProgress];
			console.log('    '+row.title);
			console.log('    '+row.url);

			for( var deviceType in conf.userAgent ){
				var fileName = md5(row['title'])+'_'+deviceType+'.png';

				(function(row,fileName,deviceType){

					var cmd = './node_modules/phantomjs/bin/phantomjs '
						+'./scripts/_phantom_capture.js '
						+row['url']+' '
						+conf.pathOutput+'/images/'+fileName+' '
						+conf.userAgent[deviceType].width+' '
						+conf.userAgent[deviceType].height+' '
						+'"'+conf.userAgent[deviceType].userAgent+'"'
					;

					exec(
						cmd,
						{timeout:0},
						function(error, stdout, stderr) {
							// console.log('stdout: '+(stdout||'none'));
							// console.log('stderr: '+(stderr||'none'));
							// if(error !== null) {
							// 	console.log('exec error: '+error);
							// }

							console.log('        generating image "' + row.title + '" (as "'+fileName+'") done.');
							done ++;
							var doneTasks = done/userAgentLength;
							if( doneTasks%conf.unit == 0 ){
								generateImage();
							}
							if( tasks.length <= doneTasks ){
								captureFinalPdf();
								return true;
							}
						}
					);
				})(row,fileName,deviceType);
			}
			htmlPdf += mkPdfPage(row, fileName);

			taskProgress++;
			if( taskProgress%conf.unit == 0 ){
				break;
			}
		}
		return true;
	}

	function captureFinalPdf(){
		var htmlFin = '';
		htmlFin += '';
		htmlFin += '<html>'+"\n";
		htmlFin += '<head>'+"\n";
		htmlFin += '<meta charset="UTF-8" />'+"\n";
		htmlFin += '<title>preview '+h( dateFormat() )+'</title>'+"\n";
		htmlFin += '<style type="text/css">'+"\n";
		htmlFin += '*{'+"\n";
		htmlFin += '	font-size:xx-small;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += '.page_unit{'+"\n";
		htmlFin += '	page-break-before: always;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += '.page_unit:first-child{'+"\n";
		htmlFin += '	page-break-before: auto;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.def {'+"\n";
		htmlFin += '  border: none;'+"\n";
		htmlFin += '  border-collapse: collapse;'+"\n";
		htmlFin += '  text-align: left;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.def th,'+"\n";
		htmlFin += 'table.def td {'+"\n";
		htmlFin += '  border: 1px solid #999999;'+"\n";
		htmlFin += '  background: #ffffff;'+"\n";
		htmlFin += '  padding: 10px;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.def th {'+"\n";
		htmlFin += '  background: #e7e7e7;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.def thead th,'+"\n";
		htmlFin += 'table.def tfoot th {'+"\n";
		htmlFin += '  background: #d9d9d9;'+"\n";
		htmlFin += '  text-align: center;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.def thead td,'+"\n";
		htmlFin += 'table.def tfoot td {'+"\n";
		htmlFin += '  background: #eeeeee;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.page_capture{'+"\n";
		htmlFin += '	width:100%;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'table.page_capture td{'+"\n";
		htmlFin += '	vertical-align:top;'+"\n";
		htmlFin += '	text-align:center;'+"\n";
		htmlFin += '	padding:2pt;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += 'img{'+"\n";
		htmlFin += '	max-width:60%;'+"\n";
		htmlFin += '	max-height:100%;'+"\n";
		htmlFin += '}'+"\n";
		htmlFin += '</style>'+"\n";
		htmlFin += ''+"\n";
		htmlFin += '</head>'+"\n";
		htmlFin += '<body>'+"\n";
		htmlFin += htmlPdf;
		htmlFin += '</body>'+"\n";
		htmlFin += '</html>';
		fs.writeFileSync( conf.pathOutput+'/index.html' , htmlFin );

		var cmd = './node_modules/phantomjs/bin/phantomjs '
			+'./scripts/_phantom_pdf.js '
			+'http://127.0.0.1:'+conf.port+'/ '
			+conf.pathOutput+'/capture.pdf '
		;
		console.log( '' );
		console.log( 'Generating PDF...' );
		exec(
			cmd,
			{timeout:0},
			function(error, stdout, stderr) {
				console.log( '    done.' );
				console.log( '    see: '+conf.pathOutput+'/capture.pdf' );
				console.log( '' );
				console.log( '' );
				console.log( 'Done all.' );
				console.log( dateFormat() );
				console.log( 'exit;'+"\n" );
				process.exit();
			}
		);
	}


	function mkPdfPage(row, fileName){
		var $html_src = '';
		$html_src += '<!-- '+h(row['url'])+' -->'+"\n";
		$html_src += '<div class="page_unit">'+"\n";
		$html_src += '<table class="def" style="width:100%;margin-bottom:1em;">'+"\n";
		$html_src += '<thead><tr>'+"\n";
		$html_src += '<th style="background-color:#aaa;">num</th>'+"\n";
		$html_src += '<th>site name</th>'+"\n";
		$html_src += '<th>page ID</th>'+"\n";
		$html_src += '<th>url</th>'+"\n";
		$html_src += '<th>page title</th>'+"\n";
		$html_src += '<th>date</th>'+"\n";
		$html_src += '</tr></thead>'+"\n";
		$html_src += '<tr>'+"\n";
		$html_src += '<td>' + h(row['num']) + '</td>'+"\n";
		$html_src += '<td>' + h(conf.siteName) + '</td>'+"\n";
		$html_src += '<td>' + h(row['page_id']) + '</td>'+"\n";
		$html_src += '<td>' + h(row['url']) + '</td>'+"\n";
		$html_src += '<td>' + h(row['title']) + '</td>'+"\n";
		$html_src += '<td>' + h(dateFormat()) + '</td>'+"\n";
		$html_src += '</tr>'+"\n";
		$html_src += '</table>'+"\n";
		$html_src += '<table class="page_capture">'+"\n";
		$html_src += '<tr>'+"\n";
		for( var deviceType in conf.userAgent ){
			var deviceInfo = conf.userAgent[deviceType];
			$html_src += '<td><img src="./images/'+md5(row['title'])+'_'+h(deviceType)+'.png" alt="'+h(row['url'])+' ('+h(deviceType)+')" /></td>'+"\n";
		}

		$html_src += '</tr>'+"\n";
		$html_src += '</table>'+"\n";
		$html_src += '</div><!-- /.page_unit -->'+"\n";
		return $html_src;
	}


	// start
	console.log('Start; '+dateFormat());
	loadCSV();

}).call(this);
