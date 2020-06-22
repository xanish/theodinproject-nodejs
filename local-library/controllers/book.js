var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/book-instance');

var async = require('async');
var validator = require('express-validator');

exports.index = (req, res) => {

    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function (callback) {
            BookInstance.countDocuments({ status: 'Available' }, callback);
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });

};

// Display list of all books.
exports.book_list = (req, res, next) => {

    // select title and author fields from Books schema
    // and populate the value of author from its reference
    Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, list_books) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('book_list', { title: 'Book List', book_list: list_books });
        });

};

// Display detail page for a specific book.
exports.book_detail = (req, res) => {

    async.parallel({

        book: function (callback) {

            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);

        },

        book_instance: function (callback) {

            BookInstance.find({ book: req.params.id })
                .exec(callback);

        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.book == null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
    });

};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {

    async.parallel({

        authors: function (callback) {
            Author.find(callback);
        },

        genres: function (callback) {
            Genre.find(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }

        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};

// Handle book create on POST.
exports.book_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    validator.body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    validator.body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    validator.body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    validator.body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        var errors = validator.validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({

                authors: function (callback) {
                    Author.find(callback);
                },
                
                genres: function (callback) {
                    Genre.find(callback);
                },
            
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                
                res.redirect(book.url);
            });
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = (req, res, next) => {
    
    async.parallel({

        book: function (callback) {

            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);

        },

        book_instance: function (callback) {

            BookInstance.find({ book: req.params.id })
                .exec(callback);

        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.book == null) {
            res.redirect('/catalog/books');
        }

        res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instance });
    });

};

// Handle book delete on POST.
exports.book_delete_post = (req, res, next) => {
    
    async.parallel({

        book: function (callback) {
            Book.findById(req.body.bookid)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },

        book_instance: function (callback) {
            BookInstance.find({ book: req.body.bookid }).exec(callback);
        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.book_instance.length > 0) {
            res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instance });
        }
        else {
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - go to book list
                res.redirect('/catalog/books');
            });
        }
    });

};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update POST');
};
