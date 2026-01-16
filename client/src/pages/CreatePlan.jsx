import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { plansAPI } from '../services/api';
import './CreatePlan.css';

const CreatePlan = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dayStartTime, setDayStartTime] = useState('06:00');
  const [dayEndTime, setDayEndTime] = useState('23:00');
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    name: '',
    startTime: '',
    endTime: '',
    category: 'productive'
  });
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
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

  const handleCreatePlan = async () => {
    if (!dayStartTime || !dayEndTime) {
      toast.error('Please set day start and end times');
      return;
    }

    if (dayStartTime >= dayEndTime) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const response = await plansAPI.createPlan({
        date: selectedDate,
        dayStartTime,
        dayEndTime
      });
      setPlanId(response.data.plan._id);
      toast.success('Plan created! Now add your tasks.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!planId) {
      toast.error('Please create a plan first');
      return;
    }

    if (!currentTask.name || !currentTask.startTime || !currentTask.endTime) {
      toast.error('Please fill all task fields');
      return;
    }

    if (currentTask.startTime >= currentTask.endTime) {
      toast.error('Task end time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const response = await plansAPI.addTask(planId, currentTask);
      setTasks(response.data.plan.tasks);
      setCurrentTask({
        name: '',
        startTime: currentTask.endTime, // Next task starts where this one ends
        endTime: '',
        category: 'productive'
      });
      toast.success('Task added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal) return;

    setLoading(true);
    try {
      const response = await plansAPI.deleteTask(planId, deleteModal);
      setTasks(response.data.plan.tasks);
      toast.success('Task deleted');
      setDeleteModal(null);
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
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
    <div className="create-plan-container">
      {/* Live Clock Display */}
      <div className="live-clock">
        <span className="clock-label">Current Time:</span>
        <span className="clock-time">{formatTime12Hour(currentTime)}</span>
        <span className="clock-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</span>
      </div>

      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← BACK
      </button>

      <div className="create-plan-header">
        <h1 className="neon-text glitch" data-text="CREATE YOUR PLAN">
          CREATE YOUR PLAN
        </h1>
      </div>

      {/* Step 1: Select Date and Day Times */}
      {!planId && (
        <div className="plan-setup cyber-glow">
          <h2>STEP 1: SETUP YOUR DAY</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>SELECT DATE</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="cyber-input date-picker-scroll"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>DAY START TIME</label>
              <input
                type="time"
                value={dayStartTime}
                onChange={(e) => setDayStartTime(e.target.value)}
                className="cyber-input"
              />
            </div>

            <div className="form-group">
              <label>DAY END TIME</label>
              <input
                type="time"
                value={dayEndTime}
                onChange={(e) => setDayEndTime(e.target.value)}
                className="cyber-input"
              />
            </div>
          </div>

          <button 
            onClick={handleCreatePlan} 
            disabled={loading}
            className="cyber-button"
          >
            {loading ? 'CREATING...' : 'CREATE PLAN'}
          </button>
        </div>
      )}

      {/* Step 2: Add Tasks */}
      {planId && (
        <>
          <div className="plan-info cyber-border">
            <h3>PLAN FOR: {format(new Date(selectedDate), 'MMMM dd, yyyy')}</h3>
            <p>Duration: {dayStartTime} - {dayEndTime}</p>
          </div>

          <div className="task-form cyber-glow">
            <h2>ADD TASK</h2>

            <div className="form-group">
              <label>TASK NAME</label>
              <input
                type="text"
                value={currentTask.name}
                onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                placeholder="e.g., Study Mathematics"
                className="cyber-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>START TIME</label>
                <input
                  type="time"
                  value={currentTask.startTime}
                  onChange={(e) => setCurrentTask({ ...currentTask, startTime: e.target.value })}
                  className="cyber-input"
                />
              </div>

              <div className="form-group">
                <label>END TIME</label>
                <input
                  type="time"
                  value={currentTask.endTime}
                  onChange={(e) => setCurrentTask({ ...currentTask, endTime: e.target.value })}
                  className="cyber-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>CATEGORY</label>
              <div className="category-selector">
                <button
                  type="button"
                  className={`category-btn ${currentTask.category === 'productive' ? 'active' : ''}`}
                  onClick={() => setCurrentTask({ ...currentTask, category: 'productive' })}
                  style={{ 
                    borderColor: getCategoryColor('productive'),
                    color: currentTask.category === 'productive' ? getCategoryColor('productive') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">💼</span>
                  PRODUCTIVE
                </button>
                <button
                  type="button"
                  className={`category-btn ${currentTask.category === 'leisure' ? 'active' : ''}`}
                  onClick={() => setCurrentTask({ ...currentTask, category: 'leisure' })}
                  style={{ 
                    borderColor: getCategoryColor('leisure'),
                    color: currentTask.category === 'leisure' ? getCategoryColor('leisure') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">🎮</span>
                  LEISURE
                </button>
                <button
                  type="button"
                  className={`category-btn ${currentTask.category === 'break' ? 'active' : ''}`}
                  onClick={() => setCurrentTask({ ...currentTask, category: 'break' })}
                  style={{ 
                    borderColor: getCategoryColor('break'),
                    color: currentTask.category === 'break' ? getCategoryColor('break') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">☕</span>
                  BREAK
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddTask} 
              disabled={loading}
              className="cyber-button"
            >
              {loading ? 'ADDING...' : 'ADD TASK'}
            </button>
          </div>

          {/* Task List */}
          {tasks.length > 0 && (
            <div className="tasks-list">
              <h2>YOUR TASKS ({tasks.length})</h2>
              <div className="tasks-grid">
                {tasks.map((task) => (
                  <div key={task._id} className="task-card cyber-border">
                    <div className="task-header">
                      <span 
                        className="task-category"
                        style={{ color: getCategoryColor(task.category) }}
                      >
                        ■ {task.category.toUpperCase()}
                      </span>
                      <button 
                        onClick={() => setDeleteModal(task._id)}
                        className="delete-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <h3>{task.name}</h3>
                    <p className="task-time">{task.startTime} - {task.endTime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="plan-actions">
            <button 
              onClick={() => navigate('/my-plan')}
              className="cyber-button"
            >
              VIEW MY PLAN
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Task</h3>
            <p className="modal-hint">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                onClick={confirmDeleteTask}
                className="cyber-button"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setDeleteModal(null)}
                className="cyber-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePlan;
