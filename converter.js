function convert(array, currentServer){
	var arrayForJson = new Array();

	for (var i = 0; i < array.length; i++) {
		var tmp = array[i];
		if (tmp){
			var objToWrite = {
				money : tmp.money,
				rank : tmp.rank,
				displayName : tmp.displayName,
				serverName : tmp.serverName,
				fbImageUrl : tmp.fbImageUrl,
				status : tmp.status
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