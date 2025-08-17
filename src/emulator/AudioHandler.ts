import { Chip8 } from './Chip8';
import beep from '../static/beep.mp3';

export class AudioHandler {
	audio: HTMLAudioElement;
	chip8: Chip8;
	running: boolean;

	constructor(containerId: string, chip8: Chip8) {
		this.chip8 = chip8;
		this.running = false;

		const container = document.getElementById(containerId);
		if (!container) {
			throw new Error(`Missing audio container ${containerId}`);
		}

		this.audio = document.createElement('audio');
		this.audio.preload = 'auto';
		this.audio.src = beep;
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

	update() {
		if (!this.running) {
			return;
		}

		if (this.chip8.soundTimer > 0) {
			this.audio.play();
		}

		window.requestAnimationFrame(this.update.bind(this));
	}
}
