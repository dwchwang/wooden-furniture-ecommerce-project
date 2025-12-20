import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { verifyJWT, optionalJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin routes (must be before public routes to avoid slug conflict)
router.get('/admin/all', verifyJWT, blogController.getAllBlogsForAdmin);
router.get('/admin/:id', verifyJWT, blogController.getBlogById);

// Public routes
router.get('/', blogController.getBlogs);
router.get('/:slug', optionalJWT, blogController.getBlogBySlug); // Optional auth to allow preview

// Protected routes (require authentication)
router.post('/:id/like', verifyJWT, blogController.toggleLike);

// Admin/Staff routes (require authentication + admin/staff role)
router.post('/', verifyJWT, blogController.createBlog);
router.put('/:id', verifyJWT, blogController.updateBlog);
router.delete('/:id', verifyJWT, blogController.deleteBlog);

export default router;
