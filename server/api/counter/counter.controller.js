'use strict';

var _ = require('lodash');
var Counter = require('./counter.model');

// Get list of counter
/*exports.index = function (req, res) {
    Counter.find(function (err, counter) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, counter);
    });
};*/

//Get next Sequence Function   
exports.show = function (req, res) {
   Counter.findAndModify(
       {
           query: { _id: req.params.id },
           update: { $inc: { seq: 1 }},
           new: true
       }
   );
    
    //return seqDoc.seq;
    return res.json(200, counter);
}

// Get a single counter
/*exports.show = function (req, res) {
    Counter.findById( 
        query: { _id: req.params.name }, function (err, counter) {
        if (err) {
            return handleError(res, err);
        }
        if (!counter) {
            return res.send(404);
        }
        return res.json(counter);
    });
};*/


// Creates a new counter in the DB.

exports.create = function (req, res) {
    Counter.create(req.body, function (err, counter) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, counter);
    });
};

// Updates an existing counter in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    
    Counter.findAndModify(
        {
            query: { _id: req.params.id },
            update: { $inc: { seq: 1 }},
                new: true
            }
        );
    return res.json(200, seqDoc.seq);
};


/*
// Deletes a counter from the DB.
exports.destroy = function (req, res) {
    Counter.findById(req.params.id, function (err, counter) {

        if (err) {
            return handleError(res, err);
        }

        if (!counter) {
            return res.send(404);
        }

        counter.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};
*/

function handleError(res, err) {
    return res.send(500, err);
}