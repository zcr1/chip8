import { useEffect, useRef, useState } from 'react';

import { Chip8 } from './emulator/Chip8';
import { Renderer } from './emulator/Renderer';
import { InputHandler } from './emulator/InputHandler';
import { AudioHandler } from './emulator/AudioHandler';
import { roms } from './roms/roms';

import './App.scss';

const RomSelector = ({ currentRom, setRom }: { currentRom?: string; setRom(rom: string): void }) => {
	return (
		<select id="rom-selector" name="roms" value={currentRom} onChange={e => setRom(e.target.value)}>
			<option value="">Select Rom</option>
			{Object.keys(roms).map(rom => (
				<option value={rom} key={rom}>
					{rom}
				</option>
			))}
		</select>
	);
};

const ViewSourceLink = () => (
	<a href="https://github.com/zcr1/chip8" target="_blank">
		View Source
		<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
			<path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
		</svg>
	</a>
);

const App = () => {
	const chip8 = useRef<Chip8>(null);
	const renderer = useRef<Renderer>(null);
	const inputHandler = useRef<InputHandler>(null);
	const audioHandler = useRef<AudioHandler>(null);
	const [currentRom, setRom] = useState<string>();

	useEffect(() => {
		chip8.current = new Chip8();
		renderer.current = new Renderer('root', 10, chip8.current);
		inputHandler.current = new InputHandler(chip8.current);
		audioHandler.current = new AudioHandler('root', chip8.current);

		return () => {
			renderer.current?.destroy();
			chip8.current?.stop();
			inputHandler.current?.stop();
			audioHandler.current?.stop();
		};
	}, []);

	function start() {
		if (!currentRom) {
			return;
		}

		chip8.current?.stop();
		chip8.current?.loadRom(roms[currentRom]);

		renderer.current?.start();
		chip8.current?.start();
		inputHandler.current?.start();
		audioHandler.current?.start();
	}

	return (
		<div className="content">
			<ViewSourceLink />
			<button id="start-button" onClick={start}>
				Start
			</button>
			<RomSelector currentRom={currentRom} setRom={setRom} />
		</div>
	);
};

export default App;
