export class Chip8 {
	currentOpcode: number;
	drawFlag: boolean;
	graphics: Uint8Array<ArrayBuffer>;
	indexRegister: number;
	jumpTable: [Function];
	memory: Uint8Array<ArrayBuffer>;
	programCounter: number;
	stack: Uint16Array<ArrayBuffer>;
	stackPointer: number;
	vRegisters: Uint8Array<ArrayBuffer>;

	constructor() {
		this.currentOpcode = 0;
		this.drawFlag = true;
		this.graphics = new Uint8Array(2048);
		this.indexRegister = 0;
		this.memory = new Uint8Array(4096);
		this.programCounter = 0;
		this.stack = new Uint16Array(16);
		this.stackPointer = 0;
		this.vRegisters = new Uint8Array(16);

		// Used to quickly jump to different coroutines
		this.jumpTable = [this.op0NNN.bind(this)];
	}

	fetchNextOpcode() {
		this.currentOpcode = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
	}

	runCurrentOpcode() {
		this.jumpTable[(this.currentOpcode & 0xf000) >> 12]();
	}

	clearGraphics() {
		this.graphics.fill(0);
	}

	clearMemory() {
		this.memory.fill(0);
	}

	clearVRegisters() {
		this.vRegisters.fill(0);
	}

	clearStack() {
		this.stack.fill(0);
	}

	// Opcodes
	//////////////////////////////////////////////////////////////////////////////////
	// 00E0 Clears screen
	// 00EE Returns from a subroutine
	op0NNN() {
		if ((this.currentOpcode & 0x000f) === 0x0000) {
			this.clearGraphics();
			this.drawFlag = true;
		} else if ((this.currentOpcode & 0x000f) === 0x000e) {
			this.stackPointer -= 1;
			this.programCounter = this.stack[this.stackPointer];
		}

		this.programCounter += 2;
	}
}
