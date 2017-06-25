import * as moment from "moment-timezone";
import * as request from "request";
import {default as DailyObs, DailyObsModel} from "../../models/DailyObservation";
import {updateDistribution} from './distributionUpdate';

/**
 * update observation collection with new daily data
 *
 * not actually accessible via API at the moment
 */
export let getMissingDailyObservations = function() {
    // query ACIS for latest data
    const sid = "mspthr"; // station we're querying
    // determine the last day we want to have an observation for
    const edate = moment().tz("America/Chicago").startOf("day").subtract(1, "day");
    const elems = [
        {"name": "maxt", "interval": "dly", "duration": "dly"},
        {"name": "mint", "interval": "dly", "duration": "dly"},
        {"name": "pcpn", "interval": "dly", "duration": "dly"},
        {"name": "snow", "interval": "dly", "duration": "dly"},
        {"name": "snwd", "interval": "dly", "duration": "dly"}
    ];
    const meta = "name";
    const url = "http://data.rcc-acis.org/StnData";

    // determine last observation that we have
    DailyObs
        .find()
        .sort({date: -1})
        .limit(1)
        .exec((err, docs: DailyObsModel[]) => {
            if (err) console.log("error from Mongo: ", err);
            const sdate = moment.utc(docs[0].date).add(1, "day");

            if (sdate.isSameOrBefore(edate)) {
                // get data from ACIS
                const params = {
                    sid: sid,
                    sdate: sdate.format("YYYY-MM-DD"),
                    edate: edate.format("YYYY-MM-DD"),
                    elems: elems,
                    meta: meta
                };
                const opts = {
                    url: url,
                    method: "POST",
                    json: params
                };
                request(opts, (acisErr, resp, body) => {
                    if (acisErr) console.log("request error: ", err);
                    // insert data into mongo
                    body.data.forEach(d => {
                        const date = moment.utc(d[0]);
                        const query = { date: date };
                        const options = { upsert: true };
                        const year = date.year();
                        const month = date.month() + 1;
                        const day = date.date();
                        const update = {
                            date: date,
                            high: d[1],
                            low: d[2],
                            precip: d[3],
                            snowfall: d[4],
                            snowdepth: d[5],
                            year: year,
                            month: month,
                            day: day
                        };
                        DailyObs.update(query, update, options, (updateErr, raw) => {
                            if (updateErr) console.log("mongo update error: ", updateErr);
                            console.log("mongo raw response to update: ", raw);

                            // update the KDE estimate as well
                            updateDistribution(month, day);
                        });
                    });
                });
            }
        });
};
