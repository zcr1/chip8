export class Chip8 {
	currentOpcode: number;
	drawFlag: boolean;
	graphics: Uint8Array<ArrayBuffer>;
	indexRegister: number;
	jumpTable: Array<() => void>;
	jumpTable8XYN: Array<() => void>;
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
			this.op7XNN.bind(this),
			this.op8XYN.bind(this),
		];

		// 8XYN op codes has a sub jump table with empty values for 8 through D
		this.jumpTable8XYN = [
			this.op8XY0.bind(this),
			this.op8XY1.bind(this),
			this.op8XY2.bind(this),
			this.op8XY3.bind(this),
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

	/*
	 ** Opcodes
	 *****************************************************************/

	// Returns the X value in an opcode i.e. 0x4312 => 0x3
	getOpcodeX() {
		return (this.currentOpcode & 0x0f00) >> 8;
	}

	// Returns the Y value in an opcode i.e. 0x4312 => 0x1
	getOpcodeY() {
		return (this.currentOpcode & 0x00f0) >> 4;
	}

	// Returns the NN value in an opcode i.e. 0x4311 => 0x11
	getOpcodeNN() {
		return this.currentOpcode & 0x00ff;
	}

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
		const registerValue = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		if (this.vRegisters[registerValue] === opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 4XNN Skips the next instruction if VX does not equal NN
	op4XNN() {
		const registerValue = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		if (this.vRegisters[registerValue] !== opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 5XY0 Skips the next instruction if VX equals VY
	op5XY0() {
		const xRegister = this.getOpcodeX();
		const yRegister = this.getOpcodeY();

		if (this.vRegisters[xRegister] === this.vRegisters[yRegister]) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 6XNN Sets VX to NN
	op6XNN() {
		const registerValue = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		this.vRegisters[registerValue] = opcodeValue;
		this.programCounter += 2;
	}

	// 7XNN Adds NN to VX
	op7XNN() {
		const registerValue = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		this.vRegisters[registerValue] += opcodeValue;
		this.programCounter += 2;
	}

	// Pass through that calls jumpTable8XYN
	op8XYN() {
		console.log(this.currentOpcode);
		this.jumpTable8XYN[this.currentOpcode & 0x000f]();
	}

	// 8XY0 Sets VX = VY
	op8XY0() {
		const xRegister = this.getOpcodeX();
		const yRegister = this.getOpcodeY();

		this.vRegisters[xRegister] = this.vRegisters[yRegister];
		this.programCounter += 2;
	}

	// 8XY1 Sets VX = VX | VY
	op8XY1() {
		const xRegister = this.getOpcodeX();
		const yRegister = this.getOpcodeY();

		this.vRegisters[xRegister] |= this.vRegisters[yRegister];
		this.programCounter += 2;
	}

	// 8XY2 Sets VX = VX & VY
	op8XY2() {
		const xRegister = this.getOpcodeX();
		const yRegister = this.getOpcodeY();

		this.vRegisters[xRegister] &= this.vRegisters[yRegister];
		this.programCounter += 2;
	}

	// 8XY3 Sets VX = VX xor VY
	op8XY3() {
		const xRegister = this.getOpcodeX();
		const yRegister = this.getOpcodeY();

		this.vRegisters[xRegister] ^= this.vRegisters[yRegister];
		this.programCounter += 2;
	}
}
