
Ext.namespace("gxp.plugins");

gxp.plugins.GeoNodeSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = gxp_gnsource */
    ptype: "gxp_gnsource",

    /** api: config[url]
     *  ``String`` WMS service URL for this source
     */

    /** api: config[baseParams]
     *  ``Object`` Base parameters to use on the WMS GetCapabilities
     *  request.
     */
    baseParams: null,

    /** i18n */
    noCompatibleSRSTitle: "Warning",
    noCompatibleSRSText: "This layer cannot be added to the map since it is not available in any projection that is compatible with the map projection",

    /** private: property[format]
     *  ``OpenLayers.Format`` Optional custom format to use on the
     *  WMSCapabilitiesStore store instead of the default.
     */
    format: null,



    /** private: property[describedLayers]
     */
    describedLayers: null,

    /** private: property[schemaCache]
     */
    schemaCache: null,



    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record;



            console.log('config:' + JSON.stringify(config))

            /**
             * TODO: The WMSCapabilitiesReader should allow for creation
             * of layers in different SRS.
             */
            var projection = this.getMapProjection();

            var maxExtent =
                OpenLayers.Bounds.fromArray(config['llbbox']).transform(new OpenLayers.Projection("EPSG:4326"), projection);

            console.log('MAXEXTENT:' + maxExtent);
            // make sure maxExtent is valid (transform does not succeed for all llbbox)
            if (!(1 / maxExtent.getHeight() > 0) || !(1 / maxExtent.getWidth() > 0)) {
                // maxExtent has infinite or non-numeric width or height
                // in this case, the map maxExtent must be specified in the config
                maxExtent = undefined;
            }

            var params = {
                STYLES: config.styles,
                FORMAT: config.format,
                TRANSPARENT: config.transparent,
                LAYERS: config.name,
                EXCEPTIONS: 'application/vnd.ogc.se_inimage',
                VERSION: '1.1.1',
                SERVICE: 'WMS',
                REQUEST: 'GetMap',
                LLBBOX: config['llbbox'],
                URL: config.url
            };

            layer = new OpenLayers.Layer.WMS(
                config.title,
                config.url,
                params, {
                    maxExtent: maxExtent,
                    restrictedExtent: maxExtent,
                    singleTile: ("tiled" in config) ? !config.tiled : false,
                    ratio: config.ratio || 1,
                    visibility: ("visibility" in config) ? config.visibility : true,
                    opacity: ("opacity" in config) ? config.opacity : 1,
                    buffer: ("buffer" in config) ? config.buffer : 1,
                    projection: projection,
                    queryable: config.queryable || false,
                    disabled: config.disabled
                }
            );

            // data for the new record
            var data = {
                title: config.title,
                group: config.group,
                source: config.source,
                properties: "gxp_wmslayerpanel",
                fixed: config.fixed,
                selected: "selected" in config ? config.selected : false,
                layer: layer,
                queryable: config.queryable,
                disabled: config.disabled,
                abstract: config.abstract
            };

            // add additional fields
            var fields = [
                {name: "source", type: "string"},
                {name: "group", type: "string"},
                {name: "properties", type: "string"},
                {name: "fixed", type: "boolean"},
                {name: "selected", type: "boolean"},
                {name: "queryable", type: "boolean"},
                {name: 'disabled', type: 'boolean'},
                {name: "abstract", type: "string"}
            ];

            var Record = GeoExt.data.LayerRecord.create(fields);
            record = new Record(data, layer.id);



            return record;
    },



    /** api: method[getConfigForRecord]
     *  :arg record: :class:`GeoExt.data.LayerRecord`
     *  :returns: ``Object``
     *
     *  Create a config object that can be used to recreate the given record.
     */
    getConfigForRecord: function(record) {
        var config = gxp.plugins.GeoNodeSource.superclass.getConfigForRecord.apply(this, arguments);
        var layer = record.getLayer();
        var params = layer.params;
        return Ext.apply(config, {
            format: params.FORMAT,
            styles: params.STYLES,
            transparent: params.TRANSPARENT,
            exceptions: params.EXCEPTIONS,
            name: params.LAYERS,
            version: params.VERSION,
            service: params.SERVICE,
            request: params.REQUEST,
            llbbox: params.LLBBOX,
            url: params.URL,
            queryable: record.get("queryable"),
            disabled: record.get("disabled")

        });
    }

});

Ext.preg(gxp.plugins.GeoNodeSource.prototype.ptype, gxp.plugins.GeoNodeSource);
