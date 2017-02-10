var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatServer = require('./lib/chat_server')
var cache = {}; //用来缓存文件内容的对象

/**
  发送404错误
*/

function send404(response){
	response.writeHead(200,{'Content-Type':'text/plain'});
	response.write('Error 404:resource not found');
}

/**
 * 提供文件数据
 */

function sendFile(response,filePath,fileContents){
	response.writeHead(200,
		{'Content-Type':mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

/**
 * 提供静态文件服务
 * 从缓存中读取文件，如果缓存中没有该文件，就从文件系统读取，如果该文件依旧不存在，发送HTTP 404
 */
function serveStatic(response,cache,absPath){
	if(cache[absPath]){
		sendFile(response, absPath, cache[absPath]);
	}else{
		fs.readFile(absPath, function(err,data){
			if(err){
				console.log('error of file:'+absPath);
				send404();
			}else{
				cache[absPath] = data;
				sendFile(response, absPath, data);
			}
		});
	}
}

/*创建服务器*/

var server = http.createServer(function(req,res){
	var filePath = false;

	if(req.url == '/'){ //处理访问符
		filePath = 'public/index.html';
	}else{
		filePath = 'public' + req.url;
	}
	var absPath = './' + filePath;
	serveStatic(res,cache,absPath);
});

server.listen(3000,function(){
	console.log('Server listening on port 3000');
});

chatServer.listen(server);












