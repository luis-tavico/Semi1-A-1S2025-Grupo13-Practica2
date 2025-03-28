import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
//import Swal from 'sweetalert2';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL;

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(`${API_URL}/api/users/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("token", data.token);
				navigate('/tareas');
			} else {
				const errorData = await response.json();
				alert(`Error al iniciar sesión: ${errorData.message || 'Error desconocido'}`);
			}
		} catch (err) {
			//console.error('Error al realizar la petición:', err);
			toast.error('Error al realizar la peticion', {
				position: "top-right",
				autoClose: 1000,
				hideProgressBar: true,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "colored",
				transition: Bounce,
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
			<div className="bg-gray-800 shadow-2xl rounded-xl w-full max-w-md p-8 space-y-6">
				<h2 className="text-center text-3xl font-bold text-white">Iniciar Sesión</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="relative">
						<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
						<input
							type="text"
							placeholder="Nombre de usuario"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full pl-10 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
						<input
							type="password"
							placeholder="Contraseña"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full pl-10 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
					>
						Iniciar Sesión
					</button>
				</form>

				<div className="text-center mt-4">
					<p className="text-gray-400">
						¿No tienes una cuenta? {' '} <Link to="/registro" className="text-blue-500 hover:underline">Registrarse</Link>
					</p>
				</div>

			</div>
			<ToastContainer />
		</div>
	);
};

export default Login;