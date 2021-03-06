﻿app.controller('DefaultController',
    ['$rootScope', '$scope', '$translate', '$http', '$state', '$stateParams', '$modal', '$compile', '$stateParams', '$interval', '$timeout', 'ControllerConfig',
    function ($rootScope, $scope, $translate, $http, $state, $stateParams, $modal, $compile, $stateParams, $interval, $timeout, ControllerConfig) {
        $scope.ShowDesignMode = true;
        //刷新页面，获取状态，浏览or编辑，失败
        $scope.$on('$viewContentLoaded', function (event) {
            //console.log($stateParams.Mode, "$stateParams.Mode")
            if ($stateParams.OT_EditorModel == true || $stateParams.Mode == "Design") {
                $scope.OT_EditorModel = true;
            } else {
                // angular.element("#content-wrapper").removeClass("edit-model");
            }
        })

        var AddEditModel = $interval(function () {
            if ($stateParams.Mode == "Design") {
                $scope.OT_EditorModel = true;
                if (angular.element("#content-wrapper").length == 1) {
                    angular.element("#content-wrapper").addClass("edit-model");
                    $interval.cancel(AddEditModel);
                }
            } else {
                if (angular.element("#content-wrapper").length == 1) {
                    angular.element("#content-wrapper").addClass("edit-model");
                    $interval.cancel(AddEditModel);
                }
            }
        }, 500);

        //加载页面模板
        $scope.RenderTemplateToPage = function () {
            //console.log("RenderTemplateToPage.PageId..." + $rootScope.PageId);
            //console.log("$stateParams.PageId..." + $stateParams.PageId);
            var url  = "";
            if ($stateParams.Mode == "Design"){
                url = ControllerConfig.HomePage.RenderTemplateToPage;
            }else{
                url = ControllerConfig.HomePage.RenderTemplateToObj;
            }
            $http({
                url: url,
                params: {
                    PageId: $stateParams.PageId || "",
                    random: new Date().getTime()
                }
            })
                .success(function (result, header, config, status) {
                    //页面模板
                    // console.log(result, '页面模板')
                    // var code = he.escape(result.PageTemplateContent)
                    var htmlCode = result.PageTemplateContent;
                    document.getElementById("div_contents").innerHTML = htmlCode;
                    $scope.PageId = result.PageId;
                    //页面标题
                    $scope.Title = result.Title;
                    //所有的部件模板
                    $scope.AllWebParts = result.AllWebParts;
                    //现有部件
                    $scope.WebParts = [];
                    angular.forEach(result.WebPartInstValue, function (data, index, full) {
                        var v = {}
                        angular.forEach(data, function (d, index, full) {
                            v[d.Text] = d.Value
                        })
                        $scope.WebParts.push(v);
                    })
                    //添加部件按钮
                    var webPartHtml = angular.element($("div[part]"));
                    if ($stateParams.Mode == "Design") {
                        angular.forEach(webPartHtml, function (data, index, full) {
                            angular.element(data).attr("portlet", "portlet");
                            var addPart = "<div class=\"button tool-button\" ng-click=\"showEditModel('','','" + data.getAttribute("part") + "')\" ng-show=\"OT_EditorModel\"><a style=\"margin-left:3px;\" translate=\"HomePage.AddWebPart\"></a></div>";//添加部件  区域
                            addPart = angular.element(addPart);
                            angular.element(data).append(addPart);
                        });

                        angular.forEach($scope.WebParts, function (data, index, full) {
                            $scope.WebParts[index] = data;
                            var htmlPart = angular.element($("[part=" + data.WebPartPost + "]"));
                            htmlPart.attr("portlet", "portlet");
                            htmlPart.append("<div web-part-init=\"" + data.ObjectID + "\"  web-index=\"" + index + "\"></div>");
                        })
                        $compile(webPartHtml)($scope);
                    } else {
                        angular.forEach(webPartHtml, function (data, index, full) {
                            angular.element(data).attr("portlet", "portlet");
                            var addPart = "<div class=\"button tool-button\" ><a style=\"margin-left:3px;\" translate=\"HomePage.AddWebPart\"></a></div>";//添加部件  区域
                            addPart = angular.element(addPart);
                            angular.element(data).append(addPart);
                        });

                        angular.forEach($scope.WebParts, function (data, index, full) {
                            $scope.WebParts[index] = data;
                            var htmlPart = angular.element($("[part=" + data.WebPartPost + "]"));
                            htmlPart.attr("portlet", "portlet");
                            htmlPart.append("<div web-part-init=\"" + data.ObjectID + "\"  web-index=\"" + index + "\"></div>");
                        })
                        $compile(webPartHtml)($scope);
                    }

                })
        }

        $scope.RenderTemplateToPage();

        //移除部件
        // WebPartObjectID 部件实例ID
        $scope.RemoveWebPartInst = function (WebPartObjectID) {
            if (WebPartObjectID == "" || WebPartObjectID == null) {
                return;
            }
            $http({
                url: ControllerConfig.HomePage.RemoveWebPartFromPage,
                params: {
                    InstanceID: WebPartObjectID,
                    rendom: new Date().getTime()
                }
            })
                .success(function (result, header, config, status) {
                    $state.go($state.$current.self.name, {OT_EditorModel: true}, {reload: true});
                })
                .error(function (result) {
                })
        }

        //添加、设置部件
        // WebPartObjectID 部件实例ID
        // WebPartID 部件ID
        // Part 区域
        $scope.showEditModel = function (WebPartObjectID, WebPartID, Part) {
            // 弹出模态框
            var modalInstance = $modal.open({
                //templateUrl: 'webpartEdit.html',    // 指向上面创建的视图
                templateUrl: "template/WebParts/WebpartEdit.html",
                controller: 'webpartEditController',// 初始化模态范围
                size: "lg",
                resolve: {
                    params: function () {
                        return {
                            PageId: $scope.PageId,
                            WebPartID: WebPartID,             //部件实例ID
                            WebPartObjectID: WebPartObjectID, //部件ID
                            Part: Part,                       //区域
                            AllWebParts: $scope.AllWebParts  //所有部件(Ascx,DataModel,Static)
                        };
                    },
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/services/ui-webpart-save.js',
                                'WFRes/editor/themes/default/default.css',
                                'WFRes/editor/kindeditor-all.js'
                            ]).then(function () {
                                return $ocLazyLoad.load([
                                    'WFRes/editor/lang/zh_CN.js'
                                ]);
                            });
                        }
                    ]
                }
            });
        }
    }]);

