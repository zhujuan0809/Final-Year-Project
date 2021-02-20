const path = require('path');

const express = require('express');
const {check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const Staff = require('../models/Staff');
const router = express.Router();

// /admin/add-product => GET
router.get('/add-Event', isAuth, adminController.getAddEvent);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-Event',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-Event',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get('/add-Staff', isAuth, adminController.getAddStaff);

router.post('/add-Staff',[
  check('StaffNumber').isNumeric().isLength({min:5}).custom(
    (value , {req}) => {
      return Staff.findOne({StaffNumber: value}).then(
        staff => {
          if(staff){
            throw new Error('Staff Number exists');
          }
          return true;
        }
      )
    }
  ),
  check('rating').custom((value , {req})=> {
    if(value < 1 || value > 10){
      throw new Error("The Rating must be between 1-10");
    }
    return true;
  }),
  body("salary").isFloat(),
  body("password").isLength({min: 5 , max: 15})
] ,isAuth, adminController.postAddStaff);

router.get('/staff' , isAuth , adminController.getStaff);

router.get('/staff' , isAuth , adminController.getStaff);

router.get('/edit-staff/:staffID' , isAuth , adminController.getEditStaff);

router.post('/edit-staff' ,[
  body('StaffNumber').isNumeric().isLength({min:5}),
  check('rating').custom((value , {req})=> {
    if(value < 1 || value > 10){
      throw new Error("The Rating must be between 1-10");
    }
    return true;
  }),
  body("salary").isFloat(),
  body("password").isLength({min: 5 , max: 15})
], isAuth , adminController.postEditStaff);

router.get('/edit-staff/:staffID' , isAuth , adminController.getEditStaff);

router.post('/delete-staff' , isAuth , adminController.postDeleteStaff);

router.get('/user' , isAuth , adminController.getUser);

router.get('/edit-user/:userID' , isAuth , adminController.getEditUser);

router.post('/edit-profile', [
 
  body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ], adminController.postEditUser);

router.post('/delete-user' , isAuth , adminController.postDeleteUser);

module.exports = router;
