var map = L.map('map').setView([20, 0], 2);

// Add a tile layer (base map) from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add CSS styles for the legend
var style = document.createElement('style');
style.textContent = `
    .info.legend {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
    }
    .info.legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
        border: 1px solid #000;
    }
    .info.legend div {
        margin-bottom: 5px;
        clear: both;
    }
`;
document.head.appendChild(style);

// Fetch earthquake data from the USGS API
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

fetch(url)
    .then(response => response.json())
    .then(data => {
        // Function to style each circle marker
        function styleInfo(feature) {
            return {
                radius: feature.properties.mag * 4,
                fillColor: getColor(feature.properties.mag),
                color: "#000000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
        }

        // Function to determine circle color based on magnitude
        function getColor(magnitude) {
            return magnitude > 5 ? "#FF0000" :
                   magnitude > 4 ? "#FF8C00" :
                   magnitude > 3 ? "#FFD700" :
                   magnitude > 2 ? "#9ACD32" :
                   "#32CD32";
        }

        // Add GeoJSON layer to the map
        L.geoJson(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },
            style: styleInfo,
            onEachFeature: function(feature, layer) {
                layer.bindPopup(`<h3>${feature.properties.place}</h3>
                                 <hr>
                                 <p>Magnitude: ${feature.properties.mag}</p>
                                 <p>Date: ${new Date(feature.properties.time)}</p>`);
            }
        }).addTo(map);

        // Add the legend
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [0, 2, 3, 4, 5];
            var labels = [];

            // Loop through the grades and create legend items
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<div>' +
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') +
                    '</div>';
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.log("Error fetching data:", error));
    