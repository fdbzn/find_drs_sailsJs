var create_hc_tpl = {
    field_hc_name : function(){
        return `
            <div class="form-group">
                <label for="nombre_hcenter">Nombre centro De salud</label>
                <input type="text" id="nombre_hcenter" name = "nombre_hcenter" class="form-control">
            </div>
        `;
    },

    field_doctor_name : function(){
        return `
            <div class="form-group">
                <div id="block_sex_doc">
                    <label for="sex_dr">Dr.</label>
                    <input type="radio" value="1" name="sex_doc" id="sex_dr" >
                    <label for="sex_dra">Dra.</label>
                    <input type="radio" value="2" name="sex_doc" id="sex_dra" >

                </div>
            </div>
            <div class="form-group">
                <div id="container_autocomplete_nombre_doc" class="col-xs-12">
                    <input type="text" name="nombre_medico" id="nombre_medico" class="form-control" placeholder="Nombre(s)"/>
                </div>
            </div>
            <div class="form-group">
                <div id="container_autocomplete_apellido_doc" class="col-xs-12">
                    <input type="text" name="apellido_medico" id="apellido_medico" class="form-control" placeholder="Apellido(s)"/>
                </div>
            </div>
        `;
    },

    option_specialty: function(item){
        return `
            <option value="${item.id}">${item.specialty_name}</option>
        `;
    },

    modal_finish_create_hc: function( doctor_id ){
        return `
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">¡Gracias por compartir tu experiencia!</h4>
            </div>
            <div class="modal-body">
                <p>Compartir</p>
                <div class="row">
                    <div class="col-xs-12">

                        <div class="block-fbconect btn_social">
                          <a href="javascript:void(null)" id="btn-share-fb">
                            <img src="/images/create_hc/share_fb_icon.png" width="28" height="28" >
                          </a>
                        </div>
                        <div id="block-twconect" class="block-twconect btn_social">

                        </div>

                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-8" id="block-share-txt-profile-doc">
                        <input type="text" id="txt_link_share" class="form-control" value="${host}doctor_profile/${doctor_id}">
                    </div>
                    <div class="col-xs-4">
                      <a href="javascript:void(null)" id="btn_copy_share_link" >Copiar</a>
                    </div>
                    <div id="block_msg_copy" class="col-xs-12">
                      <span id="msg_copy_text">Vinculo copiado al portapapeles</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
                <a href="${base_url}doctor_profile/${doctor_id}">
                    <button type="button" class="btn btn-primary">
                        Ir al registro
                    </button>
                </a>
            </div>

        `;
    }
}
