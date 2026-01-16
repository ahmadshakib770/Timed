import { validationResult } from 'express-validator';
import Plan from '../models/Plan.js';

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Helper function to adjust subsequent tasks (domino effect)
const adjustSubsequentTasks = (tasks, startIndex, delayMinutes) => {
  for (let i = startIndex; i < tasks.length; i++) {
    const task = tasks[i];
    const startMins = timeToMinutes(task.startTime);
    const endMins = timeToMinutes(task.endTime);
    
    task.startTime = minutesToTime(startMins + delayMinutes);
    task.endTime = minutesToTime(endMins + delayMinutes);
  }
  return tasks;
};

// @desc    Create a new plan for a day
// @route   POST /api/plans
// @access  Private
export const createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, dayStartTime, dayEndTime } = req.body;

    // Check if plan already exists for this date
    // Create start and end of day to handle timezone issues
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Creating plan for date:', date);
    console.log('Start of day:', startOfDay);
    console.log('End of day:', endOfDay);

    const existingPlan = await Plan.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingPlan) {
      console.log('Found existing plan:', existingPlan.date);
      return res.status(400).json({ 
        message: 'Plan already exists for this date',
        existingDate: existingPlan.date
      });
    }

    const plan = await Plan.create({
      userId: req.user._id,
      date: startOfDay,
      dayStartTime,
      dayEndTime,
      tasks: []
    });

    res.status(201).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all plans for user
