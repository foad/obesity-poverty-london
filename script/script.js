// Global variables
var map; // Main map variable
var mapOptions = {
    center: new google.maps.LatLng(51.5072, -0.1275),
    zoom: 10,
    minZoom: 8,
    disableDefaultUI: true,
    // Styling to remove POI labels and mute road colours
    styles: [{"stylers":[{"saturation":0}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":200},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":-45}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{elementType: "labels",stylers: [{ visibility: "off" }]}]
};


function initialise() {
    // Initialise map object with relevant options
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var outline = new google.maps.KmlLayer({
        url: "https://raw.githubusercontent.com/DanFoad/obesity-poverty-london/master/sources/boroughs.kml?v=3",
        map: map,
        preserveViewport: true,
        suppressInfoWindows: true
    });

    // Add custom zoom controls to map
    var zoomControlDiv = document.createElement("div");
    zoomControlDiv.index = 20; // Keep above points on map
    var zoomInControl = new ZoomInControl(zoomControlDiv, map);
    var zoomOutControl = new ZoomOutControl(zoomControlDiv, map);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomControlDiv); // Apply zoom controls
}
google.maps.event.addDomListener(window, "load", initialise);

/** ZoomInControl
 * Create a zoom-in control object and apply to map object
 * @param {Object} controlDiv Div element that will hold the created control
 */
function ZoomInControl(controlDiv, map) {
    controlDiv.style.padding = "5px"; // Apply padding around element
    var controlUI = document.createElement("div");
    $(controlUI).addClass("map__zoomControl");
    controlUI.style.marginBottom = "5px";
    if (map.getZoom() == 19) controlUI.style.visibility = "hidden"; // Hide control if zoomed in fully
    controlUI.innerHTML = "&#xf067;"; // + Symbol in FontAwesome
    controlDiv.appendChild(controlUI);
    google.maps.event.addDomListener(controlUI, "click", function() { // Zoom in
        map.setZoom(map.getZoom() + 1);
    });
}

/** ZoomOutControl
 * Create a zoom-out control object and apply to map object
 * @param {Object} controlDiv Div element that will hold the created control
 */
function ZoomOutControl(controlDiv, map) {
    controlDiv.style.padding = "5px"; // Apply padding around element
    var controlUI = document.createElement("div");
    $(controlUI).addClass("map__zoomControl");
    if (map.getZoom() <= 8) controlUI.style.visibility = "hidden"; // Hide control if zoomed out fully
    controlUI.innerHTML = "&#xf068;"; // - Symbol in FontAwesome
    controlDiv.appendChild(controlUI);
    google.maps.event.addDomListener(controlUI, "click", function() { // Zoom out
        map.setZoom(map.getZoom() - 1);
    });
}