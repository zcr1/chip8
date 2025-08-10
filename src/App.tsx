import './App.css';

import { useAppStore } from './store';

const App = () => {
	const bears = useAppStore(state => state.bears);
	const incrementBears = useAppStore(state => state.increase);

	return (
		<div className="content">
			<h1>{bears}</h1>
			<button onClick={incrementBears}>Click me</button>
		</div>
	);
};

export default App;
