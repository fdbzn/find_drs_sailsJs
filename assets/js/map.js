var test

var near_hcenters_autocomplete = [];
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};
var hc_address = [];

function searchHealthCenter() {
    var map = initMap("map_search_hc");
}

function initAutocomplete() {
    //crea el mapa
    var map = initMap("map");

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //Lo agrega como control de mapa
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    markers = [];
    var markersOrigins = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        // --- get map locations
        var places = searchBox.getPlaces();

        if( typeof (places[0])  == "undefined" ){
            $("#error_map_create_hc").removeClass("hide").html("Dirección no encontrada, intenta con el nombre de la calle y número.");

        }else{
            // --- borra mensaje de error
            $("#error_map_create_hc").addClass("hide").html("");

            //muestra boton de continuar y oculta busqueda
            showEndEscene_i();

            // --- guarda para envio en post
            setPlaceHc(places[0]);

            // --- pon el nombre del lugar
            fillInAddress_i(places[0]);

            //recuperar los lugares de origen
            searchNearHC_i( places, map, markersOrigins );

            //add marker places in db
            //click in marker autocomplete selection addres

            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            var place = places[0];
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var image = '/images/my_location.png';

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: image,
                title: place.name,
                position: place.geometry.location,
                draggable: true
            }));


            //agregando la opcion de arrastrar el marcador
            var geocoder = new google.maps.Geocoder;
            google.maps.event.addListener(markers[0], 'dragend', function (evt) {
                //$('#current').append('<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>');
                highlight("#new_formatted_address");

                //obteniendo la direccion del marcador al ser arrastrado
                var latlng = {lat: parseFloat(evt.latLng.lat()), lng: parseFloat(evt.latLng.lng())};
                geocoder.geocode({'location': latlng}, function (results, status) {
                    fillInAddress_i(results[0]);

                    // --- buscando los hc cercanos
                    searchNearHC_i(results, map);
                });

            })

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            map.fitBounds(bounds);
            map.setZoom(16);
        }


    });

}

function fillInAddress_i(place) {
    $("#new_formatted_address").html(place.formatted_address);
    return true;



    for (var component in componentForm) {
        document.getElementById(component).innerHTML = '';
        //document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            hc_address[i] = val;
            document.getElementById(addressType).innerHTML = val;
        }
    }
}

function showEndEscene_i() {
    $("#pac-input").fadeOut(function () {
        $("#txt_drag_pin").removeClass("hide");
        $("#btn_search_address").removeClass("hide");
        $("#data_address").removeClass("hide");
        $("#btn_sig").removeClass("hide");
    });
}

function showSearchBox_i() {
    $("#data_address").addClass("hide");
    $("#btn_search_address").addClass("hide");
    $("#btn_sig").addClass("hide");
    $("#txt_drag_pin").addClass("hide");
    $("#pac-input").fadeIn(function () {
        $(this).val("")
    });
}

function searchHealthCenter() {
    var map = initMap("map_search_hc");
}

function highlight(objId) {
    $(objId).animate({
        "backgroundColor": "yellow"
    }, 200, "swing", function () {
        $(this).animate({"backgroundColor": "white"}, 1800)
    });
}

function searchNearHC_i( places, map, markersOrigins2){
    //clear last markers
    markersOrigins.forEach(function (marker) {
        marker.setMap(null);
    });
    markersOrigins = [];
    //end clear markers

    //recuperar los lugares de origen
    var latitude_searched = places[0].geometry.location.lat();
    var longitude_searched = places[0].geometry.location.lng();
    var urlOrigins = base_url+"HealthCenter/nearHealtCenters";

    origin_places = $.post(urlOrigins + "?latitude="+latitude_searched+"&longitude="+longitude_searched+"&specialtyId="+selectedSpecialty, function(hcOrigins){
        if(hcOrigins.length > 0){
            near_hcenters_autocomplete = hcOrigins;
        }else{
            // --- clear autocomplete
            near_hcenters_autocomplete = [];
            //alert("sin resultados");
        }
    });
    origin_places.fail(function(){alert("error en la conexion")})
}


var setPlaceHc = function(placeObj){

    $("#place_hc").val( JSON.stringify(placeObj) );
}
