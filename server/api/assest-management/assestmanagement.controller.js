'use strict';

var _ = require('lodash');
var Assest = require('./assestmanagement.model');




// Get list of visitors
exports.index = function(req, res) {
Assest.find()
    .populate('assetCategory','categoryName')
    .populate('departments','departmentName')
    .populate('assetstatuses','assetstatusName')
    .populate('users','firstName')
    .exec(function (err, assestmanagements) {
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements);
});
};


// Get list of visitors chart data
exports.assetreport = function(req, res) {
Assest.find()
    .populate('assetCategory','categoryName')
    .populate('departments','departmentName')
    .populate('assetstatuses','assetstatusName')
    .populate('users','firstName')
    .exec(function (err, items) {
    if(err) { return handleError(res, err); }
        else {
            var temp = items.reduce(function(p,c){
                var defaultValue = {
                x: c.assetCategory.categoryName,
                y: 0
                };
                p[c.assetCategory.categoryName] = p[c.assetCategory.categoryName] || defaultValue
                p[c.assetCategory.categoryName].y++;
                
                return p;
            }, {});
            
            var result = [];
            for( var k in temp ){
                result.push(temp[k]);
            }
            console.log(result)
            return res.json(200, result);
            
        }
});
};


// Get list of visitors
exports.index = function(req, res) {
 
Assest.find()
   
.populate('assetCategory','categoryName')
.populate('departments','departmentName')
    .populate('assetstatuses','assetstatusName')
     .populate('users','firstName')

    .exec(function (err, assestmanagements) {
var itemsArray = []
var itemIds = assestmanagements
for (var i = 0; i < assestmanagements.length; i++) {
var status =itemIds[i].assetCategory.categoryName
itemsArray.push(status);
if(itemIds.length === itemsArray.length){
console.log(itemsArray)
var counts = {}, i, value;
for (i = 0; i < itemsArray.length; i++) {
value = itemsArray[i];
if (typeof counts[value] === "undefined") {
counts[value] = 1;
} else {
counts[value]++;
}
}
console.log(counts);
}
};
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements);
});
};

// Get a single issue


exports.show = function(req, res) {
Assest.findById({
_id:req.params.id
}).sort({added:1})
.populate('assetCategory','categoryName')
.populate('departments','departmentName')
    .populate('assetstatuses','assetstatusName')
    .populate('users','firstName')
.exec(function (err, assestmanagements) {
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements)
});
};






////new ones 


// Search Issue
exports.searchAssestmanagements = function(req, res) {
Assest.find({
assetCategory:req.params.category,
departments:req.params.departments
}).sort({added:1})
  .populate('assetCategory','categoryName')
  .populate('departments','departmentName')
  .populate('assetstatuses','assetstatusName')
      .populate('users','firstName')
  
    .exec(function (err, assestmanagements) {
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements);
});
};


// Search Issue By Category
exports.showAssestmanagementsByCategory = function(req, res) {
Assest.find({
assetCategory:req.params.category
}).sort({added:1})
.populate('assetCategory','categoryName')
.populate('departments','departmentName')
.populate('assetstatuses','assetstatusName')
    .populate('users','firstName')
  .exec(function (err, assestmanagements) {
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements);
});
};

// Search Issues By Status
exports.showJobAssestmanagementsByStatus = function(req, res) {
Assest.find({
assetstatuses:req.params.status
}).sort({added:1})
  .populate('assetCategory','categoryName')
  .populate('departments','departmentName')
  .populate('assetstatuses','assetstatusName')
      .populate('users','firstName')
  
    .exec(function (err, assestmanagements) {
if(err) { return handleError(res, err); }
return res.json(200, assestmanagements);
});
};















// Creates a new assettype in the DB.
exports.create = function (req, res) {
    Assest.create(req.body, function (err, assests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, assests);
    });
};

// Updates an existing assettype in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Assest.findById(req.params.id, function (err, assests) {
        if (err) {
            return handleError(res, err);
        }
        if (!assests) {
            return res.send(404);
        }
        var updated = _.merge(assests, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, assests);
        });
    });
};



//exports.update = function(req, res) {
// if(req.body._id) { delete req.body._id; }
// Assest.findById(req.params.id, function (err, assests) {
//
// if(req.body.comments) {
// assests.comments = req.body.comments;
// }
//
// if (err) { return handleError(res, err); }
// if(!assests) { return res.send(404); }
// var updated = _.merge(assests, req.body);
//
// updated.markModified('comments');
//
// updated.save(function (err) {
// if (err) { return handleError(res, err); }
// return res.json(200, assests);
// });
// });
//};












// Deletes a assettype from the DB.
exports.destroy = function (req, res) {
    Assest.findById(req.params.id, function (err, assests) {

        if (err) {
            return handleError(res, err);
        }

        if (!assests) {
            return res.send(404);
        }

        assests.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}

