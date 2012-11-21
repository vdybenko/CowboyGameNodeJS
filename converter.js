var botsList = require('./botsList');

function convert(array, currentServer){
	var arrayForJson = new Array();
	array = botsList.addBotsToArray(array);
	
	for (var i = 0; i < array.length; i++) {
		var tmp = array[i];
		if (tmp){
			var objToWrite = {
				money : tmp.money,
				rank : tmp.rank,
				displayName : tmp.displayName,
				serverName : tmp.serverName,
				fbImageUrl : tmp.fbImageUrl,
				status : tmp.status,
				bot : tmp.bot,
				sessionId : tmp.sessionId,
				duelsWin : tmp.duelsWin,
				duelsLost : tmp.duelsLost
		  	};		
  		  	arrayForJson[i] = objToWrite;
  		  	
  		} else {
  			arrayForJson[i] = null;
  		}
	}
	var index;
	index = array.indexOf(currentServer);
	if (index > -1) arrayForJson.splice(index, 1);
	return JSON.stringify(arrayForJson);
}

exports.convert = convert;