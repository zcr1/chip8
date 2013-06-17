
"use strict";

$(function(){
	var chip = new Chip8(),
		rom = new ROM();

	rom.initialize();
	chip.loadRom(rom);
	chip.initialize();

	chip.fetchOpcode();
	//animate(chip)

	keyboardInput(chip);
});


/*     Keypad     Keyboard
	1, 2, 3, C   1, 2, 3, 4
	4, 5, 6, D   q, w, e, r
	7, 8, 9, E   a, s, d, f
	A, 0, B, F   z, x, c, v
*/

function keyboardInput(chip){
	$(window).keydown(function (event){
		console.log(event.which);
		switch(event.which){
			case (49):
				break;
			case (50):
				break;

		}
	});
}

function animate(chip){
	function loop(){
		//chip.draw
		requestAnimFram(loop);
	}
	loop();
}





// Fallback to setTimeout() if browser does not define requestAnimationFrame
window.requestAnimFrame = function(){
	return (
		window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(/* function */ callback){
			window.setTimeout(callback, 1000 / 60);
		}
	);
}();

//Returns a copy of array
Array.prototype.copy = function() {
	return this.slice(0);
};