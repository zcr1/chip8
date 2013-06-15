/*******************************************
	Unit Tests for the ol' Chipper
*******************************************/
module("Opcode")

test("Global pollution", function() {
	window.pollute = true;
	ok(pollute, "Nasty pollution");
});

var chip = new Chip8();
chip.initialize();

test("ANNN", function(){
	chip.opcode = 0xA555;
	chip.decodeOpcode();

	equal(chip.I, 0x0555, "Sets I to the address NNN");
});


test("0EEE", function(){
	chip.opcode = 0x00EE;

	chip.stack[chip.sp] = 0xF0;
	chip.sp += 1

	chip.decodeOpcode();

	// Adds 2 to the program counter as well
	equal(chip.pc, 0xF2, "Returns from a subroutine");
});

test("1NNN", function(){
	chip.opcode = 0x1234;
	chip.decodeOpcode();

	equal(chip.pc, 0x0234, "Jumps to address NNN");
});

test("2NNN", function(){
	chip.opcode = 0x2345;
	chip.decodeOpcode();

	equal(chip.pc, 0x0345, "Calls subroutine at NNN");
});

test("ANNN", function(){
	chip.opcode = 0xA111;
	chip.decodeOpcode();

	equal(chip.I, 0x0111, "Sets Index register to the address NNN");
});