// @route   GET /api/plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get plan for specific date
// @route   GET /api/plans/:date
// @access  Private
export const getPlanByDate = async (req, res) => {
  try {
    // Create start and end of day to handle timezone issues
    const startOfDay = new Date(req.params.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(req.params.date);
    endOfDay.setHours(23, 59, 59, 999);

    const plan = await Plan.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!plan) {
      return res.status(404).json({ message: 'No plan found for this date' });
    }

    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add task to plan
// @route   POST /api/plans/:planId/tasks
// @access  Private
export const addTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, startTime, endTime, category } = req.body;

    const plan = await Plan.findOne({
      _id: req.params.planId,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const newStartMins = timeToMinutes(startTime);
    const newEndMins = timeToMinutes(endTime);
    const dayStartMins = timeToMinutes(plan.dayStartTime);
    const dayEndMins = timeToMinutes(plan.dayEndTime);

    // Validate times
    if (newEndMins <= newStartMins) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Validate task is within day time boundaries
    if (newStartMins < dayStartMins) {
      return res.status(400).json({ 
        message: `Task start time (${startTime}) cannot be before day start time (${plan.dayStartTime})` 
      });
    }

    if (newEndMins > dayEndMins) {
      return res.status(400).json({ 
        message: `Task end time (${endTime}) cannot exceed day end time (${plan.dayEndTime})` 
      });
    }

    // Add new task first
    const newTask = {
      name,
      startTime,
      endTime,
      category,
      order: plan.tasks.length,
      isCompleted: false,
      isNew: true // Mark as new task for priority
    };

    plan.tasks.push(newTask);

    // Sort all tasks by start time, but keep new task prioritized (stable sort)
    plan.tasks.sort((a, b) => {
      const aTime = timeToMinutes(a.startTime);
      const bTime = timeToMinutes(b.startTime);
      // If times are equal and one is new, new task comes first
      if (aTime === bTime && (a.isNew || b.isNew)) {
        return a.isNew ? -1 : 1;
      }
      return aTime - bTime;
    });

    // Now resolve all conflicts by shifting tasks forward
    let hasConflicts = true;
    let iterations = 0;
    const maxIterations = plan.tasks.length * 2; // Prevent infinite loops

    while (hasConflicts && iterations < maxIterations) {
      hasConflicts = false;
      iterations++;

      for (let i = 0; i < plan.tasks.length - 1; i++) {
        const currentTask = plan.tasks[i];
        const nextTask = plan.tasks[i + 1];

        const currentEndMins = timeToMinutes(currentTask.endTime);
        const nextStartMins = timeToMinutes(nextTask.startTime);
        const nextEndMins = timeToMinutes(nextTask.endTime);

        // Check if tasks overlap
        if (currentEndMins > nextStartMins) {
          hasConflicts = true;
          
          // Shift next task to start right after current task
          const nextDuration = nextEndMins - nextStartMins;
          const newNextStart = currentEndMins;
          const newNextEnd = newNextStart + nextDuration;

          // Check if shifted task fits within day
          if (newNextEnd > dayEndMins) {
            // Remove the new task since we can't fit everything
            plan.tasks.pop();
            return res.status(400).json({ 
              message: `Cannot add task: Total duration would exceed day end time (${plan.dayEndTime}).` 
            });
          }

          nextTask.startTime = minutesToTime(newNextStart);
          nextTask.endTime = minutesToTime(newNextEnd);
        }
      }

      // Re-sort after changes
      if (hasConflicts) {
        plan.tasks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      }
    }

    // Remove the isNew flag before saving
    newTask.isNew = undefined;
    
    // Update order
    plan.tasks.forEach((task, index) => {
      task.order = index;
    });

    plan.updatedAt = Date.now();
    await plan.save();

    res.status(201).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task details with conflict resolution
// @route   PUT /api/plans/:planId/tasks/:taskId
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { name, startTime, endTime, category } = req.body;

    const plan = await Plan.findOne({
      _id: req.params.planId,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields if provided
    if (name) task.name = name;
    if (category) task.category = category;

    // Handle time updates with conflict resolution
    if (startTime || endTime) {
      const newStartTime = startTime || task.startTime;
      const newEndTime = endTime || task.endTime;
      
      const newStartMins = timeToMinutes(newStartTime);
      const newEndMins = timeToMinutes(newEndTime);
      const dayStartMins = timeToMinutes(plan.dayStartTime);
      const dayEndMins = timeToMinutes(plan.dayEndTime);

      // Validate times
      if (newEndMins <= newStartMins) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }

      if (newStartMins < dayStartMins) {
        return res.status(400).json({ 
          message: `Task start time cannot be before day start time (${plan.dayStartTime})` 
        });
      }

      if (newEndMins > dayEndMins) {
        return res.status(400).json({ 
          message: `Task end time cannot exceed day end time (${plan.dayEndTime})` 
        });
      }

      // Store original times for cascade calculation
      const originalStartMins = timeToMinutes(task.startTime);
      const originalEndMins = timeToMinutes(task.endTime);
      
      // Calculate time deltas
      const startDelta = newStartMins - originalStartMins;  // How much start time changed
      const endDelta = newEndMins - originalEndMins;        // How much end time changed
      
      // Update current task time first
      task.startTime = newStartTime;
      task.endTime = newEndTime;
      task.updatedAt = Date.now();

      // Sort all tasks by start time
      plan.tasks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      // Find the index of the updated task
      const taskIndex = plan.tasks.findIndex(t => t._id.toString() === task._id.toString());

      if (taskIndex !== -1) {
        // CASCADE DOWN: Shift all tasks AFTER this one by the same end time delta
        for (let i = taskIndex + 1; i < plan.tasks.length; i++) {
          const currTask = plan.tasks[i];
          const currStartMins = timeToMinutes(currTask.startTime);
          const currEndMins = timeToMinutes(currTask.endTime);

          // Shift this task by the same amount
          const newCurrStartMins = currStartMins + endDelta;
          const newCurrEndMins = currEndMins + endDelta;

          // Check if shifted task goes beyond day boundaries
          if (newCurrStartMins < dayStartMins || newCurrEndMins > dayEndMins) {
            return res.status(400).json({ 
              message: `Cannot update: cascading changes would push task '${currTask.name}' outside day boundaries (${plan.dayStartTime} - ${plan.dayEndTime}).` 
            });
          }

          currTask.startTime = minutesToTime(newCurrStartMins);
          currTask.endTime = minutesToTime(newCurrEndMins);
        }

        // CASCADE UP: Shift all tasks BEFORE this one by the same start time delta
        for (let i = taskIndex - 1; i >= 0; i--) {
          const currTask = plan.tasks[i];
          const currStartMins = timeToMinutes(currTask.startTime);
          const currEndMins = timeToMinutes(currTask.endTime);

          // Shift this task by the start delta
          const newCurrStartMins = currStartMins + startDelta;
          const newCurrEndMins = currEndMins + startDelta;

          // Check if shifted task goes beyond day boundaries
          if (newCurrStartMins < dayStartMins || newCurrEndMins > dayEndMins) {
            return res.status(400).json({ 
              message: `Cannot update: cascading changes would push task '${currTask.name}' outside day boundaries (${plan.dayStartTime} - ${plan.dayEndTime}).` 
            });
          }

          currTask.startTime = minutesToTime(newCurrStartMins);
          currTask.endTime = minutesToTime(newCurrEndMins);
        }
      }
    }

    // Sort tasks by start time (final sort)
    plan.tasks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    // Update order
    plan.tasks.forEach((task, index) => {
      task.order = index;
    });

    plan.updatedAt = Date.now();
    await plan.save();

    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark task as complete
// @route   PUT /api/plans/:planId/tasks/:taskId/complete
// @access  Private
export const completeTask = async (req, res) => {
  try {
    const { actualEndTime } = req.body;

    const plan = await Plan.findOne({
      _id: req.params.planId,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isCompleted = true;

    // If actualEndTime is provided and different, apply domino effect
    if (actualEndTime && actualEndTime !== task.endTime) {
      const originalEndMins = timeToMinutes(task.endTime);
      const actualEndMins = timeToMinutes(actualEndTime);
      const delayMinutes = actualEndMins - originalEndMins;

      task.actualEndTime = actualEndTime;

      // Adjust all subsequent tasks
      if (delayMinutes !== 0) {
        const taskIndex = plan.tasks.findIndex(t => t._id.toString() === task._id.toString());
        if (taskIndex !== -1 && taskIndex < plan.tasks.length - 1) {
          plan.tasks = adjustSubsequentTasks(plan.tasks, taskIndex + 1, delayMinutes);
        }
      }
    }

    plan.updatedAt = Date.now();
    await plan.save();

    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/plans/:planId/tasks/:taskId
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.planId,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.tasks = plan.tasks.filter(task => task._id.toString() !== req.params.taskId);
    
    // Update order
    plan.tasks.forEach((task, index) => {
      task.order = index;
    });

    plan.updatedAt = Date.now();
    await plan.save();

    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete entire plan
// @route   DELETE /api/plans/:planId
// @access  Private
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({
      _id: req.params.planId,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
