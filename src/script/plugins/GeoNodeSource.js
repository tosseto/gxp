
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
    title: 'GeoNode Source',

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


            console.log("IN GEONODE CREATELAYERRECORD");
            console.log("CONFIG.LLBBOX:" + config['llbbox']);
            console.log("CONFIG.BBOX:" + config['bbox']);
            /**
             * TODO: The WMSCapabilitiesReader should allow for creation
             * of layers in different SRS.
             */
            var projection = this.getMapProjection();

            var maxExtent =
                OpenLayers.Bounds.fromArray(config['llbbox']).transform(new OpenLayers.Projection("EPSG:4326"), projection);


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
                    projection: projection
                }
            );

            // data for the new record
            var data = {
                title: config.title,
                name: config.name,
                source: config.source,
                group: config.group,
                properties: "gxp_wmslayerpanel",
                fixed: config.fixed,
                selected: "selected" in config ? config.selected : false,
                layer: layer,
                queryable: config.queryable,
                disabled: config.disabled,
                abstract: config.abstract,
                styles: config.styles
            };

            // add additional fields
            var fields = [
                {name: "title", type: "string"},
                {name: "name", type: "string"},
                {name: "source", type: "string"},
                {name: "group", type: "string"},
                {name: "properties", type: "string"},
                {name: "fixed", type: "boolean"},
                {name: "selected", type: "boolean"},
                {name: "queryable", type: "boolean"},
                {name: 'disabled', type: 'boolean'},
                {name: "abstract", type: "string"},
                {name: "styles"} //array
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
