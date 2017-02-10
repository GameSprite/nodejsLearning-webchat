//处理系统创建的受信内容和用户创建的可疑文本

/**
 * 转义后的div元素
 * @param message
 */
function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

/**
 * 受信的系统信息
 * @param message
 */
function divSystemContentElement(message) {
    return $('<div></div>').html('<i>'+message+'</i>');

}

function processUserInput(chatApp, socket){
	var message = $('#send-message').val();
	var systemMessage;

    //处理命令
	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $('messages').append(divSystemContentElement(message));
        }
	}else{
        chatApp.sendMessage($('#room').text(),message);
        $('messages').append(divEscapedContentElement(message));
        $('messages').scrollTop($('messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

/**
 客户端程序初始化逻辑
 */
var socket = io.connect(); //socket.io.client.connect

$(document).ready(function(){
    var chatApp = new Chat(socket);

    socket.on('nameResult');
});