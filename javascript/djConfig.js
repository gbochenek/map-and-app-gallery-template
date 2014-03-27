/*jslint browser:true,sloppy:true,regexp:true */
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
var path_location = location.pathname.replace(/\/[^\/]+$/, '');
var path_location_tc = path_location + '/config';
if (path_location.search(/\/apps\/|\/home\//) !== -1) {
    path_location_tc = path_location.substr(0, path_location.lastIndexOf('/map-and-app-gallery-template'));
}
// Dojo Config
var dojoConfig = {
    parseOnLoad: true,
    //locale: 'ar',
    packages: [{
        name: "esriTemplate",
        location: path_location
    }, {
        name: "application",
        location: path_location + '/javascript'
    }, {
        name: "templateConfig",
        location: path_location_tc
    }, {
        name: "config",
        location: path_location + '/config'
    }]
};