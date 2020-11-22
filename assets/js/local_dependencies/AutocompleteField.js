var AutocompleteField = {
    idInput : 0,
    arrSuggestions : [],
    mainField : "",
    auto_items : [],

    init : function (id_input, arr_suggestions, main_field) {
        this.idInput = id_input;
        this.arrSuggestions = arr_suggestions;
        this.mainField = main_field;
        this.auto_items = [];
    },


    setSuggestion : function (){
        var that = this;

        that.auto_items = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace(that.mainField),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            //initialize: false,
            identify: function (obj) {
                return obj.name;
            },

            local: that.arrSuggestions,
            //local: [{name: "Clinica Ribera:)"}]
        });

    },

    buildComponent : function(){
        var that = this;

        $(that.idInput).typeahead(
            {
                minLength: 0,
                highlight: true
            },
            {
                name: that.mainField,
                display: that.mainField,
                source: function(q, sync) {

                    if (q === '') {

                        var num_suggestions = that.auto_items.local.length;

                        var suggestions = [];
                        if(num_suggestions>0){
                            for(var i=0; i < num_suggestions; i++ ){
                                suggestions[i] = that.auto_items.local[i];
                                if(i==2){break;}
                            }
                        }
                        sync( suggestions );
                    }

                    else {
                        that.auto_items.search(q, sync);

                    }
                }
            }
        );

    },

    matchValue : function(callback){
        var that = this;
        var container_items = $(that.idInput).closest(".twitter-typeahead").find(".tt-dataset");
        // --- cuando dan click en el autocomplete
        $(container_items).on("click", ".tt-suggestion", function(){
            var option_selected = $(this).text();
            callback(option_selected, that.auto_items);

        });
        // --- cuando solo usan el teclado
        $(that.idInput).on("keyup", function(){
            var option_selected = $(this).val();
            callback(option_selected, that.auto_items);

        });
    }

}
