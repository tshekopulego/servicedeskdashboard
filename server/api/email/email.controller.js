'use strict';
var http = require('http'),
	express = require('express'),
	nodemailer = require('nodemailer'),
	parser = require('body-parser'),
    
	util = require('util')
	//validator = require('express-validator');
 var smtpTransport = require('nodemailer-smtp-transport');
// Setup App
var app = express();
//app.set('port', process.env.PORT || 8080);
//app.use(parser.json());
//app.use(parser.urlencoded({ extended: true }));
//app.use(validator());





 
// Email transporter configuration
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com', //smtp.gmail.com
    port: 465,  // secure:true for port 465, secure:false for port 587
    secure: true,
    auth: {
        user: 'mthunziduze@gmail.com',
        pass: 'mth957PAL?'
    }
}));

// Route
app.post('/email', function(request, response){
	var body = request.body;
 
	request.checkBody('email', 'Please enter email address').notEmpty();
	request.checkBody('email', 'Please enter valid email address').isEmail();
	request.checkBody('subject', 'Please enter subject').notEmpty();
	request.checkBody('message', 'Please enter messaage').notEmpty();
 
	request.getValidationResult().then(function(result) {
		if (!result.isEmpty()) {
			var arrResponse = {'status':'error', 'data':util.inspect(result.array())}
			response.status(200).send(JSON.stringify(arrResponse));
		} else {
			var params = {
			    from: '"Gopal Joshi " smangele.feliciamthembu@gmail.com',
			    to: body.email,
			    subject: body.subject,
			    html: body.message
			};
 
			transporter.sendMail(params, (mailError, mailReponse) => {
			    if (mailError) {
			        var arrResponse = {'status':'failure', 'error': mailError};
			    } else {
			    	var arrResponse = {'status':'success', 'data': mailReponse.accepted};
			    }
			    response.status(200).send(JSON.stringify(arrResponse));
			});
		}
	});
});



var exports = module.exports = {};
exports.post = function(req, res){
    
    
    console.log("!!!!!!!!!!!!!!!!1");
    console.log(req.body);
    transporter.sendMail({  //email options
    from: "mthunziduze@gmail.com", // sender address.  Must be the same as authenticated user if using Gmail.
    to: "cassino.happies@gmail.com", // receiver
    subject: "UsersQuery" // subject
        text:"bghjjjj sla" + 
        
        
    
    }, function(error, response){  //callback
  if(error){
    console.log(error);
  }else{
    console.log("Message sent: " + response.message);
  }
  transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
});
    res.send("done");
};
 
 
// Create NodeJs Server
//http.createServer(app).listen(app.get('port'), function(){
	//console.log('Server listening on port ' + app.get('port'));
//});






