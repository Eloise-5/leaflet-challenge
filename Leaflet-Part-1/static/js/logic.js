// Create a map centered on the US
const mymap = L.map('map').setView([0.00, 0.00], 2);

// Add a tile layer to the map
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(mymap);

// Load the GeoJSON data and create markers for each earthquake
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        // Set the marker size and color based on the earthquake's magnitude and depth
        const mag = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        const markerOptions = {
          radius: mag * 3,
          fillColor: getColour(depth),
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return L.circleMarker(latlng, markerOptions);
      },
      onEachFeature: (feature, layer) => {
        // Create a popup for each marker with additional earthquake information
        layer.bindPopup(`
          <h3>${feature.properties.place}</h3>
          <p>Magnitude: ${feature.properties.mag}</p>
          <p>Depth: ${feature.geometry.coordinates[2]} km</p>
          <p>Time: ${new Date(feature.properties.time)}</p>
        `);
      }
    }).addTo(mymap);

// Add a legend to the map
const legend = L.control({ position: 'bottomright' });
legend.onAdd = () => {
  const div = L.DomUtil.create('div', 'info legend');
  div.style.backgroundColor = 'white'; // add white background color
  
  // Add a title to the legend
  const title = L.DomUtil.create('div', 'legend-title');
  title.innerHTML = '<h4>Earthquake Depth</h4>';
  div.appendChild(title);

  const depths = [-10, 10, 30, 50, 70, 90];
  for (let i = 0; i < depths.length; i++) {
    const depthColour = getColour(depths[i] + 1);
    div.innerHTML += `
      <div>
        <span style="display:inline-block;width:10px;height:10px;background-color:${depthColour}"></span>
        ${depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+'}
      </div>
    `;
  }
  return div;
};
legend.addTo(mymap);
  });


// Define a function to set the marker color based on the depth
function getColour(depth) {
  return depth > 90 ? '#800026' :
         depth > 70 ? '#BD0026' :
         depth > 50 ? '#E31A1C' :
         depth > 30 ? '#FC4E2A' :
         depth > 10 ? '#FD8D3C' :
                      '#FEB24C';
}
