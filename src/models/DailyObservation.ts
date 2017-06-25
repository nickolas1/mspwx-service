import * as mongoose from 'mongoose';

export type DailyObsModel = mongoose.Document & {
    date: Date,
    high: string,
    low: string,
    precip: string,
    snowfall: string,
    snowdepth: string,
    obstime: string,
    obstime1: string,
    obstime2: string,
    obstime3: string,
    obstime4: string,
    year: number,
    month: number,
    day: number
};


const dailyObsSchema = new mongoose.Schema(
    {
        date: Date,
        high: String,
        low: String,
        precip: String,
        snowfall: String,
        snowdepth: String,
        obstime: String,
        obstime1: String,
        obstime2: String,
        obstime3: String,
        obstime4: String,
        year: Number,
        month: Number,
        day: Number
    },
    {
        collection : process.env.OBSERVATION_COLLECTION
    }
);

const DailyObs = mongoose.model('DailyObs', dailyObsSchema);
export default DailyObs;
