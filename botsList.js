function createStaticBots()
{
	var arrayOfBots = new Array();
	
	for (var i = 0; i <= 4; i++) {
		var objToWrite = {
			money : 100 * i,
			rank : i * 2,
			displayName : 'Bot ' + i,
			serverName : 'Bot' + i,
			fbImageUrl : '',
			status : 'A',
			bot : 1,
			sessionId : 'qwertyuio',
			duelsWin : i,
			duelsLost : 4 - i  
		  };	
  		arrayOfBots[i] = objToWrite;
	}
	return arrayOfBots;
}


function addBotsToArray(array){
	var arrayOfBots = createStaticBots();
	var arrayWithBots = new Array();
	for (var i = 0; i < array.length; i++) {
				
  		  	arrayWithBots[i] = array[i];
  		  	
  		} 
	for (var i = array.length; i <= 4; i++) {
				
  		  	arrayWithBots[i] = arrayOfBots[i];
  		  	
  		} 
	return arrayWithBots;
}
exports.addBotsToArray = addBotsToArray;