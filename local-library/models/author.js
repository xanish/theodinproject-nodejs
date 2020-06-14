var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
    firstname: { type: String, required: true, max: 100 },
    lastname: { type: String, required: true, max: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
});

// virtual to fetch the authors full name
AuthorSchema.virtual('name').get(function () {
    var name = '';
    if (this.lastname) {
        name += this.lastname + ', ';
    }

    if (this.firstname) {
        name += this.firstname;
    }

    return name;
});

// virtual to fetch the authors age
AuthorSchema.virtual('age').get(function () {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

// virtual to fetch the authors info url
AuthorSchema.virtual('url').get(function () {
    return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);
