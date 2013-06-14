function ROM(){
	// Pong!
	this.raw = "6a026b0c6c3f6d0ca2eadab6dcd66e00" +
				"22d4660368026060f015f0073000121a" +
				"c717770869ffa2f0d671a2eadab6dcd6" +
				"6001e0a17bfe6004e0a17b02601f8b02" +
				"dab6600ce0a17dfe600de0a17d02601f" +
				"8d02dcd6a2f0d67186848794603f8602" +
				"611f871246021278463f1282471f69ff" +
				"47006901d671122a68026301807080b5" +
				"128a68fe630a807080d53f0112a26102" +
				"80153f0112ba80153f0112c880153f01" +
				"12c26020f01822d48e3422d4663e3301" +
				"660368fe33016802121679ff49fe69ff" +
				"12c87901490269016004f01876014640" +
				"76fe126ca2f2fe33f265f12964146500" +
				"d4557415f229d45500ee808080808080" +
				"800000000000";
	this.src = null; // Uint8Array of binary data


	this.initialize = function(){
		var len = this.raw.length / 2,
			buffer = new ArrayBuffer(len);

		this.src = new Uint8Array(buffer);

		var j = 0;

		for(i = 0; i < this.raw.length; i += 2){
			this.src[j] = parseInt(this.raw.slice(i, i+2), 16);
			j += 1;
		}
	}
}


