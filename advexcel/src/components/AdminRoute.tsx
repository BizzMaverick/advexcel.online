import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  // This is a placeholder for actual authentication logic
  const isAdmin = false;
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;