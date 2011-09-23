var port = 8123,
    http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('socket.io').listen(port),
		sys = require('sys'),
		numClients = 0;


io.set('log level', 1);

io.sockets.on('connection', function(client){
	client.on('messageupdate', function(message){
    client.broadcast.emit('messageupdate', {message: JSON.parse(message)});
	});
	
	numClients++;
  io.sockets.emit('announcement', {numberOfClients: numClients});
  
  client.on('disconnect', function() {
    numClients--;
    io.sockets.emit('announcement', {numberOfClients: numClients});
  });
});