import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const GuestGuard = ({ children }) => {
    const user = useSelector((state) => state.user);
    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};
export default GuestGuard;