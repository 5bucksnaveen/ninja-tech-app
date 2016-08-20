'use strict';

angular.module('PROJECT').controller('DashboardCtrl', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.pageTitle = 'Dashboard';
            $scope.select = 'dashboard';
            $scope.isAjaxComplete = true;
            $scope.activeAlert = true;
        }
    ]
);
