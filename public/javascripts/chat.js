var Chat = function (socket) {
    this.sockets = socket;
}

Chat.prototype.sendMessage = function (room,text) {
    var message = {
        room:room,
        text:text
    };
    this.sockets.emit('message',message);
}

Chat.prototype.changeRoom = function (room) {
    this.sockets.emit('join',{
        newRoom:room
    });
}

Chat.prototype.changeName = function (name) {
    this.sockets.emit('nameAttempt',name);
}

/**
 * 处理聊天命令
 * @param command
 */
Chat.prototype.processCommand= function (command) {
    var words = command.split(' ');
    //取命令 /nick or /join
    var command = words[0].substring(1,words[0].length).toLowerCase();

    var message = false;
    switch (command){
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.changeName(name);
            break;
        default:
            message = 'Unrecognized command';
            break;
    }
    return message;
}