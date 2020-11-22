// --- continuar con la funcion de abajo
// --- cambiar item_comment_hc por la que usa profile doctor

var doctor_comments = {
    submit_comment_doctor : function(e){
        var form = $(this);
        $.post(base_url + "add_comment_doctor", form.serialize(), function(json){
            if( json.success ){
                // create new content
                var new_user_comment = doctor_comments.item_comments_doc(json.created_comment);
                // add new comment
                $("#doc_comments").prepend(new_user_comment);
                $("#user_comment_doc").val("");
            }else{

            }
        });
        e.preventDefault();
    },


    buildUserComment : function(doc_id) {
        var imgSrc = "";
        var messageLogin = "";
        var classBtnColor = "";
        var inputDisabled = "";
        var hideBtn = "";

        if ( existSession() === false ) {
            imgSrc = "/images/welcome/user-unknown.png";
            messageLogin = 'Inicia Sesión para agregar un comentario.';
            inputDisabled = "disabled";
            hideBtn = "hide"
        } else {
            imgSrc = `https://graph.facebook.com/${userSession.uid}/picture?type=small`;
            classBtnColor = "btn-primary";

        }

        return `
            <div class="doctor-comments-component">
                <form class="f_usercomment_doc">
                    <input type="hidden" name="doc_id" value="${doc_id}">
                    <div class="message-login col-xs-offset-2 col-xs-10">${messageLogin}</div>
                    <div class="col-xs-2 ">
                        <img id="fb_img_comment" src="${imgSrc}">
                    </div>
                    <div class="col-xs-10" id="contaier-input-comment-doc">
                        <input class="user-doc-comment form-control" name="user_comment_doc" id="user_comment_doc" type="text" ${inputDisabled} autocomplete="off">
                    </div>
                    <div class="container-btn-doc-comment col-xs-12">
                        <button type="submit" class="btn ${classBtnColor} ${hideBtn}"  ${inputDisabled}>Comentar</button>
                    </div>
                </form>
            </div>
        `;
    },


    item_comments_doc: function (comment) {
        var fecha = fragmentDate(comment.createdAt);

        return `
            <li>
                <div class="username_comment_doc col-xs-6">${comment.username}</div>
                <div class="comment_date_doc col-xs-6">${fecha.day} ${fecha.month} ${fecha.year}</div>
                <div class="comment_doc col-xs-12">${comment.user_comment}</div>
		    </li>
        `;
    },
}