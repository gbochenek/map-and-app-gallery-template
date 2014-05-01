/*global define,dojo,alert,CollectUniqueTags,TagCloudObj,ItemGallery */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
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
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/text!./templates/leftPanel.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/i18n!nls/localizedStrings",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/_base/array",
    "dojo/NodeList-manipulate",
    "widgets/gallery/gallery"
], function (declare, domConstruct, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, topic, Deferred, query, domClass, domStyle, domGeom, array) {

    declare("CollectUniqueTags", null, {

        setNodeValue: function (node, text) {
            if (text) {
                domAttr.set(node, "innerHTML", text);
            }
        },

        /**
        * Collect all the tags in an array
        * @memberOf widgets/leftPanel/leftPanel
        */
        collectTags: function (results, geoTag, prefixTag) {
            var i, j, geoTagValue, tagValue, tagsObj, groupItemsTagsdata = [], geoTagCollection = [];

            dojo.geoTagArray = {};
            for (i = 0; i < results.length; i++) {
                for (j = 0; j < results[i].tags.length; j++) {
                    if (geoTag) {
                        geoTagValue = this._searchGeoTag(results[i].tags[j], geoTag, prefixTag);
                        if (geoTagValue === 0) {
                            if (!geoTagCollection[results[i].tags[j]]) {
                                tagValue = results[i].tags[j].replace(prefixTag, '');
                                geoTagCollection[tagValue] = 1;
                                dojo.geoTagArray[results[i].tags[j]] = { "key": results[i].tags[j], "value": tagValue };
                            } else {
                                geoTagCollection[results[i].tags[j]]++;
                            }
                        }
                    }
                    if (geoTagValue !== 0) {
                        if (!groupItemsTagsdata[results[i].tags[j]]) {
                            groupItemsTagsdata[results[i].tags[j]] = 1;
                        } else {
                            groupItemsTagsdata[results[i].tags[j]]++;
                        }
                    }
                }
            }
            geoTagCollection = this._sortArray(geoTagCollection);
            groupItemsTagsdata = this._sortArray(groupItemsTagsdata);
            if (geoTagCollection.length === 0) {
                geoTagCollection = null;
            }
            if (groupItemsTagsdata.length === 0) {
                groupItemsTagsdata = null;
            }
            tagsObj = {
                "geoTagCollection": geoTagCollection,
                "groupItemsTagsdata": groupItemsTagsdata
            };
            return tagsObj;
        },

        /**
        * Sort the the tag cloud array in order
        * @memberOf widgets/leftPanel/leftPanel
        */
        _sortArray: function (tagArray) {
            var i, sortedArray = [];

            for (i in tagArray) {
                if (tagArray.hasOwnProperty(i)) {
                    sortedArray.push({
                        key: i,
                        value: tagArray[i]
                    });
                }
            }
            sortedArray.sort(function (a, b) {
                if (a.value > b.value) {
                    return -1;
                }
                if (a.value < b.value) {
                    return 1;
                }
                return 0;
            });
            return sortedArray;
        },

        /**
        * Search for the tags with the geographiesTagText tag configured
        * @memberOf widgets/leftPanel/leftPanel
        */
        _searchGeoTag: function (tag, geoTag) {
            var geoTagValue = tag.toLowerCase().indexOf(geoTag.toLowerCase());
            return geoTagValue;
        }
    });

    declare("TagCloudObj", null, {

        /**
        *Generate the Tag cloud based on the inputs provided
        * @memberOf widgets/leftPanel/leftPanel
        */
        generateTagCloud: function (tagsCollection, maxTags) {
            var maxUsedTags, fontSizeArray, tagCloudTags;

            if (tagsCollection.length < maxTags) {
                maxTags = tagsCollection.length;
            }
            maxUsedTags = this._identifyMaxUsedTags(tagsCollection, maxTags);
            fontSizeArray = this._generateFontSize(dojo.configData.ApplicationSettings.tagCloudFontMinValue, dojo.configData.ApplicationSettings.tagCloudFontMaxValue, maxUsedTags.length);
            tagCloudTags = this._mergeTags(maxUsedTags, fontSizeArray);
            return tagCloudTags;
        },

        /**
        * Identify maximum used tags
        * @memberOf widgets/leftPanel/leftPanel
        */
        _identifyMaxUsedTags: function (tagsCollection, maxTagsToDisplay) {
            var i, maxUsedTags = [];

            for (i = 0; i < maxTagsToDisplay; i++) {
                maxUsedTags.push(tagsCollection[i]);
            }
            return maxUsedTags;
        },

        /**
        * Generate the required font ranges for each and every tag in tag cloud
        * @memberOf widgets/leftPanel/leftPanel
        */
        _generateFontSize: function (min, max, count) {
            var i, diff, nextValue, fontSizeArray = [];

            diff = ((max - min) / (count - 1));
            fontSizeArray.push(min);
            for (i = 1; i < count; i++) {
                nextValue = fontSizeArray[i - 1] + diff;
                fontSizeArray.push(nextValue);
            }
            return fontSizeArray.sort(function (a, b) {
                if (a > b) {
                    return -1;
                }
                if (a < b) {
                    return 1;
                }
                return 0;
            });
        },

        /**
        * Merge the displayed tags and font ranges in single array
        * @memberOf widgets/leftPanel/leftPanel
        */
        _mergeTags: function (maxUsedTags, fontSizeArray) {
            var i;

            for (i = 0; i < maxUsedTags.length; i++) {
                maxUsedTags[i].fontSize = fontSizeArray[i];
            }
            return maxUsedTags.sort(function (a, b) {
                if (a.key < b.key) {
                    return -1;
                }
                if (a.key > b.key) {
                    return 1;
                }
                return 0;
            });
        }
    });

    declare("LeftPanelCollection", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Deferred], {
        templateString: template,
        nls: nls,

        startup: function () {
            dojo.sortBy = dojo.configData.ApplicationSettings.sortField;
            if (query(".esriCTSortText")[0]) {
                if ((dojo.sortBy === "modified") && (query(".esriCTSortText")[0].innerHTML !== nls.sortByViewText)) {
                    domAttr.set(query(".esriCTSortText")[0], "innerHTML", nls.sortByViewText);
                } else if ((dojo.sortBy === "numViews") && (query(".esriCTSortText")[0].innerHTML !== nls.sortByDateText)) {
                    domAttr.set(query(".esriCTSortText")[0], "innerHTML", nls.sortByDateText);
                }
            }
            this._setGroupContent();
            this._expandGroupdescEvent(this.expandGroupDescription, this);
            this._queryGroupItems();
            domAttr.set(this.leftPanelHeader, "innerHTML", dojo.configData.ApplicationSettings.applicationName);
            topic.subscribe("queryGroupItems", this._queryGroupItems);
        },

        /*
        * @memberOf widgets/leftPanel/leftPanel
        * Store the item details in an array
        */
        _queryGroupItems: function (nextQuery, queryString) {
            var _self = this, groupItems = [], defObj = new Deferred();

            if ((!nextQuery) && (!queryString)) {
                dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")';
                topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.ApplicationSettings.sortOrder.toLowerCase(), defObj);
            } else if (!queryString) {
                topic.publish("queryGroupItem", null, null, null, defObj, nextQuery);
            }
            if (queryString) {
                dojo.queryString = queryString;
                topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.ApplicationSettings.sortOrder.toLowerCase(), defObj);
            }

            defObj.then(function (data) {
                var i;

                if (data.results.length > 0) {
                    if (data.nextQueryParams.start !== -1) {
                        for (i = 0; i < data.results.length; i++) {
                            groupItems.push(data.results[i]);
                        }
                        _self._queryGroupItems(data.nextQueryParams);
                    } else {
                        for (i = 0; i < data.results.length; i++) {
                            groupItems.push(data.results[i]);
                        }
                        dojo.groupItems = groupItems;
                        _self._setLeftPanelContent(groupItems);
                    }
                } else {
                    if (queryString) {
                        alert(nls.errorMessages.noPublicItems);
                    }
                }
            }, function (err) {
                alert(err.message);
            });
        },

        /**
        * Create the categories and geographies tag cloud container
        * @memberOf widgets/leftPanel/leftPanel
        */
        _setLeftPanelContent: function (results) {
            var uniqueTags, tagsObj, tagCloud, displayCategoryTags, displaygeoTags, defObj, queryString;

            dojo.selectedTags = "";
            dojo.tagCloudArray = [];
            if (dojo.configData.ApplicationSettings.showCategoriesTagCloud || dojo.configData.ApplicationSettings.showGeographiesTagCloud) {
                uniqueTags = new CollectUniqueTags();
                tagsObj = uniqueTags.collectTags(results, dojo.configData.ApplicationSettings.geographiesTagText, dojo.configData.ApplicationSettings.geographiesPrefixText);
                tagCloud = new TagCloudObj();
                if (!dojo.configData.ApplicationSettings.tagCloudFontMinValue && !dojo.configData.ApplicationSettings.tagCloudFontMaxValue && dojo.configData.ApplicationSettings.tagCloudFontUnits) {
                    dojo.configData.ApplicationSettings.tagCloudFontMinValue = 10;
                    dojo.configData.ApplicationSettings.tagCloudFontMaxValue = 18;
                    dojo.configData.ApplicationSettings.tagCloudFontUnits = "px";
                }
                if (dojo.configData.ApplicationSettings.tagCloudFontMinValue > dojo.configData.ApplicationSettings.tagCloudFontMaxValue) {
                    alert(nls.errorMessages.minfontSizeGreater);
                    return;
                }
                if (dojo.configData.ApplicationSettings.showCategoriesTagCloud && tagsObj.groupItemsTagsdata) {
                    domStyle.set(this.tagsCategoriesContent, "display", "block");
                    uniqueTags.setNodeValue(this.tagsCategories, nls.tagCategoriesHeaderText);

                    displayCategoryTags = tagCloud.generateTagCloud(tagsObj.groupItemsTagsdata, dojo.configData.ApplicationSettings.showMaxTopTags);
                    this.displayTagCloud(displayCategoryTags, this.tagsCategoriesCloud, this.tagsCategories.innerHTML);
                }
                if (dojo.configData.ApplicationSettings.showGeographiesTagCloud && dojo.configData.ApplicationSettings.geographiesTagText && tagsObj.geoTagCollection) {
                    domStyle.set(this.geographicTagsContent, "display", "block");
                    uniqueTags.setNodeValue(this.geoTagsCloudHeader, nls.geographicTagsHeaderText);

                    displaygeoTags = tagCloud.generateTagCloud(tagsObj.geoTagCollection, dojo.configData.ApplicationSettings.showMaxTopTags);
                    this.displayTagCloud(displaygeoTags, this.geoTagsCloud, this.geoTagsCloudHeader.innerHTML);
                }
            }
            this._appendLeftPanel();
            defObj = new Deferred();
            queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")';
            /**
            *if searchString exists in the config file, perform a default serach with the specified string
            * @memberOf widgets/leftPanel/leftPanel
            */
            if (dojo.configData.ApplicationSettings.searchString) {
                queryString += ' AND (';
                queryString += ' title:' + dojo.configData.ApplicationSettings.searchString;
                queryString += ' OR tags:' + dojo.configData.ApplicationSettings.searchString;
                queryString += ' OR typeKeywords:' + dojo.configData.ApplicationSettings.searchString;
                queryString += ' OR snippet:' + dojo.configData.ApplicationSettings.searchString;
                queryString += ' ) ';
            }

            /**
            * if searchType exists in the config file, perform a default type search with the specified string
            * @memberOf widgets/leftPanel/leftPanel
            */
            if (dojo.configData.ApplicationSettings.searchType) {
                queryString += ' AND type:' + dojo.configData.ApplicationSettings.searchType;
            }

            dojo.queryString = queryString;
            dojo.sortBy = dojo.configData.ApplicationSettings.sortField;
            topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.ApplicationSettings.sortOrder.toLowerCase(), defObj);
            defObj.then(function (data) {
                topic.publish("showProgressIndicator");
                dojo.nextQuery = data.nextQueryParams;
                var gallery = new ItemGallery();
                dojo.results = data.results;
                gallery.createItemPods(data.results, false, data.total);
            }, function (err) {
                alert(err.message);
            });
        },

        /**
        * Create the required HTML for generating the tag cloud
        * @memberOf widgets/leftPanel/leftPanel
        */
        displayTagCloud: function (displayTags, node, text) {
            var i, span;

            for (i = 0; i < displayTags.length; i++) {
                span = domConstruct.place(domConstruct.create('h3'), node);
                domClass.add(span, "esriCTTagCloud");
                domStyle.set(span, "fontSize", displayTags[i].fontSize + dojo.configData.ApplicationSettings.tagCloudFontUnits);
                if (i !== (displayTags.length - 1)) {
                    domAttr.set(span, "innerHTML", displayTags[i].key + ", ");
                } else {
                    domAttr.set(span, "innerHTML", displayTags[i].key + ".");
                }
                domAttr.set(span, "selectedTagCloud", text);
                domAttr.set(span, "tagCloudValue", displayTags[i].key);
                span.onclick = this._makeSelectedTagHandler();
            }
        },

        /**
        * Creates a handler for a click on a tag
        * @memberOf widgets/leftPanel/leftPanel
        */
        _makeSelectedTagHandler: function () {
            var _self = this;

            return function () {
                var j, val, index;

                topic.publish("showProgressIndicator");
                if (query(".esriCTNoResults")[0]) {
                    domConstruct.destroy(query(".esriCTNoResults")[0]);
                }
                val = domAttr.get(this, "tagCloudValue");
                for (j in dojo.geoTagArray) {
                    if (dojo.geoTagArray.hasOwnProperty(j)) {
                        if (dojo.geoTagArray[j].value === val) {
                            val = dojo.geoTagArray[j].key;
                        }
                    }
                }
                if (domClass.contains(this, "esriCTTagCloudHighlight")) {
                    domClass.remove(this, "esriCTTagCloudHighlight");
                    index = array.indexOf(dojo.tagCloudArray, val);
                    if (index > -1) {
                        dojo.tagCloudArray.splice(index, 1);
                    }
                } else {
                    domClass.add(this, "esriCTTagCloudHighlight");
                    dojo.tagCloudArray.push(val);
                }

                if (domGeom.position(query(".esriCTAutoSuggest")[0]).h > 0) {
                    domClass.replace(query(".esriCTAutoSuggest")[0], "displayNoneAll", "displayBlockAll");
                }

                if (dojo.selectedTags !== "") {
                    dojo.selectedTags = dojo.tagCloudArray.join('"' + " AND " + '"');
                } else {
                    dojo.selectedTags = val;
                }
                _self._queryRelatedTags(dojo.selectedTags);

                if (query(".esriCTDetailsLeftPanel")[0]) {
                    domClass.replace(query(".esriCTMenuTabRight")[0], "displayBlockAll", "displayNoneAll");
                    domClass.add(query(".esriCTDetailsLeftPanel")[0], "displayNoneAll");
                    domClass.add(query(".esriCTDetailsRightPanel")[0], "displayNoneAll");
                    domClass.remove(query(".esriCTGalleryContent")[0], "displayNoneAll");
                    domClass.remove(query(".esriCTInnerRightPanel")[0], "displayNoneAll");
                    domClass.replace(query(".esriCTApplicationIcon")[0], "esriCTCursorDefault", "esriCTCursorPointer");
                }
            };
        },

        /**
        * Executed on the click of a tag cloud and queries to fetch items containing the selected tag cloud
        * @memberOf widgets/leftPanel/leftPanel
        */
        _queryRelatedTags: function (tagName) {
            var defObj = new Deferred();
            dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")' + ' AND (tags: ("' + tagName + '"))';
            topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.ApplicationSettings.sortOrder.toLowerCase(), defObj);
            defObj.then(function (data) {
                if (data.total === 0) {
                    if (query(".esriCTInnerRightPanel")[0]) {
                        domClass.replace(query(".esriCTInnerRightPanel")[0], "displayNoneAll", "displayBlockAll");
                    }
                    if (query(".esriCTNoResults")[0]) {
                        domConstruct.destroy(query(".esriCTNoResults")[0]);
                    }
                    domConstruct.create('div', { "class": "esriCTDivClear esriCTNoResults", "innerHTML": nls.noResultsText }, query(".esriCTRightPanel")[0]);
                    if (domClass.contains(query(".esriCTInnerRightPanel")[0], "displayNone")) {
                        domClass.replace(query(".esriCTNoResults")[0], "displayNoneAll", "displayBlockAll");
                    } else {
                        domClass.replace(query(".esriCTNoResults")[0], "displayBlockAll", "displayNoneAll");
                    }
                    topic.publish("hideProgressIndicator");
                } else {
                    if (query(".esriCTNoResults")[0]) {
                        domConstruct.destroy(query(".esriCTNoResults")[0]);
                    }
                    domClass.replace(query(".esriCTInnerRightPanel")[0], "displayBlockAll", "displayNoneAll");
                    dojo.nextQuery = data.nextQueryParams;
                    dojo.results = data.results;
                    topic.publish("createPods", data.results, true);
                }
            }, function (err) {
                alert(err.message);
                topic.publish("hideProgressIndicator");
            });
        },

        /**
        *Shrinks or expands the group description content on the left panel based on the click event
        * @memberOf widgets/leftPanel/leftPanel
        */
        _expandGroupdescEvent: function (node, _self) {
            node.onclick = function () {
                if (this.innerHTML === nls.expandGroupDescText) {
                    domAttr.set(this, "innerHTML", nls.shrinkGroupDescText);
                    var height = window.innerHeight - (domGeom.position(query(".esriCTMenuTab")[0]).h + domGeom.position(query(".esriCTInnerLeftPanelBottom")[0]).h + domGeom.position(query(".esriCTLogo")[0]).h + 50) + "px";
                    domStyle.set(query(".esriCTLeftPanelDesc")[0], "maxHeight", height);
                } else {
                    domAttr.set(this, "innerHTML", nls.expandGroupDescText);
                }
                domClass.toggle(_self.groupDesc, "esriCTLeftTextReadLess");
            };
        },

        /**
        * Sets the required group content in the containers
        * @memberOf widgets/leftPanel/leftPanel
        */
        _setGroupContent: function () {
            var _self = this;
            if (dojo.configData.groupIcon) {
                _self.groupLogo.src = dojo.configData.groupIcon;
            }
            if (dojo.configData.groupTitle) {
                _self.setNodeText(_self.groupName, dojo.configData.groupTitle);
            }
            if (dojo.configData.ApplicationSettings.groupDescription) {
                _self.setNodeText(_self.groupDesc, dojo.configData.ApplicationSettings.groupDescription);
                if (query(_self.groupDesc).text().length > 400) {
                    domClass.add(_self.groupDesc, "esriCTLeftTextReadLess");
                    if (nls.expandGroupDescText) {
                        _self.setNodeText(_self.expandGroupDescription, nls.expandGroupDescText);
                    }
                }
            }
            if (dojo.configData.ApplicationSettings.applicationName) {
                _self.setNodeText(_self.groupDescPanelHeader, dojo.configData.ApplicationSettings.applicationName);
                topic.publish("setGrpContent");
            }
        },

        /**
        *Used to set the innerHTML
        * @memberOf widgets/leftPanel/leftPanel
        */
        setNodeText: function (node, htmlString) {
            if (node) {
                domAttr.set(node, "innerHTML", htmlString);
            }
        },

        /**
        * Append the left panel to parent container
        */
        _appendLeftPanel: function () {
            var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
            domConstruct.place(this.galleryandPannels, applicationHeaderDiv);
        }
    });
});
