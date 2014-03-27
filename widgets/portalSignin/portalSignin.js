/*global define,dojo,alert,LeftPanelCollection */
/*jslint browser:true,sloppy:true,nomen:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
//============================================================================================================================//
define([
    "dojo/_base/declare",
    "dojo/text!./templates/PortalSignin.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/i18n!nls/localizedStrings",
    "dojo/query",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "esri/arcgis/Portal",
    "widgets/leftPanel/leftPanel"
], function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, topic, lang, Deferred, nls, query, on, domConstruct, domAttr) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        nls: nls,
        flag: false,

        postCreate: function () {
            domAttr.set(this.signInLabel, "innerHTML", nls.signInText);
            // set app ID settings and call init after
            this.own(on(this.signInContainer, "click", lang.hitch(this, function () {
                var defObj;

                if (query(".signin")[0].innerHTML === nls.signInText) {
                    //flag to check if the sign in button is clicked for a public or private group
                    if (this.flag) {
                        //executed if the group is private
                        topic.publish("initializePortal");
                    } else {
                        //executed if the group is public
                        defObj = new Deferred();
                        topic.publish("portalSignIn", defObj);
                        defObj.then(function () {
                            if (query(".esriCTGalleryContent")[0]) {
                                domConstruct.destroy(query(".esriCTGalleryContent")[0]);
                            }
                            new LeftPanelCollection();
                        }, function (err) {
                            alert(err.message);
                        });
                    }
                } else {
                    //executed on clicking of the sign out button
                    defObj = new Deferred();
                    topic.publish("portalSignIn", defObj);
                    defObj.then(function () {
                        if (query(".esriCTGalleryContent")[0]) {
                            domConstruct.destroy(query(".esriCTGalleryContent")[0]);
                        }
                        new LeftPanelCollection();
                    }, function (err) {
                        alert(err.message);
                    });
                }
            })));
        }
    });
});
