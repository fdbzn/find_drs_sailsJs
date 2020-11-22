module.exports = {

    addCommentDoctor: function (req, res) {
        let json_response = {success: false};
        let doctor_id = req.param('doc_id');
        let user_comment_doc = req.param('user_comment_doc');

        // --- verify if exist a doctor
        Doctor.findOne({id:doctor_id}, (err, doctor)=>{
            if (err) {
                // --- try put a value not existing
                json_response.error_desc = "Error al procesar, intenta más tarde.";
            }
            if (!doctor) {
                json_response.error_desc = "Error de busqueda";
            } else {
                // --- insert a new comment
                let objComment = {
                    doctor_id: doctor_id
                    ,user_id: req.user.uid
                    ,username: req.user.name
                    ,user_comment: user_comment_doc
                    ,level: 0
                };
                DoctorComment.create(objComment, (err, createdComment)=> {
                    if (err) {
                        json_response.error_desc = "Error al precesar el comentario, intenta más tarde"
                    } else {
                        // --- response with new comment
                        json_response.created_comment = createdComment;

                        // --- is first comment
                        if( typeof doctor.last_comments == 'undefined' ){
                            doctor.last_comments = [];
                            doctor.num_total_comments = 0;
                        }

                        // increment count
                        doctor.num_total_comments++;

                        // save last comments in hc
                        doctor.last_comments.unshift({
                            
                            user_id : createdComment.user_id,
                            username : createdComment.username,
                            user_comment : createdComment.user_comment,
                            createdAt : createdComment.createdAt
                        });

                        if( doctor.last_comments.length > 10 ){
                            doctor.last_comments.pop();
                        }
                        doctor.save();
                        json_response.success = true;
                    }
                    res.json(json_response);
                });
            }
        });

    },


    addInResponseCommentHCenter: function (req, res) {
        let json_response = {success: false};
        let user_comment_hc = req.param('user_comment_hc');
        let response_to = ( typeof(req.param('response_to')) == 'undefined' ) ? 0 : req.param('response_to');

        // --- search comment in response
        if (response_to.length > 0) {
            CommentHealthCenter.findOne({id: response_to}).exec((err, comment_hc)=> {
                // ---- enviar un error si no existe el comentario
                if (err) {
                    // --- try put a value not existing
                    json_response.error_desc = "Error al procesar, intenta más tarde.";
                }
                if (!comment_hc) {
                    json_response.error_desc = "Error de busqueda";
                } else {
                    // --- if exist a record get level, hcenterId
                    let nextLevel = comment_hc.level + 1;
                    let comment_id = comment_hc.id;
                    let health_center_id = comment_hc.health_center_id;

                    let objComment = {
                        health_center_id: health_center_id
                        , userId: req.user.uid
                        , username: req.user.name
                        , userComment: user_comment_hc
                        , response_to: comment_id
                        , level: nextLevel
                    }

                    // --- add direrents attributes
                    if (nextLevel == 1) {
                        objComment.parent_container = comment_hc.id;
                    } else if (nextLevel >= 2) {
                        objComment.parent_container = comment_hc.parent_container;
                    }


                    // --- insert a new comment
                    CommentHealthCenter.create(objComment, (err, createdComment)=> {
                        if (err) {
                            json_response.error_desc = "Error to create a new user"
                        } else {
                            json_response.success = true;
                            json_response.created_comment = createdComment;
                        }
                        res.json(json_response);
                    });
                }


            });
        } else {
            json_response.error_desc = "Error en la petición, intenta más tarde.";
            res.json(json_response);
        }


    },

    get_more_comments : function(req, res){
        let json_response = {};
        let hc_id = req.param('hc_id');
        let numPage = req.param('num_page');
        let limit = req.param('limit');
        let findInComments = {
            health_center_id : hc_id,
            level : 0
        }

        let qryComments = CommentHealthCenter.find(findInComments);
        qryComments.paginate({page: numPage, limit: limit});
        qryComments.sort("createdAt DESC");

        qryComments.exec((err, hc_comments)=>{
            if (err) {
                return res.serverError(err);
            }

            json_response.comments = hc_comments

            res.json( json_response );
        });

    }


}