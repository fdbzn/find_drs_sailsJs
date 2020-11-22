console.log("tplElement 0.203")
var num_total_hc_comments = 0;
var num_page_hc_comments = 1;
var limit_hc_comments = 10;

function fragmentDate(date) {
    fragmentsDate = {};
    dateObj = new Date(date);
    var monthNames = [
        "Enero", "Febrero", "Marzo",
        "Abril", "Mayo", "Junio", "Julio",
        "Augosto", "Septiembre", "Octubre",
        "Noviembre", "Diciembre"
    ];

    fragmentsDate.day = dateObj.getDate();
    fragmentsDate.month = monthNames[dateObj.getMonth()];
    fragmentsDate.year = dateObj.getFullYear();

    return fragmentsDate;
}

function getDoctorEspecialties(hc_doctors) {
    var specialties_arr = [];
    var htmlSpecialties = "";
    hc_doctors.forEach(function (doctor) {
        doctor.specialties.forEach(function (specialty) {
            var exist_in_array = $.inArray(specialty.specialty_name, specialties_arr);
            if( exist_in_array === -1 ){
                specialties_arr.push(specialty.specialty_name);
            }
        });
    });
    specialties_arr.forEach(function (specialty_name) {
        htmlSpecialties += `<div class="item-specialty">${specialty_name}</div>`;
    });

    return htmlSpecialties;
}

function calcRank(aggregate_rank) {

    return (aggregate_rank.sumStars / aggregate_rank.numRank)
}

function specialties(specialtiesItems) {
    htmlItems = "";
    specialtiesItems.forEach(function (specialty) {
        htmlItems += `<li>${specialty.specialty_name}</li>`
    });
    return htmlItems;
}

function get_li_hcenters(hcenters) {
    var htmlHCenters = "";
    hcenters.forEach(function (hcenter) {
        htmlHCenters += tplElement.item_hcenter_doc(hcenter)
    });
    return htmlHCenters;
}

function get_li_comments(comments) {
    var htmlComments = "";
    comments.forEach(function (comment) {
        htmlComments += tplElement.item_comments_doc(comment);
    });
    return htmlComments;
}

