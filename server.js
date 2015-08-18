var net = require('net');

var connections = new Array();

//Use your own IP
var HOST = '192.168.0.16';
var PORT = 6969;

var terrarium = 'Horda';

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
    server.serverName = "test server ip" + sock.remoteAddress;
    server.status = "A"; 
    addNewServer(server);
    console.log('CONNECTIONS: ' + connections[0].socket.remoteAddress + ' ' + connections.length);

    sock.on('data', function(data) {
        //console.log('get packet id %d', data.readInt8(0));
        if(data.readInt8(0) == 0) console.log('get ping packet');
        else sendDataToServerWithName(connections[0].serverName);
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
      console.log('serverForName: ' + server.socket.remoteAddress + ': ' + i);
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
	converter.convert(connections);
}

function sendDataToServerWithName(name)
{
   var server = serverForName(name);
   console.log('server to client' + name);
   server.socket.write('server to client');
}

console.log('Server listening on ' + HOST +':'+ PORT);
