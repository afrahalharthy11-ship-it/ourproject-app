import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from 'reactstrap';

function ProtectedRoute({ requiredRole }) {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner color="primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const fallback = user.role === 'doctor' ? '/doctor/dashboard' : '/client/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
