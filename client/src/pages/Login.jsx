import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      login(response.data.token, response.data.user);
      toast.success(`Welcome back, ${response.data.user.nickname}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box cyber-glow">
        <div className="auth-header">
          <h1 className="neon-text glitch" data-text="LOGIN">LOGIN</h1>
          <div className="scanline"></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="cyber-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="cyber-input"
            />
          </div>

          <button type="submit" disabled={loading} className="cyber-button">
            {loading ? (
              <span className="loading-dots">AUTHENTICATING<span>.</span><span>.</span><span>.</span></span>
            ) : (
              'ENTER SYSTEM'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>New user? <Link to="/signup" className="neon-link">Create Account</Link></p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default Login;
