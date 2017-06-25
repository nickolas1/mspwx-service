import {Request, Response} from 'express';
import {modelToDTO} from './distribution.dto';
import {default as DailyDist, DistributionModel} from "../../models/Distribution";


/**
 * GET /observation/:month/:day
 */
export let getDistribution = (req: Request, res: Response) => {
    const query = {};
    query['month'] = +req.params.month;
    query['day'] = +req.params.day;
    DailyDist.find(query,
        (err, observations: DistributionModel[]) => {
            if (err) {
                return res.send(err);
            }
            return res.json(modelToDTO(observations));
        });
};
