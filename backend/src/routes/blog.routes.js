import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Protected routes (require authentication)
router.post('/:id/like', verifyJWT, blogController.toggleLike);

// Admin/Staff routes (require authentication + admin/staff role)
router.post('/', verifyJWT, blogController.createBlog);
router.put('/:id', verifyJWT, blogController.updateBlog);
router.delete('/:id', verifyJWT, blogController.deleteBlog);

export default router;
