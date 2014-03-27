/*global define,dojo,alert,esri,dojoConfig */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true */
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
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/text!./templates/itemDetails.html",
    "dojo/i18n!nls/localizedStrings",
    "dojo/query",
    "dojo/dom-class",
    "dojo/on",
    "dojo/Deferred",
    "dojo/number",
    "dojo/topic",
    "esri/arcgis/utils",
    "esri/dijit/Legend",
    "esri/map",
    "widgets/geoLocation/geoLocation",
    "widgets/baseMapGallery/baseMapGallery",
    "esri/tasks/locator",
    "dojo/string",
    "esri/layers/GraphicsLayer",
    "esri/dijit/HomeButton",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "esri/request",
    "esri/dijit/OverviewMap",
    "./itemDetailsHelper"
], function (declare, domConstruct, lang, array, domAttr, dom, template, nls, query, domClass, on, Deferred, number, topic, utils, Legend, Map, GeoLocation, BasemapGallery, Locator, string, GraphicsLayer, HomeButton, domStyle, domGeom, esriRequest, OverviewMap, itemDetailsHelper) {

    return declare([itemDetailsHelper], {
        templateString: template,
        nls: nls,
        basemapLayer: null,
        lastSearchString: null,
        stagedSearch: null,
        mapPoint: null,
        map: null,
        mapExtent: null,
        tempGraphicsLayerId: "esriGraphicsLayerMapSettings",

        postCreate: function () {
            domClass.add(query(".esriCTGalleryContent")[0], "displayNoneAll");
            domClass.replace(query(".esriCTApplicationIcon")[0], "esriCTCursorPointer", "esriCTCursorDefault");
            var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
            domClass.replace(query(".esriCTMenuTabRight")[0], "displayNoneAll", "displayBlockAll");
            this.itemIcon.src = this.data.thumbnailUrl;
            domConstruct.place(this.itemDetailsLeftPanel, applicationHeaderDiv);
            domAttr.set(this.itemTitle, "innerHTML", dojo.configData.ApplicationSettings.mapTitle || (this.data.title || ""));
            this._createMapLayers(this.data);

            this.own(on(query(".esriCTFullScreen")[0], "click", lang.hitch(this, function () {
                this._toggleFullScreen();
            })));
            domAttr.set(this.txtAddressSearch, "defaultAddress", dojo.configData.ApplicationSettings.locatorDefaultAddress);
            domAttr.set(this.txtAddressSearch, "value", domAttr.get(this.txtAddressSearch, "defaultAddress"));
            this.own(on(this.divLegendLayer, "click", lang.hitch(this, function () {
                this._slideLegendsPanel();
            })));

            this.own(on(this.divBackToMap, "click", lang.hitch(this, function () {
                this._slideLegendsPanel();
            })));

            this.own(on(this.legendTab, "click", lang.hitch(this, function () {
                this._switchTabs(this.legendTab, this.infoTab, this.layersTab, this.legendDetails, this.layerDescription, this.layerDetails);
            })));

            this.own(on(this.layersTab, "click", lang.hitch(this, function () {
                this._switchTabs(this.layersTab, this.infoTab, this.legendTab, this.layerDetails, this.layerDescription, this.legendDetails);
            })));

            this.own(on(this.infoTab, "click", lang.hitch(this, function () {
                this._switchTabs(this.infoTab, this.layersTab, this.legendTab, this.layerDescription, this.legendDetails, this.layerDetails);
            })));

            on(window, "resize", lang.hitch(this, function () {
                if (query(".esriCTLegendContainer")[0]) {
                    if (query(".esriMapGeoInfo")[0]) {
                        if (domStyle.get(query(".esriMapGeoInfo")[0], "display") === "block") {
                            query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".esriCTRightControlPanel")[0]).h + domGeom.position(query(".esriCTTabList")[0]).h + 40) + "px";
                        } else {
                            query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".labelLegendTab")[0]).h + domGeom.position(query(".esriCTInnerLeftPanelTopMap")[0]).h + 50) + "px";
                        }
                    } else if (query(".esriCTBackToMapBtn")[0]) {
                        if (domStyle.get(query(".esriCTBackToMapBtn")[0], "display") === "block") {
                            query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".esriCTRightControlPanel")[0]).h + domGeom.position(query(".esriCTTabList")[0]).h + 40) + "px";
                        } else {
                            query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".labelLegendTab")[0]).h + domGeom.position(query(".esriCTInnerLeftPanelTopMap")[0]).h + 50) + "px";
                        }
                    }
                }
            }));
            // if showMapSearch flag is set to true in config file then show textbox for map search or hide the textbox
            if (dojo.configData.ApplicationSettings.showMapSearch) {
                this.attachLocatorEvents();
            } else {
                domStyle.set(query(".esriCTMapInput")[0], "display", "none");
            }
        },

        // Add and remove classes on switching tabs in tab container
        _switchTabs: function (selectedTab, firstUnselectedTab, secondUnselectedTab, selectedContainer, firstUnselectedContainer, secondUnselectedContainer) {
            if (!domClass.contains(selectedTab, "select")) {
                domClass.add(selectedTab, "select");
            }
            if (domClass.contains(firstUnselectedTab, "select")) {
                domClass.remove(firstUnselectedTab, "select");
            }
            if (domClass.contains(secondUnselectedTab, "select")) {
                domClass.remove(secondUnselectedTab, "select");
            }
            domClass.replace(selectedContainer, "displayBlockAll", "displayNoneAll");
            domClass.replace(firstUnselectedContainer, "displayNoneAll", "displayBlockAll");
            domClass.replace(secondUnselectedContainer, "displayNoneAll", "displayBlockAll");
        },

        // Slides in and out the legends panel on the right upon clicking the info icon. Only for smart phone devices.
        _slideLegendsPanel: function () {
            if (query(".esriCTRightControlPanel")[0]) {
                domClass.toggle(query(".esriCTBackToMapPosition")[0], "displayNoneAll");
            }
            if (domClass.contains(query(".esriCTRightControlPanel")[0], "esriRightControlPanelMap")) {
                domClass.replace(query(".esriCTRightControlPanel")[0], "esriRightControlPanelLegend", "esriRightControlPanelMap");
                domClass.replace(this.divBackToMapContainer, "esriCTBackToMapBtn", "esriCTBackToMapBtnLegend");
            } else {
                domClass.replace(query(".esriCTRightControlPanel")[0], "esriRightControlPanelMap", "esriRightControlPanelLegend");
                domClass.replace(this.divBackToMapContainer, "esriCTBackToMapBtnLegend", "esriCTBackToMapBtn");
            }
            if (domClass.contains(query(".esriCTLegendTab")[0], "esriCTLegendTabMargin")) {
                domClass.replace(query(".esriCTLegendTab")[0], "esriCTLegendTabToggle", "esriCTLegendTabMargin");
            } else {
                domClass.add(query(".esriCTLegendTab")[0], "esriCTLegendTabMargin", "esriCTLegendTabToggle");
            }
            if (query(".esriCTRightPanelMap")[0]) {
                domClass.toggle(query(".esriCTRightPanelMap")[0], "esriCTShiftLeft");
            }
            if (query(".esriCTMenuTabLeft")[0]) {
                if (domClass.contains(query(".esriCTMenuTabLeft")[0], "displayBlock")) {
                    domClass.replace(query(".esriCTMenuTabLeft")[0], "displayNone", "displayBlock");
                } else {
                    domClass.replace(query(".esriCTMenuTabLeft")[0], "displayBlock", "displayNone");
                }
            }
            if (query(".esriCTLegendTab")[0]) {
                domClass.toggle(query(".esriCTLegendTab")[0], "displayBlock");
                domClass.toggle(query(".esriCTRightPanelMap")[0], "esriCTMapPanelShift");
                if (domClass.contains(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo")) {
                    this.mapExtent = this.map.extent;
                    domClass.remove(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo icon-info-circled-alt");
                } else {
                    domClass.add(query(".esriCTMapInfoIcon")[0], "esriMapGeoInfo icon-info-circled-alt");
                    setTimeout(lang.hitch(this, function () {
                        if (this.map) {
                            this.map.resize();
                            this.map.reposition();
                        }
                    }), 100);
                    setTimeout(lang.hitch(this, function () {
                        this.map.setExtent(this.mapExtent);
                    }), 500);
                }
                domClass.toggle(query(".esriCTMapGeoLocation")[0], "displayNone");
            }
            if (this.map && this.map.extent) {
                this.map.setExtent(this.map.extent);
            }
        },

        // Add full screen functionality.
        _toggleFullScreen: function () {
            var element, requestMethod, wscript;

            element = document.documentElement;
            // Supports most browsers and their versions.
            requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
            try {
                if (requestMethod) { // Native full screen.
                    requestMethod.call(element);
                } else if (window.ActiveXObject !== undefined) {
                    wscript = new window.ActiveXObject("WScript.shell");
                    wscript.SendKeys("{F11}");
                } else {
                    alert(nls.errorMessages.noFullScreenSupport);
                }
            } catch (ex) {
                alert(nls.errorMessages.noFullScreenSupport);
            }
        },

        // Identify different item types
        _createMapLayers: function (data) {
            var mapId = data.id, _self = this, dataType, layerType, url1, mapServiceLayerType;

            if (mapId) {
                if (data) {
                    dataType = data.type.toLowerCase();
                    if (dataType === "kml") {
                        this.addLayerToMap(mapId, data.url, data.title, dataType);
                    } else if (dataType === "web map") {
                        this.addWebMap(mapId);
                    } else if (dataType === "feature service") {
                        layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                        if (!isNaN(layerType)) {
                            this.addLayerToMap(mapId, data.url, data.title, dataType);
                        } else {
                            url1 = data.url + "?f=json";
                            esriRequest({
                                url: url1,
                                handleAs: "json",
                                load: function (jsondata) {
                                    var j, layerUrl;

                                    if (jsondata.layers.length > 0) {
                                        for (j = 0; j < jsondata.layers.length; j++) {
                                            layerUrl = data.url + "/" + jsondata.layers[j].id;
                                            _self.addLayerToMap(mapId, layerUrl, data.title, dataType);
                                        }
                                    }
                                },
                                error: function (err) {
                                    alert(err.message);
                                }
                            });
                        }
                    } else if (dataType === "map service") {
                        mapServiceLayerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                        if (!isNaN(mapServiceLayerType)) {
                            this.addLayerToMap(mapId, data.url, data.title, "feature service");
                        } else {
                            this.addLayerToMap(mapId, data.url, data.title, dataType);
                        }
                    } else if (dataType === "wms") {
                        this.addLayerToMap(mapId, data.url, data.title, dataType);
                    }
                    this._createItemDescriptionContent(data);
                }
            }
        },

        // Create legend
        createLegend: function (layerObj, itemMap, legendDiv) {
            if (domStyle.get(query(".esriMapGeoInfo")[0], "display") === "block") {
                query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".esriCTRightControlPanel")[0]).h + domGeom.position(query(".esriCTTabList")[0]).h + 40) + "px";
            } else {
                query(".esriCTLegendContainer")[0].style.height = dojo.window.getBox().h - (domGeom.position(query(".labelLegendTab")[0]).h + domGeom.position(query(".esriCTInnerLeftPanelTopMap")[0]).h + 50) + "px";
            }
            var legendDijit = new Legend({
                map: itemMap,
                layerInfos: layerObj
            }, legendDiv);
            legendDijit.startup();
        },

        // Fetch data from webmap
        addWebMap: function (mapId) {
            topic.publish("showProgressIndicator");
            var _self = this;
            utils.createMap(mapId, this.itemMap, {
                mapOptions: {
                    showAttribution: dojo.configData.ApplicationSettings.showAttribution,
                    slider: true
                }
            }).then(function (response) {
                var i, layerInfo, graphicsLayer, home;

                layerInfo = utils.getLegendLayers(response);
                _self.map = response.map;
                _self.basemapLayer = response.itemInfo.itemData.baseMap.baseMapLayers[0].id;
                graphicsLayer = new GraphicsLayer();
                graphicsLayer.id = _self.tempGraphicsLayerId;
                _self.map.addLayer(graphicsLayer);
                _self.createLegend(layerInfo, response.map, _self.legendDiv);
                _self._createLayerInfoContent(_self, layerInfo);
                home = _self._addHomeButton();
                domConstruct.place(home.domNode, query(".esriSimpleSliderIncrementButton")[0], "after");
                home.startup();
                if (dojo.configData.ApplicationSettings.showOverviewMap) {
                    //add overview map
                    _self._addOverviewMap(_self.map);
                }
                new GeoLocation({
                    map: response.map,
                    basemap: response.itemInfo.itemData.baseMap.baseMapLayers[0].id,
                    graphicsLayer: graphicsLayer
                });
                if (response.errors.length > 0) {
                    for (i = 0; i < response.errors.length; i++) {
                        alert(response.errors[i].message);
                    }
                }
                topic.publish("hideProgressIndicator");
            }, function (err) {
                alert(err.message);
                topic.publish("hideProgressIndicator");
            });
        },

        // Create map object for items of type "feature service","map service","kml" and "wms".
        addLayerToMap: function (mapId, url, title, type, data) {
            var home, baseMapLayers, layer;

            topic.publish("showProgressIndicator");
            this.map = new Map(this.itemMap, {
                zoom: 2,
                showAttribution: dojo.configData.ApplicationSettings.showAttribution,
                autoResize: true
            });
            home = this._addHomeButton();
            // if showBasemapGallery flag is set to true in config file
            if (dojo.configData.ApplicationSettings.showBasemapGallery) {
                //add basemap widget
                new BasemapGallery({
                    map: this.map
                }, domConstruct.create("div", {}, null));
            } else {
                //add basemap layer
                baseMapLayers = dojo.configData.BaseMapLayers;
                layer = new esri.layers.ArcGISTiledMapServiceLayer(baseMapLayers[0].MapURL, { id: baseMapLayers[0].Key, visible: true });
                this.map.addLayer(layer);
            }
            if (dojo.configData.ApplicationSettings.customLogoUrl && lang.trim(dojo.configData.ApplicationSettings.customLogoUrl).length !== 0) {
                domConstruct.create("img", { "src": dojoConfig.baseURL + dojo.configData.ApplicationSettings.customLogoUrl, "class": "esriCTMapLogo" }, this.itemMap);
            }
            this.map.on("load", lang.hitch(this, function () {
                var i, graphicsLayer;

                domConstruct.place(home.domNode, query(".esriSimpleSliderIncrementButton")[0], "after");
                home.startup();
                if (dojo.configData.ApplicationSettings.showOverviewMap) {
                    //add overview map
                    this._addOverviewMap(this.map);
                }
                //add graphics layer
                graphicsLayer = new GraphicsLayer();
                graphicsLayer.id = this.tempGraphicsLayerId;
                this.map.addLayer(graphicsLayer);
                for (i in this.map._layers) {
                    if (this.map._layers.hasOwnProperty(i)) {
                        if (this.map._layers[i].visibleLayers) {
                            this.basemapLayer = this.map._layers[i].id;
                        }
                    }
                }
                new GeoLocation({
                    map: this.map,
                    basemap: this.basemapLayer,
                    graphicsLayer: graphicsLayer
                });

                if (type === "kml") {
                    this._addKMLLayer(this.map, mapId, url, title);
                } else if (type === "feature service") {
                    this._addFeatureLayer(this.map, mapId, url, title);
                } else if (type === "map service") {
                    this._addCachedAndDynamicService(this.map, mapId, url, title);
                } else if (type === "wms") {
                    this._addWMSLayer(this.map, mapId, url, title, data);
                }
            }));
        },

        // Add overview map
        _addOverviewMap: function (map) {
            var overviewMapDijit = new OverviewMap({
                map: map,
                attachTo: "bottom-left",
                visible: true
            });
            overviewMapDijit.startup();
        },

        // Add KML layer to map
        _addKMLLayer: function (map, mapId, url, title) {
            var kml, layerInfo = [];

            kml = new esri.layers.KMLLayer(url);
            kml.id = mapId;
            map.addLayer(kml);
            layerInfo.push({
                layer: kml,
                title: title
            });
            this.createLegend(layerInfo, map, this.legendDiv);
            this._createLayerInfoContent(this, layerInfo);
            topic.publish("hideProgressIndicator");
        },

        // Add WMS layer to map
        _addWMSLayer: function (map, mapId, url, title, data) {
            var wmsLayer, layerInfo = [];

            wmsLayer = new esri.layers.WMSLayer(url);
            wmsLayer.setImageFormat("png");
            map.addLayer(wmsLayer);
            layerInfo.push({
                layer: wmsLayer,
                title: title
            });
            this.own(on(wmsLayer, "load", function () {
                var i, layerInfos = [];

                for (i = 0; i < wmsLayer.layerInfos.length; i++) {
                    layerInfos.push(wmsLayer.layerInfos[i].name);
                }
                wmsLayer.setVisibleLayers([layerInfos]);
                if (wmsLayer.spatialReferences.indexOf(map.spatialReference.wkid) === -1) {
                    alert(nls.errorMessages.wmsSpatialReferenceError);
                }
            }));
            this.own(on(wmsLayer, "error", function (err) {
                alert(err.error);
            }));
            domAttr.set(this.legendDiv, "innerHTML", nls.noLegendText);
            this._createLayerInfoContent(this, layerInfo);
            topic.publish("hideProgressIndicator");
        },

        // Add Home button to the esri slider
        _addHomeButton: function () {
            this.home = new HomeButton({
                map: this.map
            }, domConstruct.create("div", {}, null));
            return this.home;
        },

        // Extract the feature layer url
        _addFeatureLayer: function (map, id, url, title) {
            var _self = this, layerInfo = [], lastIndex, dynamicLayerId, dynamicLayer, dynamicLayerUrl;

            lastIndex = url.lastIndexOf('/');
            dynamicLayerId = url.substr(lastIndex + 1);
            if (isNaN(dynamicLayerId) || dynamicLayerId === "") {
                if (isNaN(dynamicLayerId)) {
                    dynamicLayer = url + "/";
                    _self._fetchFeaturelayerDetails(map, id, dynamicLayer, layerInfo);
                } else if (dynamicLayerId === "") {
                    dynamicLayerUrl = url;
                    _self._fetchFeaturelayerDetails(map, id, dynamicLayerUrl, layerInfo);
                }
            } else {
                this._addFeaturelayerToMap(map, id, url, title, layerInfo, true);
            }
        },

        // Fetch the feature layer details
        _fetchFeaturelayerDetails: function (map, id, url, layerInfo) {
            var p, _self = this;

            esriRequest({
                url: url + "?f=json",
                load: function (data) {
                    var lyr;

                    for (p = 0; p < data.layers.length; p++) {
                        lyr = url + data.layers[p].id;
                        _self._addFeaturelayerToMap(map, data.layers[p].id, lyr, data.layers[p].name, layerInfo, false);
                    }
                    _self.createLegend(layerInfo, map, _self.legendDiv);
                    _self._setExtentForLayer(map, url, true);
                    _self._createLayerInfoContent(_self, layerInfo);
                },
                error: function (err) {
                    alert(err.message);
                }
            });
        },

        // Add feature layer to map
        _addFeaturelayerToMap: function (map, id, url, title, layerInfo, layerFlag) {
            var featureLayer = new esri.layers.FeatureLayer(url, {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                id: id,
                outFields: ["*"]
            });

            map.addLayer(featureLayer);
            map.getLayer(featureLayer.id).show();
            layerInfo.push({
                layer: featureLayer,
                title: title
            });
            if (layerFlag) {
                this.createLegend(layerInfo, map, this.legendDiv);
                this._setExtentForLayer(map, url, false);
                this._createLayerInfoContent(this, layerInfo);
            }
            topic.publish("hideProgressIndicator");
        },

        // Add cached and dynamic map services to map
        _addCachedAndDynamicService: function (map, id, url, title) {
            var _self = this, url1, defObj;

            url1 = url + "?f=json";
            defObj = new Deferred();
            defObj.then(function (data) {
                var mapServiceLayer, imageParameters, layerInfo = [];

                if (data) {
                    if (data.singleFusedMapCache) {
                        mapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer(url, {
                            id: id
                        });
                    } else {
                        imageParameters = new esri.layers.ImageParameters();
                        mapServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(url, {
                            "imageParameters": imageParameters,
                            id: id
                        });
                    }
                    map.addLayer(mapServiceLayer);
                    layerInfo.push({
                        layer: mapServiceLayer,
                        title: title
                    });
                    _self.createLegend(layerInfo, map, _self.legendDiv);
                    _self._setExtentForLayer(map, url, true);
                    _self._createLayerInfoContent(_self, layerInfo);
                } else {
                    alert(nls.errorMessages.layerNotFound);
                }
                topic.publish("hideProgressIndicator");
            }, function (err) {
                alert(err.message);
                topic.publish("hideProgressIndicator");
            });
            topic.publish("queryItemInfo", url1, defObj);
        },

        // Store the data to be displayed in the INFO tab of the tab container
        _createLayerInfoContent: function (_self, layerInfo) {
            var i, layerContainer;

            layerContainer = domConstruct.create("div", {}, _self.layerDetails);
            for (i = 0; i < layerInfo.length; i++) {
                this.layerContent = domConstruct.create("div", { "class": "esriCTLayerInfo esriCTBreakWord", "innerHTML": layerInfo[i].title }, layerContainer);
                domAttr.set(this.layerContent, "index", i);
                _self.own(on(this.layerContent, "click", this._makeSelectedInfoItemHandler(layerInfo)));
            }
        },

        // Creates a handler for a click on an info item
        _makeSelectedInfoItemHandler: function (layerInfo) {
            return function () {
                var index = domAttr.get(this, "index");
                window.open(layerInfo[index].layer.url);
            };
        },

        // Store the data to be displayed in the LAYER tab of the tab container
        _createItemDescriptionContent: function (data) {
            domAttr.set(this.layerDescription, "innerHTML", (data.description) || (nls.showNullValue));
        },

        // Create the default extent of the map
        _setExtentForLayer: function (map, url, type) {
            var _self = this, url1 = url + "?f=json";

            esriRequest({
                url: url1,
                load: function (data) {
                    var geometryService, layerExtent;

                    geometryService = new esri.tasks.GeometryService(dojo.configData.ApplicationSettings.geometryService);
                    if (type) {
                        layerExtent = _self._createExtent(data.fullExtent);
                    } else {
                        layerExtent = _self._createExtent(data.extent);
                    }
                    if (layerExtent.spatialReference.wkid === map.spatialReference.wkid) {
                        map.setExtent(layerExtent);
                        _self.home.extent = layerExtent;
                    } else {
                        geometryService.project([layerExtent], map.spatialReference, function (results) {
                            if (results.length) {
                                map.setExtent(results[0]);
                            }
                        }, function (error) {
                            alert(error.message);
                        });
                    }
                },
                error: function (err) {
                    alert(err.message);
                }
            });
        },

        _createExtent: function (ext) {
            var projExtent = new esri.geometry.Extent({
                "xmin": ext.xmin,
                "ymin": ext.ymin,
                "xmax": ext.xmax,
                "ymax": ext.ymax,
                "spatialReference": {
                    "wkid": ext.spatialReference.wkid || ext.spatialReference.wkt
                }
            });
            return projExtent;
        }
    });
});