var mongoose = require('mongoose');
var moment = require('moment');

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
    var lifetime_string = '';
    if (this.date_of_birth) {
        lifetime_string = moment(this.date_of_birth).format('MMMM Do, YYYY');
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
        lifetime_string += moment(this.date_of_death).format('MMMM Do, YYYY');
    }
    return lifetime_string;
});

// virtual to fetch the authors info url
AuthorSchema.virtual('url').get(function () {
    return '/catalog/author/' + this._id;
});

AuthorSchema.virtual('dob').get(function () {
    return this.date_of_birth ? moment(this.date_of_birth).format('MMM Do, YYYY') : '';
});

AuthorSchema.virtual('dod').get(function () {
    return this.date_of_death ? moment(this.date_of_death).format('MMM Do, YYYY') : '';
});

module.exports = mongoose.model('Author', AuthorSchema);
