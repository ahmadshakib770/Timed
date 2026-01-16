import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import MyPlan from './pages/MyPlan';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create-plan" element={<PrivateRoute><CreatePlan /></PrivateRoute>} />
            <Route path="/my-plan" element={<PrivateRoute><MyPlan /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{
              background: 'var(--bg-card)',
              border: '2px solid var(--vintage-sage)',
              boxShadow: '0 4px 12px rgba(139, 115, 85, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              color: 'var(--vintage-brown)',
              fontFamily: 'var(--font-main)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