function buildUserComment(hc_id) {
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
		<div class="user-comment-component">
			<form class="f_usercomment_hc">
				<input type="hidden" name="hc_id" value="${hc_id}">
				<div class="message-login col-xs-offset-2 col-xs-10">${messageLogin}</div>
				<div class="message-error-comment col-xs-offset-2 col-xs-10"></div>
				<div class="col-xs-2 ">
					<img id="fb_img_comment" src="${imgSrc}">
				</div>
				<div class="col-xs-10" id="contaier-input-usercomment">
					<input class="user-comment form-control" name="user_comment_hc" id="user_comment_hc" type="text" ${inputDisabled} maxlength="2000" autocomplete="off">
				</div>
				<div class="container-btn-usercomment">
					<button type="submit" class="btn ${classBtnColor} ${hideBtn}"  ${inputDisabled}>Comentar</button>
				</div>
			</form>
		</div>
	`;
}



var tplElement = {
    in_response_hc_comment : function(){
        return `in response helloooo`;
    },

    build_hc_comments : function (hc_comments, health_center_id) {
        var html_comments = "";
        var num_loaded_comments = (num_page_hc_comments * limit_hc_comments);
        var next_page = num_page_hc_comments+1;

        hc_comments.forEach(function (comment) {
            html_comments += tplElement.item_comment_hc(comment);
        });

        if(num_total_hc_comments > num_loaded_comments){
            html_comments += `
                <div class="btn-more-hc-comments" data-num-page="${next_page}" data-hc-id="${health_center_id}" >
                    Ver más comentarios
                </div>
            `;
        }

        return html_comments;
    },

    comments_hc: function (arr_comments, health_center_id) {
        num_page_hc_comments = 1; // set in cero page comments hc
        var html_hc_comments = this.build_hc_comments(arr_comments, health_center_id);
        var user_comment_component = buildUserComment(health_center_id);
        return `
			<div id="hc_comment_component">
				<div id="container_user_comment">
					${user_comment_component}
				</div>
				<div id="container_comments_hc">
					${html_hc_comments}
				</div>
			</div>
		`;
    },

    profile_doctor: function (docProfile) {
        console.log(docProfile.healthCenters)
        var sex = ["", "Dr.", "Dra."];
        var name = docProfile.name,
            rank = calcRank(docProfile.aggregate_rank),
            age = docProfile.age,
            sex_doc = sex[docProfile.sex_doctor],
            html_specialties = specialties(docProfile.specialties),
            html_hcenters = get_li_hcenters(docProfile.healthCenters),
            html_comments = get_li_comments(docProfile.last_comments),
            image = docProfile.image,
            form_comment_doctor_component = doctor_comments.buildUserComment(docProfile.id);


        return `
			<div id="doc_bloq_img" class="">
				<!--img src="${image}" id="doc_image"/-->
				<i class="fa fa-user-md" aria-hidden="true"></i>
			</div>
			<div id="doc_gral_data" class="col-xs-10">
				<div class="doc_name">${sex_doc} ${name}</div>
				<!---div class="doc_age">${age} años</div-->
				<!--div class="doc_num_ranked">
					<input
						value="${rank}"
						class='rank_doc_profile rating-loading'
						data-show-caption="false"
						data-show-clear="false">
				</div-->
			</div>
			<div id="container_sp" class="col-xs-10">
				<ul id="doc_specialties">
					${html_specialties}
				</ul>
			</div>
			<div id="container_hcenters" class="col-xs-12">
				<ul id="doc_healthCenters">
					${html_hcenters}
				</ul>
			</div>
			<div id="container_hcenters" class="col-xs-12">
                ${form_comment_doctor_component}
				<ul id="doc_comments">
					${html_comments}
				</ul>
			</div>
		`;
    },

    item_list_doctor: function (doctorData, doctorIndex) {
        var sex = ["", "Dr.", "Dra."];
        var doc_name = doctorData.name,
            doctor_specialties = specialties(doctorData.specialties),
            doctor_comment = doctorData.last_comments[0].user_comment,
            sex_doc = sex[doctorData.sex_doctor],
            doctor_id = doctorData.id,
            doc_rank = calcRank(doctorData.aggregate_rank);

        return `<li data-doctor-index="${doctorIndex}" class="doc-list-item">
            <div class="container-img-doc-list"><i class="fa fa-user-md" aria-hidden="true"></i></div>
			<div class="doc_name_list">
				${sex_doc} ${doc_name}
			</div>
			<!---div class="list_doc_rank col-xs-4">
				<input
					value="${doc_rank}"
					class='rank_doc_list rating-loading'
					data-show-caption="false"
					data-show-clear="false">
			</div--->
			<ul class="doc_spec">
				${doctor_specialties}
			</ul>
			<div class="comment_doc_list col-xs-12">"${doctor_comment}"</div>
            <a class="more_doctor_profile col-xs-12" href="#">Ver perfil</a>
		</li>`;
    },

    item_list_hcenter: function (hcenterData, key) {


        var hc_name = hcenterData.name,
            hc_id = hcenterData._id,
            hc_aggregate_rank = hcenterData.aggregate_rank,
            level_cost = hcenterData.aggregate_cost.level_cost,
            hc_address = hcenterData.place.formatted_address,
            hc_doctors = hcenterData.doctors,
            hc_last_comments = hcenterData.last_comments;
            hc_comment = (hc_last_comments.length > 0)? '"'+comment_preview(hc_last_comments[0].user_comment, 0, 100 )+'"': "";
        doctor_specialties = getDoctorEspecialties(hc_doctors);
        rank = calcRank(hcenterData.aggregate_rank);



        return `
            <li class="item-gral-hc" data-hcid="${hc_id}">
				<div class="tit_listhcenter col-xs-10">${hc_name}</div>
				<div class="col-xs-2 select-marker" data-marker-index="${key}" >
				    Centrar
					<i class="fa fa-map-marker" aria-hidden="true"></i>
				</div>
				<!--div class="rank_listhcenter">
					<input
						value="${rank}"
						class='gral_rank_hcenter rating-loading'
						data-show-caption="false"
						data-show-clear="false">
				</div-->
				<!--div class="cost_listhcenter">Costo: ${level_cost}</div-->
				<div class="col-xs-12 no-padding address_listhcenter">${hc_address}</div>
				<div class="specialties-listhcenter">
					${doctor_specialties}
				</div>
				<div id="comment_listhcenter">
					${hc_comment}
				</div>
				<a class="more_listhcenter col-xs-12" href="#" >Ver más</a>
		    </li>`;
    },

    healthCenterDetail: function (hcDoctors) {
        console.log(hcDoctors);
        var lat = hcDoctors.geometry.coordinates[1];
        var lon = hcDoctors.geometry.coordinates[0];
        var rank = calcRank(hcDoctors.aggregate_rank);
        var itemsDoc = "";
        hcDoctors.doctors.forEach(function(doctor, key){
            itemsDoc += tplElement.item_list_doctor(doctor, key);
        });
        var component_hc_comments = tplElement.comments_hc(hcDoctors.last_comments, hcDoctors.health_center_id );



        return `
            <div id="detailHcenter" class="col-xs-12">
                <div class="subtitle-yi">
                    <div id="icon_hospital_detail_page"><i class="fa fa-hospital-o" aria-hidden="true"></i></div>
                    <span id="hcName">${hcDoctors.hcName}</span>
                </div>
                <div class="address-hc-detail" >${hcDoctors.formatted_address}</div>
                <!--div class="detail-hc-rank">
                    <input
                      value="${rank}"
                      class='detail_rank_hcenter rating-loading'
                      data-show-caption="false"
                      data-show-clear="false">
                </div-->
                <div class="directions">

                    <a class="waze" href="http://waze.to/?ll=${lat},${lon}&amp;navigate=yes" target="_blank">
                        <img class="waze-img" src="/images/waze.png">
                    </a>
                    <a class="directions-button" href="http://maps.google.com/maps?daddr=${lat},${lon}&amp;ll=" target="_blank">
                        <img class="maps-img" src="/images/btn-maps.png">
                    </a>
                    <div class="txt-direction">Como llegar</div>
                </div>
            </div>

            <ul id="hc_doctor_list" class="tab-detail col-xs-12" >${itemsDoc}</ul>
		    <div id="hc_comments_list" class="tab-detail col-xs-12">${component_hc_comments}</div>
		`;
    },

    item_comment_hc: function (commentItem) {
        var fecha = fragmentDate(commentItem.createdAt);
        var interactions_component = "";
        if( existSession() === true ){
            interactions_component = `
                <div id="hc_comment_interactions" class="col-xs-12">
                    <div class="btn-reponse-comment-hc" comment-id="${commentItem.health_center_id}" >
                        Responder
                    </div>
                </div>
            `;
        }

        return `<div class="item_comment_hc">
          <div class="username_comment_detail col-xs-6" data-user-id=${commentItem.userId} >
            ${commentItem.username}
          </div>
          <div class="detailhc_comment_date col-xs-6">${fecha.day} ${fecha.month} ${fecha.year}</div>
          <div class="detail_comment_hc col-xs-12">${commentItem.user_comment}</div>
          <!-- ${interactions_component} -->
        </div>`;
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

    item_hcenter_doc: function (hcenter) {
        var lat = hcenter.geometry.coordinates[1];
        var lon = hcenter.geometry.coordinates[0];
        var hc_phone = ( existSession() === false ) ? 'Teléfono: <span class="no-session-phone">Inicia sesión para ver el teléfono. </span>':'Teléfono: <a href="tel:'+hcenter.phone+'">'+hcenter.phone;
        return `
            <li data-healt-hcenter-id="${hcenter.healthCenterId}">
                <div id="icon_hospital_doctor_page"><i class="fa fa-hospital-o" aria-hidden="true"></i></div>
                <div class="name_hcenter_doc">${hcenter.name}</div>
                <div class="doctor_hc_formatted_address">${hcenter.formatted_address}</div>
                <div class="hc_phone" >${hc_phone} </div>
                <div class="directions">

                    <a class="waze" href="http://waze.to/?ll=${lat},${lon}&amp;navigate=yes" target="_blank">
                        <img class="waze-img" src="/images/waze.png">
                    </a>
                    <a class="directions-button" href="http://maps.google.com/maps?daddr=${lat},${lon}&amp;ll=" target="_blank">
                        <img class="maps-img" src="/images/btn-maps.png">
                    </a>
                    <div class="txt-direction">Como llegar</div>
                </div>
            </li>
        `;
    },

    loader : function(){
        return `<div class="loader"></div> `;
    },

    option_specialty: function(item){
      return `
        <li>
            <input type="radio" id="specialty_${item.id}" name="doc_specialty" value="${item.id}"/>
            <label for="specialty_${item.id}">${item.specialty_name}</label>
        </li>
      `;
    }


}
