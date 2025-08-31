import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Chip8';
import { Chip8 } from './Chip8';

const BACKGROUND_COLOR = '#22232a';
const PIXEL_COLOR = '#758cd1ff';

export class Renderer {
	animationFrame?: number;
	canvas: HTMLCanvasElement;
	chip8: Chip8;
	context: CanvasRenderingContext2D;
	pixelSize: number;
	running: boolean;

	constructor(containerId: string, pixelSize: number, chip8: Chip8) {
		this.chip8 = chip8;
		this.pixelSize = pixelSize;
		this.running = false;
		this.canvas = document.createElement('canvas');
		this.canvas.width = SCREEN_WIDTH * pixelSize;
		this.canvas.height = SCREEN_HEIGHT * pixelSize;
		this.canvas.className = 'canvas-stopped';

		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Missing canvas context');
		}

		this.context = ctx;

		const container = document.getElementById(containerId);
		if (!container) {
			throw new Error(`Missing canvas container ${containerId}`);
		}

		container.prepend(this.canvas);
	}

	start() {
		if (this.running) {
			return;
		}

		this.canvas.className = 'canvas-started';

		this.running = true;
		this.update();
	}

	stop() {
		this.running = false;
	}

	destroy() {
		this.stop();
		this.canvas.remove();
	}

	update() {
		if (!this.running) {
			return;
		}

		if (this.chip8.drawFlag) {
			// Clear Screen
			this.context.fillStyle = BACKGROUND_COLOR;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

			// Draw pixels
			this.context.fillStyle = PIXEL_COLOR;
			for (let y = 0; y < SCREEN_HEIGHT; y++) {
				for (let x = 0; x < SCREEN_WIDTH; x++) {
					const pos = x + y * SCREEN_WIDTH;

					if (this.chip8.graphics[pos]) {
						this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
					}
				}
			}
		}

		window.requestAnimationFrame(this.update.bind(this));
	}
}
