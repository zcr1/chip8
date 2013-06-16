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
	this.delayTimer =  0;
	this.soundTimer = 0;

	this.initialize = function(){
		this.pc = 0x200;
		this.opcode = 0;
		this.I = 0;
		this.sp = 0;

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
				
				break;

			case 0x4000:
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

					if (this.V[y] > (0xFF - V[x])){
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
				else if (op == 0x000E){

				}
				else{
					console.log("Unknown opcode");
				}

				this.pc += 2;

			case 0x9000: // 9XY0 Skips the next instruction if VX doesn't equal VY
				var x = this.opcode & 0x0F00,
					y = this.opcode & 0x00F0;

				if (this.V[x] != this.V[y]){

				}

			case 0xA000: // ANNN: Sets I to the address NNN
				this.I = this.opcode & 0x0FFF;
				this.pc += 2;
				break;

			case 0xB000: // BNNN: Jumps to the address NNN plus V0
				this.pc = this.opcode & 0x0FFF + this.V[0];
				break;

			case 0xC000: // CNNN: Sets VX to a random number and NN
				break;

			case 0xD000: // DXYN : a lot
				break;
			case 0xE000:
				break;
			case 0xF000:
				break;
			default:
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
}