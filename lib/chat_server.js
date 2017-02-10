var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server){
	io = socketio.listen(server);
	io.set('log level',1);//将socket.io中的debug信息关闭

	io.sockets.on('connection',function(socket){
		guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);
        joinRoom(socket,'Lobby');

        handleMessageBroadcasting(socket);

        handleNameChangeAttemtps(socket,nickNames,namesUsed);

	});
}

/*给用户起默认的名字*/
function assignGuestName(socket,guestNumber,nickNames,nameUsed){
	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
    //服务器返回带有json数据的nameResult事件
	socket.emit('nameResult',{
		success:true,
		name:name
	});
	nameUsed.push(name);
	return guestNumber + 1;
}

/**
 * 用户加入房间
 * @param socket
 * @param room 房间名字
 */
function joinRoom(socket,room) {
    //用户加入房间
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult',{room:room});
    //把新用户加入的消息广播到房间
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id] + ' has joined ' + room + '.'
    });
    //汇总房间里的用户
    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){
        var usersInRoomSummary = 'Users currently in ' + room + ': ';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message',{text:usersInRoomSummary})
    }
}

/*更名请求处理*/
function handleNameChangeAttemtps(socket,nicknames,namesUsed) {
    socket.on('nameAttempt',function (name) {
        //名称格式检查
        if(name.indexOf('Guest') == 0){
            socket.emit('nameResult',{
                success:false,
                message:'Names cannot begin with "Guest".'
            });
        }else{
            if(namesUsed.indexOf(name) == -1){
                var previoursName = nicknames[socket.id];
                var previoursNameIndex = namesUsed.indexOf(previoursName);
                namesUsed[previoursNameIndex] = name;
                nicknames[socket.id] = name;
                socket.emit('nameResult',{
                    success:true,
                    name : name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previoursName + ' is now known as ' + name + '.'
                });
            }else{
                socket.emit('nameResult',{
                    success:false,
                    message:'That name is already in use'
                });
            }
        }
    });
}
/*发送聊天信息处理*/
function handleMessageBroadcasting(socket) {
    //message.room标识房间名
    //message.text标识谈话
    socket.on('message',function (message) {
        socket.broadcast.to(message.room).emit('message',{
            text:nickNames[socket.id] + ": " + message.text
        });
    });
}

/*用户加入已有房间的逻辑*/
function handleRoomJoining(socket) {
    socket.on('join',function (room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom((socket,room.newRoom));
    });
}

/*用户断开连接的逻辑处理*/
function handleClientDisconnection(socket) {
    socket.on('disconnect',function () {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete  nickNames[socket.id];
    })
}



























