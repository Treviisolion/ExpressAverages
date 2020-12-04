const express = require('express');
const ExpressError = require('./err.js');

const app = express();

/**
 * Returns an array of numbers given a string of comma-delineated numbers
 * @param {String} string 
 */
const breakInput = string => {
    try {
        const arr = string.split(',').filter(v => v !== '');
        if (arr.length === 0) throw "nums must have numbers";
        return arr.map(v => {
            if (isNaN(parseFloat(v))) throw `${v} is not a number`;
            else return parseFloat(v);
        })
    } catch (e) {
        if (typeof e === 'string') throw new ExpressError(e, 400);
        else throw new ExpressError("nums must be present as query parameter", 400);
    }
}

/**
 * Returns the mean of the numbers
 * @param {Array[floats]} nums 
 */
const calculateMean = nums => {
    return nums.reduce((tot, v) => tot + v) / nums.length;
}

/**
 * Returns the median of the numbers
 * @param {Array[floats]} nums 
 */
const calculateMedian = nums => {
    return nums.length % 2 === 1 ? nums[Math.floor(nums.length / 2)] : (nums[nums.length / 2] + nums[nums.length / 2 - 1]) / 2;
}

/**
 * Returns the mode of the numbers
 * @param {Array[floats]} nums 
 */
const calculateMode = nums => {
    const frequencies = {}
    for (let num of nums) {
        if (frequencies[num]) frequencies[num] += 1;
        else frequencies[num] = 1;
    }
    let mode = null;
    let freq = 0;
    for (let num in frequencies) {
        if (frequencies[num] > freq) {
            freq = frequencies[num];
            mode = num;
        }
    }
    return mode;
}

app.get('/mean', (req, res, next) => {
    try {
        const nums = breakInput(req.query.nums);
        const mean = calculateMean(nums);
        return res.json({
            response: {
                operation: 'mean',
                value: mean
            }
        });
    } catch (e) {
        return next(e);
    }
});

app.get('/median', (req, res, next) => {
    try {
        const nums = breakInput(req.query.nums).sort();
        const median = calculateMedian(nums);
        return res.json({
            response: {
                operation: 'median',
                value: median
            }
        });
    } catch (e) {
        return next(e);
    }
});

app.get('/mode', (req, res, next) => {
    try {
        const nums = breakInput(req.query.nums);
        const mode = calculateMode(nums);
        return res.json({
            response: {
                operation: 'mode',
                value: mode
            }
        });
    } catch (e) {
        return next(e);
    }
});

app.get('/all', (req, res, next) => {
    try {
        const nums = breakInput(req.query.nums).sort();
        const mean = calculateMean(nums);
        const median = calculateMedian(nums);
        const mode = calculateMode(nums);
        return res.json({
            response: {
                operation: 'all',
                mean: mean,
                median: median,
                mode: mode
            }
        });
    } catch (e) {
        return next(e);
    }
})

// 404 handler
app.use(function (req, res, next) {
    const notFoundError = new ExpressError("Not Found", 404);
    return next(notFoundError)
});

// generic error handler
app.use(function (err, req, res, next) {
    // the default status is 500 Internal Server Error
    let status = err.status || 500;
    let message = err.message;

    // set the status and alert the user
    return res.status(status).json({
        error: {
            message,
            status
        }
    });
});
// end generic handler
app.listen(3000, function () {
    console.log('Server is listening on port 3000');
});