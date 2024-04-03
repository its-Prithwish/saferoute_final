document.addEventListener("DOMContentLoaded", function () {

    // Leaflet map initialization
    const initializeMap = () => {
        const map = L.map('map').setView([22.5726, 88.3639], 5);
        const mapLink = "<a href='http://openstreetmap.org'>OpenStreetMap</a>";

        L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: `Leaflet &copy; ${mapLink}, contribution`,
            maxZoom: 18
        }).addTo(map);

        const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Terrain layer'
        });

        const trafficLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Traffic layer'
        });

        const baseLayers = {
            "Standard": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            "Terrain": terrainLayer,
            "Traffic": trafficLayer
        };

        L.control.layers(baseLayers).addTo(map);

        return map;
    };

    // Function to fetch data from JSON and add markers
    // const addMarkersFromJSON = (map) => {
    //     fetch('data.json')
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             data.forEach(point => {
    //                 var latitude = point.Latitude;
    //                 var longitude = point.Longitude;
    //                 if (!isNaN(latitude) && !isNaN(longitude)) {
    //                     var customIcon = L.divIcon({
    //                         className: 'custom-marker',
    //                         html: '<div class="circle"></div>',
    //                         iconSize: [20, 20]
    //                     });

    //                     var marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    //                     marker.bindPopup(`<b>${point["Accident Fields_Reference Number"]}</b><br>Latitude: ${latitude}, Longitude: ${longitude}`);
    //                 } else {
    //                     console.error('Invalid coordinates for data point:', point);
    //                 }
    //             });
    //         })
    //         .catch(error => {
    //             console.log('Error noted !!! ');
    //             console.error('Error fetching JSON data:', error);
    //         });
    // };

    // Geocode an address using Nominatim API
    const geocodeAddress = async (address) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                return [parseFloat(lat), parseFloat(lon)];
            } else {
                throw new Error('Geocoding response did not contain valid data');
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    };

    const findRoute = async (map) => {
        const sourceLocation = document.getElementById('source-location').value;
        const destinationLocation = document.getElementById('destination-location').value;

        map.eachLayer(layer => {
            if (layer !== map && !(layer instanceof L.TileLayer)) {
                map.removeLayer(layer);
            }
        });

        const [sourceCoordinates, destinationCoordinates] = await Promise.all([
            geocodeAddress(sourceLocation),
            geocodeAddress(destinationLocation)
        ]);

        if (sourceCoordinates && destinationCoordinates) {
            const sourceMarker = L.marker(sourceCoordinates).addTo(map);
            const destinationMarker = L.marker(destinationCoordinates).addTo(map);

            const waypoints = [
                L.latLng(sourceCoordinates[0], sourceCoordinates[1]),
                L.latLng(destinationCoordinates[0], destinationCoordinates[1])
            ];

            const routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: true,
                show: true,
                showAlternatives: true,
                lineOptions: {
                    styles: [{ color: 'blue', opacity: 0.8, weight: 5 }]
                }
            }).addTo(map);

            routingControl.route();
        }
    };

    const map = initializeMap();

    // addMarkersFromJSON(map);

    document.getElementById('find-route-button').addEventListener('click', () => findRoute(map));
});
