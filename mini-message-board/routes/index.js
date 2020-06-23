var express = require('express');
var router = express.Router();

const messages = [
  {
    text: "Hi there!",
    user: "Amando",
    added: new Date()
  },
  {
    text: "Hello World!",
    user: "Charles",
    added: new Date()
  }
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mini Message Board', messages: messages });
});

/* GET new page. */
router.get('/new', function(req, res, next) {
  res.render('form', { title: 'Add New Message' });
});

router.post('/new', function(req, res, next) {
  const msg = {
    text: req.body.message,
    user: req.body.user,
    added: new Date()
  };
  messages.push(msg);
  res.redirect('/');
});

module.exports = router;
