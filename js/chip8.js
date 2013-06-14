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

			case 0xA000: // ANNN: Sets I to the address NNN
				this.I = this.opcode & 0x0FFF;
				this.pc += 2;
				break;
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