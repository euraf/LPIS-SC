<script>
module.exports = {
    name: "layer-mvt",
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
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.$set(this.layer_props, "olLayerType", 'VectorTile')
        this.$set(this.layer_props, "olSourceType", 'VectorTile')
        this.$set(this.layer_props, "olFormatType", 'MVT')
        this.$set(this.layer_props, "eventResource", 'tile')
        this.$set(this.layer_props, "isLoading", false)
        this.$set(this.layer_props, "tilesLoading", 0)
        
		return this.layer_props
	},
    mounted() {
        
        this.source.on('tileloadstart', () => {
            if (this.tilesLoading == 0) {
                this.$set(this, 'isLoading', true);
            }
            this.tilesLoading++;
        });
        this.source.on('tileloadend', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
        });
        this.source.on('tileloaderror', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
        });

        this.$nextTick(() => {
            this.setupLayerObjFunctions()
        })

    },
    computed: {
        url() {
            return this.source_url.replaceAll('[layer_name]', this.layer_name)
        },
        format() {
            // Keep native MVT decoding, but force ol.Feature output so downstream
            // parcel logic can safely use geometry APIs (clone/getArea/etc.).
            return new ol.format[this.olFormatType]({ featureClass: ol.Feature })
        },
        style() {
            var _this = this
            return function(feature) {
                const featureId = feature.get(_this.feature_identifier_key)
                const isSelected = Array.isArray(_this.selectedFeatures) && _this.selectedFeatures.some(f => String(f.id) === String(featureId))
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: isSelected ? _this.layer_style.selected_stroke_color : (_this.layer_style.stroke_color || '#111'),
                        width: isSelected ? 1.6 : 0.7,
                    }),
                    fill: new ol.style.Fill({
                        color: isSelected ? _this.layer_style.selected_fill_color : 'rgba(134, 217, 76, 0.35)',
                    }),
                })
            }
        },
    },
    methods: {
        addClickListener() {
            var _this = this

            this.map.on('pointermove', function(evt) {
                if (!_this.layer.getVisible() || evt.dragging) return;
                const hit = _this.map.hasFeatureAtPixel(evt.pixel, {
                    layerFilter: function(layer) {
                        return layer.get('my_layer_id') === _this.layer_id && layer.getVisible();
                    }
                });
                if (hit) {
                    _this.map.getTargetElement().style.cursor = 'pointer';
                } else if (_this.map.getTargetElement().style.cursor === 'pointer') {
                    _this.map.getTargetElement().style.cursor = '';
                }
            });

            this.map.on('singleclick', function (evt) {
                if (!_this.layer.getVisible()) {
                    return
                }

                var featureFound = false

                _this.map.forEachFeatureAtPixel(evt.pixel, function(clickedFeature) {
                    featureFound = true
                    var newFeatureWrapper = _this.createSelectedFeature(clickedFeature)
                    var alreadySelected = _this.selectedFeatures.some(f => f.id === newFeatureWrapper.id)

                    if (evt.originalEvent.shiftKey) {
                        if (alreadySelected) {
                            _this.selectedFeatures = _this.selectedFeatures.filter(f => f.id !== newFeatureWrapper.id)
                        } else {
                            _this.selectedFeatures.push(newFeatureWrapper)
                        }
                    } else {
                        if (alreadySelected) {
                            if (_this.selectedFeatures.length > 1) {
                                _this.selectedFeatures.splice(0)
                                _this.selectedFeatures.push(newFeatureWrapper)
                            } else {
                                _this.selectedFeatures.splice(0)
                            }
                        } else {
                            _this.selectedFeatures.splice(0)
                            _this.selectedFeatures.push(newFeatureWrapper)
                        }
                    }

                    _this.layer.changed()
                    return true
                }, {
                    layerFilter: function(layer) {
                        return layer.get('my_layer_id') === _this.layer_id && layer.getVisible()
                    }
                })

                if (!featureFound && !evt.originalEvent.shiftKey) {
                    _this.selectedFeatures.splice(0)
                    _this.layer.changed()
                }

                _this.selectedLegendElements = _this.selectedFeatures.map(function(f) {
                    return f.legendId
                })
            });
        },
        getFeatureProperty(f, prop) {
            return f.get(prop)
        },
        generateLegendKey(f) {
            if (this.layer_legend && this.layer_legend.legend_identifier) {
                const legendKey = typeof this.layer_legend.legend_identifier === 'string'
                    ? this.layer_legend.legend_identifier
                    : this.layer_legend.legend_identifier.key
                const value = f.get(legendKey)
                if (value !== undefined && value !== null) return value.toString()
            }
            const value = f.get(this.feature_identifier_key)
            return value !== undefined && value !== null ? value.toString() : 'selected'
        }
    }
}
</script>

<template>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" :id="layer_id + '_checkbox'"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label" :for="layer_id + '_checkbox'">{{ name_en }}</label>
        <div class="spinner-border" v-if="isLoading" role="status"><span class="sr-only">Loading...</span></div>
    </div>
</template>