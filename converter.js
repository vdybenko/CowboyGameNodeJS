function convert(array, currentServerName){
	var arrayForJson = new Array();
	for (var i = 0; i < array.length; i++) {
		var tmp = array[i];
		if (tmp){
			if (tmp.serverName != currentServerName){ 
				var objToWrite = {
			  		serverName : tmp.serverName,
			  		status: tmp.status,
			  		money: tmp.money,
			  		rank: tmp.rank,
			  		fbImageUrl: tmp.fbImageUrl
			  	};		
	  		  	arrayForJson[i] = objToWrite;
  		  	}
  		} else {
  			arrayForJson[i] = null;
  		}
	}
	return JSON.stringify(arrayForJson);
	
}

exports.convert = convert;