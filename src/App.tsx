import { useEffect, useRef } from 'react';

import './App.scss';

import { Chip8 } from './emulator/Chip8';
import { Renderer } from './emulator/Renderer';
import { flagsTest } from './roms/testRoms';

const App = () => {
	const chip8 = useRef<Chip8>(null);
	const renderer = useRef<Renderer>(null);
	// const bears = useAppStore(state => state.bears);
	// const incrementBears = useAppStore(state => state.increase);

	useEffect(() => {
		chip8.current = new Chip8();
		chip8.current.loadRom(flagsTest);

		renderer.current = new Renderer('root', 10, chip8.current);

		return () => {
			renderer.current?.destroy();
			chip8.current?.stop();
		};
	}, []);

	function start() {
		console.log('Starting emulator');
		renderer.current?.start();
		chip8.current?.start();
	}

	return (
		<div className="content">
			<button onClick={start}>Start</button>
		</div>
	);
};

export default App;
