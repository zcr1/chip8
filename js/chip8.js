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
	this.delayTimer =  0;
	this.soundTimer = 0;
	this.stack = new Uint8Array(16);
	this.sp = 0; // stackpointer
	this.key = new Uint8Array(16); // current key state

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
		

		this.memory


	}

	this.fetchOpCode = function(){

	}

	this.decodeOpCode = function(){

	}

	this.executeOpCode = function(){

	}


}