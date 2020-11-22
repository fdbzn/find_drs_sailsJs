var yiPage = {
  init : function(){
    yiPage.closeBtnPage();
  },

  open : function(callback ){
    // --- get tpl new page
    var tplpage = $(yiPage.tplPage());
    // --- add a new alement and execute callback
    $("body").append(tplpage).promise().done(function() {
      tplpage.show(function(){
        tplpage.css("width","100%");
      });

      if( typeof(callback) === "function" ){
          var main_container = tplpage.find(".content_page");
          callback(main_container);
      }
    });
  },

  closeBtnPage : function(){
    $(document).on("click",".btn_close_page", function(){
      $(this).closest(".bg_new_page").css("width", "0").promise().done(function(){
        var page = $(this);
        setTimeout(function () {
          page.remove();
        }, 500);
      })

    });
  },

  tplPage : function(){
    return `
      <div class="bg_new_page">

        <div id="header_landig">
          <button class="btn_close_page col-xs-1">
            <i class="fa fa-arrow-left" aria-hidden="true"></i>
          </button>
          <div id="title_logo" class="col-xs-3">Yiunic</div>
        </div>

        <div class="content_page col-xs-12">
          <div class="loader"></div> 
        </div>
      </div>

    `;
  }
}
yiPage.init();
