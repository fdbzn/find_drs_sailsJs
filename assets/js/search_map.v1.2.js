console.log("search_map 2.01")
var test = 0;

var componentForm = {
	street_number: 'short_name',
	route: 'long_name',
	locality: 'long_name',
	administrative_area_level_1: 'short_name',
	country: 'long_name',
	postal_code: 'short_name'
};
var hc_address = [];
var markersOrigins = [];
var doctorsModel = [];


var map = {};
var markers = [];
var selectedSpecialty = 0;
var lastPosition = {};
var doctors_data = {};
var search_map = $("#search_map");

function initSearchMap() {

	//crea el mapa
	map = initMap("search_map");

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	//Lo agrega como control de mapa
	//map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function () {
		searchBox.setBounds(map.getBounds());
	});



	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function () {
        showLoadingMap();
		//muestra boton de continuar y oculta busqueda
		//showEndEscene();
        var places = searchBox.getPlaces();

        if( typeof (places[0])  == "undefined" ){
            // delete history list hc´s
			$("#l_hcenter").html("");

        	$("#error_msg_search_map").removeClass("hide").html(`
				<span class="glyphicon glyphicon-alert" aria-hidden="true"></span>
				Dirección no encontrada, intenta con el nombre de la calle y número
			`);
        }else{
        	// hide error messages
            $("#error_msg_search_map").addClass("hide");

            $(input).blur();

            fillInAddress(places[0]);

            //create HC markers
            searchNearHC( places, map, markersOrigins );

            //add marker places in db
            //click in marker autocomplete selection addres

            // Clear out the old markers.
            clearMarkers(markers);

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();

            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }

                var markerImg = '/images/my_location.png';
                // Create a marker for each place.
                createMarkerMap( map, markerImg, place.name, place.geometry.location, true );

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
            map.setZoom(12);
		}

	});

}

function fillInAddress(place) {
	for (var component in componentForm) {
		document.getElementById(component).innerHTML = '';
		//document.getElementById(component).disabled = false;
	}

	// Get each component of the address from the place details
	// and fill the corresponding field on the form.
	if(place.length>0){
		for (var i = 0; i < place.address_components.length; i++) {
			var addressType = place.address_components[i].types[0];
			if (componentForm[addressType]) {
				var val = place.address_components[i][componentForm[addressType]];
				hc_address[i] = val;
				document.getElementById(addressType).innerHTML = val;
			}
		}
	}

}

function showEndEscene(){
	$("#pac-input").fadeOut(function(){
		$("#btn_search_address").removeClass("hide");
		$("#data_address").removeClass("hide");
		$("#btn_sig").removeClass("hide");
	});
}

function showSearchBox(){
	$("#data_address").addClass("hide");
	$("#btn_search_address").addClass("hide");
	$("#btn_sig").addClass("hide");
	$("#pac-input").fadeIn(function(){$(this).val("")});
}


function focusMap(map, latlng, zoom_map){
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(latlng);
	map.fitBounds(bounds);
	map.setZoom(zoom_map);
}
function clearMarkers(){
	markers.forEach(function (marker) {
		marker.setMap(null);
	});
	markers = [];
}

function createMarkerMap( map, markerImg, name, latLon, draggable ){
	markers.push(new google.maps.Marker({
		map: map,
		icon: markerImg,
		title: name,
		position: latLon,
		draggable: draggable
	}));

	//--- save first last position
	lastPosition = latLon;


	//agregando la opcion de arrastrar el marcador
	google.maps.event.addListener(markers[0], 'dragend', function(evt){
		var drag_latlng = {lat: parseFloat(evt.latLng.lat()), lng: parseFloat(evt.latLng.lng())};
		//--- save last position - drag
		lastPosition = drag_latlng;
		reCalcLocation(drag_latlng);
	})
}

function reCalcLocation(latlng) {
	var geocoder = new google.maps.Geocoder;
	//$('#current').append('<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>');
	highlight(".g-adr");

	//obteniendo la direccion del marcador al ser arrastrado
	geocoder.geocode({'location': latlng}, function (results, status) {
		fillInAddress(results[0]);
		searchNearHC( results, map, markersOrigins );
	});
}



