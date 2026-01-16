import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { plansAPI } from '../services/api';
import './MyPlan.css';

const MyPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedDate, setSelectedDate] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adjustTime, setAdjustTime] = useState({});
  const [showAdjustModal, setShowAdjustModal] = useState(null);
  const [deletePlanModal, setDeletePlanModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    task: '',
    startTime: '',
    endTime: '',
    category: 'productive'
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await plansAPI.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const response = await plansAPI.getPlanByDate(selectedDate);
      setSearchResult(response.data.plan);
      setCurrentPlan(response.data.plan);
      setViewMode('detail');
    } catch (error) {
      setSearchResult('not-found');
      setCurrentPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = (plan) => {
    setCurrentPlan(plan);
    setViewMode('detail');
    setSearchResult(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentPlan(null);
    setSearchResult(null);
    setSelectedDate('');
  };

  const handleAddTask = async () => {
    if (!currentPlan) {
      toast.error('No plan selected');
      return;
    }

    // Check if current plan is today's plan
    const today = format(new Date(), 'yyyy-MM-dd');
    const planDate = format(new Date(currentPlan.date), 'yyyy-MM-dd');
    
    if (planDate !== today) {
      toast.error('Can only add tasks to today\'s plan');
      return;
    }

    if (!newTask.task || !newTask.startTime || !newTask.endTime) {
      toast.error('Please fill all task fields');
      return;
    }

    setLoading(true);
    try {
      const response = await plansAPI.addTask(currentPlan._id, {
        name: newTask.task,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        category: newTask.category
      });
      setCurrentPlan(response.data.plan);
      setShowAddTaskModal(false);
      setNewTask({ task: '', startTime: '', endTime: '', category: 'productive' });
      toast.success('Task added successfully!');
      await fetchPlans(); // Refresh the plans list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({
      id: task._id,
      task: task.name,
      startTime: task.startTime,
      endTime: task.endTime,
      category: task.category
    });
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async () => {
    if (!currentPlan || !editingTask) {
      toast.error('No task selected');
      return;
    }

    // Check if current plan is today's plan
    const today = format(new Date(), 'yyyy-MM-dd');
    const planDate = format(new Date(currentPlan.date), 'yyyy-MM-dd');
    
    if (planDate !== today) {
      toast.error('Can only edit tasks in today\'s plan');
      return;
    }

    if (!editingTask.task || !editingTask.startTime || !editingTask.endTime) {
      toast.error('Please fill all task fields');
      return;
    }

    setLoading(true);
    try {
      const response = await plansAPI.updateTask(currentPlan._id, editingTask.id, {
        name: editingTask.task,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime,
        category: editingTask.category
      });
      setCurrentPlan(response.data.plan);
      setShowEditTaskModal(false);
      setEditingTask(null);
      toast.success('Task updated successfully!');
      await fetchPlans(); // Refresh the plans list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, withAdjustment = false) => {
    if (!currentPlan) return;

    setLoading(true);
    try {
      const actualEndTime = withAdjustment ? adjustTime[taskId] : undefined;
      const response = await plansAPI.completeTask(currentPlan._id, taskId, actualEndTime);
      setCurrentPlan(response.data.plan);
      setShowAdjustModal(null);
      setAdjustTime({});
      toast.success(withAdjustment ? 'Task completed with time adjustment!' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePlan = async () => {
    if (!currentPlan) return;

    setLoading(true);
    try {
      await plansAPI.deletePlan(currentPlan._id);
      setCurrentPlan(null);
      await fetchPlans();
      setViewMode('list');
      toast.success('Plan deleted');
      setDeletePlanModal(false);
    } catch (error) {
      toast.error('Failed to delete plan');
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productive': return '⚡';
      case 'leisure': return '🎮';
      case 'break': return '☕';
      default: return '📌';
    }
  };

  const calculateProgress = () => {
    if (!currentPlan || currentPlan.tasks.length === 0) return 0;
    const completed = currentPlan.tasks.filter(t => t.isCompleted).length;
    return (completed / currentPlan.tasks.length) * 100;
  };

  // Convert time string (HH:MM) to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to hours.minutes format (e.g., 90 -> "1.30")
  const minutesToHoursFormat = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}.${String(minutes).padStart(2, '0')}`;
  };

  // Calculate time statistics for the plan
  const calculateTimeStats = () => {
    if (!currentPlan) return null;

    // Total day duration
    const dayStart = timeToMinutes(currentPlan.dayStartTime);
    const dayEnd = timeToMinutes(currentPlan.dayEndTime);
    const totalDayMinutes = dayEnd - dayStart;

    // Calculate time per category
    const categoryTimes = {
      productive: 0,
      leisure: 0,
      break: 0
    };

    currentPlan.tasks.forEach(task => {
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

    // Calculate total allocated time
    const totalAllocatedMinutes = categoryTimes.productive + categoryTimes.leisure + categoryTimes.break;

    // Calculate wasted time (unallocated time)
    const wastedMinutes = totalDayMinutes - totalAllocatedMinutes;

    // Calculate productive percentage
    const productivePercentage = totalDayMinutes > 0 
      ? ((categoryTimes.productive / totalDayMinutes) * 100).toFixed(1)
      : 0;

    return {
      totalDayMinutes,
      categoryTimes,
      wastedMinutes,
      productivePercentage,
      totalDayFormatted: minutesToHoursFormat(totalDayMinutes),
      productiveFormatted: minutesToHoursFormat(categoryTimes.productive),
      leisureFormatted: minutesToHoursFormat(categoryTimes.leisure),
      breakFormatted: minutesToHoursFormat(categoryTimes.break),
      wastedFormatted: minutesToHoursFormat(wastedMinutes)
    };
  };

  // Check if a task is overdue (passed end time but not completed)
  const isTaskOverdue = (task) => {
    if (task.isCompleted) return false;
    if (!currentPlan) return false;

    // Only check for today's plan
    const planDate = new Date(currentPlan.date);
    const today = new Date();
    
    // Check if plan is for today
    const isTodaysPlan = 
      planDate.getDate() === today.getDate() &&
      planDate.getMonth() === today.getMonth() &&
      planDate.getFullYear() === today.getFullYear();
    
    if (!isTodaysPlan) return false; // Don't mark as overdue if not today's plan

    // Get current time
    const now = currentTime;
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Parse task end time
    const [taskHours, taskMinutes] = task.endTime.split(':').map(Number);
    
    // Compare times - task is overdue if current time is past task end time
    if (currentHours > taskHours) return true;
    if (currentHours === taskHours && currentMinutes > taskMinutes) return true;
    
    return false;
  };

  // Format time to 12-hour format
  const formatTime12Hour = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  };

  // Check if current plan is today's plan
  const isTodaysPlan = (plan) => {
    if (!plan) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    const planDate = format(new Date(plan.date), 'yyyy-MM-dd');
    return planDate === today;
  };

  return (
    <div className="my-plan-container">
      {/* Live Clock Display */}
      <div className="live-clock">
        <span className="clock-label">Current Time:</span>
        <span className="clock-time">{formatTime12Hour(currentTime)}</span>
        <span className="clock-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</span>
      </div>

      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← BACK
      </button>

      <div className="my-plan-header">
        <h1>My Plans</h1>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Date Search Section */}
          <div className="date-search-section cyber-glow">
            <h3>SEARCH PLAN BY DATE</h3>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="cyber-input"
              />
              <button 
                onClick={handleSearch}
                className="cyber-button"
                disabled={loading || !selectedDate}
              >
                {loading ? 'SEARCHING...' : 'SEARCH'}
              </button>
            </div>

            {searchResult === 'not-found' && (
              <div className="search-not-found">
                <p>No plan found for {format(new Date(selectedDate), 'MMMM dd, yyyy')}</p>
                <button 
                  onClick={() => navigate('/create-plan')}
                  className="cyber-button"
                >
                  CREATE PLAN FOR THIS DAY
                </button>
              </div>
            )}
          </div>

          {/* All Plans List */}
          <div className="plans-list-section">
            <h3>ALL YOUR PLANS</h3>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="no-plans">
                <p>You haven't created any plans yet.</p>
                <button 
                  onClick={() => navigate('/create-plan')}
                  className="cyber-button"
                >
                  CREATE YOUR FIRST PLAN
                </button>
              </div>
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div 
                    key={plan._id} 
                    className="plan-card cyber-border"
                    onClick={() => handleViewPlan(plan)}
                  >
                    <div className="plan-card-header">
                      <h4>{format(new Date(plan.date), 'EEEE')}</h4>
                      <p className="plan-date">{format(new Date(plan.date), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div className="plan-card-body">
                      <div className="plan-card-time">
                        <span className="time-icon">⏰</span>
                        <span>{plan.dayStartTime} - {plan.dayEndTime}</span>
                      </div>
                      <div className="plan-card-stats">
                        <div className="stat-item">
                          <span className="stat-number">{plan.tasks.length}</span>
                          <span className="stat-label">Tasks</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{plan.tasks.filter(t => t.isCompleted).length}</span>
                          <span className="stat-label">Done</span>
                        </div>
                      </div>
                      {isTodaysPlan(plan) && (
                        <span className="today-badge">TODAY</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : currentPlan ? (
          <>
          <button onClick={handleBackToList} className="back-btn" style={{ marginBottom: '20px' }}>
            ← BACK TO LIST
          </button>

          <div className="plan-header-info cyber-glow">
            <div className="plan-title">
              <h2>{format(new Date(currentPlan.date), 'EEEE, MMMM dd, yyyy')}</h2>
              <p>{currentPlan.dayStartTime} - {currentPlan.dayEndTime}</p>
            </div>
            <div className="plan-stats">
              <div className="stat">
                <span className="stat-label">TOTAL TASKS</span>
                <span className="stat-value">{currentPlan.tasks.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">COMPLETED</span>
                <span className="stat-value completed">
                  {currentPlan.tasks.filter(t => t.isCompleted).length}
                </span>
              </div>
            </div>
            <div className="plan-actions-btns">
              {isTodaysPlan(currentPlan) && (
                <button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="cyber-button"
                  style={{ padding: '14px 28px', marginRight: '15px' }}
                >
                  + ADD TASK
                </button>
              )}
              <button 
                onClick={() => setDeletePlanModal(true)}
                className="delete-plan-btn"
              >
                DELETE PLAN
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-label">
              <span>PROGRESS</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Tasks Timeline */}
          <div className="tasks-timeline">
            {currentPlan.tasks
              .sort((a, b) => {
                // Sort tasks by start time
                const timeA = timeToMinutes(a.startTime);
                const timeB = timeToMinutes(b.startTime);
                return timeA - timeB;
              })
              .map((task, index) => (
              <div 
                key={task._id} 
                className={`timeline-task ${task.isCompleted ? 'completed' : ''} cyber-border`}
                style={{ borderLeftColor: getCategoryColor(task.category) }}
              >
                <div className="task-number" style={{ background: getCategoryColor(task.category) }}>
                  {index + 1}
                </div>

                <div className="task-content">
                  <div className="task-main-info">
                    <div className="task-title-row">
                      <h3>{task.name}</h3>
                      {isTaskOverdue(task) && (
                        <span className="overdue-indicator" title="Task is overdue!">
                          🔴
                        </span>
                      )}
                      <span className="task-icon">{getCategoryIcon(task.category)}</span>
                    </div>
                    <div className="task-meta">
                      <span 
                        className="task-category-badge"
                        style={{ 
                          borderColor: getCategoryColor(task.category),
                          color: getCategoryColor(task.category)
                        }}
                      >
                        {task.category.toUpperCase()}
                      </span>
                      <span className="task-time-badge">
                        {task.startTime} → {task.endTime}
                      </span>
                    </div>
                    {task.actualEndTime && task.actualEndTime !== task.endTime && (
                      <div className="task-adjustment">
                        <span className="adjustment-label">⚠ Adjusted:</span>
                        <span className="adjustment-time">Actually ended at {task.actualEndTime}</span>
                      </div>
                    )}
                  </div>

                  {!task.isCompleted && (
                    <div className="task-actions">
                      {isTodaysPlan(currentPlan) && (
                        <button 
                          onClick={() => handleEditTask(task)}
                          className="edit-btn"
                        >
                          ✏️ EDIT
                        </button>
                      )}
                      <button 
                        onClick={() => handleCompleteTask(task._id)}
                        className="complete-btn"
                      >
                        ✓ MARK DONE
                      </button>
                      <button 
                        onClick={() => setShowAdjustModal(task._id)}
                        className="adjust-btn"
                      >
                        ⏱ ADJUST TIME
                      </button>
                    </div>
                  )}

                  {task.isCompleted && (
                    <div className="task-completed-badge">
                      <span>✓ COMPLETED</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="plan-summary cyber-glow">
            <h3>CATEGORY BREAKDOWN</h3>
            
            {/* Total Day Time */}
            {calculateTimeStats() && (
              <>
                <div className="time-stat-row total-time">
                  <span className="time-stat-label">TOTAL DAY TIME</span>
                  <span className="time-stat-value">{calculateTimeStats().totalDayFormatted} hrs</span>
                </div>

                {/* Category Times */}
                <div className="category-time-stats">
                  <div className="category-time-item">
                    <div className="category-time-header">
                      <span className="category-icon-display">💼</span>
                      <span className="category-time-label">PRODUCTIVE</span>
                    </div>
                    <div className="category-time-value">{calculateTimeStats().productiveFormatted} hrs</div>
                    <div className="category-time-bar">
                      <div 
                        className="category-time-fill productive-fill"
                        style={{ 
                          width: `${(calculateTimeStats().categoryTimes.productive / calculateTimeStats().totalDayMinutes * 100)}%`,
                          background: getCategoryColor('productive')
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="category-time-item">
                    <div className="category-time-header">
                      <span className="category-icon-display">🎮</span>
                      <span className="category-time-label">LEISURE</span>
                    </div>
                    <div className="category-time-value">{calculateTimeStats().leisureFormatted} hrs</div>
                    <div className="category-time-bar">
                      <div 
                        className="category-time-fill leisure-fill"
                        style={{ 
                          width: `${(calculateTimeStats().categoryTimes.leisure / calculateTimeStats().totalDayMinutes * 100)}%`,
                          background: getCategoryColor('leisure')
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="category-time-item">
                    <div className="category-time-header">
                      <span className="category-icon-display">☕</span>
                      <span className="category-time-label">BREAK</span>
                    </div>
                    <div className="category-time-value">{calculateTimeStats().breakFormatted} hrs</div>
                    <div className="category-time-bar">
                      <div 
                        className="category-time-fill break-fill"
                        style={{ 
                          width: `${(calculateTimeStats().categoryTimes.break / calculateTimeStats().totalDayMinutes * 100)}%`,
                          background: getCategoryColor('break')
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Wasted Time */}
                  {calculateTimeStats().wastedMinutes > 0 && (
                    <div className="category-time-item wasted-item">
                      <div className="category-time-header">
                        <span className="category-icon-display">⏰</span>
                        <span className="category-time-label">WASTED / UNALLOCATED</span>
                      </div>
                      <div className="category-time-value wasted-value">{calculateTimeStats().wastedFormatted} hrs</div>
                      <div className="category-time-bar">
                        <div 
                          className="category-time-fill wasted-fill"
                          style={{ 
                            width: `${(calculateTimeStats().wastedMinutes / calculateTimeStats().totalDayMinutes * 100)}%`,
                            background: 'var(--vintage-rose)'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Productivity Percentage */}
                <div className="productivity-percentage">
                  <div className="productivity-label">PRODUCTIVITY RATE</div>
                  <div className="productivity-value">{calculateTimeStats().productivePercentage}%</div>
                  <div className="productivity-bar">
                    <div 
                      className="productivity-fill"
                      style={{ 
                        width: `${calculateTimeStats().productivePercentage}%`,
                        background: `linear-gradient(90deg, ${getCategoryColor('productive')}, var(--vintage-sage))`
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
          </>
      ) : null}

      {/* Delete Plan Confirmation Modal */}
      {deletePlanModal && (
        <div className="modal-overlay" onClick={() => setDeletePlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Entire Plan</h3>
            <p className="modal-hint">
              Are you sure you want to delete this entire plan? This action cannot be undone and will remove all tasks.
            </p>
            <div className="modal-actions">
              <button 
                onClick={confirmDeletePlan}
                className="cyber-button"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, var(--vintage-terracotta), #b36b50)', borderColor: 'var(--vintage-terracotta)' }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete Plan'}
              </button>
              <button 
                onClick={() => setDeletePlanModal(false)}
                className="cyber-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Plan Confirmation Modal */}
      {deletePlanModal && (
        <div className="modal-overlay" onClick={() => setDeletePlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Entire Plan</h3>
            <p className="modal-hint">
              Are you sure you want to delete this entire plan? This action cannot be undone and will remove all tasks.
            </p>
            <div className="modal-actions">
              <button 
                onClick={confirmDeletePlan}
                className="cyber-button"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, var(--vintage-terracotta), #b36b50)', borderColor: 'var(--vintage-terracotta)' }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete Plan'}
              </button>
              <button 
                onClick={() => setDeletePlanModal(false)}
                className="cyber-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal-content cyber-glow" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Task</h3>
            <p className="modal-hint">
              Add a new task to today's plan
            </p>
            
            <div className="form-group">
              <label>TASK NAME</label>
              <input
                type="text"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                className="cyber-input"
                placeholder="What do you need to do?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>START TIME</label>
                <input
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                  className="cyber-input"
                />
              </div>
              <div className="form-group">
                <label>END TIME</label>
                <input
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                  className="cyber-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>CATEGORY</label>
              <div className="category-selector">
                <button
                  type="button"
                  className={`category-btn ${newTask.category === 'productive' ? 'active' : ''}`}
                  onClick={() => setNewTask({ ...newTask, category: 'productive' })}
                  style={{ 
                    borderColor: getCategoryColor('productive'),
                    color: newTask.category === 'productive' ? getCategoryColor('productive') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">💼</span>
                  PRODUCTIVE
                </button>
                <button
                  type="button"
                  className={`category-btn ${newTask.category === 'leisure' ? 'active' : ''}`}
                  onClick={() => setNewTask({ ...newTask, category: 'leisure' })}
                  style={{ 
                    borderColor: getCategoryColor('leisure'),
                    color: newTask.category === 'leisure' ? getCategoryColor('leisure') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">🎮</span>
                  LEISURE
                </button>
                <button
                  type="button"
                  className={`category-btn ${newTask.category === 'break' ? 'active' : ''}`}
                  onClick={() => setNewTask({ ...newTask, category: 'break' })}
                  style={{ 
                    borderColor: getCategoryColor('break'),
                    color: newTask.category === 'break' ? getCategoryColor('break') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">☕</span>
                  BREAK
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleAddTask}
                className="cyber-button"
                disabled={loading}
              >
                {loading ? 'ADDING...' : 'ADD TASK'}
              </button>
              <button 
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTask({ task: '', startTime: '', endTime: '', category: 'productive' });
                }}
                className="cyber-button-secondary"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="modal-overlay" onClick={() => setShowEditTaskModal(false)}>
          <div className="modal-content cyber-glow" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Task</h3>
            <p className="modal-hint">
              Update task details. Conflicting tasks will be automatically shifted.
            </p>
            
            <div className="form-group">
              <label>TASK NAME</label>
              <input
                type="text"
                value={editingTask.task}
                onChange={(e) => setEditingTask({ ...editingTask, task: e.target.value })}
                className="cyber-input"
                placeholder="What do you need to do?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>START TIME</label>
                <input
                  type="time"
                  value={editingTask.startTime}
                  onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
                  className="cyber-input"
                />
              </div>
              <div className="form-group">
                <label>END TIME</label>
                <input
                  type="time"
                  value={editingTask.endTime}
                  onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })}
                  className="cyber-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>CATEGORY</label>
              <div className="category-selector">
                <button
                  type="button"
                  className={`category-btn ${editingTask.category === 'productive' ? 'active' : ''}`}
                  onClick={() => setEditingTask({ ...editingTask, category: 'productive' })}
                  style={{ 
                    borderColor: getCategoryColor('productive'),
                    color: editingTask.category === 'productive' ? getCategoryColor('productive') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">💼</span>
                  PRODUCTIVE
                </button>
                <button
                  type="button"
                  className={`category-btn ${editingTask.category === 'leisure' ? 'active' : ''}`}
                  onClick={() => setEditingTask({ ...editingTask, category: 'leisure' })}
                  style={{ 
                    borderColor: getCategoryColor('leisure'),
                    color: editingTask.category === 'leisure' ? getCategoryColor('leisure') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">🎮</span>
                  LEISURE
                </button>
                <button
                  type="button"
                  className={`category-btn ${editingTask.category === 'break' ? 'active' : ''}`}
                  onClick={() => setEditingTask({ ...editingTask, category: 'break' })}
                  style={{ 
                    borderColor: getCategoryColor('break'),
                    color: editingTask.category === 'break' ? getCategoryColor('break') : 'var(--neon-purple)'
                  }}
                >
                  <span className="category-icon">☕</span>
                  BREAK
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleUpdateTask}
                className="cyber-button"
                disabled={loading}
              >
                {loading ? 'UPDATING...' : 'UPDATE TASK'}
              </button>
              <button 
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                }}
                className="cyber-button-secondary"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Time Modal */}
      {showAdjustModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(null)}>
          <div className="modal-content cyber-glow" onClick={(e) => e.stopPropagation()}>
            <h3>ADJUST COMPLETION TIME</h3>
            <p className="modal-hint">
              Enter the actual time this task was completed.<br/>
              All subsequent tasks will be adjusted automatically.
            </p>
            <div className="form-group">
              <label>ACTUAL END TIME</label>
              <input
                type="time"
                value={adjustTime[showAdjustModal] || ''}
                onChange={(e) => setAdjustTime({ ...adjustTime, [showAdjustModal]: e.target.value })}
                className="cyber-input"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => handleCompleteTask(showAdjustModal, true)}
                className="cyber-button"
                disabled={!adjustTime[showAdjustModal]}
              >
                COMPLETE WITH ADJUSTMENT
              </button>
              <button 
                onClick={() => setShowAdjustModal(null)}
                className="cyber-button-secondary"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlan;
