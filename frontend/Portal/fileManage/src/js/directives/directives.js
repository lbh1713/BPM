
    'use strict';
    // var app = angular.module('app');

    app.directive('angularFilemanager', ['$parse', 'fileManagerConfig', function ($parse, fileManagerConfig) {
        return {
            restrict: 'EA',
            templateUrl: fileManagerConfig.tplPath + '/main.html'
        };
    }]);

    app.directive('ngFile', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFile);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }]);

    app.directive('ngRightClick', ['$parse', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            });
        };
    }]);

    //app.value('extraObj', null);
    app.directive("jqueryUpload", ["fileNavigator", "$rootScope", function (fileNavigator,$rootScope) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function ($scope, element, attrs, ngModel) {
                var url = "/Portal/fileManage/";
                var jsonData = {};
                if($rootScope.rootdir == $rootScope.scope.config.fileMemuTitle['allFiles']){
                    url += "uploadFile";
                    jsonData = {"path": $rootScope.rootdir + '/' + $scope.fileNavigator.currentPath.join('/'), "parentId": $scope.fileNavigator.currentFileId, "filePermission":$scope.fileNavigator.filePermission};
                }else if($rootScope.rootdir == $rootScope.scope.config.fileMemuTitle['myFiles']){
                    url += "uploadMyFile";
                    jsonData = {"path": $rootScope.rootdir + '/' + $scope.fileNavigator.currentPath.join('/'), "parentId": $scope.fileNavigator.currentFileId};
                }
                extraObj = $(element).uploadFile({
                    url: url,
                    fileName: "file",
                    showFileSize: true,
                    showDelete: true,
                    autoSubmit: false,
                    statusBarWidth: "auto",
                    dragdropWidth: "auto",
                    dragdropHeight: 200,
                    uploadStr: "选择",
                    cancelStr: "取消",
                    abortStr: "终止",
                    deleteStr: "删除",
                    dynamicFormData: function () {
                        return jsonData;
                    },
                    onSuccess: function (files, data, xhr, pd) {
                        var obj = eval(data);

                        if (obj.errorCode == 200) {
                            $scope.fileNavigator.refresh();
                        } else {
                            pd.progressDiv.hide();
                            pd.statusbar.append("<span class='ajax-file-upload-error'>ERROR: " + obj.msg + "</span>");
                        }
                    }
                });
            }
        };
    }]);


