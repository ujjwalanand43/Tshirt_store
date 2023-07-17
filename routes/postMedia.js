const express = require('express');
const router = express.Router();

const {
    addMedia,
    getAllData,
    getSingleMedia
} = require('../controllers/mediaController');

const { isLoggedIn, customRole } = require('../middlewares/user');


// all media get api is in post file route because it's getting error

// Admin only Post
router.route('/admin/dashboard/addMedia').post(isLoggedIn, customRole('admin'), addMedia);



router.route('/admin/dashboard/media/:id')
    .get(isLoggedIn, customRole('admin'), getSingleMedia)
    //     .put(isLoggedIn, customRole('admin'), updateSinglePost)

//     .delete(isLoggedIn, customRole('admin'), deleteSinglePost)

module.exports = router;