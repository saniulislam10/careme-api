const request = require('request');


exports.sendBulkSms = async (req, res, next) => {
    
    console.log("bulk sms")
    try {
        const message = req.body.message;
        const phoneNo = req.body.phoneNo;
        console.log(phoneNo);
        const url = 'http://66.45.237.70/api.php?username=' + process.env.bulkSmsUsername + '&password=' + process.env.bulkSmsPassword + '&number=' + phoneNo + '&message=' + message;
        // const url = 'http://66.45.237.70/maskingapi.php?username=' + process.env.bulkSmsUsername + '&password=' + process.env.bulkSmsPassword + '&number=' + phoneNo + '&message=' + message + '&senderid=' + process.env.bulkSmsSenderId;
        let result = '';
        let options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        request(options, function (error, response) {
            if (error) {
                console.log("Error", error)
                result = error;
            }
            if (response && response.body) {
                result = response.body;
                console.log("Success", result);
            }
        });

        res.status(200).json({
            success: true,
            message: 'Success',
        });

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


// exports.sendBulkSms = (req, res, next) => {
//     const message = req.body.message;
//     const phoneNo = req.body.phoneNo;
//     const apiEnd = process.env.SSL_SMS_API;
//     const mgsData = req.body;
//     const authData = {
//         user: process.env.SMSUSER,
//         pass: process.env.SMSPASS,
//         sid: process.env.SMSSID
//     }
//     const finalSmsData = {...authData, ...mgsData};

//     // GET
//     ax.get(apiEnd, {
//         params: finalSmsData
//     }).then(function (response) {
//         res.status(200).json({
//             success: true,
//             message: mgsData,
//             xmlRes: response.data.toString()
//         });
//     }).catch(function (error) {
//         console.log("error:");
//         res.status(200).json({
//             success: false,
//             message: mgsData,
//             xmlRes: error.toString()
//         });
//         console.log(error);
//     });

// }
