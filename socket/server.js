// Setup basic express server
var express = require('express');
var app = express();
//var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3100;


/*
|----------------------------------------------------------------
| Chatroom
|----------------------------------------------------------------
*/
var numUsers = 0;

io.on('connection', (socket) => {
    var addedUser = false;

    // when the client emits 'user login', this listens and executes
    socket.on('user login', (data) => {
        if (addedUser) return;
        //set username
        socket.username = data.username;
        //set room
        socket.room = data.roomId;
        //join room
        socket.join(data.roomId);
            ++numUsers;
            addedUser = true;

        //emit to room that a person has connected.
        socket.to(data.roomId).emit('user login', data);
    });



    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.to(socket.roomId).emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', (data) => {
        socket.to(socket.roomId).emit('typing', data);
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.to(socket.roomId).emit('user left', {
                username: socket.username
            });
        }
    });
});



server.listen(port, () => {
    console.log('Server listening at port %d', port);
});