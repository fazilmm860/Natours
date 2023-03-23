

const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        console.log(req.query);

        //Execute Query
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
        const tours = await features.query;


        //Send Response
        res.status(200).json({
            status: 'success',

            results: tours.length,
            data: {
                tours
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed',
            message: error
        })
    }


};
exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed',
            message: error
        })
    }


};
exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save();
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: "success",
            // data: {
            //     tours: newTour
            // }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed',
            message: 'Indvalid data send'
        })
    }


};
exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed',
            message: error
        })
    }


}
exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id)


        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'failed',
            message: error
        })
    }


}

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {

                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$reatingQuantity' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgprice: { $avg: '$price' },
                    minprice: { $min: '$price' },
                    maxprice: { $max: '$price' }
                }

            },
            {
                $sort: { avgprice: 1 }
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // }


        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });

    }
    catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}
exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }

            },
            {
                $addFields: { month: '$_id' }
            },

            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12
            }


        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}