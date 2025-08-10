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
		chip.currentOpcode = 0x00ee;
		chip.stack[chip.stackPointer++] = 0xf0;
		chip.runCurrentOpcode();

		expect(isZeroed(chip.graphics)).toBeTruthy();
		expect(chip.programCounter).toBe;
	});

	// test('0EEE', () => {
	// 	chip.currentOpcode = 0x00ee;
	// 	chip.stack[chip.stackPointer++] = 0xf0;
	// 	chip.runCurrentOpcode();

	// 	// Adds 2 to the program counter as well
	// 	equal(chip.pc, 0xf2, 'Returns from a subroutine');
	// });
});
