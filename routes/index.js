
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { messages: req.flash('error') });
};