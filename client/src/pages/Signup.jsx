import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: password & nickname
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestVerification(email);
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.verifyCode(email, code);
      toast.success('Email verified! Complete your profile.');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.completeSignup(email, code, password, nickname);
      login(response.data.token, response.data.user);
      toast.success(`Welcome, ${response.data.user.nickname}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box cyber-glow">
        <div className="auth-header">
          <h1 className="neon-text glitch" data-text="SIGNUP">SIGNUP</h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          <p className="step-indicator">STEP {step} OF 3</p>
          <div className="scanline"></div>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
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
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="cyber-button">
              {loading ? (
                <span className="loading-dots">SENDING<span>.</span><span>.</span><span>.</span></span>
              ) : (
                'SEND VERIFICATION CODE'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">VERIFICATION CODE</label>
              <p className="input-hint">Check your email: {email}</p>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                placeholder="000000"
                className="cyber-input code-input"
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="cyber-button">
              {loading ? (
                <span className="loading-dots">VERIFYING<span>.</span><span>.</span><span>.</span></span>
              ) : (
                'VERIFY CODE'
              )}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="cyber-button-secondary"
            >
              BACK
            </button>
          </form>
        )}

        {/* Step 3: Password & Nickname */}
        {step === 3 && (
          <form onSubmit={handleCompleteSignup} className="auth-form">
            <div className="form-group">
              <label htmlFor="nickname">NICKNAME</label>
              <p className="input-hint">This is how we'll address you</p>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                minLength={2}
                maxLength={30}
                placeholder="CyberUser"
                className="cyber-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <p className="input-hint">Minimum 6 characters</p>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="cyber-input"
              />
            </div>

            <button type="submit" disabled={loading} className="cyber-button">
              {loading ? (
                <span className="loading-dots">CREATING ACCOUNT<span>.</span><span>.</span><span>.</span></span>
              ) : (
                'COMPLETE SIGNUP'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="neon-link">Login</Link></p>
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

export default Signup;
