import * as d3 from 'd3';
import {default as DailyObs, DailyObsModel} from '../../models/DailyObservation';
import {default as DailyDist, KDEPoint} from '../../models/Distribution';


const PRECIP_TRACE = 0.001;
const SNOW_TRACE = 0.01;

/**
 * update kernel density estimates for temps, precip, snowfall and depth for a month and day
 *
 * not actually accessible via API at the moment
 *
 * @param month
 * @param day
 */
export let updateDistribution = function(month: number, day: number): void {
    const query = {month: month, day: day};
    DailyObs.find(query,
        (err, observations: DailyObsModel[]) => {
            if (observations.length) {
                const highs = observations.map(d => +d.high)
                    .filter(d => !isNaN(d)).sort((a, b) => a - b);
                const lows = observations.map(d => +d.low)
                    .filter(d => !isNaN(d)).sort((a, b) => a - b);
                const precips = observations.map(d => d.precip === 'T' ? PRECIP_TRACE : +d.precip)
                    .filter(d => !isNaN(d)).sort((a, b) => a - b);
                const snowfalls = observations.map(d => d.snowfall === 'T' ? SNOW_TRACE : +d.snowfall)
                    .filter(d => !isNaN(d)).sort((a, b) => a - b);
                const snowdepths = observations.map(d => d.snowdepth === 'T' ? SNOW_TRACE : +d.snowdepth)
                    .filter(d => !isNaN(d)).sort((a, b) => a - b);

                const highCount = highs.length;
                const lowCount = lows.length;
                const precipCount = precips.filter(p => p > PRECIP_TRACE).length;
                const snowfallCount = snowfalls.filter(p => p > SNOW_TRACE).length;
                const snowdepthCount = snowdepths.filter(p => p > SNOW_TRACE).length;

                const tempMin = d3.min([...lows, ...highs]);
                const tempMax = d3.max([...lows, ...highs]);

                updateType('precip', month, day, precips, 'inches', precipCount);
                updateType('snowfall', month, day, snowfalls, 'inches', snowfallCount);
                updateType('snowdepth', month, day, snowdepths, 'inches', snowdepthCount);
                updateType('high', month, day, highs, 'F', highCount, tempMin, tempMax);
                updateType('low', month, day, lows, 'F', lowCount, tempMin, tempMax);
            }
        });
};

function updateType(type, month, day, obs, unit, count, min = d3.min(obs), max = d3.max(obs)) {
    // if just an array of 0s, return an empty array
    // if (min === 0 && max === 0) return [];

    const query = {month: month, day: day, type: type};
    const options = { upsert: true };
    const update = {...query,
        unit: unit,
        kde: getDistribution(obs, min, max),
        significant: count
    };
    DailyDist.update(query, update, options, (updateErr, raw) => {
        if (updateErr) console.log('mongo update error: ', updateErr);
        console.log('mongo raw response to update: ', raw);
    });
}

function getDistribution(obs: number[], min: number, max: number): KDEPoint[] {
    const bandwidth = 1.06 * d3.deviation(obs) / Math.pow(obs.length, 0.2);
    const ticks = d3.scaleLinear().domain([min, max]).ticks(200);
    const kde = kernelDensityEstimator(epanechnikovKernel(bandwidth), ticks);
    const dist = kde(obs);
    return dist.map(d => {
        return {value: d[0], density: d[1]};
    });
}


function kernelDensityEstimator(kernel, xs) {
    return sample => xs.map(x => [x, d3.mean(sample, v => kernel(x - v))]);
}

function epanechnikovKernel(scale: number) {
    return u => Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
}
