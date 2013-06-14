function strToHex(str){
	var hex = '';

	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}

	return hex;
}

function decToHex(i) {
	return (i+0x10000).toString(16).substr(-4).toUpperCase();
}