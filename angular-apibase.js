(function() {
    "use strict";
    
    var app = angular.module("apibase", []);
    
    app.factory("$apibase", ["$rootScope", function ($rootScope) {
        return function (ref) {
            var apibase = new APIBase(ref),
                $scope = $rootScope.$new(true);
        
            apibase.retrieve().then(exposeAPI);
            
            $scope.setMethods = function (APIList) {
                var API = {};
                for (var i=0; i<APIList.length; i++) {
                    API[APIList[i]] = true;
                }
                exposeAPI(API);
            };
            
            function wrap(func) {
                return function () {
                    if (!$rootScope.$$phase)
                        $rootScope.$apply(func.apply(func, arguments));
                    else
                        func.apply(func, arguments);
                }; 
            }
            
            function exposeAPI(API) {
                if ($scope.API) return;
                $scope.API = {};
                angular.forEach(API, function (method, methodName) {
                    $scope.API[methodName] = function () {
                        var promise = API[methodName].apply(API, arguments);
                        return {
                            then: function (success, error) {
                                var args = [];
                                
                                if (success)
                                    args.push(wrap(success));
                                if (error)
                                    args.push(wrap(success));
                                    
                                promise.then.apply(promise, args);
                            }
                        };
                    };
                });

                $scope.$broadcast("ready", $scope.API);
                $scope.$apply();
            }
            
            return $scope;
        };
    }]);
}());