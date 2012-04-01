/**
 * Copyright (c) 2008-2011 The Open Planning Project
 *
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = GeoNodeQueryTool
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp");
/** api: constructor
 *  .. class:: GeoNodeQueryTool(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */
gxp.plugins.CoordinateTool = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = geo_getfeatureinfo */
    ptype: "gxp_coordinatetool",

    /** api: config[outputTarget]
     *  ``String`` Popups created by this tool are added to the map by default.
     */
    outputTarget: "map",

    title: "Map Coordinates",

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Get coordinates at the mouse position",

    toolText: null,

    iconCls: "gxp-icon-getfeatureinfo",

    coordWindow: null,

    coordDialog: new gxp.MouseCoordinatesDialog(),

    markers: new OpenLayers.Layer.Markers("CoordinatePosition",{displayInLayerSwitcher:false}),

    createMarker: function(e){
        this.markers.clearMarkers();

        var size = new OpenLayers.Size(121,125);
        var icon = new OpenLayers.Icon('/media/theme/img/WorldMap-Logo_26px.png', size);
        //this.markers.addMarker(new OpenLayers.Marker(0,0),icon);
        this.markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(e.lon,e.lat)));
    },


    showCoordinates: function(e) {
            var lonlat = this.target.mapPanel.map.getLonLatFromViewPortPx(e.xy);
            this.createMarker(lonlat);
            lonlat.transform(this.target.mapPanel.map.projection, "EPSG:4326");
            this.coordDialog.setCoordinates(lonlat.lon + ',' + lonlat.lat);
            this.coordWindow.show();

    },

    /** api: method[addActions]
     */
    addActions: function() {

        this.coordWindow = new Ext.Window({
            title: this.title,
            layout: "fit",
            width: 300,
            autoHeight: true,
            closeAction: "hide",
            items: [ this.coordDialog ]
        });

        var tool = this;

        var actions = gxp.plugins.CoordinateTool.superclass.addActions.call(this, [
            {
                tooltip: this.infoActionTip,
                iconCls: this.iconCls,
                id: this.id,
                text: this.toolText,
                toggleGroup: this.toggleGroup,
                enableToggle: true,
                pressed: false,
                allowDepress: true,
                toggleHandler: function(button, pressed) {
                        if (pressed) {
                            tool.target.mapPanel.map.addLayer(tool.markers);
                            tool.target.mapPanel.map.events.register("click", tool, tool.showCoordinates);

                        } else {
                            tool.markers.clearMarkers();
                            tool.target.mapPanel.map.removeLayer(tool.markers);
                            tool.coordWindow.hide();
                            tool.target.mapPanel.map.events.unregister("click", tool, tool.showCoordinates);
                    }
                }
            }
        ]);

        return actions;
    }


});

Ext.preg(gxp.plugins.CoordinateTool.prototype.ptype, gxp.plugins.CoordinateTool);