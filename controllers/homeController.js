const BigPromise = require('../middlewares/bigPromise')
//  One big note we can also use async await with try catch instead of Big Promise
exports.home = BigPromise(
    (req,res) => {
        res.status(200).json({
            success:true,
            gretting:"Hello from API"
        })
    }
)