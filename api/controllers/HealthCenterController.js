/**
 * HealthCenterController
 *
 * @description :: Server-side logic for managing Healthcenters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var yi_helper = require('../../modules/yi_helper');
var xss = require("xss");
// ---- IMPORTANT :: START LOGIN
module.exports = {
    process_new_hc_doctor: function (req, res) {
        var response = {success: false}
        var that = this;

        var hc_name = yi_helper.capitalizeWords( xss( req.param('nombre_hcenter') ) );
        var phone = xss( req.param('phone_hc') );
        var cellphone = xss( req.param('cellphone_hc') );
        var sex_doc = parseInt( req.param('sex_doc') );
        var nombre_medico = yi_helper.capitalizeWords( xss( req.param('nombre_medico') ) );
        var apellido_medico = yi_helper.capitalizeWords( xss( req.param('apellido_medico') ) );
        var specialty_id = xss( req.param('createhc_specialty') );
        var user_comment_doc = xss(  req.param('user_comment_doc') );
        var hc_id = xss( req.param('hc_id') );
        var doctor_id = req.param('doctor_id');
        var direccion_extra_hc = xss( req.param('direccion_extra_hc') );
        var place_hc = JSON.parse( req.param('place_hc') );

        var longitud = place_hc.geometry.location.lng
        var latitude = place_hc.geometry.location.lat

        var doctor_obj = {
            sex_doc : sex_doc,
            nombre_medico : nombre_medico,
            apellido_medico : apellido_medico,
            specialty_id : specialty_id,
            user_comment_doc : user_comment_doc,
            cell_phone : cellphone

        }


        // --- if hc exist but doctor no
        if( hc_id != 0 && doctor_id == 0 ){
            // --- verify if exist hc

            HealthCenter.findOne({id:hc_id}).exec(function (err, hcenter){
                if (err) {
                    response.error_desc = "Error found hc";
                    response.error_code = "001";
                    res.json(response);
                }
                if (!hcenter) {
                    response.error_desc = "Intenta más tarde.";
                    response.error_code = "002";
                    res.json(response);
                }else{
                    // --- if exist create a doctor
                    that.build_new_doctor(res, doctor_obj, hcenter, req.user).then((success_response)=>{
                        success_response.success = true;
                        res.json(success_response);
                    }, (err_response)=>{
                        res.json(err_response)
                    });
                }
            });



        }else if(hc_id == 0){
            // --- if hc and doctor not exist
            var userId = (req.isAuthenticated()) ? req.user.id : 0;
            that.insert_new_hc(hc_name, longitud, latitude, place_hc, direccion_extra_hc, phone, userId,function (err, inserted_hcenter) {
                if (err) {
                    //response.deep_error = err;
                    response.error_desc = "Error to create hc";
                    response.error_code = "003";
                    res.json(response);

                } else {
                    that.build_new_doctor(res, doctor_obj, inserted_hcenter, req.user).then((success_response)=>{
                        success_response.success = true;
                        res.json(success_response);
                    }, (err_response)=>{
                        res.json(err_response)
                    });
                }
            });

        }else if( hc_id != 0 && doctor_id != 0 ){
            // --- if hc exist and doctor too
            // --- verify if exist hc

            HealthCenter.findOne({id:hc_id}).exec((err, hcenter)=>{

                if (err) {
                    response.error_desc = "Error found hc";
                    response.error_code = "006";
                    res.json(response);
                }
                if (!hcenter) {
                    response.error_desc = "Intenta más tarde.";
                    response.error_code = "007";
                    res.json(response);
                }else{
                    // --- if exist find doctor
                    Doctor.findOne({id:doctor_id}).exec((error, doctor)=>{
                        if (err) {
                            response.error_desc = "Error found doctor";
                            response.error_code = "008";
                            res.json(response);
                        }
                        if (!hcenter) {
                            response.error_desc = "Intenta más tarde.";
                            response.error_code = "009";
                            res.json(response)
                        }else{
                            // --- add a new comment
                            that.process_doctor_comment(res, hcenter, doctor, req.user, doctor_obj).then(()=>{
                                // --- if not exist especialty add too
                                exist_specialty = 0;
                                doctor.specialties.forEach((specialty)=>{
                                    if( specialty.specialty_id  == specialty_id ){
                                        exist_specialty++;
                                    }
                                });
                                if(exist_specialty === 0){
                                    that.process_doctor_specialty(res, doctor, hcenter, doctor_obj).then((success_res)=>{
                                        success_res.success = true;
                                        res.json(success_res);
                                    });
                                }else{
                                    response.doctor_id = doctor.id;
                                    response.success = true;
                                    res.json(response);
                                }
                            });

                        }

                    });
                }
            });
        }


    },



    build_new_doctor : function(res, doctor_obj, inserted_hcenter, user_obj){
        var response = {success: false}
        let that = this;

        return new Promise((resolve, reject) => {

            // --- create new doctor
            that.insert_new_doc( doctor_obj.sex_doc, doctor_obj.nombre_medico, doctor_obj.apellido_medico, doctor_obj.cell_phone, inserted_hcenter, function(err, inserted_doctor){
                if (err) {
                    response.deep_error = err;
                    response.error_desc = "Error to create doctor";
                    response.error_code = "004";
                    reject(response);
                }else{
                    that.process_doctor_comment(res, inserted_hcenter, inserted_doctor, user_obj, doctor_obj).then(()=>{
                        that.process_doctor_specialty(res, inserted_doctor, inserted_hcenter, doctor_obj).then((success_res)=>{

                            resolve(success_res);

                        });
                    });

                }
            } );
        });
    },

    process_doctor_comment : function(res, inserted_hcenter, inserted_doctor, user_obj, doctor_obj ){

        var response = {success: false}
        let that = this;

        return new Promise((resolve, reject) => {
            //resolve({success: true});
            // --- insert comment

            that.insert_doc_comment( inserted_hcenter.id, inserted_doctor.id , user_obj.uid , user_obj.name, doctor_obj.user_comment_doc,(err, createdComment)=> {
                if (err) {
                    response.error_desc = "Error al precesar el comentario, intenta más tarde"
                    response.error_code = "005";
                    reject(response)
                } else {
                    // increment count
                    inserted_doctor.num_total_comments++;

                    // save last comments in hc
                    inserted_doctor.last_comments.unshift(createdComment);

                    if( inserted_doctor.last_comments.length > 10 ){
                        inserted_doctor.last_comments.pop();
                    }

                    inserted_doctor.save();
                    resolve(response);
                }
            });


        });

    },

    process_doctor_specialty : function(res, inserted_doctor, inserted_hcenter, doctor_obj){
        var response = {success: false}
        let that = this;

        return new Promise((resolve, reject) => {
          // --- add specialty

          that.upd_specialty( inserted_doctor, doctor_obj.specialty_id, function(){
              // --- add doctor to hc document
              inserted_hcenter.doctors.push({
                  id : inserted_doctor.id,
                  general: inserted_doctor.general,
                  specialties:inserted_doctor.specialties
              });
              inserted_hcenter.save();

              response.doctor_id = inserted_doctor.id;

              resolve(response);
          });

        });

    },

    insert_new_hc: function (hc_name, lng, lat, place_hc, direccion_extra_hc, phone, userId, callback) {
        var insert_hc_obj = {
            name: hc_name
            ,phone : phone
            , geometry: {
                type: "Point"
                , coordinates: [
                   lng, lat
                ]
            }
            ,extra_address : direccion_extra_hc
            , place: place_hc

            , "aggregate_cost": {
                total: 0
                , "level_cost": 0
            }
            , rank: []
            , "aggregate_rank": {
                sumStars: 0
                , numRank: 0
            }
            , doctors: []
            , "last_comments": []
            , "num_total_comments": 0
            ,create_by: userId
        };

        HealthCenter.create(insert_hc_obj, callback);

    },
    insert_new_doc : function( sex_doc, nombre_medico, apellido_medico, cell_phone, hcenter, callback ){

        var insert_doc_obj = {
             "first_name": nombre_medico
            , "last_name": apellido_medico
            ,name: nombre_medico+" "+apellido_medico
            ,cell_phone: cell_phone
            ,sex_doctor : sex_doc
            , age: null
            , image: "https://www.google.com.mx/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwj-odKUlOTXAhVG4YMKHetyAeEQjRwIBw&url=http%3A%2F%2Fwww.zayedhotel.com%2Fguestbook&psig=AOvVaw1fF5n0C4wCi38qByU9Dzvy&ust=1512057731763572"
            , general: false
            , specialties: [
            ]
            , rank: []
            , "aggregate_rank": {
                sumStars: 0
                , numRank: 0
            }
            ,"last_comments": []
            , "num_total_comments": 0
            , healthCenters: [
                {
                    id: hcenter.id
                    , name: hcenter.name
                    , "formatted_address": hcenter.place.formatted_address
                    , geometry: hcenter.geometry
                    , phone : hcenter.phone
                }
            ]
        };

        Doctor.create(insert_doc_obj, callback);
    },

    upd_specialty: function( doctor ,specialty_id, callback ){
        if(specialty_id==1){
            doctor.general = true;
            doctor.save();
            callback();
        }else{
            Specialty.findOne({id:specialty_id}, function (err, specialty_found) {
                doctor.specialties.push({
                    specialty_id : specialty_id
                    ,specialty_name : specialty_found.specialty_name

                });
                doctor.save();
                callback();
            });
        }

    },

    insert_doc_comment : function ( hcenter_id, doctor_id, user_id, user_name, user_comment_doc, callback ) {

        let objComment = {
            doctor_id: doctor_id
            ,health_centers_id: hcenter_id
            ,user_id: user_id
            ,username: user_name
            ,user_comment: user_comment_doc
            ,level: 0
        };

        DoctorComment.create(objComment, callback);
    },


    nearHealtCentersSpecialties: function (req, res) {
        var ObjectId = require('sails-mongo/node_modules/mongodb').ObjectID;
        var error = 0;
        var queryObject = {};

        // --- set variables
        var user_longitude = req.param('longitude');
        var user_latitude = req.param('latitude');
        var specialtyId = req.param('specialtyId');

        var userId = (req.isAuthenticated()) ? req.user.id : 0;
        this.save_user_location(userId, user_longitude, user_latitude, specialtyId);


        // --- validate params and parse
        if (user_longitude.length > 0) {
            user_longitude = parseFloat(user_longitude);
        } else {
            error++;
        }
        if (user_latitude.length > 0) {
            user_latitude = parseFloat(user_latitude);
        } else {
            error++;
        }


        // --- if data is complete
        if (error == 0) {
            // --- build mongo query
            queryObject = {
                geometry: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [user_longitude, user_latitude]
                        },
                        //$maxDistance: 3000
                        $maxDistance: 7000
                    }
                }
            };


            if(specialtyId == "gral"){
                // ---general search
                queryObject["doctors.general"] = true;
            }else if (specialtyId == 0) {

            } else if( specialtyId != 0 && specialtyId != "gral") {
                //specialtyId = new ObjectId(specialtyId);
                queryObject["doctors.specialties.specialty_id"] = specialtyId;
            }

            // --- execute a query
            HealthCenter.native(function (err, centers) {

                //--- mongo query
                centers.find(queryObject).toArray(function (queryError, queryRecord) {
                    //console.log(queryError)
                    return res.json(queryRecord);
                });
                //--- end mongo query

            });
        }
    },

    nearHealtCenters : function( req, res ){
        var ObjectId = require('sails-mongo/node_modules/mongodb').ObjectID;
        var error = 0;
        var queryObject = {};


        // --- set variables
        var  user_longitude = req.param('longitude');
        var  user_latitude = req.param('latitude');

        // --- save location
        var userId = (req.isAuthenticated()) ? req.user.id : 0;
        this.save_user_location(userId, user_longitude, user_latitude);


        // --- validate params and parse
        if(user_longitude.length > 0){
            user_longitude = parseFloat(user_longitude);
        }else{ error++; }
        if(user_latitude.length > 0){
            user_latitude = parseFloat(user_latitude);
        }else{ error++; }


        // --- if data is complete
        if(error == 0){
            // --- build mongo query
            queryObject = {
                geometry:{
                    $near:{
                        $geometry:{
                            type:"Point",
                            coordinates: [user_longitude, user_latitude]
                        },
                        //$maxDistance: 3000
                        $maxDistance: 1000
                    }
                }
            };


            // --- execute a query
            HealthCenter.native(function(err, centers){

                //--- mongo query
                centers.find(queryObject).toArray(function(queryError, queryRecord) {
                    //console.log(queryError)
                    return res.json(queryRecord);
                });
                //--- end mongo query

            });
        }
    },

    save_user_location: function(userId, lat, lon, specialty){
      let response = {};
      let location_obj = {
        coordinates: [
          lon,
          lat
        ],
        user_id: userId,
        specialty: specialty
      };

      return new Promise((resolve, reject) => {
        UserLocation.create({location_obj}, function(err, user_location){
          if(err){
            response.error_desc = "Error location user";
            response.error_code = "0010";
            reject(response);
          }else{
            response.success = true;
            resolve(response)
          }

        });
      });

    },


    create_health_center: function (req, res) {
        res.view();
    },

    health_center_detail: function (req, res) {
        res.view();
    }

};
