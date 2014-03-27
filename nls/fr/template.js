/*global define */
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
define(
    ({
        "viewer": {
            "main": {
                "scaleBarUnits": "metric",
                "clearSearch": "Effacer"
            },
            "errors": {
                "createMap": "Impossible de créer la carte",
                "general": "Erreur",
                "bingError": "Le déploiement de cette application nécessite votre propre clé Bing Maps.",
                "noLayers": "Aucune couche fonctionnelle",
                "noSearchResults": "Aucun résultat n\'a été trouvé.",
                "noGroupResults": "Le groupe est introuvable.",
                "noMatches": "Aucun résultat n\'a été trouvé.",
                "noMapsFound": "Aucune carte n\'a été trouvée."
            },
            "sidePanel": {
                "title": "Légende",
                "legendButton": "Légende",
                "layersButton": "Couches",
                "legendButtonTitle": "Légende de la carte",
                "aboutButton": "A propos",
                "aboutButtonTitle": "A propos de la carte",
                "message": "Aucune couche fonctionnelle"
            },
            "groupPage": {
                "showAllMaps": "Afficher toutes les cartes",
                "searchTitle": "Rechercher dans ce groupe",
                "searchTitleShort": "Rechercher",
                "searchPlaceholder": "Rechercher dans les cartes",
                "itemTitle": "Afficher la carte",
                "gridSwitch": "Affichage Grille",
                "listSwitch": "Affichage Liste",
                "loadingText": "Chargement de Maps&hellip;"
            },
            "sortFields": {
                "sortBy": "Trier par",
                "modified": "Date",
                "title": "Titre",
                "type": "Type",
                "numRatings": "Evaluations",
                "avgRating": "Evaluation moyenne",
                "numComments": "Commentaires",
                "numViews": "Vues"
            },
            "comments": {
                "commentsHeader": "Commentaires",
                "posted": "Publié(s)",
                "by": "par",
                "deleteComment": "supprimer",
                "editComment": "modifier",
                "noComments": "Aucun commentaire",
                "addCommentButton": "Ajouter un commentaire",
                "signIn": "Se connecter",
                "register": "Inscription",
                "or": "ou",
                "toPost": "pour publier un commentaire."
            },
            "buttons": {
                "cancel": "Annuler",
                "submit": "Envoyer"
            },
            "rating": {
                "signIn": "Se connecter",
                "toRate": "pour laisser une évaluation."
            },
            "itemInfo": {
                "createdLabel": "créé(e)",
                "ratingsLabel": "évaluation",
                "ratingsLabelPlural": "évaluations",
                "viewsLabel": "vue",
                "viewsLabelPlural": "vues",
                "commentsLabel": "commentaire",
                "commentsLabelPlural": "commentaires",
                "modifiedLabel": "Dernière modification",
                "by": "par",
                "separator": ","
            },
            "mapPage": {
                "findLocation": "Rechercher un lieu",
                "findPlaceholder": "Localiser une adresse",
                "aboutHeader": "A propos de cette carte",
                "layersHeader": "Couches",
                "enterFullscreen": "Affichage plein écran",
                "exitFullscreen": "Quitter le plein écran",
                "arcgisLink": "Détails des éléments",
                "moreInformation": "Plus d\'informations",
                "geoLocateTitle": "Utiliser l\'emplacement actuel",
                "openInMobile": "Ouvrir dans l\'application mobile",
                "openInArcGIS": "Map Viewer",
                "openInExplorer": "Explorer Online",
                "ownerHeader": "Propriétaire :",
                "switchBasemap": "Changer de fond de carte",
                "getMobileApp": "Obtenir une application",
                "constraintsHeading": "Use Constraints",
                "createdLabel": "Created",
                "noDescription": "No description.",
                "detailsLabel": "Details"
            },
            "pagination": {
                "previous": "Précédent",
                "next": "Suivant",
                "first": "Première page",
                "last": "Dernière page",
                "helip": "&hellip;",
                "page": "Page"
            }
        }
    })
);