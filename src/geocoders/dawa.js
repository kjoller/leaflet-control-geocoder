var L = require('leaflet'),
	Util = require('../util');

module.exports = {
	class: L.Class.extend({
		options: {
	    		serviceUrl: '//dawa.aws.dk/adgangsadresser/',
        		geocodingQueryParams: {},
		        reverseQueryParams: {},
			wildcard: false
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);
		},

		geocode: function(query, cb, context) {
			    Util.jsonp(this.options.serviceUrl + '', L.extend({
		    	        q: this.options.wildcard ? query + '*' : query,
		            }, this.options.geocodingQueryParams),
		            function(data) {
			            var results = [];
			            // j is a variable to make sure that results list will be continuous even if addresses without
			            // a geometry is skipped.
			            var j = 0
			            for (var i = data.length - 1; i >= 0; i--) {
		        	            // Check if coordinates exists, otherwiese increment j by 1 and skip adding results
			                    if (!data[i].adgangspunkt.koordinater) {
				                    j += 1;
			                    } else {
				                    results[i-j] = {
				                            name: data[i].vejstykke.navn + " " + data[i].husnr + ", " + data[i].postnummer.nr + " " + data[i].postnummer.navn,
                        
				                            // there is no bounding box in the results, so return a small box centered around the point
				                            bbox: L.latLngBounds([data[i].adgangspunkt.koordinater[1]-0.00001, data[i].adgangspunkt.koordinater[0]-0.00001], 
			                                             [data[i].adgangspunkt.koordinater[1]+0.00001, data[i].adgangspunkt.koordinater[0]+0.00001]),
				                            center: L.latLng(data[i].adgangspunkt.koordinater[1],data[i].adgangspunkt.koordinater[0])
				                    };
			                    }
			            };
			            cb.call(context, results);
		            }, this, 'callback');
		},

		reverse: function(location, scale, cb, context) {
		        Util.jsonp(this.options.serviceUrl + 'reverse/', L.extend({
		                y: location.lat,
		                x: location.lng
		        }, this.options.reverseQueryParams), function(data) {
		                var result = [],
    			        loc;

		                if (data && data.adgangspunkt) {
			                loc = L.latLng(data.adgangspunkt.koordinater[1], data.adgangspunkt.koordinater[0]);
			                result.push({
			                        name: data.vejstykke.navn + " " + data.husnr + ", " + data.postnummer.nr + " " + data.postnummer.navn,
			                        center: loc,
			                    bounds: L.latLngBounds(loc, loc)
			                });
		                }
	            		cb.call(context, result);
		        }, this, 'callback');
		}
/*
		reverse: function(location, scale, cb, context) {
			Util.jsonp(this.options.serviceUrl + 'reverse', L.extend({
				lat: location.lat,
				lon: location.lng,
				zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
				addressdetails: 1,
				format: 'json'
			}, this.options.reverseQueryParams), function(data) {
				var result = [],
				    loc;

				if (data && data.lat && data.lon) {
					loc = L.latLng(data.lat, data.lon);
					result.push({
						name: data.display_name,
						html: this.options.htmlTemplate ?
							this.options.htmlTemplate(data)
							: undefined,
						center: loc,
						bounds: L.latLngBounds(loc, loc),
						properties: data
					});
				}

				cb.call(context, result);
			}, this, 'json_callback');
		}
*/
	}),

	factory: function(options) {
		return new L.Control.Geocoder.DAWA(options);
	}
};

/*
L.Control.Geocoder.DAWA = L.Class.extend({
    options: {
        serviceUrl: '//dawa.aws.dk/adgangsadresser/',
        geocodingQueryParams: {},
        reverseQueryParams: {}
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
        L.Control.Geocoder.jsonp(this.options.serviceUrl + '', L.extend({
            q: query,
            //kommunekode: '0147'
        }, this.options.geocodingQueryParams),
        function(data) {
            var results = [];
            // j is a variable to make sure that results list will be continuous even if addresses without
            // a geometry is skipped.
            var j = 0
            for (var i = data.length - 1; i >= 0; i--) {
                // Check if coordinates exists, otherwiese increment j by 1 and skip adding results
                if (!data[i].adgangspunkt.koordinater) {
                    j += 1;
                } else {
                    results[i-j] = {
                        name: data[i].vejstykke.navn + " " + data[i].husnr + ", " + data[i].postnummer.nr + " " + data[i].postnummer.navn,
                        
                        // there is no bounding box in the results, so return a small box centered around the point
                        bbox: L.latLngBounds([data[i].adgangspunkt.koordinater[1]-0.00001, data[i].adgangspunkt.koordinater[0]-0.00001], 
                                             [data[i].adgangspunkt.koordinater[1]+0.00001, data[i].adgangspunkt.koordinater[0]+0.00001]),
                        center: L.latLng(data[i].adgangspunkt.koordinater[1],data[i].adgangspunkt.koordinater[0])
                    };
                }
            };
            cb.call(context, results);
        }, this, 'callback');
    },

 reverse: function(location, scale, cb, context) {
        L.Control.Geocoder.jsonp(this.options.serviceUrl + 'reverse/', L.extend({
            y: location.lat,
            x: location.lng
        }, this.options.reverseQueryParams), function(data) {
            var result = [],
                loc;

            if (data && data.adgangspunkt) {
                loc = L.latLng(data.adgangspunkt.koordinater[1], data.adgangspunkt.koordinater[0]);
                result.push({
                    name: data.vejstykke.navn + " " + data.husnr + ", " + data.postnummer.nr + " " + data.postnummer.navn,
                    center: loc,
                    bounds: L.latLngBounds(loc, loc)
                });
            }

            cb.call(context, result);
        }, this, 'callback');
    }
});

L.Control.Geocoder.dawa = function(options) {
    return new L.Control.Geocoder.DAWA(options);
};
*/