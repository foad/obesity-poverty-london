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
var outlineData; // Data from read in outline points

// Sources
var obesity_source = "sources/obesity.txt"; // Data from http://data.london.gov.uk/dataset/obesity-adults
var poverty_source = "sources/poverty.txt"; // Data from http://data.london.gov.uk/dataset/percentage-people-low-income-borough
var outline_source = "sources/boroughs.json";


function initialise() {
    // Initialise map object with relevant options
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    outlineData = readSource(outline_source);
    outlineData = parseOutlineData(outlineData);
    var outlines = [];
    for (var borough in outlineData) {
        outlines[borough] = new google.maps.Polygon({
            paths: outlineData[borough],
            strokeColor: "#CE93D8",
            strokeOpacity: 0.53,
            strokeWeight: 2,
            fillColor: "#9C27B0",
            fillOpacity: 0.29,
            map: map
        });
    }

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

/** readSource
 * Read in data from a JSON source and return the JSON object that was parsed in
 * @param url   URL of the source file to read in
 * @param pipeDelimited Whether the source file is delimited via the pipe symbol
 * @return Object JSON object containing all data read in from file
 */
function readSource(url, pipeDelimited) {
    var file = new XMLHttpRequest();
    var raw = "";
    var data;
    file.open("GET", url, false); // Open file
    file.onreadystatechange = function() {
        if (file.readyState === 4 && (file.status === 200 || file.status === 0)) { // If file opened fine
            raw = file.responseText;
            if (pipeDelimited) {
                data = [];
                raw = raw.split("|"); // Split raw feed into different incidents
                for (var i in raw) {
                    data.push(JSON.parse(raw[i]));
                }
            } else {
                data = JSON.parse(raw);
            }
        }
    };
    file.send(null); // Close file
    return data;
}

function parseOutlineData(outlineData) {
    for (var borough in outlineData) {
        for (var point in outlineData[borough]) {
            outlineData[borough][point] = new google.maps.LatLng(outlineData[borough][point].lat, outlineData[borough][point].lng);
        }
    }
    return outlineData;
}


/**** USER INTERACTIONS/LISTENERS ****/

$("#sidebar__button").click(function() {
    if (!($(".content-wrapper").hasClass("content-wrapper--open"))) {
        $(".content-wrapper").addClass("content-wrapper--open");
        $("#overlay").show();
        $("#sidebar").animate({"right": "0"}, 300);
    }
});

$("#overlay").click(function() {
    $(".content-wrapper--open").removeClass("content-wrapper--open");
    $(this).hide();
    $("#sidebar").animate({"right": "-320px"}, 300);
});