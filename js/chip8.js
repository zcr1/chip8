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
	this.key = new Uint8ClampedArray(16); // current key state
	this.fontSet = null;
	this.delayTimer =  0;
	this.soundTimer = 0;

	this.initialize = function(){
		this.pc = 0x200;
		this.opcode = 0;
		this.I = 0;
		this.sp = 0;

		this.setFontSet();

		// Clear display
		// Clear stack
		// CLear registers V0-VF
		// Clear Memory

		// Load fontset

		// Reset timers
	}

	this.loadRom = function(rom){
		for (var i = 0; i < rom.src.length; i++){
			// Rom starts at memory location 0x200
			this.memory[i + 0x200] = rom.src[i];
		}
	}

	this.fetchOpcode = function(){
		// Retrieve opcode (2 bytes)
		this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
	}

	// TODO: Add function pointers instead of gargantuan switch statement
	this.decodeOpcode = function(){
		switch(this.opcode & 0xF000){

			case 0x0000:

				// TODO: 0NNN: Calls RCA 1802 program at address NNN.

				if ((this.opcode & 0x000F) == 0x0000){ // 00E0 Clears screen
					this.clearDisplay();
				}
				else if((this.opcode & 0x000F) == 0x000E){ //00EE Returns from a subroutine
					this.sp -= 1
					this.pc = this.stack[this.sp];
				}
				else{
					console.log("Unknown opcode");
				}

				this.pc += 2;
				break;

			case 0x1000: // 1NNN: Jumps to address NNN
				this.pc = this.opcode & 0X0FFF;
				break;

			case 0x2000: // 2NNN: Calls subroutine at NNN
				this.stack = this.pc;
				this.sp += 1;
				this.pc = this.opcode & 0x0FFF;
				break;

			case 0x3000: // 3XNN: Skips the next instruction if VX equals NN
				if ((this.V[(this.opcode & 0x0F00) >> 8]) == (this.opcode & 0x00FF)){
					this.pc += 4;
				}
				else{
					this.pc += 2;
				}
				break;

			case 0x4000: // 4XNN: Skips the next instruction if VX equals NN
				if ((this.V[(this.opcode & 0x0F00) >> 8]) != (this.opcode & 0x00FF)){
					this.pc += 4;
				}
				else{
					this.pc += 2;
				}
				break;

			case 0x5000:
				break;

			case 0x6000: // 6XNN: Sets VX to NN
				this.V[(this.opcode & 0x0F00) >> 8] = this.opcode & 0x00FF;
				this.sp += 2;
				break;

			case 0x7000: // 7XNN: Adds NN to VX
				this.V[(this.opcode & 0x0F00) >> 8] += this.opcode & 0x00FF;
				this.sp += 2;
				break;

			case 0x8000: // 8XY#
				var x = (this.opcode & 0x0F00) >> 8,
					y = (this.opcode & 0x00F0) >> 4,
					op = this.opcode & 0x000F;

				if (op == 0x0000){ // 8XY1: Sets VX = VY
					this.V[x] = this.V[y];
				}
				else if (op == 0x0001){ // 8XY2: Sets VX = VX or VY
					this.V[x] |= this.V[y];
				}
				else if (op == 0x0002){ // 8XY3: Sets VX = VX and VY
					this.V[x] &= this.V[y];
				}
				else if (op == 0x0003){ // 8XY3: Sets VX = VX xor VY
					this.V[x] ^= this.V[y];
				}
				else if (op == 0x0004){ // 8XY4: Adds VY to VX. VF is set to carry

					if (this.V[y] > (0xFF - this.V[x])){
						this.V[15] = 1;
					}
					else{
						this.V[15] = 0;
					}

					this.V[x] += this.V[y];
				}
				else if (op == 0x0005){ // 8XY5: Subtract VY from VX. VF is set to borrow
					
					if (this.V[y] > this.V[x]){
						this.V[15] = 1;
					}
					else{
						this.V[15] = 0;
					}

					this.V[x] -= this.V[y];
				}
				else if (op == 0x0006){ // 8XY6: Right shift VX, VF = least significant bit of VX before shift
					this.V[15] = this.V[x] & 0x1;
					this.V[x] >>= 1;
				}
				else if (op == 0x0007){ // 8XY7: Sets VX to VY - VX. VF is set to borrow
					
					if (this.V[x] > this.V[y]){
						this.V[15] = 1;
					}
					else{
						this.V[15] = 0;
					}

					this.V[x] = this.V[y] - this.V[x];
				}
				else if (op == 0x000E){ // 8XYE: Right shift VX, VF = most significant bit of VX before shift
					this.V[15] = this.V[x] >> 7;
					this.V[x] >>= 1;
				}
				else{
					console.log("Unknown opcode");
				}

				this.pc += 2;
				break;

			case 0x9000: // 9XY0 Skips the next instruction if VX doesn't equal VY
				var x = (this.opcode & 0x0F00) >> 8,
					y = (this.opcode & 0x00F0) >> 4;

				if (this.V[x] != this.V[y]){
					this.pc += 4;
				}
				else{
					this.pc += 2;
				}
				break;

			case 0xA000: // ANNN: Sets I to the address NNN
				this.I = this.opcode & 0x0FFF;
				this.pc += 2;
				break;

			case 0xB000: // BNNN: Jumps to the address NNN plus V0
				this.pc = (this.opcode & 0x0FFF) + this.V[0];
				break;

			case 0xC000: // CXNN: Sets VX to a random number and NN
				var ran = Math.floor(Math.random() * 256);

				this.V[(this.opcode & 0x0F00) >> 8] = ran & (this.opcode & 0x00FF);
				this.pc += 2;
				break;

			case 0xD000: // DXYN : a lot
				break;

			case 0xE000:
				var x = (this.opcode & 0x0F00) >> 8;

				if ((this.opcode & 0x00FF) == 0x009E){ // EX9E: Skip next instruction if key in VX is pressed
					if (this.keys[this.V[x]]){
						this.pc += 4;
					}
					else{
						this.pc += 2;
					}
				}
				else if ((this.opcode & 0x00FF) == 0x00A1){ // EXA1: Skip next instruction if key in VX not pressed
					if (!this.keys[this.V[x]]){
						this.pc += 4;
					}
					else{
						this.pc += 2;
					}					
				}
				else console.log("Unknown opcode");

				break;

			case 0xF000:
				var x = (this.opcode & 0x0F00) >> 8,
					op = (this.opcode & 0x00FF);

				if (op == 0x0007){ // FX07: Setvs VX to value of delay timer
					this.V[x] = this.delayTimer;
				}
				else if (op == 0x000A){ // FX07: A key press is awaited, and then stored in VX

				}
				else if (op == 0x0015){ // FX15: Sets the delay timer to VX
					this.delayTimer = this.V[x];
				}
				else if (op == 0x0018){ // FX18: Sets the sound timer to VX
					this.soundTimer = this.V[x];
				}
				else if (op == 0x001E){ // FX1E: Adds VX to I
					if ((this.I + this.V[x]) > 0xFFF){ 
						//carry bit
						this.V[15] = 1;
					}
					else{
						this.V[15] = 0;
					}

					this.I += this.V[x];
				}
				else if (op == 0x0029){ // FX29:
					// Sets I to the location of the sprite for the character in VX.
					// Characters 0-F are represented by a 4x5 font

				}
				else if (op == 0x0033){ // FX33:
					// Stores the binary-coded decimal representation of VX, with the most significant
					// of the three digits at the address in I, the middle digiat at I + 1, and the
					// least significant digits at I + 2.
				}
				else if (op == 0x0055){ // FX55: Stores V0 to VX in memory starting at address I
					for (var i = 0; i < x; i++){
						this.memory[this.I + i] = this.V[x];
					}
					// On the original interpreter, when the operation is done, I = I + X + 1
					this.I +=  x + 1;
				}
				else if (op == 0x0065){ // FX65: Fills V0 to VX with values from memory starting at address I
					for (var i = 0; i < x; i++){
						this.V[i] = this.memory[this.I + i];
					}

					// On the original interpreter, when the operation is done, I = I + X + 1
					this.I +=  x + 1;
				}
				else console.log("Unknown opcode");

				this.pc += 2;
				break;

			default:
				this.pc += 2;
				console.log("Unknown opcode");
		}
	}

	this.executeOpcode = function(){

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