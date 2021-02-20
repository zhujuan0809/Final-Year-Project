const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const Staff = require('../models/Staff');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};
exports.getAdminLogin = (req, res, next) => {
 
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/Adminlogin', {
    path: '/Adminlogin',
    pageTitle: 'AdminLogin',
    errorMessage: message,
    oldInput: {
      staffNumber: '',
      password: '',
    },
    validationErrors: []
  });
};

exports.postAdminLogin = (req,res , next) => {
  const staffNumber = req.body.staffNumber;
  console.log(staffNumber);
  const password = req.body.password.toString();
  console.log(password);
  Staff.findOne({StaffNumber: staffNumber}).then(
    AdminUser => {
      console.log(AdminUser);
      if(!AdminUser){
        return res.status(422).render('auth/Adminlogin', {
          path: '/Adminlogin',
          pageTitle: 'AdminLogin',
          errorMessage: 'Staff Number Cannot be found',
          oldInput: {
            staffNumber: staffNumber,
          },
          validationErrors: []
        });
      }
      bcrypt.compare( password , AdminUser.Password ).then(
        doMatch => {
          console.log(doMatch);
          if(doMatch){
            req.session.isLoggedIn = true;
            req.session.user = AdminUser;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/admin/products');
            });
            
          }
          return res.status(422).render('auth/Adminlogin', {
            path: '/Adminlogin',
            pageTitle: 'AdminLogin',
            errorMessage: 'Invalid ID or password.',
            oldInput: {
              staffNumber: staffNumber,
            },
            validationErrors: []
          });
        }
      ).catch(err => {
        console.log(err);
      })
    }
  ).catch(
    err=>{
      console.log(err);
    }
  )
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      name: '',
      date: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.isAdmin = false;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const date = req.body.date;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        name: name,
        password: password,
        date: date.toString(),
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
        birthday: date.toString(),
        cart: { items: [] }
      });
      console.log(user);
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded!',
      //   html: '<h1>You successfully signed up!</h1>'
      // });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: '1181201779@student.mmu.edu.my',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProfile = (req , res , next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/');
  }
  const userId = req.params.userId;
  User.findById(userId).then(user => {
    if(!user){
      return res.redirect('/');
    }
    res.render('auth/edit-profile' , {
      pageTitle: 'Edit Profile',
      path: '/edit-profile',
      editing: editMode,
      RegisteredUser: user,
      admin: false,
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
  })
}

exports.postEditProfile = (req , res , next) => {
  const updatedemail = req.body.email;
  const updatedpassword = req.body.password;
  const updatedname = req.body.name;
  const updatedBirthdate = req.body.date;
  const userId = req.body.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/edit-profile', {
      pageTitle: 'Edit Profile',
      path: 'edit-profile',
      editing: true,
      hasError: true,
      admin: false,
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
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.isAdmin = false;
          console.log("Successfully Updated");
          res.redirect('/');
        }
        
      ).catch(
        err => {
          console.log(err);
        }
      )
    })

  })
}
