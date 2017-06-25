import {DailyObsModel} from "../../models/DailyObservation";
export interface DailyObsDTO {
    date: Date;
    high: string;
    low: string;
    precip: string;
    snowfall: string;
    snowdepth: string;
}

export const modelToDTO = (model: DailyObsModel): DailyObsDTO => {
    return {
        date: model.date,
        high: model.high,
        low: model.low,
        precip: model.precip,
        snowfall: model.snowfall,
        snowdepth: model.snowdepth
    };
};
