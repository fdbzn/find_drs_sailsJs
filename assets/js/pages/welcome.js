console.log("welcome 0.2")

$(document).ready(function() {
    initHistory();

    // --- clear search input
    $(".clear_btn_search").on("click", function(){
      $("#pac-input").val("");
    });


    // --- load speacialties
    $.post(base_url+"specialty/get_specialties", function (json) {
        if(json.specialties.length > 0){
            var specialties_html = "";
            json.specialties.forEach(function(specialty){
                specialties_html += tplElement.option_specialty(specialty);

            });
            $("#container_specialties").append(specialties_html);
        }else{
            console.log("no se pudo cargar las especialidades")
        }
    });


    // --- specialty
    $(".btn_specialty").on("click", function() {

        $("#bg_overlay_specialties").fadeIn();
    });
    $(".btn_close_overlay").on("click", function() {
        $(this).closest(".bg_overlay").hide();
    });
    $("body").on("click", "#container_specialties li label", function() {
        GtagTraking.open_specialty();

        var label = $(this);
        var radioVal = label.siblings("input").val();
        selectedSpecialty = radioVal;
        label.closest(".bg_overlay").hide();
        $("#specialty_name").text(label.text())

        //--- recalcular con la ultima postion
        if (Object.keys(lastPosition).length > 0) {
            showLoadingMap();
            var zoom_map = 12;
            reCalcLocation(lastPosition);
            var markerImg = '/images/my_location.png';
            clearMarkers();
            createMarkerMap(map, markerImg, "Tu ubicación", lastPosition, true);
            focusMap(map, lastPosition, zoom_map);
        }
    });

    // --- user location
    $(".btn_my_location").on("click", function(e) {
        GtagTraking.my_location();

        showLoadingMap();
        getLocation(function(position) {
            var zoom_map = 12;
            var latlng = {
                lat: parseFloat(position.coords.latitude),
                lng: parseFloat(position.coords.longitude)
            };
            reCalcLocation(latlng);
            var markerImg = 'images/my_location.png';
            clearMarkers();
            createMarkerMap(map, markerImg, "Tu ubicación", latlng, true);
            focusMap(map, latlng, zoom_map);

            $("#block_change_addr").show();
        });

    });

    // --- change location address
    $("#btn_ch_location").on("click", function(){
        GtagTraking.ch_location();

        var btn =  $(this);
        var toggle_ch_addr = btn.data("is-active");

        if( toggle_ch_addr == 0 ){
            $("#block_set_address").fadeIn();
            btn.data("is-active", 1);
            btn.html(`<i class="fa fa-location-arrow" aria-hidden="true"></i>Ocultar cambiar ubicación`);
        }else{
            $("#block_set_address").fadeOut();
            btn.data("is-active", 0);
            btn.html(`<i class="fa fa-location-arrow" aria-hidden="true"></i>Cambiar ubicación`)
        }

    });

    // --- event detail hc
    $("#l_hcenter").on("click", ".tit_listhcenter, .more_listhcenter", function(e) {
        e.preventDefault();
        var item_hc = $(this).closest(".item-gral-hc")
        var hcid = $(item_hc).data("hcid");
        openListDoctors( hcid );

        // --- browser history ---
        var path_detail_hc = base_url+'health_center_detail/' + hcid;
        history.pushState({page: 'yi01', hc_id:hcid}, 'yiPage', path_detail_hc);
        GtagTraking.page_detail_hc( path_detail_hc );
    })


    // --- event list doctor
    $("body").on("click", ".doc-list-item", function(e) {
        e.preventDefault();
        var item_hc = $(this),
            docIndex = item_hc.data("doctor-index"),
            profileDoc = doctors_data[docIndex];

        var htmlProfile = tplElement.profile_doctor(profileDoc);
        yiPage.open(function(containerPage) {
            $(containerPage).html( htmlProfile );
            /*$('.rank_doc_profile').rating({hoverEnabled: true});*/
        });

        // --- browser history ---
        var path_detail_doc = base_url+'doctor_profile/' + profileDoc.id;
        history.pushState({page: 'yi02', doctor_id:profileDoc.id}, 'yiPage', path_detail_doc);
        GtagTraking.page_detail_doc(path_detail_doc);
    });


    // --- user comment hc
    $("body").on("submit", ".f_usercomment_hc", function(e){
        var input_comment = $("#user_comment_hc");
        var message_error_comment = $(".message-error-comment");

        if(input_comment.val().length === 0){
            message_error_comment.html("Escribe un comentario");
        }else{
            var form = $(this);
            $.post(base_url + "add_comment_hc", form.serialize(), function(json){
                if( json.success ){
                    // create new content
                    var new_user_comment = tplElement.item_comment_hc(json.created_comment)
                    // add new comment
                    $("#container_comments_hc").prepend(new_user_comment);
                    input_comment.val("");
                    message_error_comment.html("");
                }else{

                }
            });
        }

        e.preventDefault();
    });

    $("body").on("click", ".btn-more-hc-comments", function(e){
        num_page_hc_comments++;
        var btn_more = $(this);
        var hcId = btn_more.data("hc-id");
        var data_post = {
            hc_id : hcId,
            num_page : num_page_hc_comments,
            limit : limit_hc_comments
        };

        btn_more.hide();
        $.post(base_url + "more_hc_comments", data_post, function(json){
            if( json.comments.length > 0 ){
                var hc_comments = tplElement.build_hc_comments(json.comments, hcId);
                $("#container_comments_hc").append(hc_comments);
            }
        });
    });

    // --- response in hc comment
    $("#container_doctor_list").on("click", ".btn-reponse-comment-hc", function(e){
        // --- add new text input to response
        // --- get responses
        // --- build html
        // --- add to new page
        var htmlInResponse = tplElement.in_response_hc_comment();
        yiPage.open(htmlInResponse);
    });

    // --- user comment doctors
    $("body").on("submit", ".f_usercomment_doc", doctor_comments.submit_comment_doctor);



    $(window).scroll(function(){
        if ($(window).scrollTop() >= 120) {
            search_map.prependTo("body");
            search_map.addClass('fixed-map');

        }
        else {
            search_map.prependTo("#container_search_map");
            search_map.removeClass('fixed-map');
        }
    });
});

var openYiPageDoctor = function( doctor_id ){
  $.post(base_url+"get_doctor_profile/"+doctor_id, function(json){
      if(json.success){
          var htmlProfile = tplElement.profile_doctor(json.doctor);
          yiPage.open(function(containerPage) {
              $(containerPage).html( htmlProfile );
          });
      }else{
          alert(json.error_desc)
      }
  });
}
