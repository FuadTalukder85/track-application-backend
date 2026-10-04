import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationStats,
} from '../controllers/jobApplicationController';

const router = Router();

// Stats endpoint
router.get('/stats', getApplicationStats);

// Main CRUD endpoints
router.route('/')
  .post(createApplication)
  .get(getApplications);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .patch(updateApplication)
  .delete(deleteApplication);

export default router;
