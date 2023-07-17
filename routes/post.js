const express = require('express');
const router = express.Router();
const {
    getAllData,
} = require('../controllers/mediaController');
const {
    addPost,
    getAllPost,
    getSinglePost,
    updateSinglePost,
    deleteSinglePost
} = require('../controllers/postController');

const { isLoggedIn, customRole } = require('../middlewares/user');

// all media files here get route 

// router.route('/admin/dashboard/allmedia').get(isLoggedIn, customRole('admin'), getAllData)
router.route('/admin/dashboard/allmedia').get(getAllData)
    // Admin only Post
router.route('/admin/dashboard/addPost').post(isLoggedIn, customRole('admin'), addPost);

router.route('/admin/dashboard/getPost').get(isLoggedIn, customRole('admin'), getAllPost);

router.route('/admin/dashboard/:id')
    .put(isLoggedIn, customRole('admin'), updateSinglePost)
    .get(isLoggedIn, customRole('admin'), getSinglePost)
    .delete(isLoggedIn, customRole('admin'), deleteSinglePost)



module.exports = router;