// Chip 8 Emulator
"use strict";

$(function(){
	var chip = new Chip8(),
		rom = new ROM();

	rom.setRom("Brix");

	chip.initialize();
	chip.loadRom(rom);

	romPicker(chip, rom);
	colorPicker(chip);
	keyboardInput(chip);

	eventLoop(chip)
});

function eventLoop(chip){
	var context = $("#canvas")[0].getContext("2d");

	function loop(){
		chip.fetchOpcode();
		chip.decodeOpcode();
		chip.updateTimers();


		if (chip.drawFlag){
			draw(chip, context);
			chip.drawFlag = false;
		}

		setTimeout(loop, 1);
	}

	loop();
}

// Each pixel in Chip8 is represented by a 10x10 "pixel" on canvas
function draw(chip, context){
	context.fillStyle = chip.backColor;
	context.fillRect(0, 0, 640, 320);
	context.fillStyle = chip.blockColor;

	for (var row = 0; row < 32; row++){
		for (var col = 0; col < 64; col++){

			var pos = col + (row * 64);
			if (chip.gfx[pos] == 1){
				context.fillRect(col * 10, row * 10, 10, 10);
			}
		}
	}
}

// Sets up the color options for emulator
function colorPicker(chip){
	var $backColor = $("#backColor > div"),
		$blockColor = $("#blockColor > div");

	$backColor.click(function(){
		chip.setBackColor($(this).css("backgroundColor"));

		$backColor.each(function (){
			$(this).removeClass("active");
		});

		$(this).addClass("active");
	});

	$blockColor.click(function(){
		chip.setBlockColor($(this).css("backgroundColor"));

		$blockColor.each(function (){
			$(this).removeClass("active");
		});

		$(this).addClass("active");
	});
}

function romPicker(chip){
	var $roms = $("#roms");

	$roms.change(function(){
		var rom = new ROM();
		rom.setRom($(this).val())

		chip.initialize();
		chip.loadRom(rom);
	});
}

/*     Keypad     Keyboard
	1, 2, 3, C   1, 2, 3, 4
	4, 5, 6, D   q, w, e, r
	7, 8, 9, E   a, s, d, f
	A, 0, B, F   z, x, c, v
*/
function keyboardInput(chip){
	$(document).keydown(function (event){
		switch(event.which){
			case (49): // 1
				chip.setKey(1, true);
				break;
			case (50): // 2
				chip.setKey(2, true);
				break;
			case (51): // 3
				chip.setKey(3, true);
				break;
			case (52): // 4
				chip.setKey(0xC, true);
				break;
			case (81): // q
				chip.setKey(4, true);
				break;
			case (87): // w
				chip.setKey(5, true);
				break;

			case (69): // e
				chip.setKey(6, true);
				break;
			case (82): // r
				chip.setKey(0xD, true);
				break;
			case (65): // a
				chip.setKey(7, true);
				break;
			case (83): // s
				chip.setKey(8, true);
				break;
			case (68): // d
				chip.setKey(9, true);
				break;
			case (70): // f
				chip.setKey(0xE, true);
				break;
			case (90): // z
				chip.setKey(0xA, true);
				break;
			case (88): // x
				chip.setKey(0, true);
				break;
			case (67): // c
				chip.setKey(0xB, true);
				break;
			case (86): // v
				chip.setKey(0xF, true)
				break;
		}
	});

	$(document).keyup(function (event){
		switch(event.which){
			case (49): // 1
				chip.setKey(1, false);
				break;
			case (50): // 2
				chip.setKey(2, false);
				break;
			case (51): // 3
				chip.setKey(3, false);
				break;
			case (52): // 4
				chip.setKey(0xC, false);
				break;
			case (81): // q
				chip.setKey(4, false);
				break;
			case (87): // w
				chip.setKey(5, false);
				break;
			case (69): // e
				chip.setKey(6, false);
				break;
			case (82): // r
				chip.setKey(0xD, false);
				break;
			case (65): // a
				chip.setKey(7, false);
				break;
			case (83): // s
				chip.setKey(8, false);
				break;
			case (68): // d
				chip.setKey(9, false);
				break;
			case (70): // f
				chip.setKey(0xE, false);
				break;
			case (90): // z
				chip.setKey(0xA, false);
				break;
			case (88): // x
				chip.setKey(0, false);
				break;
			case (67): // c
				chip.setKey(0xB, false);
				break;
			case (86): // v
				chip.setKey(0xF, false)
				break;
		}
	});
}