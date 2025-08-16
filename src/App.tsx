import { useEffect, useRef } from 'react';

import './App.scss';

import { useAppStore } from './store';
import { Chip8 } from './emulator/Chip8';
import { testRom } from './emulator/roms';

const App = () => {
	const chip8 = useRef<Chip8>(null);
	// const bears = useAppStore(state => state.bears);
	// const incrementBears = useAppStore(state => state.increase);

	useEffect(() => {
		chip8.current = new Chip8();
		chip8.current.loadRom(testRom);
	}, []);

	function start() {
		chip8.current?.start();
	}

	return (
		<div className="content">
			<button onClick={start}>Start</button>
		</div>
	);
};

export default App;
