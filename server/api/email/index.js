'use strict';

var express = require('express');
var controller = require('./email.controller');
var auth = require('../../auth/auth.service');
var app = express();

var router = express.Router();

//router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:id', auth.isAuthenticated(), controller.show);





router.post('/', auth.isAuthenticated(), controller.post);
//router.put('/:id', auth.isAuthenticated(), controller.update);
//router.patch('/:id', auth.isAuthenticated(), controller.update);
//router.delete('/:id', auth.isAuthenticated(), controller.destroy);





router.post('/email', function(request, response){
	var body = request.body;
 
	// Set email configuration such as Fron email, To email, Subject, HTML body.
	var params = {
	    from: '"Gopal Joshi " smangele.feliciamtnhembu@gmail.com',
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
});

module.exports = router;