//添加、编辑插件Controller
app.controller('webpartEditController', ['$scope', '$http', '$state', '$modalInstance', '$interval', '$timeout', 'ControllerConfig', 'webpartSave', 'params', function ($scope, $http, $state, $modalInstance, $interval, $timeout, ControllerConfig, webpartSave, params) {
    $scope.WebPartObjectID = params.WebPartObjectID;//部件实例ID
    $scope.WebPartID = params.WebPartID;            //部件ID
    $scope.AllWebParts = params.AllWebParts;        //所有部件(Ascx,DataModel,Static)
    $scope.Part = params.Part;

    //编辑禁止修改部件类型
    $scope.IsNewWebPart = true;
    if (($scope.WebPartObjectID && $scope.WebPartID) || $scope.Part == "MobileDataModel") {
        $scope.IsNewWebPart = false;
        $timeout(function () {
            //console.log($("#Code"));
            initPageData();
        }, 500);
    }
    $scope.PartType = "";
    $scope.WebPartIDChange = function (WebPartID) {
        $scope.WebPartID = WebPartID;
        angular.forEach($scope.AllWebParts, function (data, index, full) {
            if (data.Value == WebPartID) {
                if (data.Text == "Ascx控件") {
                    $scope.PartType = "Ascx";
                } else if (data.Text == "数据模型") {
                    $scope.PartType = "DataModel";
                    //使数据模型的输入框宽度与其他保持一致
                    $timeout(function () {
                        $("#sheetWorkflow").css("width", "100%");
                    }, 500)
                } else if (data.Text == "静态内容") {
                    $scope.PartType = "Static";
                } else if (data.Text == "报表") {
                    $scope.PartType = "Report";
                    initPageData();
                }
            }
        })
        // initPageData();

    }
    $scope.WebPartIDChange($scope.WebPartID);


    if ($scope.Part == "MobileDataModel") {
        $scope.PartType = "DataModel";
        angular.forEach($scope.AllWebParts, function (data, index, full) {
            if (data.Text == "数据模型") {
                $scope.WebPartID = data.Value;
            }
        })
    }

    $scope.init = function () {
        //公共属性
        $scope.Title = "";//标题
        $scope.TitleIcon = "";//标题图标
        $scope.FunctionCode = "";//权限编码
        $scope.Height = "";//高度
        $scope.HeightUnit = "px";//高度单位
        $scope.CssName = "";//css样式
        $scope.TitleVisible = "1";//显示标题栏

        //初始化 tab.js
        var AddEditModel = $interval(function () {
            if (angular.element("#StepTab a").length > 0) {
                angular.element("#StepTab a").bind('click', function (e) {
                    e.stopPropagation()
                    e.preventDefault();
                    $(this).tab('show');
                    //初始化静态内容
                    var element = $("textarea[class^='ckeditor']")
                    if (element.length == 1 && element.attr("data-init") == "true") {
                        element.attr("data-init", "false");
                        $scope.InitKindEditor();
                    } else {
                        return;
                    }
                })
                $interval.cancel(AddEditModel);
            }
        }, 200);

        //初始化数据
        if (params.WebPartObjectID != "" && params.WebPartObjectID != null) {
            $http({
                url: "PortalHandler/GetWebPartInstEditValue",
                params: {
                    InstanceID: params.WebPartObjectID,
                    rendom: new Date().getTime()
                }
            })
                .success(function (result, header, config, status) {
                    if ($scope.PartType == "Ascx") {
                        $scope.SetAscxValue(result);
                    } else if ($scope.PartType == "DataModel") {
                        $scope.SetDataModelValue(result);
                    } else if ($scope.PartType == "Static") {
                        $scope.SetStaticValue(result);
                    } else if ($scope.PartType == "Report") {
                        $scope.SetReportValue(result);
                    }
                })
                .error(function () {
                })
        }
    }
    $scope.init();

    $scope.save = function () {
        var WebPartID = $scope.WebPartID;     //部件id,唯一部件
        $scope.WebPartID = false;
        var WebPartObjectID = params.WebPartObjectID;//部件实例ID
        var WebPartPost = params.Part;
        $modalInstance.close();
        webpartSave.save(params.PageId, WebPartObjectID, WebPartID, WebPartPost, $scope);
        $state.go($state.$current.self.name, {}, {reload: true});
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    };

    $scope.SetAscxValue = function (datas) {
        angular.forEach(datas, function (data, index, full) {
            if (data.Text == "Height") {
                $scope[data.Text] = Number(data.Value);
            } else {
                $scope[data.Text] = data.Value;
            }
        })
    }
    //报表start

    //初始化页面数据
    function initPageData() {

        $.ajax({
            url: "/Portal/FunctionNode/GetFunctionNode?id=&appCode=Report&parentCode=Report",
            type: 'get',
            dataType: "json",
            async: false,//同步执行
            success: function (result) {
//            	//console.log(result);
                pageData = result.Extend;
                InitReportSelect(result.Extend.ReportTree);
            }
        });

    };

    function InitReportSelect(datas) {

        var combob = $("#Code").ligerComboBox({
            selectBoxWidth: 360,
            selectBoxHeight: 260,
            valueField: 'Code',
            idFieldName: 'Code',
            textField: 'Text',
            treeLeafOnly: false,
            tree: {
                isMultiSelect: false,
                data: datas,
                checkbox: false,
                idField: 'Code',
                idFieldName: 'Code',
                textFieldName: 'Text',
                render: function (row) {
                    row.Text = row.ExtendObject.Text;
                    return row.ExtendObject.Text;
                },
                //update by ouyangsk 叶子节点的判断函数，当子对象长度等于0时，则为叶子节点
                isLeaf: function (row) {
                    if (row.nodeType == 'ReportFolderPage') {
                        return true;
                    }
                    return false;
                }
            },
            onSelected: function (val, name) {
                //console.log(val);
                //console.log(name);
                $scope.Code = val;
            },
            onSuccess: function (data) {
            }

        });

    }

    $scope.SetReportValue = function (datas) {
        angular.forEach(datas, function (data, index, full) {
            if (data.Text == "Height") {
                $scope[data.Text] = Number(data.Value);
            } else {
                $scope[data.Text] = data.Value;
            }
        })
    }
    // —— 数据模型部件  Start ——    
    $scope.DataModelInit = function () {
        $scope.BindDataFields = [{
            AttrName: "",
            Len: 10,
            Format: ""
        }]

        $scope.WorkflowOptions = {
            Editable: true, Visiable: true, Mode: "WorkflowTemplate", IsMultiple: false,
            OnChange: function (e) {
                $scope.GetWorkflowItems();
            }
        }

        $scope.GetWorkflowItems = function (WorkflowCode) {
            $scope.WorkflowCode = WorkflowCode || $("#sheetWorkflow").SheetUIManager().GetValue();
            if ($scope.WorkflowCode == "" || $scope.WorkflowCode == null) return;
            $http({
                url: ControllerConfig.WebParts.ChangeWorkflowCode,
                params: {
                    WorkflowCode: $scope.WorkflowCode
                }
            })
                .success(function (result, header, config, status) {
                    // 绑定流程模板的数据项
                    // console.log(result);
                    if (/*result.ExceptionCode == -1 && */result.Success == true) {
                        $scope.WorkflowItems = result.Extend;
                    }
                    //加载树成功后让li元素样式变为absolute处理选中后空白bug
                    $(".select2-container-multi .select2-choices .select2-search-choice").css({
                        "position": "absolute",
                        "padding-right": "15px"
                    });
                })
        }

        $scope.RemoveBindDataField = function (index) {
            $scope.BindDataFields.splice(index, 1);
        }

        $scope.AddBindDataField = function () {
            $scope.BindDataFields.push({
                AttrName: "",
                Len: 10,
                Format: ""
            })
        }

        $scope.SetDataModelValue = function (datas) {
            angular.forEach(datas, function (data, index, full) {
                if (data.Text == "Height" || data.Text == "ShowCount") {
                    $scope[data.Text] = Number(data.Value);
                }
                else if (data.Text == "DataModelCode") {
                    var SetValue = $interval(function () {
                        if (angular.element("#sheetWorkflow") && angular.element("#sheetWorkflow").SheetWorkflow()) {
                            angular.element("#sheetWorkflow").SheetWorkflow().SetValue(data.Value);
                            $scope.GetWorkflowItems(data.Value);
                            $interval.cancel(SetValue);
                        }
                    }, 1000);
                } else if (data.Text == "BoundField") {
                    $scope.BindDataFields = [];
                    var boundfields = data.Value.split(',');
                    $timeout(function () {
                        angular.forEach(boundfields, function (boundfield, index, full) {
                            var v = boundfield.split('|');
                            $scope.BindDataFields.push({
                                AttrName: v[0],
                                Len: Number(v[1]),
                                Format: v[2]
                            })
                        })
                    }, 2 * 1000)
                }
                else {
                    $scope[data.Text] = data.Value;
                }
            })
        }
    };
    $scope.DataModelInit();


    // —— 数据模型部件  End ——

    // —— 静态内容 初始化富文本框 Start ——
    $scope.InitKindEditor = function () {
        this.EditorIndex = KindEditor.instances.length;
        var index = this.EditorIndex;
        var element = $("textarea[class^='ckeditor']");

        this.EditorObject = KindEditor.create(element, {
            cssPath: "WFRes/editor/plugins/code/prettify.css",
            uploadJson: "upload/upload_json.jsp",
            fileManagerJson: "WFRes/editor/asp.net/file_manager_json.ashx",
            allowFileManager: true,
            items: [
                'source', '|', 'undo', 'redo', '|', 'code', 'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter',
                'justifyright', 'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                'superscript', 'clearhtml', 'selectall', '|', 'fullscreen', '/',
                'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'strikethrough',
                'lineheight', 'removeformat', '|', 'image', 'table', 'hr', 'emoticons', 'anchor', 'link', 'unlink', '|', 'about'
            ],
            afterCreate: function () {
                this.sync();
                var self = this;
                // 给KindEditor绑定paste事件，用于粘贴截图
                $(self.edit.doc).on("paste", function (e) {
                    // 需支持HTML5
                    if (!(!!window.ActiveXObject || "ActiveXObject" in window) && typeof(Worker) === "undefined") {
                        return;
                    }

                    var itmes = (e.clipboardData || e.originalEvent.clipboardData).items,
                        blob = null,
                        i,
                        length;

                    for (i = 0, length = itmes.length; i < length; i++) {
                        if (itmes[i].type.indexOf("image") === 0) {
                            blob = itmes[i].getAsFile();
                            break;
                        }
                    }

                    if (blob) {
                        var data = new FormData();
                        data.append("imgFile", blob, "screenshot.png");
                        data.append("BizObjectID", sheetInfo.BizObjectID);
                        data.append("UserID", sheetInfo.UserID);
                        data.append("SchemaCode", sheetInfo.SchemaCode);
                        data.append("EditorIndex", index);

                        $.ajax({
                            url: "WFRes/editor/asp.net/upload_json.ashx",
                            type: "POST",
                            data: data,
                            cache: false,
                            processData: false, // 告诉jQuery不要去处理发送的数据
                            contentType: false, // 告诉jQuery不要去设置Content-Type请求头
                            dataType: "json",
                            success: function (data) {
                                if (data.error === 0) {
                                    KindEditor.instances[data.editorIndex].insertHtml("<img src=\"" + data.url + "\" alt=\"\" /> ");
                                }
                            }
                        });
                    }
                });
            },
            afterChange: function () {
                this.sync();
            },
            afterBlur: function () {
                this.sync();
            }
        });
    }

    $scope.SetStaticValue = function (datas) {
        angular.forEach(datas, function (data, index, full) {
            if (data.Text == "Height") {
                $scope[data.Text] = Number(data.Value);
            } else if (data.Text == "HtmlContent") {
                KindEditor("#StaticHtml").val(data.Value);
            }
            else {
                $scope[data.Text] = data.Value;
            }
        })
    }
    // —— 静态内容 初始化富文本框 End ——
}]);

