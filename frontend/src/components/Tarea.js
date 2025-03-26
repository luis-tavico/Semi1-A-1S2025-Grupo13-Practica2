import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { List, Folder, X, Save, CalendarDays } from 'lucide-react';

const Tarea = () => {
    const { id } = useParams();
    const [tarea, setTarea] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (id) {
            fetch(`${API_URL}/tareas/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudo cargar la tarea.');
                    }
                    return response.json();
                })
                .then(data => {
                    setTarea(data);
                    setTitulo(data.titulo);
                    setDescripcion(data.descripcion);
                    setFecha(data.fecha);
                })
                .catch(error => {
                    console.error('Error al cargar la tarea:', error);
                });
        } else {
            setTarea(null);
            setTitulo('');
            setDescripcion('');
            setFecha(new Date().toISOString().split('T')[0]);
        }
    }, [id, API_URL]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const tareaData = {
            titulo,
            descripcion,
            fecha,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/tareas/${id}` : `${API_URL}/tareas`;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tareaData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(id ? 'No se pudo actualizar la tarea.' : 'No se pudo crear la tarea.');
                }
                return response.json();
            })
            .then(() => {
                navigate('/tareas');
            })
            .catch(error => {
                console.error(id ? 'Error al actualizar la tarea:' : 'Error al crear la tarea:', error);
            });
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
                        <div
                            className="w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden cursor-pointer"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <img
                                src="/api/placeholder/40/40"
                                alt="Usuario"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {menuAbierto && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                                <div className="px-4 py-2 hover:bg-gray-600 flex items-center cursor-pointer text-red-400" onClick={() => navigate('/login')}>
                                    Cerrar sesión
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulario de Tarea */}
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        {tarea ? 'Editar Tarea' : 'Crear Nueva Tarea'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium mb-2">
                                Título de la Tarea
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ingresa el título de la tarea"
                            />
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium mb-2">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Describe los detalles de la tarea"
                            />
                        </div>

                        <div>
                            <label htmlFor="fecha" className="block text-sm font-medium mb-2">
                                Fecha de la Tarea
                            </label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="date"
                                    id="fecha"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => navigate('/tareas')}
                                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center"
                            >
                                <X className="mr-2" size={20} />
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                <Save className="mr-2" size={20} />
                                {tarea ? 'Guardar Cambios' : 'Crear Tarea'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Tarea;