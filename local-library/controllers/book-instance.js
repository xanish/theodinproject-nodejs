var Book = require('../models/book');
var BookInstance = require('../models/book-instance');

var validator = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {

    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });

};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookInstance) {
            if (err) { return next(err); }

            if (bookInstance == null) {
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }

            res.render('bookinstance_detail', { title: 'Copy: ' + bookInstance.book.title, bookinstance: bookInstance });
        });

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {

    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }

            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
        });

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    validator.body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    validator.body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    validator.body('status').trim().escape(),
    validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        var errors = validator.validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
                });
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
    
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }

            if (bookinstance==null) {
                res.redirect('/catalog/bookinstances');
            }

            res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance:  bookinstance});
        });

};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res) => {
    
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        if (err) { return next(err); }

        res.redirect('/catalog/bookinstances');
    });

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
