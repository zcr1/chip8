import { Chip8 } from '../src/emulator/Chip8';

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
	});

	test('7XNN Adds NN to VX', () => {
		chip.currentOpcode = 0x7945;
		chip.vRegisters[9] = 0x33;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[9]).toBe(0x0078);
	});

	test('8XY0 Sets VX = VY', () => {
		chip.currentOpcode = 0x8120;
		chip.vRegisters[2] = 0x33;
		chip.runCurrentOpcode();

		expect(chip.vRegisters[2]).toBe(chip.vRegisters[1]);
	});
});
