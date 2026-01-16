import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { plansAPI } from '../services/api';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await plansAPI.getPlans();
      // Sort plans by date (newest first)
      const sortedPlans = response.data.plans.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setPlans(sortedPlans);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  // Convert time string (HH:MM) to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to hours.minutes format
  const minutesToHoursFormat = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}.${String(minutes).padStart(2, '0')}`;
  };

  // Calculate statistics for a plan
  const calculatePlanStats = (plan) => {
    const dayStart = timeToMinutes(plan.dayStartTime);
    const dayEnd = timeToMinutes(plan.dayEndTime);
    const totalDayMinutes = dayEnd - dayStart;

    const categoryTimes = {
      productive: 0,
      leisure: 0,
      break: 0
    };

    plan.tasks.forEach(task => {
      const taskStart = timeToMinutes(task.startTime);
      let taskEnd = timeToMinutes(task.endTime);
      
      // Cap task end time at day end time (don't count overtime)
      if (taskEnd > dayEnd) {
        taskEnd = dayEnd;
      }
      
      // Only count duration if task is within day bounds
      if (taskStart < dayEnd) {
        const duration = Math.max(0, taskEnd - taskStart);
        if (categoryTimes[task.category] !== undefined) {
          categoryTimes[task.category] += duration;
        }
      }
    });

    const totalAllocatedMinutes = categoryTimes.productive + categoryTimes.leisure + categoryTimes.break;
    const wastedMinutes = totalDayMinutes - totalAllocatedMinutes;
    const productivePercentage = totalDayMinutes > 0 
      ? ((categoryTimes.productive / totalDayMinutes) * 100).toFixed(1)
      : 0;

    return {
      totalDayMinutes,
      categoryTimes,
      wastedMinutes,
      productivePercentage,
      completedTasks: plan.tasks.filter(t => t.isCompleted).length,
      totalTasks: plan.tasks.length
    };
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'productive': return 'var(--neon-cyan)';
      case 'leisure': return 'var(--neon-pink)';
      case 'break': return 'var(--electric-yellow)';
      default: return 'var(--neon-purple)';
    }
  };

  return (
    <div className="analytics-container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← BACK
      </button>

      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p className="analytics-subtitle">Track your daily productivity records</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="no-data">
          <h2>No Data Available</h2>
          <p>You haven't created any plans yet. Start planning to see your analytics!</p>
          <button 
            onClick={() => navigate('/create-plan')}
            className="cyber-button"
          >
            CREATE YOUR FIRST PLAN
          </button>
        </div>
      ) : (
        <div className="analytics-list">
          {plans.map((plan) => {
            const stats = calculatePlanStats(plan);
            return (
              <div key={plan._id} className="analytics-card cyber-border">
                <div className="analytics-card-header">
                  <div className="plan-date-info">
                    <h3>{format(new Date(plan.date), 'EEEE, MMMM dd, yyyy')}</h3>
                    <p className="plan-time-range">
                      <span className="time-icon">⏰</span>
                      {plan.dayStartTime} - {plan.dayEndTime}
                    </p>
                  </div>
                  <div className="plan-completion-badge">
                    <span className="completion-text">
                      {stats.completedTasks}/{stats.totalTasks} Tasks
                    </span>
                  </div>
                </div>

                <div className="analytics-card-body">
                  {/* Productivity Rate */}
                  <div className="productivity-highlight">
                    <div className="productivity-circle" style={{ 
                      background: `conic-gradient(var(--vintage-terracotta) ${stats.productivePercentage}%, rgba(139, 111, 71, 0.1) ${stats.productivePercentage}%)`
                    }}>
                      <div className="productivity-inner">
                        <span className="productivity-percent">{stats.productivePercentage}%</span>
                        <span className="productivity-label-small">Productive</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="category-breakdown-grid">
                    {/* Productive */}
                    <div className="category-stat-box productive-box">
                      <div className="category-stat-header">
                        <span className="category-icon-large">💼</span>
                        <span className="category-stat-name">Productive</span>
                      </div>
                      <div className="category-stat-time">
                        {minutesToHoursFormat(stats.categoryTimes.productive)} hrs
                      </div>
                      <div className="category-stat-bar">
                        <div 
                          className="category-stat-fill"
                          style={{ 
                            width: `${(stats.categoryTimes.productive / stats.totalDayMinutes * 100)}%`,
                            background: getCategoryColor('productive')
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Leisure */}
                    <div className="category-stat-box leisure-box">
                      <div className="category-stat-header">
                        <span className="category-icon-large">🎮</span>
                        <span className="category-stat-name">Leisure</span>
                      </div>
                      <div className="category-stat-time">
                        {minutesToHoursFormat(stats.categoryTimes.leisure)} hrs
                      </div>
                      <div className="category-stat-bar">
                        <div 
                          className="category-stat-fill"
                          style={{ 
                            width: `${(stats.categoryTimes.leisure / stats.totalDayMinutes * 100)}%`,
                            background: getCategoryColor('leisure')
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Break */}
                    <div className="category-stat-box break-box">
                      <div className="category-stat-header">
                        <span className="category-icon-large">☕</span>
                        <span className="category-stat-name">Break</span>
                      </div>
                      <div className="category-stat-time">
                        {minutesToHoursFormat(stats.categoryTimes.break)} hrs
                      </div>
                      <div className="category-stat-bar">
                        <div 
                          className="category-stat-fill"
                          style={{ 
                            width: `${(stats.categoryTimes.break / stats.totalDayMinutes * 100)}%`,
                            background: getCategoryColor('break')
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Wasted */}
                    {stats.wastedMinutes > 0 && (
                      <div className="category-stat-box wasted-box">
                        <div className="category-stat-header">
                          <span className="category-icon-large">⏰</span>
                          <span className="category-stat-name">Wasted</span>
                        </div>
                        <div className="category-stat-time wasted-time">
                          {minutesToHoursFormat(stats.wastedMinutes)} hrs
                        </div>
                        <div className="category-stat-bar">
                          <div 
                            className="category-stat-fill"
                            style={{ 
                              width: `${(stats.wastedMinutes / stats.totalDayMinutes * 100)}%`,
                              background: 'var(--vintage-rose)'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Day Time */}
                  <div className="total-day-time">
                    <span className="total-label">TOTAL DAY TIME</span>
                    <span className="total-value">{minutesToHoursFormat(stats.totalDayMinutes)} hrs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Analytics;
