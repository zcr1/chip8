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

test("3XNN", function(){
	chip.opcode = 0x3345;
	chip.V[3] = 0x45;
	chip.pc = 4;
	chip.decodeOpcode();

	equal(chip.pc, 8, "Skips the next instruction if VX equals NN");
});

test("4XNN", function(){
	chip.opcode = 0x4345;
	chip.V[3] = 0x01;
	chip.pc = 4;
	chip.decodeOpcode();

	equal(chip.pc, 8, "Skips the next instruction if VX does not equal NN");
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

test("8XY4", function(){
	chip.opcode = 0x8124;
	chip.V[1] = 0x33;
	chip.V[2] = 0x11;
	chip.decodeOpcode();

	equal(chip.V[1], 0x44, "Adds VY to VX");
	equal(chip.V[15], 0, "No Carry bit");

	chip.V[1] = 0xFF;
	chip.V[2] = 0x01;
	chip.decodeOpcode();

	equal(chip.V[1], 0xFF, "Adds VY to VX");
	equal(chip.V[15], 1, "Carry bit");
});

test("8XY5", function(){
	chip.opcode = 0x8125;
	chip.V[1] = 55;
	chip.V[2] = 44;
	chip.decodeOpcode();

	equal(chip.V[1], 11, "Subtracts VY from VX");
	equal(chip.V[15], 0, "No Borrow bit");

	chip.V[1] = 10;
	chip.V[2] = 20;
	chip.decodeOpcode();

	equal(chip.V[1], 0, "Subtracts VY from VX");
	equal(chip.V[15], 1, "Borrow bit");
});

test("8XY6", function(){
	chip.opcode = 0x8126;
	chip.V[1] = 0x0F;

	chip.decodeOpcode();

	equal(chip.V[1], 0x07, "Right shift VX");
	equal(chip.V[15], 1, "Least significant bit");
});

test("8XY7", function(){
	chip.opcode = 0x8127;
	chip.V[1] = 10;
	chip.V[2] = 15;

	chip.decodeOpcode();

	equal(chip.V[1], 5, "Sets VX to VY - VX");
	equal(chip.V[15], 0, "No borrow bit");

	chip.V[1] = 20;
	chip.decodeOpcode();

	equal(chip.V[1], 0, "Sets VX to VY - VX");
	equal(chip.V[15], 1, "Borrow bit");
});

test("8XYE", function(){
	chip.opcode = 0x812E;
	chip.V[1] = 0x0F;

	chip.decodeOpcode();

	equal(chip.V[1], 0x07, "Right shift VX");
	equal(chip.V[15], 0, "Most significant bit");
});

test("9XY0", function(){
	chip.opcode = 0x9120;
	chip.V[1] = 10;
	chip.V[2] = 9;
	chip.pc = 0;

	chip.decodeOpcode();

	equal(chip.pc, 4, "Skip next instruction");
});

test("ANNN", function(){
	chip.opcode = 0xA111;
	chip.decodeOpcode();

	equal(chip.I, 0x0111, "Sets Index register to the address NNN");
});

test("BNNN", function(){
	chip.opcode = 0xB111;
	chip.V[0] = 0x55;
	chip.decodeOpcode();

	equal(chip.pc, 0x55 + 0x0111, "Jumps to the address NNN plus V0");
});

test("FX07", function(){
	chip.opcode = 0xF107;
	chip.delayTimer = 30;
	chip.decodeOpcode();

	equal(chip.V[1], chip.delayTimer, "Sets VX to the value of the delay timer");
});

test("FX15", function(){
	chip.opcode = 0xF115;
	chip.V[1] = 0x33;
	chip.decodeOpcode();

	equal(chip.delayTimer, chip.V[1], "Sets the delay timer to VX");
});

test("FX18", function(){
	chip.opcode = 0xF118;
	chip.V[1] = 0x33;
	chip.decodeOpcode();

	equal(chip.soundTimer, chip.V[1], "Sets the sounds timer to VX");
});

test("FX1E", function(){
	chip.opcode = 0xF11E;
	chip.V[1] = 0x33;
	chip.I = 0x01;
	chip.decodeOpcode();

	equal(chip.I, 0x34, "Adds VX to I");
	equal(chip.V[15], 0, "No carry bit");

	chip.V[1] = 0xFF;
	chip.I = 0xFFF;
	chip.decodeOpcode();

	equal(chip.V[15], 1, "Carry bit");
});

//FX29

//FX33

