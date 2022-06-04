mapboxgl.accessToken = mapToken; //looks for mapToken in same script in show.ejs

console.log("attraction.geometry.coordinates are", attraction.geometry.coordinates);
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    //center: [-74.5, 40], // starting position [lng, lat]
    center: attraction.geometry.coordinates,
    zoom: 9 // starting zoom
});

new mapboxgl.Marker() //this lets you put a marker
    .setLngLat(attraction.geometry.coordinates) //puts a marker at coordinates specified
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML( //html can be injected here
            `<h4 class>${attraction.name}</h4><p>${attraction.region}, ${attraction.country}</p>`
        )
    )
    .addTo(map) //adds to map