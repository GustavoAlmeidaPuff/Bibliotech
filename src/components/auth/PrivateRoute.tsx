import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';

const PrivateRoute: React.FC = () => {
  const { currentUser, authState } = useAuth();
  const location = useLocation();

  if (authState.status === 'loading') {
    return null; // não renderiza nada enquanto carrega
  }

  // se não tiver logado, vai pro login
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // se tiver logado, mostra as rotas protegidas
  return <Outlet />;
};

export default PrivateRoute; 