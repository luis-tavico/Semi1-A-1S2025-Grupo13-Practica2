import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Folder, Trash2, LogOut, Circle, CheckCircle2, Plus, Edit } from 'lucide-react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tareas = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [profilePicture, setProfilePicture] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTareas = async () => {
            try {
                const response = await fetch(`${API_URL}/api/tasks/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const sortedTasks = data.tasks.sort((a, b) => {
                        return new Date(b.creation_date) - new Date(a.creation_date);
                    });
                    setTasks(sortedTasks);
                    setProfilePicture(data.user.profile_picture);
                } else {
                    console.error('Error al obtener tareas:', response.statusText);
                    alert('Error al obtener tareas. Inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al obtener tareas:', error);
                alert('Error al obtener tareas. Inténtalo de nuevo.');
            }
        };

        fetchTareas();
    }, [API_URL, navigate, token]);

    const toggleCompletada = async (id) => {
        try {
            const task = tasks.find(task => task.id === id);
            const response = await fetch(`${API_URL}/api/tasks/state/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...task, completed: !task.completed }),
            });

            if (response.ok) {
                setTasks(tasks.map(task =>
                    task.id === id ? { ...task, completed: !task.completed } : task
                ));
            } else {
                console.error('Error al actualizar tarea:', response.statusText);
                alert('Error al actualizar tarea. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            alert('Error al actualizar tarea. Inténtalo de nuevo.');
        }
    };

    const handleEditarTarea = (tarea) => {
        navigate(`/editartarea/${tarea.id}`);

    };

    const eliminarTarea = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message, {
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
                setTasks(tasks.filter(tarea => tarea.id !== id));
            } else {
                console.error('Error al eliminar tarea:', response.statusText);
                alert('Error al eliminar tarea. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            alert('Error al eliminar tarea. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 p-4 border-r border-gray-700 relative">
                <div className="space-y-2">
                    <div className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => navigate('/tareas')}>
                        <List className="mr-2" />
                        <span>Tareas</span>
                    </div>
                    <div className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => navigate('/archivos')}>
                        <Folder className="mr-2" />
                        <span>Archivos</span>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-grow p-8 relative">
                {/* Menú de salida */}
                <div className="absolute top-4 right-4 flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden cursor-pointer" onClick={() => setMenuAbierto(!menuAbierto)}>
                            <img
                                src={profilePicture || "/unknown.png"}
                                alt="Usuario"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {menuAbierto && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                                <div className="px-4 py-2 hover:bg-gray-600 flex items-center cursor-pointer text-red-400" onClick={() => navigate('/login')}>
                                    <LogOut className="mr-2" size={16} /> Cerrar sesión
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Tareas */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">Mis Tareas</h1>

                    <div className="mb-6">
                        {/*<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center" onClick={() => navigate('/creartarea')}>*/}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center cursor-pointer" onClick={() => navigate('/creartarea', { state: { profilePicture } })}>
                            <Plus className="mr-2" size={20} />
                            Crear Nueva Tarea
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tasks.length === 0 ? (
                            <div className="text-center py-10 bg-gray-800 rounded-lg">
                                <List size={64} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400">No tienes tareas pendientes.</p>
                            </div>
                        ) : (
                            tasks.map((tarea) => (
                                <div
                                    key={tarea.id}
                                    className={`flex items-center p-4 rounded-lg ${tarea.completed ? 'bg-green-900/30 border border-green-700/50' : 'bg-gray-800 border border-gray-700'}`}>
                                    <div
                                        className="mr-4 cursor-pointer"
                                        onClick={() => toggleCompletada(tarea.id)}
                                    >
                                        {tarea.completed ? (
                                            <CheckCircle2 className="text-green-500" size={24} />
                                        ) : (
                                            <Circle className="text-gray-500" size={24} />
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <h3
                                            className={`text-lg font-semibold ${tarea.completed ? 'line-through text-gray-500' : ''}`}
                                        >
                                            {tarea.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">{tarea.description}</p>
                                        <span className="text-xs text-gray-500 mt-1">
                                            Creada el: {new Date(tarea.creation_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Botón Editar Tarea */}
                                        <button
                                            onClick={() => handleEditarTarea(tarea)}
                                            className="text-blue-500 hover:text-blue-400 mr-2 cursor-pointer"
                                        >
                                            <Edit size={20} />
                                        </button>

                                        <button
                                            onClick={() => eliminarTarea(tarea.id)}
                                            className="text-red-500 hover:text-red-400 cursor-pointer"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Tareas;