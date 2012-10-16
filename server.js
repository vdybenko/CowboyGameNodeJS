var net = require('net');
var converter = require('./converter');

var connections = new Array();

var HOST = '192.168.0.16';
var PORT = 6969;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    sock.setTimeout(10000, function(data) {
        console.log('setTIMEOUT: ' + sock.remoteAddress +' '+ sock.remotePort);
    });    

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    var server = {}
    server.socket = sock;
    server.serverName = sock.remoteAddress;
    server.status = "A";
    addNewServer(server);
    console.log('CONNECTIONS: ' + connections[0].socket.remoteAddress + ' ' + connections.length);

    sock.on('data', function(data) {
        if (data.readInt8(0) == 0){ 
			//console.log('get ping packet');
			console.log('get ping packet ' + data); 
		}else if (data.readInt8(0) == 1) {
			console.log('list online' + converter.convert(connections));
		}
		else if (data.readInt8(0) == 2){
			console.log('set pair socket ' + data.toString('utf8', 4, 16));
			var name = data.toString('utf8', 4, 16);
			var tempServer = serverForSocket(sock);
			var pairServer = serverForName(name);
			if (pairServer) {
				pairServer.pairSocket = sock;
				tempServer.pairSocket = pairServer.socket;
			}
			else console.log('cannot find pair server for name ' + name);
			
		} else if (data.readInt8(0) > 2){
			console.log('send data to client ' + data);
			tempServer = serverForSocket(sock);
			if (tempServer.pairSocket) tempServer.pairSocket.write(data);
			else console.log('pair socket does not set');
		}
	
    });
    
	sock.on('drain', function(){
		console.log('drain!');	
	});
    // Add a 'timeout' event handler to this instance of socket
    sock.on('timeout', function(data) {
        console.log('TIMEOUT: ' + sock.remoteAddress +' '+ sock.remotePort);
        removeServerFromList(serverForSocket(sock));
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
        removeServerFromList(serverForSocket(sock));
    });
    
}).listen(PORT, HOST);

function serverForName(name){
   for (i = 0; i < connections.length; i++){
      var server = connections[i];
      if (server.serverName === name) return server;
      console.log('serverForName: ' + server.serverName +' name ' + name);
   }
}

function serverForSocket(sock) {
	for (i = 0; i < connections.length; i++){
	      var server = connections[i];
	      if (server.socket == sock) return server;
	}
}

function addNewServer(server)
{
   var serverAlreadyAdded = false;
   for (i = 0; i < connections.length; i++){
      var serverTemp = connections[i];
      if (server.serverName === serverTemp.serverName) serverAlreadyAdded = true;
   }
   if (!serverAlreadyAdded) 
   {
       connections[connections.length] = server;
   }
   else sock.destroy();   
}

function removeServerFromList(server)
{
   var index;
   index = connections.indexOf(server);
   connections.splice(index, 1);
}

function sendDataToServerWithName(name)
{
   var server = serverForName(name);
   console.log('server to client' + name);
   server.socket.write('server to client');
}

console.log('Server listening on ' + HOST +':'+ PORT);