//插件初始化
app.directive('webPartInit', ['$interval', '$timeout', '$http', 'ControllerConfig', '$compile', function ($interval, $timeout, $http, ControllerConfig, $compile) {
    return {
        restrict: 'A',
        scope: true,
        controller: function ($scope, $element) {
            $scope.index = $element.attr("web-index");
            $scope.WebPartData = $scope.$parent.WebParts[$scope.index]; //当前部件属性值
            //当前部件类型
            $scope.AllWebParts = $scope.$parent.AllWebParts;
            angular.forEach($scope.$parent.AllWebParts, function (data, index, full) {
                if (data.Value == $scope.WebPartData.WebPartID) {
                    $scope.WebPartType = data;
                }
            })
            if ($scope.WebPartType.Text == "数据模型") {
                var Init = $interval(function () {
                    var ele = angular.element("#" + $scope.WebPartData.ObjectID);
                    if (ele.length == 1) {
                        DataModelInit($scope.WebPartData);
                        $interval.cancel(Init);
                    }
                }, 100);
            } else if ($scope.WebPartType.Text == "静态内容") {
                var Init = $interval(function () {
                    var ele = angular.element("#" + $scope.WebPartData.ObjectID);
                    if (ele.length == 1) {
                        ele.append($scope.WebPartData.HtmlContent);
                        $interval.cancel(Init);
                    }
                }, 100);
            } else if ($scope.WebPartType.Text == "报表") {
                var Init = $interval(function () {
                    var ele = angular.element("#" + $scope.WebPartData.ObjectID);
                    if (ele.length == 1) {
                        ele.append($scope.WebPartData.HtmlContent);
                        $interval.cancel(Init);
                        //用户控件
                        $scope.UserOptions = {
                            Editable: true,
                            Visiable: true,
                            OrgUnitVisible: true,
                            V: "",
                            IsMultiple: true,
                            PlaceHolder: ""
                        };
                        var ionic = {
                            $scope: $scope,
                            $compile: $compile
                        }
                        if (!$scope.WebPartData.Options) {
                            $scope.WebPartData.Options = [];
                        }

                        //console.log($scope.WebPartData.Code);
                        $scope.WebPartData.Options[$scope.WebPartData.ObjectID] = {
                            PortalRoot: window.localStorage.getItem("H3.PortalRoot") ? window.localStorage.getItem("H3.PortalRoot") : "/Portal",
                            SourceCode: $scope.WebPartData.Code,
                            ReportFiters: null,
                            ReportPage: $("#" + $scope.WebPartData.ObjectID).find(".ReportPage"),
                            Ionic: ionic
                        };
                        $("#" + $scope.WebPartData.ObjectID).find(".ReportPage").LoadReportFiters($scope.WebPartData.Options[$scope.WebPartData.ObjectID]);

                        var ReportModel = $("#" + $scope.WebPartData.ObjectID).find(".ReportPage ").find(".widget-messaging.mypanel");
                        $("#" + $scope.WebPartData.ObjectID).find(".ReportPage ").css("height", ReportModel.height() * ReportModel.length + ReportModel.length * 5 + 50);
                    }
                }, 100);
            }
            var DataModelInit = function (AttrValue) {
                var trDatas;
                if (AttrValue.DataModelCode == "" || AttrValue.QueryCode == "")
                    return;
                //获取数据
                $http({
                    //url: ControllerConfig.WebParts.GetDataModelData,
                    url: "PortalAdminHandler/GetDataModelData",
                    params: {
                        DataModelCode: AttrValue.DataModelCode,
                        QueryCode: AttrValue.QueryCode,
                        SortBy: AttrValue.SortBy,
                        ShowCount: AttrValue.ShowCount || 0,
                        BoundFiledList: AttrValue.BoundField,
                        LinkFormat: AttrValue.LinkFormat
                    }
                })
                    .success(function (data) {
                        $scope.trDatas = data.Extend;
                    })
            }
        },
        templateUrl: 'template/WebParts/WebPartPanel.html'
    }
}]);

