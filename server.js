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
    

    sock.on('data', function(data) {
      if (data.readInt8(0) == 0){       //ping packet
			 console.log('get ping packet'); 
		  } else if (data.readInt8(0) == 1) {   //info packet
        console.log('data info ' + data);
        var server = {}
        server.socket = sock;
        server.money = data.readInt8(4,4);
        server.rank = data.readInt8(8,4);
        server.serverName = data.toString('utf8', 12, data.length);
        server.status = "A";
        addNewServer(server);
        console.log('CONNECTIONS: ' + connections[0].socket.remoteAddress + ' ' + connections.length);
      } else if (data.readInt8(0) == 2) {   //list online packet
            // sending list of servers:
            var tempServer = serverForSocket(sock);
            var listOfServers = converter.convert(connections);

            // form data to send:
            dataOfListBuffer = new Buffer(listOfServers.length+1);
            dataOfListBuffer[0] = 2;
            dataOfListBuffer.write(listOfServers, 1);

            tempServer.socket.write(dataOfListBuffer);
			console.log('list online' + converter.convert(connections));
		  } else if (data.readInt8(0) == 3) {    //set pair server packet
			 console.log('set pair socket ' + data.toString('utf8', 4));
			 var name = data.toString('utf8', 4);
			 var tempServer = serverForSocket(sock);
			 var pairServer = serverForName(name);
			 if (pairServer) {
				pairServer.pairSocket = sock;
                pairServer.status = 'B';
				tempServer.pairSocket = pairServer.socket;
                tempServer.status = 'B';
			 }
			 else console.log('cannot find pair server for name ' + name);
			
		  } else if (data.readInt8(0) > 4){   //worked packet
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
  if (server.pairSocket) {
    var buffer = new Buffer();
    buffer[0] = 4;
    server.pairSocket;
  }
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
