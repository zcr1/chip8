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




test("6XNN", function(){
	chip.opcode = 0x6345;
	chip.decodeOpcode();

	equal(chip.V[3], 0x0045, "Sets VX to NN");
});

test("7XNN", function(){
	chip.opcode = 0x7945;
	chip.V[9] = 0x33;
	chip.decodeOpcode();

	equal(chip.V[9], 0x0078, "Adds NN to VX");
});

test("8XY0", function(){
	chip.opcode = 0x8120;
	chip.V[2] = 0x33;
	chip.decodeOpcode();

	equal(chip.V[2], chip.V[1], "Sets VX to VY");
});

test("8XY1", function(){
	chip.opcode = 0x8121;
	chip.V[1] = 0x33;
	chip.V[2] = 0x11;
	chip.decodeOpcode();

	equal(chip.V[1], 51, "Sets VX to VX or VY");
});

test("8XY2", function(){
	chip.opcode = 0x8122;
	chip.V[1] = 0x33;
	chip.V[2] = 0x11;
	chip.decodeOpcode();

	equal(chip.V[1], 17, "Sets VX to VX and VY");
});

test("8XY3", function(){
	chip.opcode = 0x8123;
	chip.V[1] = 0x33;
	chip.V[2] = 0x11;
	chip.decodeOpcode();

	equal(chip.V[1], 34, "Sets VX to VX xor VY");
});

test("ANNN", function(){
	chip.opcode = 0xA111;
	chip.decodeOpcode();

	equal(chip.I, 0x0111, "Sets Index register to the address NNN");
});
