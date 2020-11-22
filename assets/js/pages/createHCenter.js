test = {};

$(document).ready(function () {
    /*--- share buttons ---*/
    $("body").on("click", "#btn-share-fb", function (){
      FB.ui({
        method: 'feed',
        name: "Yiunic",
        description: ("Yiunic - Ayuda a alguien más a encontrar una opción de salud."),
        link: $("#txt_link_share").val(),
      });
    });

    // --- copy link
    $("body").on("click","#btn_copy_share_link", function(){
        var that = this;
        copyLink("txt_link_share");
        var msg_copy = $("#msg_copy_text");
        msg_copy.fadeIn(function(){
          setTimeout(function(){
            msg_copy.fadeOut();
          }, 2000)
        });
    });


    // --- guardar formulario
    $("#btn_save_hc").on("click", function(){
        // --- validar form
      var error_items = validate_new_hc();
        // --- add class error in forms
      if(error_items.length > 0){

          // --- clear red inputs
          $(".has-error").removeClass("has-error");
          test = error_items;
          error_items.forEach(function(input_item){
              input_item.closest(".form-group").addClass("has-error");
          });


      }else{
          // --- clear red inputs
          $(".has-error").removeClass("has-error");
          // --- open modal with loader
          $("#hc_doc_finish_modal").modal();

          // --- guardar formulario
          var form = $("#f_location_center");
          var form_data = form.serialize();

          var post = $.post(base_url+"add_hcenter_doctor", form_data, function(json){
              if(json.success){
                  // --- reemplaza el contenido del modal
                  $("#hc_doc_finish_modal .modal-content")
                    .html(create_hc_tpl.modal_finish_create_hc(json.doctor_id)).promise().done(function() {
                      // --- init button tw
                      tw_doc_profile_button("block-twconect", json.doctor_id)
                    });
                  // --- limpia el formulario
                  form.get(0).reset();
              }
          });
          post.fail(function(){console.log("error network")})
      }
    });


    // --- mover la pantalla hasta el input seleccionado
    $(document).on("click", "input:text", function () {
        $("html, body").animate({ scrollTop: $(this).closest(".form-group").offset().top }, 500);
        return true;
    });

    // --- load speacialties
    $.post(base_url+"specialty/get_specialties", function (json) {
        if(json.specialties.length > 0){
            var specialties_html = "";
            json.specialties.forEach(function(specialty){
                specialties_html += create_hc_tpl.option_specialty(specialty);

            });
            $("#createhc_specialty").append(specialties_html);
        }else{
            console.log("no se pudo cargar las especialidades")
        }
    });

    // --- ir  al mapa
    $("#btn_select_location").on("click", function () {
        $('#contaier_pages').carousel("next");
        initAutocomplete();
    });

    // --- ir al formulario
    $("#btn_sig").on("click", function () {
        $('#contaier_pages').carousel("prev");

        // mostrar nueva direccion agregada
        $("#btn_select_location").html("Editar Dirección");
        //Agrega el valor de direccion extra para enviar
        var extra_direccion_txt = $("#extra").val();
        $("#hc_address").show().html($("#new_formatted_address").text() + " " + extra_direccion_txt );
        $("#direccion_extra_hc").val(extra_direccion_txt);

        // --- borra nombre de hc
        $("#container_hc_name").find("div.form-group").remove();
        // --- reemplaza por otro con autocomplete
        $("#container_hc_name").html(create_hc_tpl.field_hc_name);


        // --- inicia el autocomplete del hc
        var aCompleteHCenter = Object.assign({}, AutocompleteField);
        aCompleteHCenter.init("#nombre_hcenter", near_hcenters_autocomplete, "name")
        aCompleteHCenter.setSuggestion();
        aCompleteHCenter.buildComponent();
        aCompleteHCenter.matchValue(function(option_selected, items){
            // --- obten el objeto con detalle del hc
            var hc_search = items.get( option_selected );
            // si existen recomendaciones muestra
            if(hc_search.length>0){
                hc_obj = hc_search[0];
                // --- guardar valor de hc para envio post
                $("#hc_id").val(hc_obj._id);

                // --- Autocomplete name doctor
                $.post( base_url + "doctor/get_doctors_by_hc_id", {hc_id : hc_obj._id}, function(json){
                    $("#container_doctor_name").find("div.form-group").remove();
                    $("#container_doctor_name").html(create_hc_tpl.field_doctor_name);
                    var aCompleteDoctors = Object.assign({}, AutocompleteField);
                    aCompleteDoctors.init("#nombre_medico", json.doctors, "name")
                    aCompleteDoctors.setSuggestion();
                    aCompleteDoctors.buildComponent();
                    aCompleteDoctors.matchValue(function(option_selected, items){
                        var docs_search = items.get( option_selected );
                        // si existe el  doc
                        if(docs_search.length>0){
                            var obj_doc = docs_search[0];
                            // --- ocultar el apellido
                            $("#container_autocomplete_apellido_doc").hide();
                            // --- guardar el valor para enviar en post
                            $("#doctor_id").val(obj_doc.id)

                        }else{
                            // --- si no existen coincidencias mostrar el apellido
                            $("#container_autocomplete_apellido_doc").show();
                            // --- guardar el valor en cero
                            $("#doctor_id").val(0);
                        }
                    });


                });
            }else{
                $("#container_doctor_name").find("div.form-group").remove();
                $("#container_doctor_name").html(create_hc_tpl.field_doctor_name);
                // --- guardar valor en cero para envio post
                $("#hc_id").val(0);
            }
        })

    });

    $("#btn_search_address").on("click", function () {
        showSearchBox_i();
    });




});

var copyLink = function (idElement) {
  var copyText = document.getElementById(idElement);
  copyText.focus();
  copyText.select();
  document.execCommand("Copy");
  return true;
}

var tw_doc_profile_button = function(id, doctor_id ){
  twttr.widgets.createShareButton(
    host + "doctor_profile/"+doctor_id,
    document.getElementById(id),
    {
      size: "large",
      text: "Ayuda a alguien más a encontrar una opción de salud",
      hashtags: "yiunic",
      related: "salud,ayuda"
    }
  );
}

var validate_new_hc = function(){
  var hc_name = $("#nombre_hcenter");
  var sex_doc = $("input[name=sex_doc]:checked");
  var nombre_medico = $("#nombre_medico");
  var apellido_medico = $("#apellido_medico");
  var createhc_specialty_name = $("#createhc_specialty");
  var hc_id = $("#hc_id");
  var doctor_id = $("#doctor_id");
  var user_comment_doc = $("#user_comment_doc");
  var error_items = [];
  var sex_doc_error = $("input[name=sex_doc]").get(0);

  if( hc_name.val() == "" ){
    error_items.push(hc_name);
  }
  if(sex_doc.length == 0){
    error_items.push( $(sex_doc_error) );
  }
  if(nombre_medico.val() == ""){
    error_items.push(nombre_medico);
  }
  if(doctor_id.val() == 0){
      if(apellido_medico.val() == ""){
          error_items.push(apellido_medico);
      }
  }

  if(createhc_specialty_name.val() == 0){
    error_items.push(createhc_specialty_name);
  }
  if(user_comment_doc.val() == "" ){
    error_items.push(user_comment_doc);
  }


  return error_items;
}
