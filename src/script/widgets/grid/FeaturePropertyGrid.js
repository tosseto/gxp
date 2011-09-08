/**
 * Created by PyCharm.
 * User: mbertrand
 * Date: 9/7/11
 * Time: 4:50 P
 *
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.grid
 *  class = FeaturePropertyGrid
 *  base_link = `Ext.grid.PropertyGrid <http://extjs.com/deploy/dev/docs/?class=Ext.grid.PropertyGrid>`_
 */
Ext.namespace("gxp.grid");

/** api: constructor
 *  .. class:: FeaturePropertyGrid(config)
 *
 *     This is almost identical to the standard PropertyGrid but does not automatically sort the attributes alphabetically
 */


gxp.grid.FeaturePropertyGrid = Ext.extend(Ext.grid.PropertyGrid, {

    /**
     *  Nearly identical to PropertyGrid.initComponent, but does NOT sort the attributes alphabetically by name
     */
    initComponent : function(){
        this.customRenderers = this.customRenderers || {};
        this.customEditors = this.customEditors || {};
        this.lastEditRow = null;
        var store = new Ext.grid.PropertyStore(this);
        this.propStore = store;
        var cm = new Ext.grid.PropertyColumnModel(this, store);
        // DO NOT SORT!
        //store.store.sort('name', 'ASC');
        this.addEvents(
            /**
             * @event beforepropertychange
             * Fires before a property value changes.  Handlers can return false to cancel the property change
             * (this will internally call {@link Ext.data.Record#reject} on the property's record).
             * @param {Object} source The source data object for the grid (corresponds to the same object passed in
             * as the {@link #source} config property).
             * @param {String} recordId The record's id in the data store
             * @param {Mixed} value The current edited property value
             * @param {Mixed} oldValue The original property value prior to editing
             */
            'beforepropertychange',
            /**
             * @event propertychange
             * Fires after a property value has changed.
             * @param {Object} source The source data object for the grid (corresponds to the same object passed in
             * as the {@link #source} config property).
             * @param {String} recordId The record's id in the data store
             * @param {Mixed} value The current edited property value
             * @param {Mixed} oldValue The original property value prior to editing
             */
            'propertychange'
        );
        this.cm = cm;
        this.ds = store.store;
        Ext.grid.PropertyGrid.superclass.initComponent.call(this);

		this.mon(this.selModel, 'beforecellselect', function(sm, rowIndex, colIndex){
            if(colIndex === 0){
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
        }, this);
    }

});

/** api: xtype = gxp_featurepropertygrid */
Ext.reg('gxp_featurepropertygrid', gxp.grid.FeaturePropertyGrid);