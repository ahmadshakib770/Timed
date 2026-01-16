import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createPlan,
  getPlans,
  getPlanByDate,
  addTask,
  updateTask,
  completeTask,
  deleteTask,
  deletePlan
} from '../controllers/planController.js';

const router = express.Router();

// @route   POST /api/plans
// @desc    Create a new plan for a day
// @access  Private
router.post('/', protect, [
  body('date').isISO8601(),
  body('dayStartTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('dayEndTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
], createPlan);

// @route   GET /api/plans
// @desc    Get all plans for user
// @access  Private
router.get('/', protect, getPlans);

// @route   GET /api/plans/:date
// @desc    Get plan for specific date
// @access  Private
router.get('/:date', protect, getPlanByDate);

// @route   POST /api/plans/:planId/tasks
// @desc    Add task to plan
// @access  Private
router.post('/:planId/tasks', protect, [
  body('name').trim().notEmpty(),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('category').isIn(['productive', 'leisure', 'break'])
], addTask);

// @route   PUT /api/plans/:planId/tasks/:taskId
// @desc    Update task details
// @access  Private
router.put('/:planId/tasks/:taskId', protect, [
  body('name').optional().trim().notEmpty(),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('category').optional().isIn(['productive', 'leisure', 'break'])
], updateTask);

// @route   PUT /api/plans/:planId/tasks/:taskId/complete
// @desc    Mark task as complete
// @access  Private
router.put('/:planId/tasks/:taskId/complete', protect, [
  body('actualEndTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
], completeTask);

// @route   DELETE /api/plans/:planId/tasks/:taskId
// @desc    Delete a task
// @access  Private
router.delete('/:planId/tasks/:taskId', protect, deleteTask);

// @route   DELETE /api/plans/:planId
// @desc    Delete entire plan
// @access  Private
router.delete('/:planId', protect, deletePlan);

export default router;
