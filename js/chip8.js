// http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays?redirectlocale=en-US&redirectslug=JavaScript%2FTyped_arrays
// https://github.com/bfirsh/dynamicaudio.js

function Chip8(){
	this.opcode = 0;
	this.memory = new Uint8ClampedArray(4096); // 4K
	this.V = new Uint8ClampedArray(16); // 16 registers V0, V1, ..., VD, VE
	this.I = 0; // index register
	this.pc = 0; // program counter
	this.gfx = new Uint8ClampedArray(2048); // graphics array 64 x 32 screen
	this.stack = new Uint8ClampedArray(16);
	this.sp = 0; // stackpointer
	this.delayTimer =  0;
	this.soundTimer = 0;

	this.jumpTable = null; // Opcode function pointers

	this.initialize = function(){
		this.pc = 0x200;
		this.opcode = 0;
		this.I = 0;
		this.sp = 0;

		this.setFunctionPointers();
		this.setFontSet();
		this.setKeys();

		// Clear display
		// Clear stack
		// CLear registers V0-VF
		// Clear Memory

		// Load fontset

		// Reset timers
	}

	this.setFunctionPointers = function(){
		this.jumpTable = [this.op0NNN.bind(this), this.op1NNN.bind(this), this.op2NNN.bind(this), this.op3XNN.bind(this),
						this.op4XNN.bind(this), this.op5NNN.bind(this), this.op6XNN.bind(this), this.op7XNN.bind(this),
						this.op8000.bind(this), this.op9XY0.bind(this), this.opANNN.bind(this), this.opBNNN.bind(this),
						this.opCXNN.bind(this), this.opDXYN.bind(this), this.opE000.bind(this), this.opF000.bind(this)]
	}

	this.setKeys = function(){
		this.keys = new Uint8ClampedArray([ 0,0,0,0,
											0,0,0,0,
											0,0,0,0,
											0,0,0,0]);
	}

	this.loadRom = function(rom){
		for (var i = 0; i < rom.src.length; i++){
			// Rom starts at memory location 0x200
			this.memory[i + 0x200] = rom.src[i];
		}
	}

	// Retrieve opcode (2 bytes)
	this.fetchOpcode = function(){
		this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
	}

	this.decodeOpcode = function(){
		this.jumpTable[(this.opcode & 0xF000) >> 12]();
	}

	this.cpuArithmetic = function(){

	}

	this.op0NNN = function(){
		// TODO: 0NNN: Calls RCA 1802 program at address NNN.

		// 00E0 Clears screen
		if ((this.opcode & 0x000F) == 0x0000){
			this.clearDisplay();
		}
		//00EE Returns from a subroutine
		else if((this.opcode & 0x000F) == 0x000E){
			this.sp -= 1
			this.pc = this.stack[this.sp];
		}
		this.pc += 2;
	}

	// Jumps to address NNN
	this.op1NNN = function(){
		this.pc = this.opcode & 0X0FFF;
	}

	// Calls subroutine at NNN
	this.op2NNN = function(){
		this.stack = this.pc;
		this.sp += 1;
		this.pc = this.opcode & 0x0FFF;
	}

	// Skips the next instruction if VX equals NN
	this.op3XNN = function(){
		if ((this.V[(this.opcode & 0x0F00) >> 8]) == (this.opcode & 0x00FF)){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}
	// Skips the next instruction if VX equals NN
	this.op4XNN = function(){
		if ((this.V[(this.opcode & 0x0F00) >> 8]) != (this.opcode & 0x00FF)){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}

	this.op5NNN = function(){

	}

	// Sets VX to NN
	this.op6XNN = function(){
		this.V[(this.opcode & 0x0F00) >> 8] = this.opcode & 0x00FF;
		this.sp += 2;
	}

	// Adds NN to VX
	this.op7XNN = function(){
		this.V[(this.opcode & 0x0F00) >> 8] += this.opcode & 0x00FF;
		this.sp += 2;
	}

	// Jump table for 8XYN op codes
	this.op8000 = function(){
		var jump = [this.op8XY0.bind(this), this.op8XY1.bind(this), this.op8XY2.bind(this),
					this.op8XY3.bind(this), this.op8XY4.bind(this), this.op8XY5.bind(this),
					this.op8XY6.bind(this), this.op8XY7.bind(this), ,,,,,,this.op8XYE.bind(this)];

		jump[(this.opcode & 0x000F)]();
	}

	// Sets VX = VY
	this.op8XY0 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] = this.V[y];
		this.sp += 2;
	}

	// Sets VX = VX OR VY
	this.op8XY1 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] |= this.V[y];
		this.sp += 2;
	}

	// Sets VX = VX AND VY
	this.op8XY2 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] &= this.V[y];
		this.sp += 2;
	}

	// Sets VX = VX XOR VY
	this.op8XY3 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] ^= this.V[y];
		this.sp += 2;
	}

	// Adds VY to VX. VF is set to carry
	this.op8XY4 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[y] > (0xFF - this.V[x])){
			this.V[15] = 1;
		}
		else{
			this.V[15] = 0;
		}
		this.V[x] += this.V[y];
		this.sp += 2;
	}

	// Subtract VY from VX. VF is set to borrow
	this.op8XY5 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[y] > this.V[x]){
			this.V[15] = 1;
		}
		else{
			this.V[15] = 0;
		}

		this.V[x] -= this.V[y];
		this.sp += 2;
	}

	// Right shift VX, VF = least significant bit of VX before shift
	this.op8XY6 = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		this.V[15] = this.V[x] & 0x1;
		this.V[x] >>= 1;
		this.sp += 2;
	}

	// Sets VX to VY - VX. VF is set to borrow
	this.op8XY7 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[x] > this.V[y]){
			this.V[15] = 1;
		}
		else{
			this.V[15] = 0;
		}

		this.V[x] = this.V[y] - this.V[x];
		this.sp += 2;
	}

	// Right shift VX, VF = most significant bit of VX before shift
	this.op8XYE = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		this.V[15] = this.V[x] >> 7;
		this.V[x] >>= 1;
		this.sp += 2;
	}

	// Skips the next instruction if VX doesn't equal VY
	this.op9XY0 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[x] != this.V[y]){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}

	// Sets I to the address NNN
	this.opANNN = function(){
		this.I = this.opcode & 0x0FFF;
		this.pc += 2;
	}
	// Jumps to the address NNN plus V0
	this.opBNNN = function(){
		this.pc = (this.opcode & 0x0FFF) + this.V[0];
	}

	// Sets VX to a random number and NN
	this.opCXNN = function(){
		var ran = Math.floor(Math.random() * 256);

		this.V[(this.opcode & 0x0F00) >> 8] = ran & (this.opcode & 0x00FF);
		this.pc += 2;
	}

	this.opDXYN = function(){
		//
	}

	this.opE000 = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		// EX9E: Skip next instruction if key in VX is pressed
		if ((this.opcode & 0x00FF) == 0x009E){
			if (this.keys[this.V[x]]){
				this.pc += 4;
			}
			else{
				this.pc += 2;
			}
		}

		// EXA1: Skip next instruction if key in VX not pressed
		else if ((this.opcode & 0x00FF) == 0x00A1){

			if (!this.keys[this.V[x]]){
				this.pc += 4;
			}
			else{
				this.pc += 2;
			}
		}
	}

	// Jump table wont' work for F000 opcodes because their naming scheme isn't in ascending order :(
	this.opF000 = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		switch(this.opcode & 0x00FF){
			case(0x0007):
				// FX07: Setvs VX to value of delay timer
				this.V[x] = this.delayTimer;
				break;

			case(0x000A):
				// FX07: A key press is awaited, and then stored in VX
				break;

			case(0x0015):
				// FX15: Sets the delay timer to VX
				this.delayTimer = this.V[x];
				break;

			case(0x0018):
				// FX18: Sets the sound timer to VX
				this.soundTimer = this.V[x];
				break;

			case(0x001E):
				// FX1E: Adds VX to I
				if ((this.I + this.V[x]) > 0xFFF){
					//carry bit
					this.V[15] = 1;
				}
				else{
					this.V[15] = 0;
				}

				this.I += this.V[x];
				break;

			case(0x0029): // FX29:
				// Sets I to the location of the sprite for the character in VX.
				// Characters 0-F are represented by a 4x5 font
				break;

			case(0x0033): // FX33:
				// Stores the binary-coded decimal representation of VX, with the most significant
				// of the three digits at the address in I, the middle digiat at I + 1, and the
				// least significant digits at I + 2.
				break;

			case(0x0055):// FX55: Stores V0 to VX in memory starting at address I
				for (var i = 0; i <= x; i++){
					this.memory[this.I + i] = this.V[i];
				}

				this.I +=  x + 1;
				break;

			case(0x0065): // FX65: Fills V0 to VX with values from memory starting at address I
				for (var i = 0; i <= x; i++){
					this.V[i] = this.memory[this.I + i];
				}

				this.I +=  x + 1;
				break;

			default:
				console.log("Unknown opcode");

			this.pc += 2;
		}
	}

	this.loadFontSet = function(){

	}

	this.clearDisplay = function(){
		for (var i = 0; i < this.gfx.length; i++){
			this.gfx[i] = 0;
		}
	}

	this.clearStack = function(){
		for (var i = 0; i < this.stack.length; i++){
			this.stack[i] = 0;
		}
	}

	this.clearMemory = function(){
		for (var i = 0; i < this.memory.length; i++){
			this.memory[i] = 0;
		}
	}

	this.clearRegisters = function(){
		for (var i = 0; i < this.V.length; i++){
			this.V[i] = 0;
		}
	}

	this.resetDelayTimer = function(){
		this.delayTimer = 0;
	}

	this.resetSoundTimer = function(){
		this.resetTimer = 0;
	}

	this.setFontSet = function(){
		this.fontSet = new Uint8Array(
					[0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
					0x20, 0x60, 0x20, 0x20, 0x70, // 1
					0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
					0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
					0x90, 0x90, 0xF0, 0x10, 0x10, // 4
					0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
					0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
					0xF0, 0x10, 0x20, 0x40, 0x40, // 7
					0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
					0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
					0xF0, 0x90, 0xF0, 0x90, 0x90, // A
					0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
					0xF0, 0x80, 0x80, 0x80, 0xF0, // C
					0xE0, 0x90, 0x90, 0x90, 0xE0, // D
					0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
					0xF0, 0x80, 0xF0, 0x80, 0x80 ]); // F;
	}
}