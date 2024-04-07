document.addEventListener("DOMContentLoaded", function () {


    const sourceInput = document.getElementById('source-location');
    const destinationInput = document.getElementById('destination-location');
    const sourceSuggestionsContainer = document.getElementById('source-suggestions');
    const destinationSuggestionsContainer = document.getElementById('destination-suggestions');
    var routingControl = null;
    var sourceMarker = null;
    var destinationMarker = null;


    const updateSuggestions = async (input, suggestionsContainer) => {
        const query = input.value.trim();
        suggestionsContainer.innerHTML = ''; // Clear previous suggestions
        
        // Remove previous markers
        if (sourceMarker) {
            map.removeLayer(sourceMarker);
        }
        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }
    
        if (query.length === 0) {
            return;
        }
    
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            data.forEach(item => {
                const suggestion = document.createElement('div');
                suggestion.textContent = item.display_name;
                suggestion.classList.add('suggestion');
                suggestion.addEventListener('click', () => {
                    input.value = item.display_name;
                    suggestionsContainer.innerHTML = ''; // Clear suggestions
                    
                    // Remove previous markers
                    if (sourceMarker) {
                        map.removeLayer(sourceMarker);
                    }
                    if (destinationMarker) {
                        map.removeLayer(destinationMarker);
                    }
                    
                    const latLng = [parseFloat(item.lat), parseFloat(item.lon)];
                    map.setView(latLng, 13);
                    sourceMarker = L.marker(latLng).addTo(map);
                });
                suggestionsContainer.appendChild(suggestion);
            });
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
        }
    };
    

    sourceInput.addEventListener('input', () => updateSuggestions(sourceInput, sourceSuggestionsContainer));
    destinationInput.addEventListener('input', () => updateSuggestions(destinationInput, destinationSuggestionsContainer));




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

    const fetchPhotos = async (placeId) => {
        try {
          const response = await fetch(`/fetch-photos?placeId=${placeId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching photos:', error);
          return null;
        }
      };


      // Function to handle map click event
      const handleMapClick = async (event) => {
        const clickedLatLng = event.latlng;

        // Perform reverse geocoding using Nominatim API
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLatLng.lat}&lon=${clickedLatLng.lng}&zoom=18&addressdetails=1`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const placeId = data.place_id;
          const address = data.display_name;

          // Fetch photos for the clicked place
          const photosData = await fetchPhotos(placeId);
          if (photosData && photosData.query && photosData.query.pages) {
            const images = photosData.query.pages[Object.keys(photosData.query.pages)[0]].images;
            if (images && images.length > 0) {
              const photoTitle = images[0].title;
              const photoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${photoTitle}&prop=imageinfo&iiprop=url&format=json`;
              
              // Create popup content with photos
              let popupContent = `<b>${address}</b><br>`;
              images.forEach(image => {
                const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${image.title}&prop=imageinfo&iiprop=url&format=json`;
                popupContent += `<img src="${imageUrl}" alt="Photo" width="200"><br>`;
              });

              // Create marker with popup
              const marker = L.marker(clickedLatLng).addTo(map);
              marker.bindPopup(popupContent);
              marker.openPopup();
            } else {
              // If no photos found, create popup with address only
              L.popup()
                .setLatLng(clickedLatLng)
                .setContent(address)
                .openOn(map);
            }
          } else {
            // If no photos found, create popup with address only
            L.popup()
              .setLatLng(clickedLatLng)
              .setContent(address)
              .openOn(map);
          }
        } catch (error) {
          console.error('Error handling map click event:', error);
        }
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

        // Clear previous markers and routing control
        if (sourceMarker) {
            map.removeLayer(sourceMarker);
        }
        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const [sourceCoordinates, destinationCoordinates] = await Promise.all([
            geocodeAddress(sourceLocation),
            geocodeAddress(destinationLocation)
        ]);

        if (sourceCoordinates && destinationCoordinates) {
            sourceMarker = L.marker(sourceCoordinates).addTo(map);
            destinationMarker = L.marker(destinationCoordinates).addTo(map);

            const waypoints = [
                L.latLng(sourceCoordinates[0], sourceCoordinates[1]),
                L.latLng(destinationCoordinates[0], destinationCoordinates[1])
            ];

            // Create routing control and set waypoints
            routingControl = L.Routing.control({
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
    
    // Example: Attach map click event listener
    map.on('click', handleMapClick);

    // addMarkersFromJSON(map);

    document.getElementById('find-route-button').addEventListener('click', () => findRoute(map));
    
});
