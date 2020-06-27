var Author = require('../models/author');
var Book = require('../models/book');

var async = require('async');
var validator = require('express-validator');

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

    validator.body('firstname').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.')
        .escape(),

    validator.body('lastname').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.')
        .escape(),

    // checkFalsy will accept either an empty string or null as an EMPTY value
    validator.body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),

    validator.body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

        var errors = validator.validationResult(req);

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
exports.author_delete_get = (req, res, next) => {
    
    async.parallel({

        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },

        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }

        if (results.author==null) {
            res.redirect('/catalog/authors');
        }

        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    
    async.parallel({
        
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },

        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }

        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });

};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST');
};
