import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro';
import Tarea from './components/Tarea';
import Tareas from './components/Tareas';
import Archivos from './components/Archivos';
import RutaPrivada from './components/RutaPrivada'; // Asegúrate de crear este archivo

function App() {
	return (
		<Router>
			<div className="App">
				<Routes>
					<Route path="/" element={<Navigate replace to="/login" />} />
					<Route path="/login" element={<Login />} />
					<Route path="/registro" element={<Registro />} />
					<Route path="/creartarea" element={<RutaPrivada><Tarea /></RutaPrivada>}/>
					<Route path="/editartarea/:id" element={<RutaPrivada><Tarea /></RutaPrivada>}/>
					<Route path="/tareas" element={<RutaPrivada><Tareas /></RutaPrivada>}/>
					<Route path="/archivos"element={<RutaPrivada><Archivos /></RutaPrivada>}/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;