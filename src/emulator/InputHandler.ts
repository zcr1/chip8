import { Chip8 } from './Chip8';

// 1 2 3 C -> 1 2 3 4
// 4 5 6 D -> q w e r
// 7 8 9 E -> a s d f
// A 0 B F -> z x c v
const INPUT_MAP: Record<string, number> = {
	1: 0x1,
	2: 0x2,
	3: 0x3,
	4: 0xc,
	q: 0x4,
	w: 0x5,
	e: 0x6,
	r: 0xd,
	a: 0x7,
	s: 0x8,
	d: 0x9,
	f: 0xe,
	z: 0xa,
	x: 0x0,
	c: 0xb,
	v: 0xf,
};

export class InputHandler {
	chip8: Chip8;
	keydownListener?: number;
	keyupListener?: number;

	constructor(chip8: Chip8) {
		this.chip8 = chip8;
	}

	start() {
		document.addEventListener('keydown', this.handleKey);
		document.addEventListener('keyup', this.handleKey);
	}

	stop() {
		document.removeEventListener('keydown', this.handleKey);
		document.removeEventListener('keyup', this.handleKey);
	}

	handleKey = (e: KeyboardEvent) => {
		if (this.chip8.running && INPUT_MAP[e.key] !== undefined) {
			this.chip8.keypad[INPUT_MAP[e.key]] = e.type === 'keydown';
		}
	};
}
