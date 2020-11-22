$(document).ready(function(){
    // --- verify end callback user login and build profile
    verify_session_to_build(show_doctor_profile);

});

var show_doctor_profile = function(doctor_id){
    var container_doctor_profile = $("#container_doctor_profile");
        if( container_doctor_profile.length > 0 ){
            // --- get doctor_id in url
            var full_url = window.location.href;
            var url_segments = full_url.split('/');
            var doctor_id = url_segments[4];

            if( doctor_id.length > 0 ){
            $.post(base_url+"get_doctor_profile/"+doctor_id, function(json){
                if(json.success){
                    var htmlProfile = tplElement.profile_doctor(json.doctor);
                    container_doctor_profile.html(htmlProfile);
                }else{
                    alert(json.error_desc)
                }
            });
        }
    }
}


