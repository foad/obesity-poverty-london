// Global variables
var map; // Main map variable
var mapOptions = {
    center: new google.maps.LatLng(51.5072, -0.1275),
    zoom: 10,
    minZoom: 8,
    disableDefaultUI: true,
    // Styling to remove POI labels and mute road colours
    styles: [{"stylers":[{"saturation":0}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":200},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":-45}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{featureType: "poi",elementType: "labels",stylers: [{ visibility: "off" }]}]
};


function initialise() {
    // Initialise map object with relevant options
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
}
google.maps.event.addDomListener(window, "load", initialise);