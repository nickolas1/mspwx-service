import {DistributionModel, KDEPoint} from "../../models/Distribution";

export interface DailyDistDTO {
    month: number;
    day: number;
    kdes: KDE[];
}

export interface KDE {
    type: string;
    kde: KDEPoint[];
    unit: string;
    significant: number;
}

export const modelToDTO = (models: DistributionModel[]): DailyDistDTO => {
    return {
        month: models[0].month,
        day: models[0].day,
        kdes: models.map(m => {
            return {
                type: m.type,
                kde: m.kde,
                unit: m.unit,
                significant: m.significant
            };
        })
    };
};
