'use strict';


angular.module('PROJECT').config([
    '$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', '$provide', 'RestangularProvider', 'PROJECT_CONSTANTS',
    function($stateProvider, $urlRouterProvider, $sceDelegateProvider, $provide, RestangularProvider,   PROJECT_CONSTANTS) {

        // Set API end point
        RestangularProvider.setBaseUrl(PROJECT_CONSTANTS.APIBaseUrl);

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'http://*.s3.amazonaws.com/**',
            'https://*.s3.amazonaws.com/**'
        ]);

        RestangularProvider.setRequestSuffix('\/');
        $provide.decorator('taOptions', ['taRegisterTool','$delegate', '$uibModal', function(taRegisterTool, taOptions, $uibModal) { // $delegate is the taOptions we are decorating
            taOptions.toolbar = [
              ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p','bold', 'italics', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'ol', 'ul']
            ];
            taRegisterTool('addImage', {
                iconclass: "fa-picture-o",
                tooltiptext: "Insert Image",
                action: function($deferred) {
                    angular.element('#imageselector').trigger('click');
                    return false;
                }
            });
            //add the button to the default toolbar definition
            taOptions.toolbar[0].push('addImage');
            return taOptions;
        }]);
        $stateProvider
        .state('dashboard', {
            url: '/dashboard/',
            templateUrl: PROJECT_CONSTANTS.templateUrls.dashboard,
            controller: 'DashboardCtrl'
        });
        $urlRouterProvider.otherwise('/dashboard/');
        }
    ]

).run(
    ['$state', '$rootScope', '$cookies', '$http', '$location', '$interval', '$localStorage', '$window', 'Restangular', 'PROJECT_CONSTANTS',
        function ($state, $rootScope, $cookies, $http, $location, $interval, $localStorage, $window, Restangular, PROJECT_CONSTANTS) {
        }
    ]
);
