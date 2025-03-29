import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro';
import Tarea from './components/Tarea';
import Tareas from './components/Tareas';
import Archivos from './components/Archivos';

function App() {
	return (
		<Router>
			<div className="App">
				<Routes>
					<Route path="/" element={<Navigate replace to="/login" />} />
					<Route path="/login" element={<Login />} />
					<Route path="/registro" element={<Registro />} />
					<Route path="/creartarea" element={<Tarea />} />
					<Route path="/editartarea/:id" element={<Tarea />} />
					<Route path="/tareas" element={<Tareas />} />
					<Route path="/archivos" element={<Archivos />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
