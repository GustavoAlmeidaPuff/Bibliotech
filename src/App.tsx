import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TagsProvider } from './contexts/TagsContext';
import { AuthorsProvider } from './contexts/AuthorsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ThemeProvider from './components/theme/ThemeProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import Students from './pages/students/Students';
import RegisterStudent from './pages/students/RegisterStudent';
import EditStudent from './pages/students/EditStudent';
import StudentDashboard from './pages/students/StudentDashboard';
import Staff from './pages/staff/Staff';
import Books from './pages/books/Books';
import RegisterBook from './pages/books/RegisterBook';
import EditBook from './pages/books/EditBook';
import StudentLoans from './pages/loans/StudentLoans';
import StaffLoans from './pages/loans/StaffLoans';
import StudentReturns from './pages/returns/StudentReturns';
import StudentWithdrawals from './pages/withdrawals/StudentWithdrawals';
import BookSelection from './pages/withdrawals/BookSelection';
import WithdrawalConfirmation from './pages/withdrawals/WithdrawalConfirmation';
import StaffReturns from './pages/returns/StaffReturns';
import Settings from './pages/settings/Settings';

const App = () => {
  return (
    <AuthProvider>
      <TagsProvider>
        <AuthorsProvider>
          <SettingsProvider>
            <ThemeProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/students/register" element={<RegisterStudent />} />
                      <Route path="/students/:studentId/edit" element={<EditStudent />} />
                      <Route path="/students/:studentId" element={<StudentDashboard />} />
                      <Route path="/staff" element={<Staff />} />
                      <Route path="/books" element={<Books />} />
                      <Route path="/books/register" element={<RegisterBook />} />
                      <Route path="/books/:bookId" element={<EditBook />} />
                      <Route path="/student-loans" element={<StudentLoans key="student-loans" />} />
                      <Route path="/staff-loans" element={<StaffLoans />} />
                      <Route path="/student-returns" element={<StudentReturns />} />
                      <Route path="/student-withdrawals" element={<StudentWithdrawals />} />
                      <Route path="/student-withdrawals/:studentId" element={<BookSelection />} />
                      <Route path="/student-withdrawals/:studentId/confirm/:bookId" element={<WithdrawalConfirmation />} />
                      <Route path="/staff-returns" element={<StaffReturns />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>
                  
                  {/* Default redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
            </ThemeProvider>
          </SettingsProvider>
        </AuthorsProvider>
      </TagsProvider>
    </AuthProvider>
  );
};

export default App;