function searchNearHC( places, map, markersOrigins2){
	//clear last markers
	markersOrigins.forEach(function (marker) {
		marker.setMap(null);
	});
	markersOrigins = [];
	//end clear markers

	//recuperar los lugares de origen
	var latitude_searched = places[0].geometry.location.lat();
	var longitude_searched = places[0].geometry.location.lng();
	var urlOrigins = base_url+"HealthCenter/nearHealtCentersSpecialties";

	origin_places = $.post(urlOrigins + "?latitude="+latitude_searched+"&longitude="+longitude_searched+"&specialtyId="+selectedSpecialty, function(hcOrigins){
        hideLoadinMap();
		generateListHCenter(hcOrigins);
		if(hcOrigins.length > 0){
      // hide error messages
      $("#error_msg_search_map").addClass("hide");

			$.each(hcOrigins, function(key, healthCenter){
				var hcPosition = {lat: parseFloat(healthCenter.geometry.coordinates[1]), lng: parseFloat(healthCenter.geometry.coordinates[0])}
				// --- get information about these places
				var infowindow = new google.maps.InfoWindow({
				  content: healthCenter.name,
				  maxWidth: 200
				});

				var image = '/images/pin.png';
				var hcMarker = new google.maps.Marker({
					map: map,
					icon: image, 
					healthCenterId:healthCenter._id,
					title: healthCenter.name,
					address_components: healthCenter.address_components,
					position: hcPosition,
					draggable: false
				});

				//show info markers
				hcMarker.addListener('click', function() {
				  infowindow.open(map, hcMarker);
				  openListDoctors(hcMarker.healthCenterId);
					// --- browser history ---
	        var path_detail_hc = base_url+'health_center_detail/' + hcMarker.healthCenterId;
	        history.pushState({page: 'yi01', hc_id:hcMarker.healthCenterId}, 'yiPage', path_detail_hc);
	        GtagTraking.page_detail_hc( path_detail_hc );
				});
				//infowindow.open(map, hcMarker);

				markersOrigins.push(hcMarker);
			});
		}else{
        $("#error_msg_search_map").removeClass("hide").html(`
        	<span class="glyphicon glyphicon-alert" aria-hidden="true"></span>
        	No se encontraron doctores cercanos aun. Intenta cambiando la ubicación o contactanos
        	a traves de facebook.
        `);
		}
	});
	origin_places.fail(function(){alert("error en la conexion")})
}

function openListDoctors(healthCenterId){
    yiPage.open(function( pageContent ) {

        var post = $.post(base_url+"doctor/getdoctors?hcId="+healthCenterId, function(jsonHCDoctors){
            doctorsModel = jsonHCDoctors.doctors;
            num_total_hc_comments = jsonHCDoctors.num_total_comments;

            //setListDoctors(jsonHCDoctors);
            //console.log(pageContent);

            // --- save in global variable
            doctors_data = jsonHCDoctors.doctors;

            // --- create detail hc
            var html_hCenterDetail = tplElement.healthCenterDetail(jsonHCDoctors);
            $(pageContent).html(html_hCenterDetail);

        });

        post.fail(function(){console.log("error network")});

	});
}

function highlight( objId ){
	$(objId).animate({
		"backgroundColor":"yellow"
	},200,"swing", function(){
		$(this).animate({"backgroundColor":"white"},1800)
	});
}

function generateListHCenter(hcenters){

	htmlListcenter = "";
	hcenters.forEach(function(hcenter, key){
		htmlListcenter += tplElement.item_list_hcenter(hcenter, key);
	});

	// --- init rank system
	$("#l_hcenter").html(htmlListcenter).promise().done(function() {
		// --- add listner to new elements
		$('.gral_rank_hcenter').rating({
			hoverEnabled: false,
			displayOnly: true
		});
		// --- select marker listerner
		$(".select-marker").on("click",function(){
			var zoom_map = 16;
			var btn_marker = $(this),
			marker_index = btn_marker.data("marker-index"),
			marker_selected = markersOrigins[marker_index];

			//change icon marker
			marker_selected.setIcon("");
			//focus in selected marker
			var latlng = {lat: parseFloat(marker_selected.position.lat()), lng: parseFloat(marker_selected.position.lng())};
			focusMap(map, latlng, zoom_map);
		});

  });
}

var showLoadingMap =  function(){
	$("#search_map").prepend(`
		<div id="container_loader_search_map">
			<div class="loader"></div>
		</div>
	`);
}

var hideLoadinMap = function(){
	$("#container_loader_search_map").hide();
}
