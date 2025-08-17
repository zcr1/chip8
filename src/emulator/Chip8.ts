import typeface from './typeface';

export const SCREEN_WIDTH = 64;
export const SCREEN_HEIGHT = 32;

export class Chip8 {
	currentOpcode: number;
	delayTimer: number;
	drawFlag: boolean;
	graphics: Uint8Array<ArrayBuffer>;
	indexRegister: number;
	keypad: boolean[];
	jumpTable8XYN: Array<() => void>;
	jumpTable: Array<() => void>;
	memory: Uint8Array<ArrayBuffer>;
	programCounter: number;
	running: boolean;
	soundTimer: number;
	stack: Uint16Array<ArrayBuffer>;
	stackPointer: number;
	vRegisters: Uint8Array<ArrayBuffer>;

	constructor() {
		this.currentOpcode = 0;
		this.delayTimer = 0;
		this.drawFlag = false;
		this.graphics = new Uint8Array(2048);
		this.indexRegister = 0;
		this.keypad = new Array(16).fill(false);
		this.memory = new Uint8Array(4096);
		this.programCounter = 0;
		this.soundTimer = 0;
		this.stack = new Uint16Array(16);
		this.stackPointer = 0;
		this.vRegisters = new Uint8Array(16);
		this.running = false;

		// Load font into memory
		this.memory.set(typeface, 0);

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
			this.op9XY0.bind(this),
			this.opANNN.bind(this),
			this.opBNNN.bind(this),
			this.opCXNN.bind(this),
			this.opDXYN.bind(this),
			this.opE000.bind(this),
			this.opF000.bind(this),
		];

