
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')

const app = express();

// 1) MIDDLEWARES
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})



// 3) ROUTES




app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'failed',
    //     message: `Cant find ${req.originalUrl} on this server`
    // })
    // next();
    const err = new Error(`Cant find ${req.originalUrl} on this server`);
    err.status = 'failed';
    err.statuCode = 404;

    next(err)
});

app.use((err, req, res, next) => {
    err.statuCode = err.statuCode || 500;
    err.status = err.status || error;

    res.status(err.statuCode).json({
        status: err.status,
        message: err.message
    });
    next();
})


//4)START SEREVERS
module.exports = app;