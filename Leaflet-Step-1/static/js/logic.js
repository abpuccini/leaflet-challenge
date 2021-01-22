// Source: https://leafletjs.com/examples/choropleth/ , https://leafletjs.com/examples/geojson/ , https://docs.mapbox.com/mapbox-gl-js/api/map/

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // console.log(data.features);

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function getColor(d) {
    return d > 5 ? '#D02A2E' :
        d > 4 ? '#FEDAC6' :
            d > 3 ? '#F8F29A' :
                d > 2 ? '#C1E7B8' :
                    d > 1 ? '#C6D5D8' :
                        '#EDE3D1';
};

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p><b>Time:</b> " + new Date(feature.properties.time) + "</p>" +
            "<p><b>Magnitude:</b> " + feature.properties.mag + "</p>");
    }


    function pointToLayer(feature, latlng) {
        var geojsonMarkerOptions = {
            radius: feature.properties.mag * 4,
            fillColor: getColor(feature.properties.mag),
            color: "grey",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.75
        }
        return L.circleMarker(latlng, geojsonMarkerOptions)
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
};

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 516,
        minZoom: 2,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            25, 20
        ],
        zoom: 2,
        layers: [lightmap, earthquakes]
    });

    // Set bound to unable to drag to map over left or right
    // https://stackoverflow.com/questions/22155017/can-i-prevent-panning-leaflet-map-out-of-the-worlds-edge/31529463#31529463
    var southWest = L.latLng(-90, -180),
        northEast = L.latLng(90, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    myMap.setMaxBounds(bounds);
    myMap.on('drag', function () {
        map.panInsideBounds(bounds, { animate: false });
    });

    // Create legend of map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5];


        // loop through our magnitude intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
};
