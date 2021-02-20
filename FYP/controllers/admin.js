const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

const Event = require('../models/event');
const Staff = require('../models/Staff');
const User = require('../models/user');
exports.getAddEvent = (req, res, next) => {
  res.render('admin/edit-event', {
    pageTitle: 'Add Event',
    path: '/admin/add-Event',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const venue = req.body.venue;
  console.log(date);
  console.log(time);
  console.log(venue);
  if (!image) {
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
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

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
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
      // console.log(result);
      console.log('Created Product');
      res.redirect('products');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Event.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-event', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const updatedBirthdate = req.body.date;
  const updatedVenue = req.body.venue;
  const updatedTime = req.body.time;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
        date: updatedBirthdate.toString(),
        time: updatedTime.toString(),
        venue: updatedVenue,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Event.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.date =  updatedBirthdate.toString();
      product.time =  updatedTime.toString();
      product.venue =  updatedVenue;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Event.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Event.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Event.deleteOne({ _id: prodId });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getAddStaff = (req , res , next) => {
  res.render('admin/add-staff',{
    pageTitle: 'Add Staff',
    path: '/admin/add-Staff',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  })
}

exports.postAddStaff = (req , res , next) => {
  const staffNumber = req.body.StaffNumber;
  const staffName = req.body.StaffName;
  const PositionTitle = req.body.Stafftitle;
  const staffRating = req.body.rating;
  const salary = req.body.salary;
  const password = req.body.password;
  
  

  const errors = validationResult(req);
  console.log(errors.array());
  if(!errors.isEmpty()){
    return res.status(422).render('admin/add-staff',{
      pageTitle: 'Add Staff',
      path: '/admin/add-Staff',
      editing: false,
      hasError: true,
      Staff:{
        StaffNumber: staffNumber,
        StaffName: staffName,
        PositionTitle: PositionTitle,
        StaffRating: staffRating,
        Salary: salary,
        Password: password
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }
  
  bcrypt.hash(password, 12).then(
    hashedPassword => {
      const staff = new Staff({
        StaffNumber: staffNumber,
        StaffName : staffName,
        PositionTitle: PositionTitle,
        StaffRating: staffRating,
        Salary: salary,
        Password: hashedPassword
      });
      return staff.save().then(
        result=> {
          res.redirect('/admin/staff')
          console.log('Successfully save staff details')
        }
      ).catch(err => {
        console.log(err);
      });
    }
  )

}

exports.getStaff = (req , res , next) => {
  Staff.find().then(
    staff => {
      res.render('admin/Staff' , {
        pageTitle: 'Staff',
        path: '/admin/staff',
        staff: staff
      });
      
    }
  ).catch(err => {
    console.log(err);
  })
}

exports.getEditStaff = (req , res , next) => {
  const editMode = req.query.edit;
  const staffID = req.params.staffID;
  Staff.findById(staffID).then(
    staff => {
      res.render('admin/add-staff' , {
        pageTitle: 'Edit-Staff',
        path: '/admin/edit-staff',
        Staff: staff,
        editing: editMode,
        hasError: true,
        errorMessage: null,
        validationErrors: [],
      });
      
    }
  ).catch(err => {
    console.log(err);
  })
}

exports.postEditStaff = (req , res , next) => {
  const staffId = req.body.StaffID;
  const updatedstaffNumber = req.body.StaffNumber;
  const updatedstaffName = req.body.StaffName;
  const updatedPositionTitle = req.body.Stafftitle;
  const updatedstaffRating = req.body.rating;
  const updatedsalary = req.body.salary;
  const updatedpassword = req.body.password;

  const errors = validationResult(req);
  console.log(errors.array());
  if(!errors.isEmpty()){
    return res.status(422).render('admin/add-staff',{
      pageTitle: 'Add Staff',
      path: '/admin/add-Staff',
      editing: false,
      hasError: true,
      Staff:{
        StaffNumber: updatedstaffNumber,
        StaffName: updatedstaffName,
        PositionTitle: updatedPositionTitle,
        StaffRating: updatedstaffRating,
        Salary: updatedsalary,
        Password: updatedpassword
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }
  bcrypt.hash(updatedpassword , 12).then(
    hashedPassword => {
      Staff.findById(staffId).then(
        staff => {
          staff.StaffNumber = updatedstaffNumber;
          staff.StaffName = updatedstaffName;
          staff.PositionTitle = updatedPositionTitle;
          staff.StaffRating = updatedstaffRating
          staff.Salary = updatedsalary;
          staff.Password = hashedPassword;
          return staff.save().then(
            result => {
            console.log("successfully Edit Staff");
            res.redirect('/admin/staff');
            }).catch(
              err => {
                console.log(err);
              }
            )
        }
      )
    }
  )
}

exports.postDeleteStaff = (req , res , next) => {
  const staffID = req.body.staffID;
  
  Staff.findById(staffID).then(
    staff => {
      console.log(req.session.user._id);
      console.log(staff._id);
      if(staff._id.toString() == req.session.user._id.toString()){
        return staff.deleteOne().then(
          result => {
            console.log("Successfully Delete Staff 12345");
            req.session.destroy(err => {
              console.log(err);
              res.redirect('/');
            });
          }
        )
        
      }
      else{
        console.log('false');
      }
      return staff.deleteOne().then(
        result => {
          console.log("Successfully Delete Staff");
          res.redirect('/admin/staff');
        }

      )
    }
  ).catch(
    err => {
      console.log(err);
    }
  )
  
}
exports.getUser = (req,res, next) => {
  User.find().then(
    user => {
      res.render('admin/user' , {
        pageTitle: 'User',
        path: '/admin/User',
        Registereduser: user
      });
      
    }
  ).catch(err => {
    console.log(err);
  })
}

exports.getEditUser = (req,res, next) => {
  const userID = req.params.userID;
  const editMode = req.query.edit;
  User.findById(userID).then(
    user => {
      if(!user){
        res.redirect('/admin/user');
      }
      res.render('auth/edit-profile' , {
        pageTitle: 'Edit User',
        path: '/edit-User',
        editing: editMode,
        RegisteredUser: user,
        admin: true,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        oldInput: {
          email: '',
          name: '',
          date: '',
          oldpassword:'',
          password: '',
          confirmPassword: ''
        }
      })
    }
  )
}

exports.postEditUser = (req , res , next) => {
  console.log('hello');
  const updatedemail = req.body.email;
  const updatedpassword = req.body.password;
  const updatedname = req.body.name;
  const updatedBirthdate = req.body.date.toString();
  const userId = req.body.userId;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/edit-profile', {
      pageTitle: 'Edit Profile',
      path: 'edit-profile',
      editing: true,
      hasError: true,
      admin: true,
      RegisteredUser: {
        email: updatedemail,
        name: updatedname,
        birthday: updatedBirthdate,
        oldpassword:'',
        password: '',
        confirmPassword: ''
      },
      oldInput: {
        email: updatedemail,
        name: updatedname,
        birthday: updatedBirthdate,
        oldpassword:'',
        password: '',
        confirmPassword: ''
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  User.findById(userId).then(user => {
    bcrypt.hash(updatedpassword , 12).then(hashedPassword => {
      user.email = updatedemail;
      user.name = updatedname;
      user.birthday = updatedBirthdate;
      user.password = hashedPassword;
      return user.save().then(
        result => {
          console.log("Successfully Updated");
          res.redirect('/admin/user');
        }
        
      ).catch(
        err => {
          console.log(err);
        }
      )
    })

  })
}

exports.postDeleteUser = (req , res , next) => {
  const UserID = req.body.userID;
  User.findById(UserID)
    .then(user => {
      if (!user) {
        return next(new Error('Product not found.'));
      }
      return User.deleteOne({ _id: UserID });
    })
    .then(() => {
      console.log('DESTROYED USER');
      res.redirect('/admin/user');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}