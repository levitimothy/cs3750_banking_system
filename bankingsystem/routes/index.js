var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  
  if (req.session.loggedIn) {
    res.redirect("/accountpage");
  } else {
    res.redirect("/loginuser");
  }
  // if (req.session.test === undefined) {
  //   console.log("Session key test not set");
  //   req.session.test = "Putting data in a session variable";
  //   req.session.save(function(err) {
  //     if (err) {
  //       throw err;
  //     }
  //     console.log("Session variable set test: " + req.session.test);
  //   });
  // } else {
  //   console.log("Session variable set test: " + req.session.test);
  // }

  res.render('index', { title: 'Express' });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
          throw err;
        }   
        res.redirect('/'); 
    });
});

module.exports = router;
