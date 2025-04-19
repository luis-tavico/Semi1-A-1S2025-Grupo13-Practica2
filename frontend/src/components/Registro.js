import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Lock, KeyRound } from 'lucide-react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Registro = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    const UPLOAD_IMAGE_URL = process.env.REACT_APP_UPLOAD_IMAGE_URL

    // Funcion para convertir archivo a base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.warning('¡Las contraseñas no coinciden!', {
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
            return;
        }

        try {
            let profilePictureUrl = null;

            if (profilePicture) {
                const fileContent = await fileToBase64(profilePicture);

                // Subir imagen a Lambda
                const lambdaResponse = await fetch(`${UPLOAD_IMAGE_URL}/cargar_imagenes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: profilePicture.name,
                        fileContent: fileContent,
                        fileType: profilePicture.type
                    })
                });

                if (!lambdaResponse.ok) {
                    throw new Error('Error al subir la imagen de perfil a S3');
                }

                const { file_url } = await lambdaResponse.json();
                profilePictureUrl = file_url;
            }

            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    profile_picture: profilePictureUrl
                })
            });

            if (response.ok) {
                toast.success('¡Registro exitoso!', {
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
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message, {
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
        } catch (error) {
            console.error('Error en el proceso de registro:', error);
            toast.error('¡Error al registrarse!', {
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
                <h2 className="text-center text-3xl font-bold text-white">Registrarse</h2>

                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="profilePicture"
                            onChange={handleImageUpload}
                        />
                        <label
                            htmlFor="profilePicture"
                            className="cursor-pointer"
                        >
                            {profilePicture ? (
                                <img
                                    src={URL.createObjectURL(profilePicture)}
                                    alt="imagen perfil"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                                    <Camera className="text-gray-400" size={36} />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1">
                                <Camera size={16} className="text-white" />
                            </div>
                        </label>
                    </div>
                </div>

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
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Registrarse
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-gray-400">
                        ¿Ya tienes una cuenta? {' '} <Link to="/login" className="text-blue-500 hover:underline">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Registro;