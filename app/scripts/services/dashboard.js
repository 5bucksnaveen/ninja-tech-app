"use strict";

angular.module('PROJECT').service('dashBoardService', ['$q', 'alertService', 'messageService', 'Restangular', 'PROJECT_CONSTANTS',
    function ($q, alertService, messageService, Restangular, PROJECT_CONSTANTS) {
        /**
         * function to fetch data to be shown on dashboard
         * @param data - data required to fetch alert list and thread list
         * @return collection of promises which will be considered resolved if all the promises has been resolved
         */
        this.getDashBoardData = function (data) {
            var patientCountDefer = $q.defer();
            // get count of patients associated with this patient
            Restangular.all(PROJECT_CONSTANTS.restAPIURL.patientCount).get('', {}).then(
                function (response) {
                    patientCountDefer.resolve(response);
                }, function (response) {
                    patientCountDefer.reject(response);
                }
            );
            return $q.all([
                patientCountDefer.promise,
                alertService.activeAlertList(data),
                messageService.getThreadList(data).promise
            ]);
        };
    }
]);
