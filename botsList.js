var http = require('http');

var randomIndexes;

var arrayOfBotsJSON = new Array();

var options = {
    host: 'bidoncd.s3.amazonaws.com',
    path: '/bot.json'
}

function getBotsList()
{
	var request = http.request(options, function (res) {
    	var data = '';
    	res.on('data', function (chunk) {
    	    data += chunk;
   	 });
   	 res.on('end', function () {
    		arrayOfBotsJSON = JSON.parse(data);
    	});
	});
	request.on('error', function (e) {
    	console.log(e.message);
	});
	request.end();
}

function createBots()
{
	var arrayOfBots = new Array();
	getBotsList();
	for (var i = 0; i < arrayOfBotsJSON.length; i++) {
		var objToWrite = {
			money : arrayOfBotsJSON[i].money,
			rank : arrayOfBotsJSON[i].level,
			displayName : arrayOfBotsJSON[i].nickname,
			serverName : arrayOfBotsJSON[i].authen,
			fbImageUrl : arrayOfBotsJSON[i].avatar,
			status : 'A',
			bot : 1,
			sessionId : arrayOfBotsJSON[i].session_id,
			duelsWin : arrayOfBotsJSON[i].duels_win,
			duelsLost : arrayOfBotsJSON[i].duels_lost,
			weapon :  arrayOfBotsJSON[i].weapons.id, 
			defense :  arrayOfBotsJSON[i].defenses.value
		  };	
  		arrayOfBots[i] = objToWrite;
	}
	return arrayOfBots;
}

function addBotsToArray(array){
	arrayOfBots = createBots();
	var arrayWithBots = new Array();
	var index = 0;
	randomIndexes = new Array();
	for (var i = 0; i < 200; i++)
    		{
    			var tempIndex = Math.floor((Math.random()*arrayOfBots.length));
    			var isInRandomIndexes = false;
    			
    			if(i != 0){
    				for (var j = 0; j < randomIndexes.length; j++)
    				{
    					if (randomIndexes[j] == tempIndex) {
    						isInRandomIndexes = true;
    						break;
    					}
    				}
    			}
    			if (!isInRandomIndexes) {
    				randomIndexes[index] = tempIndex;
    				index++;
    			}
    			if(randomIndexes.length == arrayOfBots.length) break;
    		}
	var listSize = 10;
	if(array.length < listSize) listSize = array.length;
	
	for (var i = 0; i < listSize; i++) {
				
  		  	arrayWithBots[i] = array[i];
  		  	
  		} 
	for (var i = array.length; i < 4; i++) {
				
  		  	arrayWithBots[i] = arrayOfBots[randomIndexes[i]];
  		  	
  		} 
	return arrayWithBots;
}
exports.addBotsToArray = addBotsToArray;
exports.getBotsList = getBotsList;