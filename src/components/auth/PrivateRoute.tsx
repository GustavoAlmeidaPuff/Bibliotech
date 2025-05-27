import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';

const PrivateRoute: React.FC = () => {
  const { currentUser, authState } = useAuth();
  const location = useLocation();

  if (authState.status === 'loading') {
    return null; // Não renderiza nada durante o carregamento
  }

  // Se não estiver autenticado, redireciona para o login
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza as rotas protegidas
  return <Outlet />;
};

export default PrivateRoute; 