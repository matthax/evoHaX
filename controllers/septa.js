var fetch = require('node-fetch');
const bluebird = require('bluebird');
const ee = require('event-emitter');

const endpoints = {
    stations: 'http://www3.septa.org/hackathon/locations/get_locations.php',
    trainview: 'http://www3.septa.org/hackathon/TrainView/',
    trips: 'http://www3.septa.org/hackathon/TransitView/trips.php',
    transitviewall: 'http://www3.septa.org/hackathon/TransitViewAll/',
    transitview: 'http://www3.septa.org/hackathon/TransitView/',
    arrivals: 'http://www3.septa.org/hackathon/Arrivals/',
    busdetours: 'http://www3.septa.org/hackathon/BusDetours/',
};
class SeptaPoint {
    constructor (latitude, longitude) {
        this.location = {latitude: parseFloat(latitude), longitude: parseFloat(longitude)};
    }
}
/* Is a location within the specified radius (Kilometers) */
SeptaPoint.prototype.near = function(lat, long, radius = 2) {
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * this.location.latitude / 180.0) * ky;
    var dx = Math.abs(this.location.longitude - long) * kx;
    var dy = Math.abs(this.location.latitude - lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
}
class SeptaVehicle extends SeptaPoint {
    constructor (latitude, longitude, id, destination) {
        super(latitude, longitude);
        this.Destination = destination;
        this.ID = id;
    }
}
class Bus extends SeptaVehicle {
    constructor(props) {
        super(props["lat"], props["lng"], props["VehicleID"], props["destination"]);
        this.BlockID = props["BlockID"];
        this.Direction = props["Direction"];
        this.Offset = props["Offset"];
        this.OffsetSeconds = props["Offset_sec"];
        this.Trip = props["trip"];
    }
};
class Train extends SeptaVehicle {
    constructor(props) {
        super(props["lat"], props["lon"], props["trainno"], props["dest"]);
        this.Service = props["service"];
        this.NextStop = props["nextstop"];
        this.isLate = props["late"] == "0" ? false : true;
        this.isSuspended = props["late"] == "999" ? true : false;
        this.timeDelayed = parseInt(props["late"]);
        this.Start = props["SOURCE"];
        this.Track = props["TRACK"];
        this.ChangeTrack = props["TRACK_CHANGE"];
    }
};
function toVehicle (obj) {
    return new Promise((resolve, reject) => {
        var vehicle;

        if (typeof obj["TRACK"] === "undefined") {
            vehicle = new Bus(obj);
        }
        else {
            vehicle = new Train(obj);
        }
        resolve(vehicle);
    });
}
function first (obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && typeof(i) !== 'function') {
            return obj[i];
        }
    }
}
class Location extends SeptaPoint {
    constructor(props) {
        super(props["location_lat"], props["location_lon"]);
        this.Name = props["location_name"];
        this.ID = props["location_id"];

        this.Type = props["location_type"];
        this.Distance = parseFloat(props["distance"]);
        this.Details = {
            Address1: props["location_id"],
            Address2: props["location_data"]["address1"],
            Text: props["location_data"]["location_name"],
            City: props["location_data"]["city"],
            State: props["location_data"]["state"],
            Zip: props["location_data"]["zip"],
            Hours: props["location_data"]["hours"],
            StartDate: props["location_data"]["startDate"],
            EndDate: props["location_data"]["endDate"],
            Phone: props["location_data"]["phone"],
            Status: props["location_data"]["status"],
        }
    }
};
exports.locations = { 
    vehicles: function () {
        var vehicles = function() {
            this.near = function (lat, long) {
                var nLat = parseFloat(lat), nLong = parseFloat(long);
                var locations = [];
                // could check if parse worked but we'll just continue and return nada
                return Promise.all([fetch(endpoints.trainview).then(resp => resp.json()).then(trains => trains.map(train => toVehicle(train))),
                fetch(endpoints.transitviewall).then(resp => resp.json()).then(r => {
                    var vehicles = [].concat.apply([], first(r).map(el => first(el).map(vehicle => toVehicle(vehicle)
                    )));
                    return vehicles;
                })]).filter(vehicle => vehicle.near(lat, long)).then(([trains,busses]) => {
                    this.trains = trains;
                    this.busses = busses;
                    emitter.emit('updated', busses, trains);
                });
            };
            this.busses = [];
            this.trains = [];
        };
        ee(vehicles.prototype);
        var emitter = new vehicles(), listener;
        return new vehicles();
    }(),
    places: function () {
        var lookup = function(type) {

        };
        var places = {
            bus: lookup.bind(this, 'bus_stops'),
            rail: lookup.bind(this, 'rail_stations'),
            sales: lookup.bind(this, 'sales_locations'),
            trolley: lookup.bind(this, 'trolley_stops'),
            perk: lookup.bind(this, 'perk_locations'),
    };
    return places;
    }(),
    routes: function () {

    },
}