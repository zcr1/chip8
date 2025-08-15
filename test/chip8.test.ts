import { Chip8, SCREEN_WIDTH } from '../src/emulator/Chip8';

function isZeroed(array: Uint8Array<ArrayBuffer>) {
	return array.every(x => x === 0);
}

describe('Chip8 Opcode Tests', () => {
	let chip: Chip8;

	beforeEach(() => {
		chip = new Chip8();
	});

	test('0EE0 clears screen', () => {
		chip.graphics.fill(1);
		chip.currentOpcode = 0x00e0;
		chip.runCurrentOpcode();

		expect(isZeroed(chip.graphics)).toBeTruthy();
		expect(chip.programCounter).toBe(2);
	});

	test('0EEE returns from a subroutine', () => {
		chip.currentOpcode = 0x00ee;
		chip.stack[chip.stackPointer++] = 0xf0;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(0xf2);
		expect(chip.stackPointer).toBe(0);
	});

	test('01NNN jumps to address NNN', () => {
		chip.currentOpcode = 0x1234;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(0x0234);
	});

	test('2NNN calls subroutine at NNN', () => {
		chip.programCounter = 4;
		chip.currentOpcode = 0x2345;
		chip.runCurrentOpcode();

		expect(chip.stack[0]).toBe(4);
		expect(chip.stackPointer).toBe(1);
		expect(chip.programCounter).toBe(0x0345);
	});

	test('3XNN Skips the next instruction if VX === NN', () => {
		chip.currentOpcode = 0x3345;
		chip.vRegisters[3] = 0x45;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('3XNN Does not skip the next instruction if VX !== NN', () => {
		chip.currentOpcode = 0x3345;
		chip.vRegisters[3] = 0x46;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});

	test('4XNN Skips the next instruction if VX !== NN', () => {
		chip.currentOpcode = 0x4245;
		chip.vRegisters[2] = 0x22;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('4XNN Does not skip the next instruction if VX === NN', () => {
		chip.currentOpcode = 0x4245;
		chip.vRegisters[2] = 0x45;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});

	test('5XY0 Skips the next instruction if VX === VY', () => {
		chip.currentOpcode = 0x5340;
		chip.vRegisters[3] = 1;
		chip.vRegisters[4] = 1;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('5XY0 Does not skip the next instruction if VX !== VY', () => {
		chip.currentOpcode = 0x5340;
		chip.vRegisters[3] = 1;
		chip.vRegisters[4] = 2;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});

	test('6XNN Sets VX to NN', () => {
		chip.currentOpcode = 0x6345;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[3]).toBe(0x0045);
		expect(chip.programCounter).toBe(2);
	});

	test('7XNN Adds NN to VX', () => {
		chip.currentOpcode = 0x7945;
		chip.vRegisters[9] = 0x33;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[9]).toBe(0x33 + 0x45);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY0 Sets VX = VY', () => {
		chip.currentOpcode = 0x8120;
		chip.vRegisters[2] = 0x33;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[2]).toBe(chip.vRegisters[1]);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY1 Sets VX = VX | VY', () => {
		chip.currentOpcode = 0x8121;
		chip.vRegisters[1] = 0x33;
		chip.vRegisters[2] = 0x11;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0x33 | 0x11);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY2 Sets VX = VX & VY', () => {
		chip.currentOpcode = 0x8122;
		chip.vRegisters[1] = 0x33;
		chip.vRegisters[2] = 0x11;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0x33 & 0x11);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY3 Sets VX = VX xor VY', () => {
		chip.currentOpcode = 0x8123;
		chip.vRegisters[1] = 0x33;
		chip.vRegisters[2] = 0x11;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0x33 ^ 0x11);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY4 Adds VY to VX no carry bit', () => {
		chip.currentOpcode = 0x8014;
		chip.vRegisters[0] = 0x33;
		chip.vRegisters[1] = 0x11;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[0]).toBe(0x44);
		expect(chip.vRegisters[15]).toBe(0);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY4 Adds VY to VX with carry bit', () => {
		chip.currentOpcode = 0x8014;
		chip.vRegisters[0] = 0xff;
		chip.vRegisters[1] = 0x01;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[0]).toBe(0);
		expect(chip.vRegisters[15]).toBe(1);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY5 Subtracts VY from VX no borrow', () => {
		chip.currentOpcode = 0x8015;
		chip.vRegisters[0] = 0x55;
		chip.vRegisters[1] = 0x44;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[0]).toBe(0x55 - 0x44);
		expect(chip.vRegisters[15]).toBe(1);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY5 Subtracts VY from VX with borrow', () => {
		chip.currentOpcode = 0x8015;
		chip.vRegisters[0] = 0x10;
		chip.vRegisters[1] = 0x20;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[0]).toBe(0xf0);
		expect(chip.vRegisters[15]).toBe(0);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY6 Right shift VX', () => {
		chip.currentOpcode = 0x8126;
		chip.vRegisters[1] = 0x0f;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0x0f >> 1);
		expect(chip.vRegisters[15]).toBe(1);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY7 Sets VX = VY - VX. VF is set to 1 no borrow', () => {
		chip.currentOpcode = 0x8127;
		chip.vRegisters[1] = 15;
		chip.vRegisters[2] = 20;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(5);
		expect(chip.vRegisters[15]).toBe(1);
		expect(chip.programCounter).toBe(2);
	});

	test('8XY7 Sets VX = VY - VX. VF is set to 0 borrow', () => {
		chip.currentOpcode = 0x8127;
		chip.vRegisters[1] = 20;
		chip.vRegisters[2] = 15;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0xfb);
		expect(chip.vRegisters[15]).toBe(0);
		expect(chip.programCounter).toBe(2);
	});

	test('8XYE Left shift VX, VF is set to most significant bit of VX', () => {
		chip.currentOpcode = 0x812e;
		chip.vRegisters[1] = 0x10;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[1]).toBe(0x10 << 1);
		expect(chip.vRegisters[15]).toBe(0);
		expect(chip.programCounter).toBe(2);
	});

	test('9XY0 Skips the next instruction if VX does not equal VY', () => {
		chip.currentOpcode = 0x9120;
		chip.vRegisters[1] = 0x10;
		chip.vRegisters[1] = 0x12;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('9XY0 Does not skip the next instruction if VX equals VY', () => {
		chip.currentOpcode = 0x9120;
		chip.vRegisters[1] = 0x12;
		chip.vRegisters[2] = 0x12;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});

	test('ANNN Sets index register to the address NNN', () => {
		chip.currentOpcode = 0xa111;
		chip.runCurrentOpcode();

		expect(chip.indexRegister).toBe(0x111);
	});

	test('BNNN Jumps to the address NNN plus V0', () => {
		chip.currentOpcode = 0xb111;
		chip.vRegisters[0] = 0x55;
		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(0x111 + 0x55);
	});

	test('CXNN Sets VX to a random number (0-255) & NN', () => {
		const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0x55);

		chip.currentOpcode = 0xc922;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[9]).toBe(0x55 & 0x22);
		expect(chip.programCounter).toBe(2);

		mockRandom.mockRestore();
	});

	test('DXYN Draws a sprite no collision', () => {
		// load sprite into memory
		const spriteData = new Uint8Array([0b11110000, 0b10010000]);
		chip.indexRegister = 0x300;
		chip.memory.set(spriteData, chip.indexRegister);

		// 8x2 pixel at [10, 12]
		chip.currentOpcode = 0xd012;
		chip.vRegisters[0] = 10;
		chip.vRegisters[1] = 12;

		chip.runCurrentOpcode();

		expect(chip.vRegisters[15]).toBe(0);
		expect(chip.programCounter).toBe(2);

		// Top row of the sprite at (10, 12)
		expect(chip.graphics[SCREEN_WIDTH * 12 + 10]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 11]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 12]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 13]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 14]).toBe(0);

		// Bottom row of the sprite at (10, 13)
		expect(chip.graphics[SCREEN_WIDTH * 13 + 10]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 11]).toBe(0);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 12]).toBe(0);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 13]).toBe(1);
	});

	test('DXYN Draws a sprite with collision', () => {
		// load sprite sprite data
		const spriteData = new Uint8Array([0b11110000, 0b10010000]);
		chip.indexRegister = 0x300;
		chip.memory.set(spriteData, chip.indexRegister);

		// 8x2 pixel at [10, 12]
		chip.currentOpcode = 0xd012;
		chip.vRegisters[0] = 10;
		chip.vRegisters[1] = 12;

		chip.graphics[12 * SCREEN_WIDTH + 10] = 1; // Collision at (10, 12)

		chip.runCurrentOpcode();

		expect(chip.vRegisters[15]).toBe(1);
		expect(chip.programCounter).toBe(2);

		// Top row of the sprite at (10, 12)
		expect(chip.graphics[SCREEN_WIDTH * 12 + 10]).toBe(0);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 11]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 12]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 13]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 12 + 14]).toBe(0);

		// Bottom row of the sprite at (10, 13)
		expect(chip.graphics[SCREEN_WIDTH * 13 + 10]).toBe(1);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 11]).toBe(0);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 12]).toBe(0);
		expect(chip.graphics[SCREEN_WIDTH * 13 + 13]).toBe(1);
	});

	test('EX9E Skip next instruction if key in VX is pressed', () => {
		chip.currentOpcode = 0xe19e;
		chip.vRegisters[1] = 0xe;
		chip.inputs[0xe] = true;

		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('EX9E Does not next instruction if key in VX is not pressed', () => {
		chip.currentOpcode = 0xe19e;
		chip.vRegisters[1] = 0xe;

		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});

	test('EXA1 Skip next instruction if key in VX is not pressed', () => {
		chip.currentOpcode = 0xe1a1;
		chip.vRegisters[1] = 0xe;

		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(4);
	});

	test('EXA1 Does not next instruction if key in VX pressed', () => {
		chip.currentOpcode = 0xe1a1;
		chip.vRegisters[1] = 0xe;
		chip.inputs[0xe] = true;

		chip.runCurrentOpcode();

		expect(chip.programCounter).toBe(2);
	});
});
