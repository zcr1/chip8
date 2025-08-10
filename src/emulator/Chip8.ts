export class Chip8 {
	currentOpcode: number;
	drawFlag: boolean;
	graphics: Uint8Array<ArrayBuffer>;
	indexRegister: number;
	jumpTable: Array<() => void>;
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
		this.jumpTable = [
			this.op0NNN.bind(this),
			this.op1NNN.bind(this),
			this.op2NNN.bind(this),
			this.op3XNN.bind(this),
			this.op4XNN.bind(this),
			this.op5XY0.bind(this),
			this.op6XNN.bind(this),
		];
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

	// Returns the register value in an opcode i.e. 0x4311 => 0x3
	getOpcodeRegister() {
		return (this.currentOpcode & 0x0f00) >> 8;
	}

	// Returns the NN value in an opcode i.e. 0x4311 => 0x11
	getOpcodeValue() {
		return this.currentOpcode & 0x00ff;
	}

	/*
	 ** Opcodes
	 *****************************************************************/

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

	// 1NNN Jumps to address NNN
	op1NNN() {
		this.programCounter = this.currentOpcode & 0x0fff;
	}

	// 2NNN Calls subroutine at NNN
	op2NNN() {
		this.stack[this.stackPointer] = this.programCounter;
		this.stackPointer += 1;
		this.programCounter = this.currentOpcode & 0x0fff;
	}

	// 3XNN Skips the next instruction if VX equals NN
	op3XNN() {
		const registerValue = this.getOpcodeRegister();
		const opcodeValue = this.getOpcodeValue();

		if (this.vRegisters[registerValue] === opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 4XNN Skips the next instruction if VX does not equal NN
	op4XNN() {
		const registerValue = this.getOpcodeRegister();
		const opcodeValue = this.getOpcodeValue();

		if (this.vRegisters[registerValue] !== opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 5XY0 Skips the next instruction if VX equals VY
	op5XY0() {
		const xRegister = (this.currentOpcode & 0x0f00) >> 8;
		const yRegister = (this.currentOpcode & 0x00f0) >> 4;

		if (this.vRegisters[xRegister] === this.vRegisters[yRegister]) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 6XNN Sets VX to NN
	op6XNN() {
		const registerValue = this.getOpcodeRegister();
		const opcodeValue = this.getOpcodeValue();

		this.vRegisters[registerValue] = opcodeValue;
		this.programCounter += 2;
	}

	// 7XNN Adds NN to VX
	op7XNN() {
		const registerValue = this.getOpcodeRegister();
		const opcodeValue = this.getOpcodeValue();

		this.vRegisters[registerValue] += opcodeValue;
		this.programCounter += 2;
	}
}
