import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants';

// Lazy loading dos componentes para melhor performance
const Login = React.lazy(() => import('../pages/auth/Login'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const StudentLogin = React.lazy(() => import('../pages/auth/StudentLogin'));
const StudentDashboardPage = React.lazy(() => import('../pages/student/StudentDashboard'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const Students = React.lazy(() => import('../pages/students/Students'));
const RegisterStudent = React.lazy(() => import('../pages/students/RegisterStudent'));
const EditStudent = React.lazy(() => import('../pages/students/EditStudent'));
const StudentDashboard = React.lazy(() => import('../pages/students/StudentDashboard'));
const Staff = React.lazy(() => import('../pages/staff/Staff'));
const RegisterStaff = React.lazy(() => import('../pages/staff/RegisterStaff'));
const EditStaff = React.lazy(() => import('../pages/staff/EditStaff'));
const Books = React.lazy(() => import('../pages/books/Books'));
const RegisterBook = React.lazy(() => import('../pages/books/RegisterBook'));
const EditBook = React.lazy(() => import('../pages/books/EditBook'));
const StudentLoans = React.lazy(() => import('../pages/loans/StudentLoans'));
const StudentLoanDetail = React.lazy(() => import('../pages/loans/StudentLoanDetail'));
const StaffLoans = React.lazy(() => import('../pages/loans/StaffLoans'));
const StudentReturns = React.lazy(() => import('../pages/returns/StudentReturns'));
const StudentWithdrawals = React.lazy(() => import('../pages/withdrawals/StudentWithdrawals'));
const StaffWithdrawals = React.lazy(() => import('../pages/withdrawals/StaffWithdrawals'));
const BookSelection = React.lazy(() => import('../pages/withdrawals/BookSelection'));
const CodeSelection = React.lazy(() => import('../pages/withdrawals/CodeSelection'));
const WithdrawalConfirmation = React.lazy(() => import('../pages/withdrawals/WithdrawalConfirmation'));
const StaffWithdrawalConfirmation = React.lazy(() => import('../pages/withdrawals/StaffWithdrawalConfirmation'));
const SelectStaffBook = React.lazy(() => import('../pages/withdrawals/SelectStaffBook'));
const Settings = React.lazy(() => import('../pages/settings/Settings'));
const UpdateNotification = React.lazy(() => import('../pages/admin/UpdateNotification'));
const Home = React.lazy(() => import('../pages/Home'));

// Loading component for lazy routes
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px'
  }}>
    Carregando...
  </div>
);

// Higher-order component to wrap lazy components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

// redireciona com base no estado de autenticação
export const RedirectBasedOnAuth = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to={ROUTES.DASHBOARD} /> : <Navigate to={ROUTES.LOGIN} />;
};

// rotas públicas
export const publicRoutes = [
  {
    path: ROUTES.HOME,
    element: withSuspense(Home)({}),
  },
  {
    path: "/home",
    element: withSuspense(Home)({}),
  },
  {
    path: ROUTES.LOGIN,
    element: withSuspense(Login)({}),
  },
  {
    path: "/forgot-password",
    element: withSuspense(ForgotPassword)({}),
  },
  {
    path: "/student-login",
    element: withSuspense(StudentLogin)({}),
  },
  {
    path: "/student-dashboard",
    element: withSuspense(StudentDashboardPage)({}),
  },
];

// rotas protegidas
export const protectedRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: withSuspense(Dashboard)({}),
  },
  {
    path: ROUTES.STUDENTS,
    element: withSuspense(Students)({}),
  },
  {
    path: "/students/register",
    element: withSuspense(RegisterStudent)({}),
  },
  {
    path: "/students/:studentId/edit",
    element: withSuspense(EditStudent)({}),
  },
  {
    path: "/students/:studentId",
    element: withSuspense(StudentDashboard)({}),
  },
  {
    path: ROUTES.STAFF,
    element: withSuspense(Staff)({}),
  },
  {
    path: "/staff/register",
    element: withSuspense(RegisterStaff)({}),
  },
  {
    path: "/staff/:id",
    element: withSuspense(EditStaff)({}),
  },
  {
    path: "/staff/:id/edit",
    element: withSuspense(EditStaff)({}),
  },
  {
    path: ROUTES.BOOKS,
    element: withSuspense(Books)({}),
  },
  {
    path: "/books/register",
    element: withSuspense(RegisterBook)({}),
  },
  {
    path: "/books/:bookId",
    element: withSuspense(EditBook)({}),
  },
  {
    path: "/student-loans",
    element: withSuspense(StudentLoans)({ key: "student-loans" }),
  },
  {
    path: "/student-loan-detail/:loanId",
    element: withSuspense(StudentLoanDetail)({}),
  },
  {
    path: "/staff-loans",
    element: withSuspense(StaffLoans)({}),
  },
  {
    path: "/student-returns",
    element: withSuspense(StudentReturns)({}),
  },
  {
    path: "/student-withdrawals",
    element: withSuspense(StudentWithdrawals)({}),
  },
  {
    path: "/student-withdrawals/:studentId",
    element: withSuspense(BookSelection)({}),
  },
  {
    path: "/code-selection/:studentId/:bookId",
    element: withSuspense(CodeSelection)({}),
  },
  {
    path: "/withdrawal-confirmation/:studentId/:bookId",
    element: withSuspense(WithdrawalConfirmation)({}),
  },
  {
    path: "/staff-withdrawals",
    element: withSuspense(StaffWithdrawals)({}),
  },
  {
    path: "/staff-withdrawals/:staffId",
    element: withSuspense(SelectStaffBook)({}),
  },
  {
    path: "/staff-withdrawals/:staffId/confirm/:bookId",
    element: withSuspense(StaffWithdrawalConfirmation)({}),
  },
  {
    path: ROUTES.SETTINGS,
    element: withSuspense(Settings)({}),
  },
  {
    path: "/admin/update-notification",
    element: withSuspense(UpdateNotification)({}),
  },
]; 