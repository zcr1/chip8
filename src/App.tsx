import { useEffect, useMemo, useRef, useState } from 'react';

import { Chip8 } from './emulator/Chip8';
import { Renderer } from './emulator/Renderer';
import { InputHandler } from './emulator/InputHandler';
import { AudioHandler } from './emulator/AudioHandler';
import { roms } from './roms/roms';

import './App.scss';

const RomSelector = ({ currentRom, setRom }: { currentRom?: string; setRom(rom: string): void }) => {
	return (
		<select name="roms" value={currentRom} onChange={e => setRom(e.target.value)}>
			<option value="">Select Rom</option>
			{Object.keys(roms).map(rom => (
				<option value={rom} key={rom}>
					{rom}
				</option>
			))}
		</select>
	);
};

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

	// todo engine class?
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
			<button onClick={start}>Start</button>
			<RomSelector currentRom={currentRom} setRom={setRom} />
		</div>
	);
};

export default App;
