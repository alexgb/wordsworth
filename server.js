var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('./vendor/socket.io-node/'),
		sys = require('sys'),
		
server = http.createServer();

server.listen(8123);

var numClients = 0,
    json = JSON.stringify,
		io = io.listen(server);
		
io.on('connection', function(client){
	client.on('message', function(message){
		client.broadcast(json({ message: [client.sessionId, JSON.parse(message)] }));
	});
});

io.on('clientConnect', function(client) {
  numClients++;
  io.broadcast(json({ announcement: { msg: client.sessionId + ' connected', numberOfClients: numClients }}));
});

io.on('clientDisconnect', function(client) {
  numClients--;
  io.broadcast(json({ announcement: { msg: client.sessionId + ' disconnected', numberOfClients: numClients }}));
});