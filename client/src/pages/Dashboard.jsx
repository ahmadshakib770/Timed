import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time to 12-hour format
  const formatTime12Hour = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Live Clock Display */}
      <div className="live-clock">
        <span className="clock-label">Current Time:</span>
        <span className="clock-time">{formatTime12Hour(currentTime)}</span>
        <span className="clock-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</span>
      </div>

      {/* Header */}
      <header className="dashboard-header cyber-glow">
        <div className="header-content">
          <h1 className="neon-text">TIMED</h1>
          <button onClick={handleLogout} className="logout-btn">
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-text neon-text glitch" data-text={`HELLO, ${user?.nickname?.toUpperCase()}`}>
            HELLO, {user?.nickname?.toUpperCase()}
          </h2>
          <div className="welcome-line"></div>
        </div>

        <div className="action-cards">
          {/* Create Plan Card */}
          <div className="action-card cyber-border" onClick={() => navigate('/create-plan')}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3>CREATE YOUR PLAN</h3>
            <p>Schedule your day with precision</p>
            <div className="card-arrow">→</div>
          </div>

          {/* My Plan Card */}
          <div className="action-card cyber-border" onClick={() => navigate('/my-plan')}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>MY PLAN</h3>
            <p>View and manage your schedule</p>
            <div className="card-arrow">→</div>
          </div>

          {/* Analytics Card */}
          <div className="action-card cyber-border" onClick={() => navigate('/analytics')}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <h3>ANALYTICS</h3>
            <p>Track your productivity records</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </main>

      {/* Background decorations */}
      <div className="dashboard-decoration decoration-1"></div>
      <div className="dashboard-decoration decoration-2"></div>
    </div>
  );
};

export default Dashboard;
