const cors = require('cors');

let whitelist;
if (process.env.PRODUCTION_BUILD === 'true') {
    whitelist = ['http://localhost:4200', 'http://192.168.68.10:4200', 'http://localhost:8100', 'https://caremein.softlabit.com', 'https://www.caremein.softlabit.com'];
} else {
    whitelist = ['http://localhost:4200', 'http://192.168.68.10:4200', 'http://localhost:8100', 'https://caremein.softlabit.com', 'https://www.caremein.softlabit.com'];
}

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(
                new Error('Not allowed by CORS')
            )
        }
    }
}

module.exports = cors(corsOptions);
