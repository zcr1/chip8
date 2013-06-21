// http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays?redirectlocale=en-US&redirectslug=JavaScript%2FTyped_arrays
// https://github.com/bfirsh/dynamicaudio.js

function Chip8(){
	this.opcode = 0;
	this.memory = new Uint8Array(4096); // 4K
	this.V = new Uint8Array(16); // 16 registers V0, V1, ..., VD, VE
	this.I = 0; // index register
	this.pc = 0; // program counter
	this.gfx = new Uint8Array(2048); // graphics array 64 x 32 screen
	this.stack = new Uint16Array(16);
	this.keys = new Array(16); // pressed keys
	this.sp = 0; // stackpointer
	this.delayTimer =  0;
	this.soundTimer = 0;
	this.drawFlag = true;
	this.jumpTable = null; // Opcode function pointers
	this.blockColor = "#FFFFFF";
	this.backColor = "#6DA7D1";

	this.initialize = function(){
		this.pc = 0x200;
		this.opcode = 0;
		this.I = 0;
		this.sp = 0;

		this.setFunctionPointers();
		this.setFontSet();
		this.keyInit();
	}

	this.setFunctionPointers = function(){
		this.jumpTable = [this.op0NNN.bind(this), this.op1NNN.bind(this), this.op2NNN.bind(this), this.op3XNN.bind(this),
						this.op4XNN.bind(this), this.op5XY0.bind(this), this.op6XNN.bind(this), this.op7XNN.bind(this),
						this.op8000.bind(this), this.op9XY0.bind(this), this.opANNN.bind(this), this.opBNNN.bind(this),
						this.opCXNN.bind(this), this.opDXYN.bind(this), this.opE000.bind(this), this.opF000.bind(this)]
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
		//console.log(decToHex(this.opcode));
		this.jumpTable[(this.opcode & 0xF000) >> 12]();
	}

	this.op0NNN = function(){
		// 00E0 Clears screen
		if ((this.opcode & 0x000F) == 0x0000){
			this.clearDisplay();
			this.drawFlag = true;
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
		this.stack[this.sp] = this.pc;
		this.sp += 1;
		this.pc = this.opcode & 0x0FFF;
	}

	// Skips the next instruction if VX == NN
	this.op3XNN = function(){
		if ((this.V[(this.opcode & 0x0F00) >> 8]) == (this.opcode & 0x00FF)){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}

	// Skips the next instruction if VX !+ NN
	this.op4XNN = function(){
		if ((this.V[(this.opcode & 0x0F00) >> 8]) != (this.opcode & 0x00FF)){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}

	// Skips the next instruction if VX equals VY
	this.op5XY0 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if(this.V[x] == this.V[y]){
			this.pc += 4;
		}
		else{
			this.pc += 2;
		}
	}

	// Sets VX to NN
	this.op6XNN = function(){
		this.V[(this.opcode & 0x0F00) >> 8] = this.opcode & 0x00FF;
		this.pc += 2;
	}

	// Adds NN to VX
	this.op7XNN = function(){
		this.V[(this.opcode & 0x0F00) >> 8] += this.opcode & 0x00FF;
		this.pc += 2;
	}

	// Jump table for 8XYN op codes (There is no 8 through D)
	this.op8000 = function(){
		var jump = [this.op8XY0.bind(this), this.op8XY1.bind(this), this.op8XY2.bind(this),
					this.op8XY3.bind(this), this.op8XY4.bind(this), this.op8XY5.bind(this),
					this.op8XY6.bind(this), this.op8XY7.bind(this),,,,,,, this.op8XYE.bind(this)];

		jump[(this.opcode & 0x000F)]();
	}

	// Sets VX = VY
	this.op8XY0 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] = this.V[y];
		this.pc += 2;
	}

	// Sets VX = VX OR VY
	this.op8XY1 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] |= this.V[y];
		this.pc += 2;
	}

	// Sets VX = VX AND VY
	this.op8XY2 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] &= this.V[y];
		this.pc += 2;
	}

	// Sets VX = VX XOR VY
	this.op8XY3 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		this.V[x] ^= this.V[y];
		this.pc += 2;
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
		this.pc += 2;
	}

	// Subtract VY from VX. VF is set to 0 when there's a borrow, 1 otherwise
	this.op8XY5 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[y] > this.V[x]){
			this.V[15] = 0;
		}
		else{
			this.V[15] = 1;
		}

		this.V[x] -= this.V[y];
		this.pc += 2;
	}

	// Right shift VX, VF = least significant bit of VX before shift
	this.op8XY6 = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		this.V[15] = this.V[x] & 0x1;
		this.V[x] >>= 1;
		this.pc += 2;
	}

	// Sets VX to VY - VX. VF is set to - when there's a borrow and 1 otherwise
	this.op8XY7 = function(){
		var x = (this.opcode & 0x0F00) >> 8,
			y = (this.opcode & 0x00F0) >> 4;

		if (this.V[x] > this.V[y]){
			this.V[15] = 0;
		}
		else{
			this.V[15] = 1;
		}

		this.V[x] = this.V[y] - this.V[x];
		this.pc += 2;
	}

	// Left shift VX, VF = most significant bit of VX before shift
	this.op8XYE = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		this.V[15] = this.V[x] >> 7;
		this.V[x] <<= 1;
		this.pc += 2;
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
		/* Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
		Each row of 8 pixels is read as bit-coded (with the most significant bit of each byte displayed on the left)
		starting from memory location I; I value doesn't change after the execution of this instruction. As described
		above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn't happen. */
		var x = this.V[(this.opcode & 0x0F00) >> 8],
			y = this.V[(this.opcode & 0x00F0) >> 4],
			height = (this.opcode & 0x000F),
			pixel = 0;

		this.V[15] = 0;

		for (var row = 0; row < height; row++){
			pixel = this.memory[this.I + row];

			for (var col = 0; col < 8; col++){

				if ((pixel & (0x80 >> col)) != 0){

					var pos = x + col + ((y + row) * 64);

					if(this.gfx[pos] == 1){
						this.V[15] = 1;
					}

					this.gfx[pos] ^= 1;
				}
			}
		}

		this.drawFlag = true;
		this.pc += 2;
	}

	this.opE000 = function(){
		var x = (this.opcode & 0x0F00) >> 8;

		// EX9E: Skip next instruction if key in VX is pressed
		if ((this.opcode & 0x00FF) == 0x009E){
			if (this.keys[this.V[x]] == true){
				this.pc += 4;
			}
			else{
				this.pc += 2;
			}
		}
		// EXA1: Skip next instruction if key in VX not pressed
		else if ((this.opcode & 0x00FF) == 0x00A1){
			if (this.keys[this.V[x]] == false){
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
			case (0x0007):
				// FX07: Sets VX to value of delay timer
				this.V[x] = this.delayTimer;
				break;

			case (0x000A):
				// FX0A: A key press is awaited, and then stored in VX
				var keyPress = false;

				for (var i = 0; i < 16; i++){
					if (this.keys[i] == true){
						keyPress = true;
						this.V[x] = i;
					}
				}

				// key is not pressed yet, don't add to program counter
				if (keyPress == false) return;
				break;

			case (0x0015):
				// FX15: Sets the delay timer to VX
				this.delayTimer = this.V[x];
				break;

			case (0x0018):
				// FX18: Sets the sound timer to VX
				this.soundTimer = this.V[x];
				break;

			case (0x001E):
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

			case (0x0029): // FX29:
				// Sets I to the location of the sprite for the character in VX.
				// Characters 0-F are represented by a 4x5 font (5 bytes per character)
				this.I = this.V[x] * 0x5;
				break;

			case (0x0033):
				// FX33: Stores the binary-coded decimal representation of VX
				this.memory[this.I] = this.V[x] / 100;
				this.memory[this.I + 1] = (this.V[x] / 10) % 10;
				this.memory[this.I + 2] = (this.V[x] % 100) % 10;
				break;

			case (0x0055):// FX55: Stores V0 to VX in memory starting at address I
				for (var i = 0; i <= x; i++){
					this.memory[this.I + i] = this.V[i];
				}

				this.I += x + 1;
				break;

			case (0x0065): // FX65: Fills V0 to VX with values from memory starting at address I
				for (var i = 0; i <= x; i++){
					this.V[i] = this.memory[this.I + i];
				}

				this.I += x + 1;
				break;

			default:
				console.log("Unknown opcode");
		}

		this.pc += 2;
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

	this.setKey = function(key, bool){
		this.keys[key] = bool;
	}

	this.keyInit = function(){
		for (var i = 0; i < this.keys.length; i++){
			this.keys[i] = false;
		}
	}

	this.setFontSet = function(){
		var fontSet = new Uint8Array(
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
					0xF0, 0x80, 0xF0, 0x80, 0x80]); // F;

		for(var i = 0; i < fontSet.length; i++){
			this.memory[i] = fontSet[i];
		}
	}

	this.updateTimers = function(){
		if (this.delayTimer > 0) this.delayTimer -= 1;
		if (this.soundTimer > 0) this.soundTimer -= 1;
		if (this.soundTimer == 1) console.log("beep");

	}

	this.setBlockColor = function(color){
		this.blockColor = color;
		this.drawFlag = true;
	}

	this.setBackColor = function(color){
		this.backColor = color;
		this.drawFlag = true;
	}
}