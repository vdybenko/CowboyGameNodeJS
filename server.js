var net = require('net');
var converter = require('./converter');

var connections = new Array();
var PORT = 8888;

var packetCodes = Object.freeze({
  NETWORK_PING: 0,
  NETWORK_POST_INFO:1,
  NETWORK_GET_LIST_ONLINE:2,
  NETWORK_SET_PAIR:3,
  NETWORK_PAIR_SET_TRUE:4,
  NETWORK_PAIR_SET_FALSE:5,
  NETWORK_DISCONNECT_PAIR:6,
  NETWORK_LOST_CONNECTION:7,
  NETWORK_TIME:8,         
  NETWORK_TIME_TRY:9,               
  NETWORK_START_DUEL:10,       
  NETWORK_START_DUEL_TRUE:11,        
  NETWORK_START_DUEL_FALSE:12,       
  NETWORK_ACCEL_STATE:13,                    
  NETWORK_ACCEL_STATE_TRUE:14,               
  NETWORK_SEND_SHOT_TIME:15,                 
  NETWORK_FOLL_START:16,                     
  NETWORK_FOLL_END:17,                       
  NETWORK_OPONTYPE_RESPONSE:18,              
  NETWORK_OPONTYPE_RESPONSE_TRY:19,          
  NETWORK_RUN_AWAY:20,                       
  NETWORK_RESPONSE:21,                       
  NETWORK_DUEL_CANSEL:22
 });

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
var masretServer = net.createServer(function(sock) {
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
    sock.on('error', function(exception){
        console.log('Exception:');
        console.log(exception);
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
      console.log('serverForSocket: ' + server.socket +' socket ' + sock);
  }
}

function addNewServer(server)
{
   var serverAlreadyAdded = false;
   for (i = 0; i < connections.length; i++){
      var serverTemp = connections[i];
      if (server.serverName === serverTemp.serverName) {
          serverTemp.socket.destroy();
          connections[i] = server;
          serverAlreadyAdded = true;
          console.log('server ' + server.serverName + ' already added');
      }
   }
   if (!serverAlreadyAdded) 
   {
       connections[connections.length] = server;
       console.log('add new server ' + server.serverName);
   }
}

function removeServerFromList(server)
{
  if (server) {
    if (server.pairSocket) {
      var buffer = new Buffer(1);
      buffer[0] = packetCodes.NETWORK_DISCONNECT_PAIR;
      console.log('removeServerFromList try send data');
      try{
             server.pairSocket.write(buffer);
         }catch(err){
             console.log('There is err occured: ' + err.message);
         }
      
    }
  };
   var index;
   index = connections.indexOf(server);
   console.log('Remove server at index ' + index);
   console.log('List of servers before delete ' + converter.convert(connections, server));
   
   if (index > -1)  connections.splice(index, 1);
   
   console.log('List of servers after delete ' + converter.convert(connections, server));
   
}


function processDataFromSocket(data, sock)
{ 
  if (data.readInt8(0) != packetCodes.NETWORK_PING)
    console.log('get '+data.readInt8(0));
  if (data.readInt8(0) == packetCodes.NETWORK_PING){
   // console.log('get ping packet'); 
  } else if (data.readInt8(0) == packetCodes.NETWORK_POST_INFO){  //init info
      console.log('data info ' + data);
      var serverExist;
      var server = serverForSocket(sock);
      
      if (!server) {
          server = {}; 
          serverExist = false;
      } else serverExist = true;
      
      server.socket = sock;
      
      var money = data.readInt32LE(4,4);
      console.log('money ' + money);
      if (money < 0) money = 0;
      
      server.money = money;
      server.rank = data.readInt8(8,4);
      
      var displayNameLen = data.readInt8(12,4);
      server.displayName = data.toString('utf8', 16, 16+displayNameLen);

      var nameLen = data.readInt8(16+displayNameLen,4);
      server.serverName = data.toString('utf8', 20+displayNameLen, 20+displayNameLen+nameLen);
      
      server.fbImageUrl = data.toString('utf8', 20+displayNameLen+nameLen, data.length);
      server.status = "A";
      if(!serverExist) addNewServer(server);
      console.log('CONNECTIONS: ' + connections[0].socket.remoteAddress + ' ' + connections.length);
      console.log('name: '+server.serverName+' displayName: '+server.displayName);
      console.log('url: '+server.fbImageUrl);
  } else if (data.readInt8(0) == packetCodes.NETWORK_GET_LIST_ONLINE){  //list online
      console.log('connections ' + connections);
      // sending list of servers:
      try{
      var tempServer = serverForSocket(sock);
      //console.log('curr '+tempServer.displayName);
      var listOfServers = converter.convert(connections, tempServer);
      console.log('list: '+listOfServers);
      // form data to send:
      var dataOfListBuffer = new Buffer (Buffer.byteLength(listOfServers, encoding='utf8')+1);
      dataOfListBuffer[0] = packetCodes.NETWORK_GET_LIST_ONLINE;
      dataOfListBuffer.write(listOfServers, 1, dataOfListBuffer.length, 'utf8');
      try{
             tempServer.socket.write(dataOfListBuffer);
         }catch(err){
             console.log('There is err occured: ' + err.message);
         }
    }catch(err){
      console.log('There is err occured: ' + err.message);
    }
  } else if (data.readInt8(0) == packetCodes.NETWORK_SET_PAIR){   //set pair of clients
      console.log('set pair socket ' + data.toString('utf8', 4));
      var name = data.toString('utf8', 4);
      var tempServer = serverForSocket(sock);
      var pairServer = serverForName(name);
      
      if (pairServer) {
        if (pairServer.status === 'B'){
            var discPacket = new Buffer(4);
            discPacket[0] = packetCodes.NETWORK_PAIR_SET_FALSE;
            try{
              tempServer.socket.write(discPacket);
            }catch(err){
               console.log('There is err occured: ' + err.message);
            }
            return;
        }
        
        var discPacket = new Buffer(4);
        discPacket[0] = packetCodes.NETWORK_PAIR_SET_TRUE;
        tempServer.socket.write(discPacket);
        
        pairServer.pairSocket = sock;
        pairServer.status = 'B';
        tempServer.pairSocket = pairServer.socket;
        tempServer.status = 'B';
        console.log('Pair '+tempServer.displayName + ' && ' + pairServer.displayName + ' setted');
        console.log('i.e. '+tempServer.serverName + ' && ' + pairServer.serverName + ' setted');
        console.log('They are: '+ tempServer.status+ ' && '+pairServer.status + ' now ');
      }
      else {
          var discPacket = new Buffer(4);
          discPacket[0] = packetCodes.NETWORK_PAIR_SET_FALSE;
          try{
              tempServer.socket.write(discPacket);
            }catch(err){
               console.log('There is err occured: ' + err.message);
            }
          console.log('cannot find pair server for name ' + name);
          return;
      }
  
  } else if (data.readInt8(0) == packetCodes.NETWORK_DISCONNECT_PAIR){
      tempServer = serverForSocket(sock);
      console.log('NETWORK_DISCONNECT_PAIR getted');
      if (tempServer)
      if (tempServer.pairSocket){
        // sending that we were disconnected to other side:
        var discPacket = new Buffer(4);
        discPacket[0] = packetCodes.NETWORK_DISCONNECT_PAIR;
        try{
              tempServer.pairSocket.write(discPacket);
            }catch(err){
               console.log('There is err occured: ' + err.message);
            }
        console.log('discPacket[0]: '+ discPacket[0]);

        var pairServer = serverForSocket(tempServer.pairSocket);
        destroyPairSocket(pairServer);
        destroyPairSocket(tempServer);
      }
      else console.log('pair socket does not set');      
  } else if (data.readInt8(0) > 4){   //worked packet
      tempServer = serverForSocket(sock);
      console.log('send data to client ' + data);
      if (tempServer)
            if (tempServer.pairSocket) {
                try{
                    tempServer.pairSocket.write(data);
                }catch(err){
                    console.log('There is err occured: ' + err.message);
                }
            }
                   else console.log('pair socket does not set');    
  }
  
}

function destroyPairSocket(server){
  server.status = 'A';
  var tmp = serverForSocket(server.pairSocket);
  if (server.pairSocket) {
    console.log('pair '+ server.displayName + ' && ' + tmp.displayName+ ' destroyed');
    console.log('They are: '+ server.status+ ' && '+tmp.status + ' now ');
    server.pairSocket = null;
    // console.log('pair '+ server.displayName + ' && ' + tmp.displayName+ ' destroyed');
  };
}

console.log('Server listening on ' +':'+ PORT); 
