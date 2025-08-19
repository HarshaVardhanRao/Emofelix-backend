import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar_new';
import TermsChecker from './components/TermsChecker';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyLovedOnes from './pages/MyLovedOnes';
import CallSetup from './pages/CallSetup';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import LoadingSpinner from './components/LoadingSpinner';


// Home Route Component (redirect authenticated users to loved ones)
const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/loved-ones" replace /> : <Home />;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/loved-ones" /> : children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-800">
      <TermsChecker>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/loved-ones"
              element={
                <ProtectedRoute>
                  <MyLovedOnes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/call-setup/:relationId"
              element={
                <ProtectedRoute>
                  <CallSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:relationId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            {/* Redirect old routes */}
            <Route path="/dashboard" element={<Navigate to="/loved-ones" replace />} />
            <Route path="/relations" element={<Navigate to="/loved-ones" replace />} />
          </Routes>
        </main>
      </TermsChecker>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
