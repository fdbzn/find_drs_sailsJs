module.exports = {
    profile: function(req, res){
        res.view();
    },

    get_doctor_by_id : function (req, res) {
        var doctor_id = req.param('doctor_id');
        var data_response = {"success":false};

        Doctor.findOne( {id:doctor_id}, function(err, doctor){
            if (!doctor) {
                data_response.error_desc = "Perfil no encontrado";
            }else{
                data_response.success = true;
                data_response.doctor = doctor;
            }
            res.json(data_response);
        } );
    },

    getDoctors: function(req, res, next){
        var qryHealthCenters = {id : req.param('hcId')};
        var id_doctors = [];
        var response = {};

        //HealthCenter.find(qryHealthCenters, {fields: {_id:0}}, (err, refDoctors)=>{
        HealthCenter.find(qryHealthCenters, {}, (err, refDoctors)=>{
            if(err){
                return next(err);
            }
            refDoctors[0].doctors.forEach((refDoc)=>{
                id_doctors.push(refDoc.id);
            });


            Doctor.find({id: id_doctors}, (err, foundDocs)=>{
                response.geometry = refDoctors[0].geometry;
                response.health_center_id = refDoctors[0].id;
                response.hcName = refDoctors[0].name;
                response.formatted_address = refDoctors[0].place.formatted_address;
                response.aggregate_rank = refDoctors[0].aggregate_rank;
                response.last_comments = refDoctors[0].last_comments;
                response.num_total_comments = refDoctors[0].num_total_comments;
                response.phone = refDoctors[0].phone
                response.doctors = foundDocs;
                res.json(response);
            });

        });
    },

    get_doctors_by_hc_id : function (req, res, next){
        var qryDoctors = {"healthCenters.id" : req.param('hc_id')};
        var response = {};

        console.log(qryDoctors);
        Doctor.find(qryDoctors, (err, foundDocs)=>{
            response.doctors = foundDocs;
            res.json(response);
        });

    },



};