//拖拽初始化
app.directive('portlet', ['$timeout', '$http', '$localStorage', 'ControllerConfig',
    function ($timeout, $http, $localStorage, ControllerConfig) {
        var storageKeyName = 'portletState';
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element) {

            if (!$.fn.sortable) return;

            element.sortable({
                connectWith: '[portlet]', // same like directive
                items: 'div.panel',
                handle: '.portlet-handler',
                opacity: 0.7,
                placeholder: 'portlet box-placeholder',
                cancel: '.portlet-cancel',
                forcePlaceholderSize: true,
                iframeFix: false,
                tolerance: 'pointer',
                helper: 'original',
                revert: 200,
                forceHelperSize: true,
                update: savePortletOrder,
                create: loadPortletOrder
            });
        }

        //保存插件
        function savePortletOrder(event/*, ui*/) {
            var div_part = angular.element(event.toElement.closest("[part]"));
            var _Change = false;
            //当前分区
            var _CurrentPartID = div_part.attr("part");
            //当前分区的WebPartID集合
            var _CurrentWebPartIDs = [];
            var webPartInst = div_part.find("[ot_webpart_inst]");
            angular.forEach(webPartInst, function (data, index, full) {
                var _thisPartInstanceID = data.getAttribute("ot_webpart_inst");
                _CurrentWebPartIDs.push(_thisPartInstanceID);
            });
            $http({
                //url: ControllerConfig.HomePage.PageWebPartSort,
                url: "PortalHandler/PageWebPartSort",
                params: {
                    WebPartIDs: _CurrentWebPartIDs,
                    PartID: _CurrentPartID,
                    rendom: new Date().getTime()
                }
            })
                .success(function (result, header, config, status) {
                    //超时，跳转到登陆页面

                })
                .error(function (result, header, config, status) {

                })
        }

        function loadPortletOrder(event) {
            var self = event.target;
            var data = angular.fromJson($localStorage[storageKeyName]);

            if (data) {
                var porletId = self.id,
                    panels = data[porletId];

                if (panels) {
                    var portlet = $('#' + porletId);
                    $.each(panels, function (index, value) {
                        $('#' + value).appendTo(portlet);
                    });
                }
            }
        }
    }]);