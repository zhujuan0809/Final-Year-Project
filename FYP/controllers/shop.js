const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator/check');
const Event = require('../models/event');
const Order = require('../models/order');
const SearchResult = require('../models/SearchResult');
const Feedback = require('../models/feedback');
const User = require('../models/user');
exports.getProducts = (req, res, next) => {
  Event.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        search: false
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(req.session.user);
  Event.findById(prodId)
    .then(product => {
      Feedback.find({eventId: prodId}).then(
        feedback => {
         
              
              res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
                userId: req.session.user._id,
                username: req.session.user.name,
                feedback: feedback,
                
    
              });   
            
           
        }
      )
      
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
    
  
};

exports.getIndex = (req, res, next) => {
  Event.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddEvent = (req, res, next) => {
  res.render('shop/user-add-event', {
    pageTitle: 'Add Event',
    path: '/user-add-event',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddEvent = (req, res, next) => {
  
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const venue = req.body.venue;
  if (!image) {
    
    return res.status(422).render('shop/user-add-event', {
      pageTitle: 'Add Event',
      path: '/user-add-event',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('shop/user-add-event', {
      pageTitle: 'Add Event',
      path: '/user-add-event',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const event = new Event({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
    date: date.toString(),
    time: time.toString(),
    venue: venue

  });
  event
    .save()
    .then(result => {
      console.log(result);
      console.log('Created Product');
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      
      const products = user.cart.items;
      console.log(products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Event.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};

exports.getSearch = (req, res, next) => {
  Event.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/search',
        search: true
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.PostSearch = (req, res, next) => {
  const EventTitle = req.body.searchName;
  Event.findOne({title: EventTitle}).then(
    searchEvent => {
      const searchEventResult = new SearchResult({
        title: searchEvent.title,
        price: searchEvent.price,
        description: searchEvent.description,
        imageUrl: searchEvent.imageUrl,
        userId: req.user,
        date: searchEvent.date.toString(),
        time: searchEvent.time.toString(),
        venue: searchEvent.venue,
        EventId: searchEvent._id,
      })
      searchEventResult.save().then(
        result=>{
          console.log('Successfully Created Result');
          res.redirect('/searchResult')
        }
      )
    }
    
  ).catch(err => {
    if(err){
      return res.render('shop/NoResult',{
        pageTitle: 'No Result',
        path: "/search"
      })
    }
    
  })
}

exports.getSearchResult = (req , res , next) => {
  SearchResult.find().then(
    result=>{
      res.render('shop/SearchResult', {
        prods: result,
        pageTitle: 'All Products',
        path: '/search',
        search: true
      });
      
      
    }
  ).then(
    result => {
      SearchResult.remove().then(result => {
        console.log("Successfully Removed");
      })
    }
  )
}

exports.postFeedback = (req , res , next) => {
  const userId = req.body.userId;
  const eventId = req.body.eventId;
  const feedback = req.body.feedback;
  const username = req.body.username;
  const FeedBack = new Feedback({
    userId: userId,
    eventId: eventId,
    feedback: feedback,
    username: username
  });
  FeedBack.save().then(
    result=>{
      console.log("Feedback Saved");
      res.redirect('/products/'+eventId);
    }
  )
}


