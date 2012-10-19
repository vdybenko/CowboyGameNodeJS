var net = require('net');
var converter = require('./converter');

var connections = new Array();
var PORT = 8888;

var packetCodes = Object.freeze({
  NETWORK_PING: 0,
  NETWORK_POST_INFO:1,
  NETWORK_GET_LIST_ONLINE:2,
  NETWORK_SET_PAIR:3,
  NETWORK_DISCONNECT_PAIR:4,
  NETWORK_LOST_CONNECTION:5,
  NETWORK_TIME:6,         
  NETWORK_TIME_TRY:7,               
  NETWORK_START_DUEL:8,       
  NETWORK_START_DUEL_TRUE:9,        
  NETWORK_START_DUEL_FALSE:10,       
  NETWORK_ACCEL_STATE:11,                    
  NETWORK_ACCEL_STATE_TRUE:12,               
  NETWORK_SEND_SHOT_TIME:13,                 
  NETWORK_FOLL_START:14,                     
  NETWORK_FOLL_END:15,                       
  NETWORK_OPONTYPE_RESPONSE:16,              
  NETWORK_OPONTYPE_RESPONSE_TRY:17,          
  NETWORK_RUN_AWAY:18,                       
  NETWORK_RESPONSE:19,                       
  NETWORK_DUEL_CANSEL:20
 });

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    sock.setTimeout(10000, function(data) {
        console.log('setTIMEOUT: ' + sock.remoteAddress +' '+ sock.remotePort);
    });    

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    

    sock.on('data', function(data){
      processDataFromSocket(data,sock);
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

}).listen(PORT);

function serverForName(name){
   for (i = 0; i < connections.length; i++){
      var server = connections[i];
      if (server.serverName === name) return server;
      console.log('serverForName: ' + server.displayName +' name ' + name);
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
  if (server) {
    if (server.pairSocket && server.pairSocket.wrirable) {
      var buffer = new Buffer(1);
      buffer[0] = 4;
      console.log('removeServerFromList try send data');
      server.pairSocket.write(buffer);
      
    }
  };
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

function processDataFromSocket(data, sock)
{ 
  console.log('get '+data.readInt8(0));
  if (data.readInt8(0) == packetCodes.NETWORK_PING){
   // console.log('get ping packet'); 
  } else if (data.readInt8(0) == packetCodes.NETWORK_POST_INFO){  //init info
      console.log('data info ' + data);
      var server = {}
      server.socket = sock;
      server.money = data.readInt8(4,4);
      server.rank = data.readInt8(8,4);
      
      var displayNameLen = data.readInt8(12,4);
      server.displayName = data.toString('utf8', 16, 16+displayNameLen);

      var nameLen = data.readInt8(16+displayNameLen,4);
      server.serverName = data.toString('utf8', 20+displayNameLen, 20+displayNameLen+nameLen);
      
      server.fbImageUrl = data.toString('utf8', 20+displayNameLen+nameLen, data.length);
      server.status = "A";
      addNewServer(server);
      console.log('CONNECTIONS: ' + connections[0].socket.remoteAddress + ' ' + connections.length);
      console.log('name: '+server.name+' displayName: '+server.displayName);
      console.log('url: '+server.fbImageUrl);
  } else if (data.readInt8(0) == packetCodes.NETWORK_GET_LIST_ONLINE){  //list online
      // sending list of servers:
      var tempServer = serverForSocket(sock);
      console.log('curr '+tempServer.displayName);
      var listOfServers = converter.convert(connections, tempServer);
      console.log('list: '+listOfServers);
      // form data to send:
      var dataOfListBuffer = new Buffer(listOfServers.length + 1);
      dataOfListBuffer[0] = 2;
      dataOfListBuffer.write(listOfServers, 1, dataOfListBuffer.length, 'utf8');
      tempServer.socket.write(dataOfListBuffer);
  } else if (data.readInt8(0) == packetCodes.NETWORK_SET_PAIR){   //set pair of clients
      console.log('set pair socket ' + data.toString('utf8', 4));
      var name = data.toString('utf8', 4);
      var tempServer = serverForSocket(sock);
      var pairServer = serverForName(name);
      if (pairServer) {
        pairServer.pairSocket = sock;
        pairServer.status = 'B';
        tempServer.pairSocket = pairServer.socket;
        tempServer.status = 'B';
        console.log('Pair '+tempServer.displayName + ' && ' + pairServer.displayName + ' setted');
        console.log('i.e. '+tempServer.serverName + ' && ' + pairServer.serverName + ' setted');
      }
      else console.log('cannot find pair server for name ' + name);
  
  } else if (data.readInt8(0) == packetCodes.NETWORK_DISCONNECT_PAIR){
      tempServer = serverForSocket(sock);
      console.log('NETWORK_DISCONNECT_PAIR getted');
      if (tempServer.pairSocket){
        // sending that we were disconnected to other side:
        var discPacket = new Buffer(4);
        discPacket[0] = packetCodes.NETWORK_DISCONNECT_PAIR;
        tempServer.pairSocket.write(discPacket);
        console.log('discPacket[0]: '+ discPacket[0]);

        var pairServer = serverForSocket(tempServer.pairSocket);
        destroyPairSocket(pairServer);
        destroyPairSocket(tempServer);
      }
      else console.log('pair socket does not set');      
  } else if (data.readInt8(0) > 4){   //worked packet
      tempServer = serverForSocket(sock);
      console.log('send data to client ' + data);
       
      if (tempServer.pairSocket) tempServer.pairSocket.write(data);
       else console.log('pair socket does not set');    
  }
  
}

function destroyPairSocket(server){
  server.status = 'A';
  var tmp = serverForSocket(server.pairSocket);
  if (server.pairSocket) {
    server.pairSocket = null;
    console.log('pair '+ server.displayName + ' && ' + tmp.displayName+ ' destroyed');
  };
}

console.log('Server listening on ' +':'+ PORT); 
