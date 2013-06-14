
"use strict";

$(function(){
    var chip = new Chip8(),
        rom = new ROM();

    rom.initialize();
    chip.loadRom(rom);
    chip.initialize();

    chip.fetchOpcode();
    //animate(chip)
});


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