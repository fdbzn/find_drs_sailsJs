var GtagTraking = {
    open_specialty : function(){
        gtag('config', 'UA-120531288-1', {'page_path': '#specialties'});
    },

    my_location : function(){
        gtag('config', 'UA-120531288-1', {'page_path': '#my_location'});
    },

    ch_location : function(){
        gtag('config', 'UA-120531288-1', {'page_path': '#ch_location'});
    },

    page_detail_hc : function(path_detail_hc){
        gtag('config', 'UA-120531288-1', {'page_path': path_detail_hc});
    },

    page_detail_doc : function(path_detail_doc){
        gtag('config', 'UA-120531288-1', {'page_path': path_detail_doc});
    },

    page_map_recomend : function(){
        gtag('config', 'UA-120531288-1', {'page_path': '/recomendacion#map_recomend'});
    },

    btn_direction_maps : function(){

    },

    btn_direction_waze : function(){

    },

    btn_get_phone : function(){

    }
}
