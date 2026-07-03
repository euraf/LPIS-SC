<script>
module.exports = {
    name: "layer-wfs",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        [
            "createSelectedFeature",
            "getFeatureProperty",
            "generateLegendKey"
        ].forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(this.layer_props, key)) {
                this.$delete(this.layer_props, key)
            }
        })

        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedFeaturesSummary", {})
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.$set(this.layer_props, "olLayerType", 'Vector')
        this.$set(this.layer_props, "olSourceType", 'Vector')
        this.$set(this.layer_props, "olFormatType", 'GeoJSON')
        this.$set(this.layer_props, "eventResource", 'features')
        this.$set(this.layer_props, "isLoading", false)
        this.$set(this.layer_props, "bboxes", {
            bbox_5: { bboxLayer: null, bboxPixelsLayer: null, stats: {} },
            bbox_10: { bboxLayer: null, bboxPixelsLayer: null, stats: {} }
        })
        this.$set(this.layer_props, "stats", {})
        this.$set(this.layer_props, "farmPrompt", { show: false, farmId: null, clickedWrapper: null })
        this.$set(this.layer_props, "showLegend", false)
        
		return this.layer_props
	},
    mounted() {

        this.source.on('change', () => {
            if (this.source.getState() === 'ready' && this.source.getFeatures().length > 0) {
                this.$set(this, "isLoading", false);
            }
        });
        
        this.source.on(this.eventResource + 'loadend', () => {
            this.syncSelectedFeaturesFromRoute();
        });

        this.$nextTick(() => {
            this.syncSelectedFeaturesFromRoute();
        })

        VueBus.$on('updateSelectedFeaturesQuery', id => {
            if (this.layer_id == id) {
                this.updateSelectedFeaturesQuery()
            }
        })
        
        this.$nextTick(() => {
            this.setupLayerObjFunctions()
        })
    },
    computed: {
        url() {
            var _this = this
            return function (extent) {
                var transformedExtent = extent
                if (MAP_PROJECTION != _this.layer_projection) {
                    transformedExtent = ol.proj.transformExtent(extent, MAP_PROJECTION, _this.layer_projection);
                }
                return _this.source_url.replaceAll('[layer_name]', _this.layer_name).replaceAll('[layer_name_detail]', _this.layer_name_detail).replaceAll('[layer_projection]', _this.layer_projection).replaceAll('[extent]', transformedExtent.join(','))
            }
        },
        format() {
            return new ol.format[this.olFormatType]({
                dataProjection: this.layer_projection, // Server data
                featureProjection: MAP_PROJECTION // Map projection
            })
        },
        strategy() {
            return ol.loadingstrategy.bbox
        },
        style() {
            var _this = this
            return function(feature) {

                var legendKey = feature.get(_this.layer_legend.legend_identifier)
                var legendElement = _this.layer_legend && _this.layer_legend.legend_elements
                    ? _this.layer_legend.legend_elements[legendKey]
                    : null
                var fallbackFillColor = _this.layer_style.fill_color || '#FFFFFF66'

                var isSelected = Array.isArray(_this.selectedFeatures) &&
                _this.selectedFeatures.some(f =>
                    f.id === feature.get(_this.feature_identifier_key)
                );

                var zoom = _this.map.getView().getZoom();

                var stroke_style = new ol.style.Stroke({
                    color: isSelected ? _this.layer_style.selected_stroke_color : _this.layer_style.stroke_color,
                    width: 0.5,
                })
                var fill_style = new ol.style.Fill({
                    color: isSelected
                        ? _this.layer_style.selected_fill_color
                        : (legendElement
                            ? legendElement.color
                            : fallbackFillColor),
                })
                var geomType = feature.getGeometry() ? feature.getGeometry().getType() : null
                var pointImageStyle = (geomType === 'Point' || geomType === 'MultiPoint')
                    ? new ol.style.Circle({
                        radius: 4,
                        fill: fill_style,
                        stroke: stroke_style,
                    })
                    : null

                return new ol.style.Style({

                    stroke: stroke_style,

                    fill: fill_style,

                    image: pointImageStyle,
                    
                    text: zoom > 14 ? new ol.style.Text({
                        text: String(feature.get(_this.feature_identifier_key) ?? ''),
                        font: '12px Poppins,sans-serif',
                        fill: new ol.style.Fill({ color: '#000' }),
                        stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                        overflow: true,
                    }) : null,
                });
                
            }
        },
        loader() {
            var _this = this
            return function(extent, resolution, projection, success, failure) {

                var xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('GET', _this.url(extent));

                xhr.onerror = function() {
                    _this.source.removeLoadedExtent(extent);
                    failure();
                };

                xhr.onload = function() {
                    if (xhr.status == 200) {
                        var json = xhr.response
                        
                        // The problem comes from the LPIS CZ WFS GeoJSON response having a property named "geometry" inside the "properties" object, which is a string ("polygon"), shadowing the actual geometry of the feature. OpenLayers’ readFeatures() method assigns all properties under "properties" as feature properties. So, first I remove the properties > geometry before creating the features.
                        json.features.forEach(feature => {
                        if (feature.properties && feature.properties.geometry) {
                            delete feature.properties.geometry;
                        }
                        });

                        var features = _this.format.readFeatures(json);
                        _this.source.addFeatures(features);
                        success(features);
                    } else {
                        _this.source.removeLoadedExtent(extent);
                        failure();
                    }
                }

                xhr.send();
            }
        }
    },
    methods: {
        addClickListener() {
            var _this = this
            
            this.map.on('singleclick', function (evt) {

                // Reset prompt for every new click; it will be re-opened when conditions match.
                _this.$set(_this.farmPrompt, 'show', false);

                if (!_this.layer.getVisible()) {
                    return
                }

                var featureFound = false

                _this.map.forEachFeatureAtPixel(evt.pixel, function (clickedFeature) {
                    featureFound = true
                    
                    var newFeatureWrapper = _this.createSelectedFeature(clickedFeature)

                    var alreadySelected = _this.selectedFeatures.some(f =>
                            f.id === clickedFeature.get(_this.feature_identifier_key)
                        );

                    if (evt.originalEvent.shiftKey) { // mouse click + shift key
                        // Multi-selection mode

                        if (alreadySelected) {
                            // clicking in an alreadySelected feature removes its selection
                            _this.selectedFeatures = _this.selectedFeatures.filter(f =>
                                f.id !== clickedFeature.get(_this.feature_identifier_key)
                            )
                        } else {
                            // if not selected, adds feature to selection
                            _this.selectedFeatures.push(newFeatureWrapper);
                        }

                    } else { // only mouse click

                        if (alreadySelected) {

                            if (_this.selectedFeatures.length > 1) {
                                // if various features selected, clear all, keep this
                                _this.selectedFeatures.splice(0)
                                _this.selectedFeatures.push(newFeatureWrapper);

                            } else {
                                // if only this is selected, remove it
                                _this.selectedFeatures.splice(0)
                            }

                        } else {
                            // Single selection mode
                            _this.selectedFeatures.splice(0)
                            _this.selectedFeatures.push(newFeatureWrapper)

                            // Offer full-farm selection if layer has farm_id_key
                            if (_this.farm_id_key) {
                                const farmId =
                                    clickedFeature.get(_this.farm_id_key) ??
                                    clickedFeature.get(String(_this.farm_id_key).toLowerCase()) ??
                                    clickedFeature.get(String(_this.farm_id_key).toUpperCase());
                                if (farmId != null) {
                                    _this.$set(_this.farmPrompt, 'farmId', farmId);
                                    _this.$set(_this.farmPrompt, 'clickedWrapper', newFeatureWrapper);
                                    _this.$set(_this.farmPrompt, 'show', true);
                                }
                            }
                        }
                    }
                    _this.layer.changed()
                    return true;
                },
                {
                    layerFilter: function (layer) {
                        return layer.get('my_layer_id') === _this.layer_id && layer.getVisible()
                    }
                })

                if (!featureFound) {
                    if (!evt.originalEvent.shiftKey) {
                        // clicking in a place where there are no features, clears the selection
                        _this.selectedFeatures.splice(0)
                        _this.layer.changed()
                    }
                }

                _this.selectedLegendElements = _this.selectedFeatures.map(function(f) {
                    return f.legendId
                })

                // Keep prompt stable in UI; query sync happens after prompt decision.
                if (!_this.farmPrompt.show) {
                    _this.updateSelectedFeaturesQuery()
                }
            });
        },
        setSelectedFeaturesByIds(ids) {
            // Find features in the layer's source that match the IDs
            const features = this.source.getFeatures().filter(f =>
                ids.includes(String(f.get(this.feature_identifier_key)))
            );
            // Wrap features as in your click handler
            this.selectedFeatures = features.map(clickedFeature => this.createSelectedFeature(clickedFeature));
            this.selectedLegendElements = this.selectedFeatures.map(f => f.legendId);
            this.layer.changed();
        },
        syncSelectedFeaturesFromRoute() {
            const selected = this.$route.query.selected || '';
            const selectedLayers = selected ? selected.split(';') : [];
            const currentLayerSelection = selectedLayers.find(sel => sel.startsWith(this.layer_id + ':'));

            if (!currentLayerSelection) {
                return;
            }

            const [, featIds] = currentLayerSelection.split(':');
            if (!featIds) {
                return;
            }

            this.setSelectedFeaturesByIds(featIds.split(','));
        },
        updateSelectedFeaturesQuery() {
            // Get current selected features from query
            var ids = this.selectedFeatures.map(f => f.id)

            let selected = this.$route.query.selected || '';
            let selectedLayers = selected ? selected.split(';') : [];
            // Remove any previous entry for this layer
            selectedLayers = selectedLayers.filter(sel => !sel.startsWith(this.layer_id + ':'));
            // Add new entry
            if (ids.length) {
                selectedLayers.push(this.layer_id + ':' + ids.join(','));
            }
            const newSelected = selectedLayers.join(';');
            const newQuery = {
                ...this.$route.query,
                selected: newSelected
            };
            if (this.$route.query.selected !== newSelected) {
                this.$router.replace({ query: newQuery });
            }
        },
        selectFullFarm() {
            const farmId = this.farmPrompt.farmId;
            this.$set(this.farmPrompt, 'show', false);
            if (!farmId || !this.farm_id_key) return;
            const farmFeatures = this.source.getFeatures().filter(f =>
                f.get(this.farm_id_key) === farmId
            );
            this.selectedFeatures = farmFeatures.map(f => this.createSelectedFeature(f));
            this.selectedLegendElements = this.selectedFeatures.map(f => f.legendId);
            this.layer.changed();
            this.updateSelectedFeaturesQuery();
        },
        dismissFarmPrompt() {
            this.$set(this.farmPrompt, 'show', false);
            this.updateSelectedFeaturesQuery();
        },
        getFeatureProperty(f, prop) {
            return f.get(prop)
        },
        generateLegendKey(f) {
            const legendValue = f.get(this.layer_legend.legend_identifier)
            return legendValue == null ? '_undefined_' : legendValue.toString()
        }
    }
}
</script>

