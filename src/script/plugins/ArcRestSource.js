/**
 * Created by
 * User: mbertrand
 * Date: 6/13/11
 * Time: 8:16 AM
 *
 */


/** api: (define)
 *  module = gxp.plugins
 *  class = LayerSource
 *  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LayerSource(config)
 *
 *    Base class for layer sources to plug into a :class:`gxp.Viewer`. A source
 *    is created by adding it to the ``sources`` object of the viewer. Once
 *    there, the viewer will create layers from it by looking at objects in
 *    the ``layers`` array of its ``map`` config option, calling the source's
 *    ``createLayerRecord`` method.
 */
gxp.plugins.ArcRestSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = gxp_arcrestsource */
    ptype: "gxp_arcrestsource",

    constructor: function(config) {
        this.config = config;
        gxp.plugins.ArcRestSource.superclass.constructor.apply(this, arguments);
    },



    /** private: method[createStore]
     *
     *  Creates a store of layers.  This requires that the API script has already
     *  loaded.  Fires the "ready" event when the store is loaded.
     */
    createStore: function()
    {
        var baseUrl =    this.url.split("?")[0];
        //console.log('baseURL:' + baseUrl);
        //console.log('Proxy URL:' + baseUrl + "?f=json&pretty=true");
        var source = this;

        var processResult = function(response) {
               //console.log('RESPONSE:' + response);
                var json = Ext.decode(response.responseText);

                if (json.capabilities.contains('Map'))
                {
                var layers = [];
                for (var l=0; l < json.layers.length; l++) {
                    var layer = json.layers[l];
                    var layerShow = "show:" + layer.id;
                    //console.log('layer ' + layer.id + ':' + layer.name);
                    layers.push(new OpenLayers.Layer.ArcGIS93Rest(layer.name, baseUrl + "/export",
                            {layers: layerShow, TRANSPARENT: true}, {isBaseLayer: false, displayInLayerSwitcher: true, visibility: true, projection: "EPSG:102113", queryable: json.capabilities.contains("Identify")}
                    ));
                }

                this.title = json['documentInfo']['Title'];
                //console.log('TITLE:' + this.title);

                source.store = new GeoExt.data.LayerStore({
                    layers: layers,
                    fields: [
                        {name: "source", type: "string"},
                        {name: "name", type: "string", mapping: "name"},
                        {name: "group", type: "string", defaultValue: this.title},
                        {name: "fixed", type: "boolean", defaultValue: true},
                        {name: "queryable", type: "boolean", defaultValue: true},
                        {name: "selected", type: "boolean"}
                    ]
                });
                } else
                    processFailure();

                source.fireEvent("ready", source);
        };

        var processFailure = function(response)
        {
            source.fireEvent("ready", source);
            Ext.Msg.alert("No Layers", "Could not find any layers to map at " + this.url);
        };


        Ext.Ajax.request({
            url: baseUrl,
            params: {'f' : 'json', 'pretty' : 'false', 'keepPostParams' : 'true'},
            method: 'POST',
            success: processResult,
            failure: processFailure
        });
    },

    createLayerRecord: function(config) {
        var record;
        var cmp = function(l) {
            return l.get("name") === config.name;
        };
        // only return layer if app does not have it already
        if (this.target.mapPanel.layers.findBy(cmp) == -1) {
            // records can be in only one store
            record = this.store.getAt(this.store.findBy(cmp)).clone();
            var layer = record.getLayer();
            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }
            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }

            if ("opacity" in config) {
                layer.opacity = config.opacity
            }

            record.set("selected", config.selected || false);
            record.set("queryable", config.queryable || true)
            record.set("source", config.source);
            record.set("name", config.name);
            record.set("properties",  "gxp_wmslayerpanel");
            if ("group" in config) {
                record.set("group", config.group);
            }
            record.commit();
        }
        return record;
    }


});




Ext.preg(gxp.plugins.ArcRestSource.prototype.ptype, gxp.plugins.ArcRestSource);
