import 'whatwg-fetch';

exports.locations = { 
    vehicles: function () {
        var vehicles = function() {
            
        };
        return vehicles;
    },
    stations: function () {
        var lookup = function(type) {

        };
        var stations = {
            bus: lookup.bind(this, 'bus_stops'),
            rail: lookup.bind(this, 'rail_stations'),
            sales: lookup.bind(this, 'sales_locations'),
            trolley: lookup.bind(this, 'trolley_stops'),
            perk: lookup.bind(this, 'perk_locations'),
    };
    return stations;
    }(),
    routes: function () {

    },
}