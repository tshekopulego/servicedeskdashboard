'use strict';

// This filter converts an object into an array so that it can easily be iterated over by ng-repeat and passed to other filters like orderBy
angular.module('serviceDeskApp')
.filter('toArray', function () {
    'use strict';

    return function (obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).map(function (key) {
            return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
        });
    }
});
