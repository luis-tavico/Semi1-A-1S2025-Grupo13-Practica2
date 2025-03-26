import React, { useState, useRef, useEffect, useCallback } from 'react';
import { List, Folder, Eye, Trash2, LogOut, Plus, FileText, Image, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Archivos = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [archivos, setArchivos] = useState([]);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const cargarArchivos = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/archivos`);
            const archivosConDetalles = response.data.map(nombre => ({
                id: Date.now() + Math.random(),
                nombre: nombre,
                tipo: nombre.split('.').pop(),
                fechaCarga: new Date().toISOString().split('T')[0]
            }));
            setArchivos(archivosConDetalles);
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            alert('No se pudieron cargar los archivos');
        }
    }, [API_URL]);

    useEffect(() => {
        cargarArchivos();
    }, [cargarArchivos]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const _ = await axios.post(`${API_URL}/archivos`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                cargarArchivos();
            } catch (error) {
                console.error('Error al subir archivo:', error);
                alert(`No se pudo subir el archivo ${file.name}`);
            }
        }
    };

    const eliminarArchivo = async (nombre) => {
        try {
            await axios.delete(`${API_URL}/archivos/${nombre}`);
            setArchivos(archivos.filter(archivo => archivo.nombre !== nombre));
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            alert('No se pudo eliminar el archivo');
        }
    };

    const visualizarArchivo = (archivo) => {
        console.log(`Visualizando archivo: ${archivo.nombre}`);
    };

    const getFileDetails = (tipo) => {
        const tipoLower = tipo.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(tipoLower)) 
            return { icon: <Image className="text-blue-500" />, color: 'blue' };
        if (['txt', 'doc', 'docx', 'pdf'].includes(tipoLower)) 
            return { icon: <FileText className="text-green-500" />, color: 'green' };
        return { icon: <File className="text-gray-500" />, color: 'gray' };
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
                    <div className="flex items-center p-2 bg-gray-700 rounded cursor-pointer" onClick={() => navigate('/archivos')}>
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
                                    <LogOut className="mr-2" size={16} /> Cerrar sesión
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gestión de Archivos */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">Mis Archivos</h1>

                    {/* Botón de carga de archivos */}
                    <div className="mb-6 flex items-center space-x-4">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                        >
                            <Plus className="mr-2" size={20} />
                            Cargar Archivos
                        </button>
                    </div>

                    {/* Lista de Archivos */}
                    <div className="space-y-4">
                        {archivos.map((archivo) => {
                            const { icon, color } = getFileDetails(archivo.tipo);
                            return (
                                <div 
                                    key={archivo.id}
                                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between hover:bg-gray-700 transition"
                                >
                                    <div className="flex items-center space-x-4 flex-grow">
                                        {icon}
                                        <div className="flex-grow">
                                            <div className="flex items-center">
                                                <h3 className="text-md font-semibold mr-2 truncate max-w-[300px]">
                                                    {archivo.nombre}
                                                </h3>
                                                <span 
                                                    className={`px-2 py-1 rounded text-xs bg-${color}-500/20 text-${color}-400`}
                                                >
                                                    {archivo.tipo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Cargado el {archivo.fechaCarga}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => visualizarArchivo(archivo)}
                                            className="text-blue-500 hover:text-blue-400 transition"
                                            title="Ver archivo"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => eliminarArchivo(archivo.nombre)}
                                            className="text-red-500 hover:text-red-400 transition"
                                            title="Eliminar archivo"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Archivos;