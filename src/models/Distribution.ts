import * as mongoose from 'mongoose';

export type DistributionModel = mongoose.Document & {
    type: string,
    month: number,
    day: number,
    unit: string,
    kde: KDEPoint[],
    significant: number
};

export interface KDEPoint {
    value: number;
    density: number;
}

const distributionSchema = new mongoose.Schema(
    {
        type: String,
        month: Number,
        day: Number,
        unit: String,
        kde: Array,
        significant: Number
    },
    {
        collection : process.env.DISTRIBUTION_COLLECTION
    }
);

const DailyDist = mongoose.model('DailyDist', distributionSchema);
export default DailyDist;
