import { Chip8 } from '../src/emulator/Chip8';

function isZeroed(array: Uint8Array<ArrayBuffer>) {
	return array.every(e => e === 0);
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
});
