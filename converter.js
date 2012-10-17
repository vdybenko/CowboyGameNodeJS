function convert(array, currentServer){
	var arrayForJson = new Array();

	for (var i = 0; i < array.length; i++) {
		var tmp = array[i];
		if (tmp){
			var objToWrite = {
		  		serverName : tmp.serverName,
		  		status: tmp.status,
		  		money: tmp.money,
		  		rank: tmp.rank,
		  		fbImageUrl: tmp.fbImageUrl
		  	};		
  		  	arrayForJson[i] = objToWrite;
  		  	
  		} else {
  			arrayForJson[i] = null;
  		}
	}
	var index;
	index = array.indexOf(currentServer);
	arrayForJson.splice(index, 1);
	return JSON.stringify(arrayForJson);
}

exports.convert = convert;