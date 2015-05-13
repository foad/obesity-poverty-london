// Global variables
var map; // Main map variable
var mapOptions = {
    center: new google.maps.LatLng(51.5072, -0.1275),
    zoom: 10,
    minZoom: 9,
    disableDefaultUI: true,
    // Styling to remove POI labels and mute road colours
    styles: [{"stylers":[{"saturation":0}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":200},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":-45}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"simplified"},{"saturation":45}]},{elementType: "labels",stylers: [{ visibility: "off" }]}]
};
var outlineData; // Data from read in outline points
var outlines; // google.maps.Polygon objects outlining boroughs
var selected = false; // Whether a borough is selected

// Sources
var obesity_source = "sources/obesity.txt"; // Data from http://data.london.gov.uk/dataset/obesity-adults
var poverty_source = "sources/poverty.txt"; // Data from http://data.london.gov.uk/dataset/percentage-people-low-income-borough
var outline_source = "sources/boroughs.json"; // Outline data for London boroughs, manually converted from KML

var obesity = readSource(obesity_source, true); // Read in obesity percentages
var poverty = readSource(poverty_source, true); // Read in poverty percentages
var obesityMax, obesityMin, povertyMax, povertyMin;
var obesityCircle, povertyCircle;

function initialise() {
    // Initialise map object with relevant options
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    outlineData = readSource(outline_source);
    parseOutlineData(outlineData);

    // Add custom zoom controls to map
    var zoomControlDiv = document.createElement("div");
    zoomControlDiv.index = 20; // Keep above points on map
    var zoomInControl = new ZoomInControl(zoomControlDiv, map);
    var zoomOutControl = new ZoomOutControl(zoomControlDiv, map);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomControlDiv); // Apply zoom controls

    // Map listeners
    google.maps.event.addListener(map, "click", function() {
        map.setOptions({
            zoom: 10,
            center: new google.maps.LatLng(51.5072, -0.1275)
        });
        for (var borough in outlines) {
            outlines[borough].setMap(map);
        }
        obesityCircle.setMap(null);
        povertyCircle.setMap(null);
        selected = false;
    });

    // Initialise source information
    obesityMax = Math.max.apply(Math, obesity.map(function(o){return o.obesity;}));
    obesityMin = Math.min.apply(Math, obesity.map(function(o){return o.obesity;}));
    povertyMax = Math.max.apply(Math, poverty.map(function(p){return p.poverty;}));
    povertyMin = Math.min.apply(Math, poverty.map(function(p){return p.poverty;}));
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
    if (map.getZoom() <= 9) controlUI.style.visibility = "hidden"; // Hide control if zoomed out fully
    controlUI.innerHTML = "&#xf068;"; // - Symbol in FontAwesome
    controlDiv.appendChild(controlUI);
    google.maps.event.addDomListener(controlUI, "click", function() { // Zoom out
        map.setZoom(map.getZoom() - 1);
    });
}

/** readSource
 * Read in data from a JSON source and return the JSON object that was parsed in
 * @param {String} url   URL of the source file to read in
 * @param {Boolean} pipeDelimited Whether the source file is delimited via the pipe symbol
 * @return {Object} JSON object containing all data read in from file
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

/** displayData
 * Display visual representation of data for selected borough
 * @param borough   Name of currently selected borough
 */
function displayData(borough) {

    var ob, po
    for (var i = 0; i < obesity.length; i++) {
        if (obesity[i].borough == borough) ob = obesity[i].obesity
    }
    for (var i = 0; i < poverty.length; i++) {
        if (poverty[i].borough == borough) po = poverty[i].poverty
    }
    var maxHeight = $("#map").height() / 2;

    var obesityScale = ((ob - obesityMin) / (obesityMax - obesityMin)) * maxHeight;
    var povertyScale = ((po - povertyMin) / (povertyMax - povertyMin)) * maxHeight;

    obesityCircle = new google.maps.Marker({
        position: map.getCenter(),
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 0,
            fillColor: "#0000FF",
            fillOpacity: 0.35,
            scale: 0
        },
        map: map
    });

    povertyCircle = new google.maps.Marker({
        position: map.getCenter(),
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeWeight: 0,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            scale: 0
        },
        map: map
    });

    animateCircles(obesityScale, povertyScale);
}

/** animateCircles
 * Animate the visual representations of obesity/poverty
 */
 function animateCircles(obesityScale, povertyScale) {
    var count = 0;
    var obAnimation = window.setInterval(function() {
        if (count == 40) {
            clearInterval(obAnimation);
            return;
        }
        count++;
        var circle = obesityCircle.get('icon');
        circle.scale = (obesityScale / 50) * count;
        obesityCircle.set('icon', circle);
    }, 20);

    var poAnimation = window.setInterval(function() {
        if (count == 40) {
            clearInterval(poAnimation);
            return;
        }
        var circle = povertyCircle.get('icon');
        circle.scale = (povertyScale / 50) * count;
        povertyCircle.set('icon', circle);
    }, 20);
 }

/** parseOutlineData
 * Convert inputted outline data into google.maps.Polygons and apply to map
 * @param {Object} outlineData   Inputted outline data that was read in
 */
function parseOutlineData(outlineData) {
    for (var borough in outlineData) {
        for (var point in outlineData[borough]) {
            outlineData[borough][point] = new google.maps.LatLng(outlineData[borough][point].lat, outlineData[borough][point].lng);
        }
    }
    outlines = new Array();
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
        outlines[borough].name = borough;
        bindOutlineEvents(outlines[borough]);
    }
}

/** bindOutlineEvents
 * Binds hover and click events to polygon outlines for interactions
 * @param {Object} polygon   Polygon to apply events to
 */
function bindOutlineEvents(polygon) {
    google.maps.event.addListener(polygon,"mouseover", function() {
        if (!selected) this.setOptions({fillColor: "#7B1FA2", fillOpacity: 0.53});
        $("#borough p").html(polygon.name);
    }); 

    google.maps.event.addListener(polygon,"mouseout", function() {
        this.setOptions({fillColor: "#9C27B0", fillOpacity: 0.29});
    });

    google.maps.event.addListener(polygon, "click", function() {
        map.fitBounds(polygon.getBounds());
        for (var borough in outlines) {
            if (!(outlines[borough] == polygon)) {
                outlines[borough].setMap(null);
            }
            polygon.setOptions({fillColor: "#9C27B0", fillOpacity: 0.29});
        }
        selected = true;
        displayData(polygon.name);
    });
}

/*
 *  Add getBounds() function to google.maps.Polygon objects
 */
google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;        
    for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
        }
    }
    return bounds;
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

$("#sidebar__search").keyup(function() {
    var search = $("#sidebar__search").val().toLowerCase();
    $("#search-results li").each(function(i, entry) {
        if ($(entry).data("borough").toLowerCase().search(search) > -1 && search.length > 0) {
            $(entry).show();
        } else {
            $(entry).hide();
        }
    });
});

$("#search-results li").click() {
    var borough = $(this).data("borough");
    $("#overlay").trigger("click");
    if (selected) {
        google.maps.event.trigger(map, 'click');
    }
    google.maps.event.trigger(outlines[borough], 'click');
}