var Book = require('../models/book');
var Genre = require('../models/genre');

var async = require('async');
var validator = require('express-validator');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
    
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genres) {
            if (err) { return next(err); }
            
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });

};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
    
    async.parallel({

        genre: function (callback) {

            Genre.findById(req.params.id)
                .exec(callback);

        },

        genre_books: function (callback) {

            Book.find({ genre: req.params.id })
                .exec(callback);

        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.genre == null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    });

};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [

    validator.body('name', 'Genre name required').trim().isLength({ min: 1}).escape(),

    (req, res, next) => {

        var errors = validator.validationResult(req);

        var genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
        }
        else {
            Genre.findOne({ name: req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function (err) {
                            if (err) { return next(err); }

                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
    
    async.parallel({

        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },

        genre_books: function (callback) {
            Book.find({ genre: req.params.id }).exec(callback);
        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.genre==null) {
            res.redirect('/catalog/genres');
        }

        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
    
    async.parallel({

        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },

        genre_books: function (callback) {
            Book.find({ genre: req.body.genreid }).exec(callback);
        }

    }, (err, results) => {
        if (err) { return next(err); }

        if (results.genre_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
        }
        else {
            // Genre has no books. Delete object and redirect to the list of genre.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to genre list
                res.redirect('/catalog/genres')
            });
        }
    });

};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
