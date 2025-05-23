import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TagsProvider } from './contexts/TagsContext';
import { AuthorsProvider } from './contexts/AuthorsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './styles/ThemeProvider';
import CustomThemeProvider from './components/theme/ThemeProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentLogin from './pages/auth/StudentLogin';
import StudentDashboardPage from './pages/student/StudentDashboard';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import Students from './pages/students/Students';
import RegisterStudent from './pages/students/RegisterStudent';
import EditStudent from './pages/students/EditStudent';
import StudentDashboard from './pages/students/StudentDashboard';
import Staff from './pages/staff/Staff';
import RegisterStaff from './pages/staff/RegisterStaff';
import EditStaff from './pages/staff/EditStaff';
import Books from './pages/books/Books';
import RegisterBook from './pages/books/RegisterBook';
import EditBook from './pages/books/EditBook';
import StudentLoans from './pages/loans/StudentLoans';
import StudentLoanDetail from './pages/loans/StudentLoanDetail';
import StaffLoans from './pages/loans/StaffLoans';
import StudentReturns from './pages/returns/StudentReturns';
import StudentWithdrawals from './pages/withdrawals/StudentWithdrawals';
import StaffWithdrawals from './pages/withdrawals/StaffWithdrawals';
import BookSelection from './pages/withdrawals/BookSelection';
import WithdrawalConfirmation from './pages/withdrawals/WithdrawalConfirmation';
import StaffWithdrawalConfirmation from './pages/withdrawals/StaffWithdrawalConfirmation';
import SelectStaffBook from './pages/withdrawals/SelectStaffBook';
import StaffReturns from './pages/returns/StaffReturns';
import Settings from './pages/settings/Settings';
import Home from './pages/Home';

// Componente para redirecionar com base no estado de autenticação
const RedirectBasedOnAuth = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <TagsProvider>
        <AuthorsProvider>
          <SettingsProvider>
            <ThemeProvider>
              <CustomThemeProvider>
                <Router>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/student-dashboard" element={<StudentDashboardPage />} />
                    
                    {/* Protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/students/register" element={<RegisterStudent />} />
                        <Route path="/students/:studentId/edit" element={<EditStudent />} />
                        <Route path="/students/:studentId" element={<StudentDashboard />} />
                        <Route path="/staff" element={<Staff />} />
                        <Route path="/staff/register" element={<RegisterStaff />} />
                        <Route path="/staff/:id" element={<EditStaff />} />
                        <Route path="/staff/:id/edit" element={<EditStaff />} />
                        <Route path="/books" element={<Books />} />
                        <Route path="/books/register" element={<RegisterBook />} />
                        <Route path="/books/:bookId" element={<EditBook />} />
                        <Route path="/student-loans" element={<StudentLoans key="student-loans" />} />
                        <Route path="/student-loan-detail/:loanId" element={<StudentLoanDetail />} />
                        <Route path="/staff-loans" element={<StaffLoans />} />
                        <Route path="/student-returns" element={<StudentReturns />} />
                        <Route path="/student-withdrawals" element={<StudentWithdrawals />} />
                        <Route path="/student-withdrawals/:studentId" element={<BookSelection />} />
                        <Route path="/student-withdrawals/:studentId/confirm/:bookId" element={<WithdrawalConfirmation />} />
                        <Route path="/staff-withdrawals" element={<StaffWithdrawals />} />
                        <Route path="/staff-withdrawals/:staffId" element={<SelectStaffBook />} />
                        <Route path="/staff-withdrawals/:staffId/confirm/:bookId" element={<StaffWithdrawalConfirmation />} />
                        <Route path="/settings" element={<Settings />} />
                      </Route>
                    </Route>
                    
                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Router>
              </CustomThemeProvider>
            </ThemeProvider>
          </SettingsProvider>
        </AuthorsProvider>
      </TagsProvider>
    </AuthProvider>
  );
};

export default App;