		// 8XYN op codes have a sub jump table with empty values for 8 through D
		this.jumpTable8XYN = [
			this.op8XY0.bind(this),
			this.op8XY1.bind(this),
			this.op8XY2.bind(this),
			this.op8XY3.bind(this),
			this.op8XY4.bind(this),
			this.op8XY5.bind(this),
			this.op8XY6.bind(this),
			this.op8XY7.bind(this),
			() => {},
			() => {},
			() => {},
			() => {},
			() => {},
			() => {},
			this.op8XYE.bind(this),
		];
	}

	start() {
		if (this.running) {
			return;
		}

		this.running = true;
		this.update();
	}

	stop() {
		this.running = false;
	}

	// Core update loop
	update() {
		if (this.running) {
			this.fetchNextOpcode();
			this.runCurrentOpcode();

			// todo not great
			setTimeout(this.update.bind(this), 1);
		}
	}

	// 60hz
	timerTick() {}

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

	// Loads rom into memory starting at 0x200
	loadRom(rom: Uint8Array<ArrayBuffer>) {
		this.memory.set(rom, 0x200);
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
		const x = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		if (this.vRegisters[x] === opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 4XNN Skips the next instruction if VX does not equal NN
	op4XNN() {
		const x = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		if (this.vRegisters[x] !== opcodeValue) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 5XY0 Skips the next instruction if VX equals VY
	op5XY0() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		if (this.vRegisters[x] === this.vRegisters[y]) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// 6XNN Sets VX to NN
	op6XNN() {
		const x = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		this.vRegisters[x] = opcodeValue;
		this.programCounter += 2;
	}

	// 7XNN Adds NN to VX
	op7XNN() {
		const x = this.getOpcodeX();
		const opcodeValue = this.getOpcodeNN();

		this.vRegisters[x] += opcodeValue;
		this.programCounter += 2;
	}

	// Pass through that calls jumpTable8XYN
	op8XYN() {
		this.jumpTable8XYN[this.currentOpcode & 0x000f]();
	}

	// 8XY0 Sets VX = VY
	op8XY0() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		this.vRegisters[x] = this.vRegisters[y];
		this.programCounter += 2;
	}

	// 8XY1 Sets VX = VX | VY
	op8XY1() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		this.vRegisters[x] |= this.vRegisters[y];
		this.programCounter += 2;
	}

	// 8XY2 Sets VX = VX & VY
	op8XY2() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		this.vRegisters[x] &= this.vRegisters[y];
		this.programCounter += 2;
	}

	// 8XY3 Sets VX = VX xor VY
	op8XY3() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		this.vRegisters[x] ^= this.vRegisters[y];
		this.programCounter += 2;
	}

	// 8XY4 Sets VX = VX + VY. VF is set to carry
	op8XY4() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		const xValue = this.vRegisters[x];
		const yValue = this.vRegisters[y];

		if (xValue > 0xff - yValue) {
			this.vRegisters[0xf] = 1;
		} else {
			this.vRegisters[0xf] = 0;
		}

		// When X === VF use the carry bit
		if (x !== 0xf) {
			this.vRegisters[x] = xValue + yValue;
		}

		this.programCounter += 2;
	}

	// 8XY5 Sets VX = VX - VY. VF is set to 0 when there's a borrow, 1 otherwise
	op8XY5() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		const xValue = this.vRegisters[x];
		const yValue = this.vRegisters[y];

		if (yValue > xValue) {
			this.vRegisters[0xf] = 0;
		} else {
			this.vRegisters[0xf] = 1;
		}

		// When X === VF use the carry bit
		if (x !== 0xf) {
			this.vRegisters[x] = xValue - yValue;
		}

		this.programCounter += 2;
	}

	// 8XY6 Right shift VX, VF is set to least significant bit of VX before shift
	op8XY6() {
		const x = this.getOpcodeX();

		// todo quirk
		// this.vRegisters[x] = this.vRegisters[y];
		this.vRegisters[0xf] = this.vRegisters[x] & 0x1;

		if (x !== 0xf) {
			this.vRegisters[x] >>= 1;
		}

		this.programCounter += 2;
	}

	// 8XY7 Sets VX = VY - VX. VF is set to 0 when there's a borrow and 1 otherwise
	op8XY7() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		const xValue = this.vRegisters[x];
		const yValue = this.vRegisters[y];

		if (xValue > yValue) {
			this.vRegisters[0xf] = 0;
		} else {
			this.vRegisters[0xf] = 1;
		}

		// When X === VF use the carry bit
		if (x !== 0xf) {
			this.vRegisters[x] = yValue - xValue;
		}

		this.programCounter += 2;
	}

	// 8XYE Left shift VX, VF is set to most significant bit of VX before shift
	op8XYE() {
		const x = this.getOpcodeX();

		this.vRegisters[0xf] = this.vRegisters[x] >> 0x7;

		// When X === VF use the carry bit
		if (x !== 0xf) {
			this.vRegisters[x] <<= 1;
		}

		this.programCounter += 2;
	}

	// 9XY0 Skips the next instruction if VX doesn't equal VY
	op9XY0() {
		const x = this.getOpcodeX();
		const y = this.getOpcodeY();

		if (this.vRegisters[x] !== this.vRegisters[y]) {
			this.programCounter += 4;
		} else {
			this.programCounter += 2;
		}
	}

	// ANNN Sets index register to the address NNN
	opANNN() {
		this.indexRegister = this.currentOpcode & 0x0fff;
		this.programCounter += 2;
	}

	// BNNN Jumps to the address NNN plus V0
	opBNNN() {
		this.programCounter = (this.currentOpcode & 0x0fff) + this.vRegisters[0];
	}

	// CXNN Sets VX to a random number (0-255) & NN
	opCXNN() {
		const x = this.getOpcodeX();
		const opecodeValue = this.getOpcodeNN();
		const rand = Math.floor(Math.random() * 256);

		this.vRegisters[x] = rand & opecodeValue;
		this.programCounter += 2;
	}

	// Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
	// Each row of 8 pixels is read as bit-coded (with the most significant bit of each byte displayed
	// on the left) starting from memory location index register. If there is a collision then the pixel
	// is unset and VF is set to 1, otherwise VF is 0.
	opDXYN() {
		const x = this.vRegisters[this.getOpcodeX()];
		const y = this.vRegisters[this.getOpcodeY()];
		const height = this.currentOpcode & 0x000f;
		let pixel = 0;

		this.vRegisters[0xf] = 0;

		for (let row = 0; row < height; row++) {
			pixel = this.memory[this.indexRegister + row];

			for (let col = 0; col < 8; col++) {
				const currentBit = pixel & (128 >> col);
				if (currentBit !== 0) {
					const pos = x + col + (y + row) * SCREEN_WIDTH;

					// Collision
					if (this.graphics[pos] === 1) {
						this.vRegisters[0xf] = 1;
					}

					// Flip current pixel
					this.graphics[pos] ^= 1;
				}
			}
		}

		this.drawFlag = true;
		this.programCounter += 2;
	}

	// EX9E Skip next instruction if key in VX is pressed
	// EXA1 Skip next instruction if key in VX not pressed
	opE000() {
		const x = this.vRegisters[this.getOpcodeX()];
		const opecodeValue = this.getOpcodeNN();

		if (opecodeValue === 0x9e) {
			this.programCounter += this.keypad[x] ? 4 : 2;
		} else if (opecodeValue === 0xa1) {
			this.programCounter += this.keypad[x] ? 2 : 4;
		}
	}

	// F000
	opF000() {
		const x = this.getOpcodeX();
		const opecodeValue = this.getOpcodeNN();

		switch (opecodeValue) {
			// FX07 Sets VX to value of delay timer
			case 0x07:
				this.vRegisters[x] = this.delayTimer;
				break;

			// FX0A A key press is awaited then stored in VX
			case 0x0a:
				let keyPress = false;

				for (let i = 0; i < 16; i++) {
					if (this.keypad[i]) {
						keyPress = true;
						this.vRegisters[x] = i;
					}
				}

				// key is not pressed yet, don't add to program counter
				if (!keyPress) return;
				break;

			// FX15 Sets the delay timer to VX
			case 0x15:
				this.delayTimer = this.vRegisters[x];
				break;

			// FX18 Sets the sound timer to VX
			case 0x18:
				this.soundTimer = this.vRegisters[x];
				break;

			// FX1E Adds VX to I and stores carry bit in VF if greater than 0xfff
			case 0x1e:
				const value = this.vRegisters[x];
				if (this.indexRegister + value > 0xfff) {
					// carry bit
					this.vRegisters[0xf] = 1;
				} else {
					this.vRegisters[0xf] = 0;
				}

				this.indexRegister += value;
				break;

			// FX29 Sets I to the location of the sprite for the character in VX.
			// Characters 0-F are represented by a 4x5 font (5 bytes per character)
			case 0x29:
				this.indexRegister = this.vRegisters[x] * 0x5;
				break;

			// FX33 Stores the binary-coded decimal representation of VX
			case 0x33:
				this.memory[this.indexRegister] = this.vRegisters[x] / 100;
				this.memory[this.indexRegister + 1] = (this.vRegisters[x] / 10) % 10;
				this.memory[this.indexRegister + 2] = (this.vRegisters[x] % 100) % 10;
				break;

			// FX55 Stores V0 to VX in memory starting at address I
			case 0x55:
				for (let i = 0; i <= x; i++) {
					this.memory[this.indexRegister + i] = this.vRegisters[i];
				}

				// Below depends on the interpreter
				// this.indexRegister += x + 1;
				break;

			// FX65 Fills V0 to VX with values from memory starting at address I
			case 0x65:
				for (let i = 0; i <= x; i++) {
					this.vRegisters[i] = this.memory[this.indexRegister + i];
				}

				// Below depends on the interpreter
				// this.indexRegister += x + 1;
				break;
		}

		this.programCounter += 2;
	}
}
