import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthGuard = ({ children }) => {
    const user = useSelector((state) => state.user);
    
    if (!user) {
        // Redirect to login if user is not authenticated
        return <Navigate to="/login" replace />;
    }
    
    // User is authenticated, render the protected component
    return children;
};

export default AuthGuard;