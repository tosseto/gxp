
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

        if (config['llbbox']) {

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
                TRANSPARENT:  ("transparent" in config) ? config.transparent : true,
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

            if ("tiled" in config && config.tiled == true) {

                var tileWidth = config['tileWidth'] || 256;
                var tileHeight = config['tileHeight'] || 256;
                var tileResolutions = config['tileResolutions']  || [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135,0.29858214169740677,0.14929107084870338,0.07464553542435169,0.037322767712175846,0.018661383856087923,0.009330691928043961,0.004665345964021981];
                var originLon = config['tileOriginLon'] || -20037508.34;
                var originLat = config['tileOriginLat'] || -20037508.34;

                  layer.addOptions({resolutions: tileResolutions,
                  tileSize: new OpenLayers.Size(tileWidth, tileHeight),
                  tileOrigin: new OpenLayers.LonLat(originLat, originLon)});
                  layer.params.TILED = true; // set to true when http://projects.opengeo.org/suite/ticket/1286 is closed
            }
            // data for the new record
            var data = {
                title: config.title,
                name: config.name,
                source: config.source,
                group: config.group,
                searchfields: config.searchfields,
                properties: "gxp_wmslayerpanel",
                fixed: config.fixed,
                selected: "selected" in config ? config.selected : false,
                layer: layer,
                queryable: config.queryable,
                disabled: config.disabled,
                abstract: config.abstract,
                styles: [config.styles]
            };

            // add additional fields
            var fields = [
                {name: "title", type: "string"},
                {name: "name", type: "string"},
                {name: "source", type: "string"},
                {name: "group", type: "string"},
                {name: "searchfields"}, //array
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
        }
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
            styles: params.STYLES,
            tiled: record.getLayer().params.TILED
        });
    }

});

Ext.preg(gxp.plugins.GeoNodeSource.prototype.ptype, gxp.plugins.GeoNodeSource);
