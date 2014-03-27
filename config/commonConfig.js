/*global define,commonConfig:true */
/*jslint browser:true,sloppy:true */
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
define([], function () {
    var config = {
        bingMapsKey: "ArAavTvIHoG3w9HwhroJuCFAzUttY_pQQvjdmHmZHQQfv6wahgxcyOiT3op-SCni",
        helperServices: {
            geometry: {
                url: location.protocol + "//utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
            },
            printTask: {
                url: location.protocol + "//utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
            },
            geocode: [{
                url: location.protocol + "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            }]
        }
    };

    // could use a has() test to optionally populate some global
    // property so that the stuff defined is in some global identifier
    //
    // instead, just populate a global, will need to remove the next line when
    // when we remove support for loading modules with dojo.require
    // which will be when we move to Dojo 2.0
    commonConfig = config;
    // instead of using a global, this should probably be added to some namespace...
    // do the templates have a common namespace that they use?

    return config;
});
