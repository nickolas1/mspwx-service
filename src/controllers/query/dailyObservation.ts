import {default as DailyObs, DailyObsModel} from '../../models/DailyObservation';
import {Request, Response} from 'express';
import {modelToDTO} from "./dailyObservation.dto";
// import { WriteError } from 'mongodb';
//const request = require('express-validator');


/**
 * GET /observation/:year?/:month?/:day?
 */
export let getObservation = (req: Request, res: Response) => {
    const query = {};
    if (req.params.year) query['year'] = +req.params.year;
    if (req.params.month) query['month'] = +req.params.month;
    if (req.params.day) query['day'] = +req.params.day;
    DailyObs.find(query,
        (err, observations: DailyObsModel[]) => {
            if (err) {
                return res.send(err);
            }
            return res.json(observations.map(obs => modelToDTO(obs)));
        });
};
