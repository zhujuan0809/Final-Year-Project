const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/search', isAuth, shopController.getSearch);

router.post('/searchResult', isAuth, shopController.PostSearch);

router.get('/searchResult', isAuth, shopController.getSearchResult);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/feedback', isAuth, shopController.postFeedback);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/user-add-event', isAuth, shopController.getAddEvent);

router.post('/user-add-event',[
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ], isAuth, shopController.postAddEvent);
  
module.exports = router;