<template>
    <div class="form-check">
        <input class="form-check-input" type="checkbox"
            :id="layer_id + '-chk'"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label" :for="layer_id + '-chk'"><small>{{country_code}}</small> {{ name_en }}</label>
        <button
            v-if="layer_legend && layer_legend.legend_elements"
            type="button"
            class="layer-legend-toggle"
            @click.stop="showLegend = !showLegend"
            :title="showLegend ? 'Hide legend' : 'Show legend'"
        ><i class="fa" :class="showLegend ? 'fa-chevron-up' : 'fa-chevron-down'"></i></button>
        <div class="spinner-border" v-show="isLoading" role="status"><span class="sr-only">Loading...</span></div>
        <div class="farm-prompt-backdrop" v-show="farmPrompt.show" @click.self="dismissFarmPrompt()">
            <div class="farm-prompt-card" role="dialog" aria-modal="true" aria-labelledby="farm-prompt-title">
                <div class="farm-prompt-kicker">Farm selection</div>
                <div class="farm-prompt-text" id="farm-prompt-title">Select all visible parcels for farm <strong>{{ farmPrompt.farmId }}</strong>?</div>
                <div class="farm-prompt-actions">
                    <button class="farm-prompt-btn farm-prompt-yes" type="button" @click="selectFullFarm()">Yes, select full farm</button>
                    <button class="farm-prompt-btn farm-prompt-no" type="button" @click="dismissFarmPrompt()">No, keep current parcel</button>
                </div>
            </div>
        </div>
        <div class="layer-legend-inline" v-if="layer_legend && layer_legend.legend_elements" v-show="showLegend">
            <div class="legend-item" v-for="(el, key) in layer_legend.legend_elements" :key="key">
                <span
                    class="legend-swatch"
                    :class="{ 'legend-swatch--nodata': el.color === null }"
                    :style="el.color !== null ? { background: el.color } : {}"
                ></span>
                <span class="legend-label">{{ el[layer_legend.legend_text] }}</span>
            </div>
        </div>
    </div>
</template>