const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const sulgify = require('slugify');
const validator = require('validator');
const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, ' A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 character'],
        minlength: [5, 'A tour name must have more or equal than 10 character'],
        // validate: [validator.isAlpha, 'Tour name must be only contain characters']

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy , medium, difficult'
        }

    },

    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5.0']
    },
    reatingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //THIS ONLY POINTS TO CURRENT DOCUMENT ON NEW DOCUMENT CREATION
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'

        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must havea coverImage']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String

    },
    location: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
        },
        {
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]



},

    {

        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next();
});
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

// tourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromise)
//     next();
// })

// tourSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// });
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// })

//queryMiddleWare
// tourSchema.pre('find', function (next)
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);

    next();
});
//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    console.log(this.pipeline());
    next();
})
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;