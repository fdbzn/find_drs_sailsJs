console.log("main 0.201");
var base_url = "/";
var host = "http://www.yiunic.com/";
var userSession = {load:true};


function initMap(mapId){
	//inicia el mapa
	var pos_ini = {lat: 19.380954871434753, lng: -99.18304682485348};
	return new google.maps.Map(document.getElementById(mapId), {
        zoomControl: true,
        streetViewControl:false,
        mapTypeControl:false,

        gestureHandling: 'greedy',
		center: pos_ini,
		zoom: 10,
		mapTypeId: 'roadmap',
		styles: [
			{
				"featureType": "poi.business",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels.text",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			}
		]
	});
}

//-- position

function getLocation(callback) {
	if (navigator.geolocation) {

		navigator.geolocation.getCurrentPosition(callback, function error(err) {
		  console.log('ERROR(' + err.code + '): ' + err.message);
		});

	} else {
		console.log("error location")
	}
}


function initUserSession(){
	var post = $.post("/get_user_profile", function(json){
		if(json.success){
			userSession = json;
		}else{
			window.location.reload();
		}
	});
	post.fail(function(){alert("session error")});
}

function existSession(){
	return (userSession.uid != undefined);
}


var verify_session_to_build = function(callback){
    if(userSession.noSession===true){
        callback();
    }else if( userSession.load === true ){
        setTimeout(callback, 500);
    }else{
        callback();
    }
}

var initHistory = function(){
	$(window).on('popstate', function (e) {
		var state = e.originalEvent.state;
        yiPage.closeAllYiPages();
		if (state !== null) {
			if( state.page == "yi01" ){
				// --- hcenter page
				openListDoctors(state.hc_id);
			}else if ( state.page == "yi02" ) {
				// --- profile doctor
				openYiPageDoctor(state.doctor_id);
			}
		}
	});
}


