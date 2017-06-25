/**
 * Module dependencies.
 */
import * as express from 'express';
import * as compression from 'compression';  // compresses requests
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import expressValidator = require('express-validator');
import * as cron from 'cron';


// const MongoStore = mongo(session);

/**
 * Load environment variables from .env file
 */
dotenv.config({ path: '.env' });


/**
 * Controllers (route handlers).
 */
import * as dailyObsController from './controllers/query/dailyObservation';
import * as distributionController from './controllers/query/distribution';
import * as obsCommands from './controllers/command/dailyObservationUpdate';


// import * as distCommands from './controllers/command/distributionUpdate';
// for (let m = 1; m <= 12; m++) {
//     for (let d = 1; d <= 31; d++) {
//         distCommands.updateDistribution(m, d);
//     }
// }

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
const db = (process.env.MONGODB_URI || process.env.MONGOLAB_URI) + '/' + process.env.MONGODB_NAME;
mongoose.connect(db);

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected: ', db);
});

mongoose.connection.on('error', () => {
    console.log('MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
});



/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());


app.get('/observation/:year?/:month?/:day?', dailyObsController.getObservation);
app.get('/distribution/:month/:day', distributionController.getDistribution);


// at 5am, get yesterday's data
cron.CronJob({
    cronTime: '0 5 * * *',
    onTick: function() {
        obsCommands.getMissingDailyObservations();
    },
    start: true,
    timezone: 'America/Chicago'
});
obsCommands.getMissingDailyObservations(); // check for new data at app launch as well

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
