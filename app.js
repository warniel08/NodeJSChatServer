const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mime = require('mime-types');
const WebSocketServer = require('websocket').server;

let server = http.createServer(function (req, res) {
    let pathname = url.parse(req.url).pathname;

    if (pathname === '/') {
        pathname = '/index.html';
    }

    let ext = path.extname(pathname);

    fs.readFile(path.join(__dirname + '/resources' + pathname), function(err, data) {
        if (!err) {
            if (ext) {
                if (ext === '.css') {
                    res.writeHead(200, {'Content-Type': mime.contentType('.css')});
                    res.write(data);
                } else if (ext === '.js') {
                    res.writeHead(200, {'Content-Type': mime.contentType('.js')});
                    res.write(data);
                } else {
                    res.writeHead(200, {'Content-Type': mime.contentType('.html')});
                    res.write(data);
                }
            }

            res.end();
        } else {
            res.writeHead(404, {'Content-Type': mime.contentType('.html')});
            res.write("404 Not Found!");

            res.end();
        }
    });
}).listen(8080, function(){
    console.log("server started on port 8080");
});


// *************** WebSocket ********************

let wsServer = new WebSocketServer ({
    httpServer: server
});

let roomList = {};

wsServer.on('request', function(req) {
    console.log((new Date()) + ' Connection from origin '
        + req.origin);

    let connection = req.accept(null, req.origin);
    console.log((new Date()) + ' Connection established');

    connection.on('message', function(message) {
        console.log('inside join area');
        console.log('Received Message: ' + message.utf8Data);
        let requestMessage = message.utf8Data;
        let index = requestMessage.indexOf(' ');
        let joinKey = requestMessage.substr(0, index);
        let roomName = requestMessage.substr(index + 1);

        if (joinKey != 'join') {
            connection.close();
        } else {
            if (roomName in roomList) {
                roomList[roomName].users.push(connection);
                console.log("Message history: ");
                roomList[roomName].messages.forEach(e => {
                    console.log("**********e: " + e);
                    connection.sendUTF(e);
                });
            } else {
                roomList[roomName] = { users: [connection],
                    messages: []};
            }
            connection.removeAllListeners('message');

            connection.on('message', function(message) {
                console.log('inside message area');
                let requestMessage = message.utf8Data;
                let index = requestMessage.indexOf(' ');
                let messageKey = requestMessage.substr(0, index);
                let messageText = requestMessage.substr(index + 1);

                let messageJSON = { "user": messageKey, "message": messageText };

                roomList[roomName].messages.push(JSON.stringify(messageJSON));
                console.log(messageJSON);
                roomList[roomName].users.forEach(e => {
                    e.send(JSON.stringify(messageJSON));
                });
            });
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log('ReasonCode: ' + reasonCode);
        console.log('Description: ' + description);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});