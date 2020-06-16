var Author = require('../models/author');
var Book = require('../models/book');

var async = require('async');
var { body, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = (req, res, next) => {

    Author.find()
        .sort([['lastname', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });

};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
    
    async.parallel({

        author: function (callback) {

            Author.findById(req.params.id)
                .exec(callback);

        },

        author_books: function (callback) {

            Book.find({ author: req.params.id }, 'title summary')
                .exec(callback);

        }
    }, (err, results) => {
        if (err) { return next(err); }

        if (results.author == null) {
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }

        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.author_books });
    });

};

// Display Author create form on GET.
exports.author_create_get = (req, res) => {
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [

    body('firstname').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),

    body('lastname').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),

    // checkFalsy will accept either an empty string or null as an EMPTY value
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    sanitizeBody('firstname').escape(),
    sanitizeBody('lastname').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    (req, res, next) => {

        var errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
        }
        else {
            var author = new Author({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save(function (err) {
                if (err) { return next(err); }
                
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST');
};
