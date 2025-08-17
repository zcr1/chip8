import { useEffect, useRef } from 'react';

import { Chip8 } from './emulator/Chip8';
import { Renderer } from './emulator/Renderer';
import { keypadTest } from './roms/testRoms';
import { InputHandler } from './emulator/InputHandler';

import './App.scss';

const App = () => {
	const chip8 = useRef<Chip8>(null);
	const renderer = useRef<Renderer>(null);
	const inputHandler = useRef<InputHandler>(null);

	useEffect(() => {
		chip8.current = new Chip8();
		chip8.current.loadRom(keypadTest);

		renderer.current = new Renderer('root', 10, chip8.current);
		inputHandler.current = new InputHandler(chip8.current);

		return () => {
			renderer.current?.destroy();
			chip8.current?.stop();
			inputHandler.current?.stop();
		};
	}, []);

	function start() {
		console.log('Starting emulator');
		renderer.current?.start();
		chip8.current?.start();
		inputHandler.current?.start();
	}

	return (
		<div className="content">
			<button onClick={start}>Start</button>
		</div>
	);
};

export default App;
