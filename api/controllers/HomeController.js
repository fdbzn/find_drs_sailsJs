module.exports = {
  index: function(req,res){
    res.view({
      user: req.user
    });
  }
};