import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
	return localStorage.getItem('isAuthenticated') === 'true';
};

const RutaPrivada = ({ children }) => {
	return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default RutaPrivada;
