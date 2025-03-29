import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Folder, Trash2, LogOut, Eye, Upload, FileText, FileImage, File } from 'lucide-react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Archivos = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [files, setFiles] = useState([]);
    const [profilePicture, setProfilePicture] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchArchivos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/files/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFiles(data.files);
                    setProfilePicture(data.user.profile_picture);
                } else {
                    console.error('Error al obtener archivos:', response.statusText);
                    alert('Error al obtener archivos. Inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al obtener archivos:', error);
                alert('Error al obtener archivos. Inténtalo de nuevo.');
            }
        };

        fetchArchivos();
    }, [API_URL, token]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/files/upload/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newFile = await response.json();
                setFiles([newFile, ...files]);
                toast.success('¡Archivo subido exitosamente!', {
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
            } else {
                const errorData = await response.json();
                console.error('Error al subir archivo:', errorData);
                alert(errorData.error || 'Error al subir archivo. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
            alert('Error al subir archivo. Inténtalo de nuevo.');
        }
    };

    const eliminarArchivo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/files/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setFiles(files.filter(file => file.id !== id));
                toast.success('¡Archivo eliminado exitosamente!', {
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
            } else {
                console.error('Error al eliminar archivo:', response.statusText);
                alert('Error al eliminar archivo. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            alert('Error al eliminar archivo. Inténtalo de nuevo.');
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return <FileImage size={24} />;
        if (fileType.includes('text') || fileType.includes('doc')) return <FileText size={24} />;
        return <File size={24} />;
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

                {/* Lista de Archivos */}
                <div>
                    <h1 className="text-3xl font-bold mb-6">Mis Archivos</h1>

                    {/* Boton de subida*/}
                    <div className="mb-8 flex">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="file-upload"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center cursor-pointer shadow-lg w-48"
                        >
                            <Upload className="mr-2" size={18} />
                            Subir Archivo
                        </label>
                    </div>

                    {/* Grid de archivos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.length === 0 ? (
                            <div className="col-span-3 text-center py-10 bg-gray-800 rounded-lg">
                                <Folder size={64} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400">No tienes archivos todavía.</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-500 group"
                                >
                                    <div className="p-5 bg-gray-750 border-b border-gray-700 flex items-center">
                                        <div className="text-blue-400 mr-3">
                                            {getFileIcon(file.file_type)}
                                        </div>
                                        <div className="flex-grow truncate">
                                            <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors">
                                                {file.file_name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 text-xs text-gray-400">
                                        <div className="flex justify-between">
                                            <span>Tipo: {file.file_type?.split('/')[1] || 'Desconocido'}</span>
                                            <span>Subido: {new Date(file.upload_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex border-t border-gray-700">
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-3 text-blue-400 hover:bg-gray-700 transition-colors flex items-center justify-center"
                                            title="Ver archivo"
                                        >
                                            <Eye size={18} className="mr-1" />
                                            <span>Ver</span>
                                        </a>

                                        <div className="w-px bg-gray-700"></div>

                                        <button
                                            onClick={() => eliminarArchivo(file.id)}
                                            className="flex-1 py-3 text-red-400 hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer"
                                            title="Eliminar archivo"
                                        >
                                            <Trash2 size={18} className="mr-1" />
                                            <span>Eliminar</span>
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

export default Archivos;