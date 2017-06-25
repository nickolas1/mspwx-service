use mspweather;
db.observations.find().forEach(function(el){
    el.date = new Date(el.date);
    el.year = el.date.getUTCFullYear();
    el.month = el.date.getUTCMonth() + 1; // month is 0 indexed :/
    el.day = el.date.getUTCDate();
    db.observations.save(el)
});
