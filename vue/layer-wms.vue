<script>
module.exports = {
    name: "layer-wms",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "lastCalledURL", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.$set(this.layer_props, "olLayerType", 'Tile')
        this.$set(this.layer_props, "olSourceType", 'TileWMS')
        this.$set(this.layer_props, "eventResource", 'tile')
        this.$set(this.layer_props, "isLoading", false)
        this.$set(this.layer_props, "tilesLoading", 0)
        this.$set(this.layer_props, "showLegend", false)
        this.$set(this.layer_props, "showFullLegend", false)
        this.$set(this.layer_props, "showOriginInfo", false)
        
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
            return this.source_url.split('?')[0].replaceAll('[layer_name]', this.layer_name).replaceAll('[layer_name_detail]', this.layer_name_detail).replaceAll('[layer_projection]', this.layer_projection)
        },
        params() {
            var url = this.source_url.replaceAll('[layer_name]', this.layer_name).replaceAll('[layer_name_detail]', this.layer_name_detail).replaceAll('[layer_projection]', this.layer_projection)
            const urlSearchParams = new URLSearchParams(url.split('?')[1]);
            const params = Object.fromEntries(urlSearchParams.entries());
            return params
        },
        serverType() {
            if (this.source_url.toLowerCase().includes("geoserver")) {
                return "geoserver"
            } else if (this.source_url.toLowerCase().includes("mapserver")) {
                return "mapserver"
            }
        },
        projection() {
            return this.layer_projection
        }
    },
    methods: {
        addClickListener() {
            var _this = this
            
            this.map.on('singleclick', function (evt) {

                if (!_this.layer.getVisible() || _this.layer_id == "jrc_gfc_2020_v2") {
                    return
                }
                const viewResolution = _this.map.getView().getResolution();
                const viewProjection = _this.map.getView().getProjection();

                const url = _this.source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {
                    'INFO_FORMAT': _this.feature_info_format,
                    'QUERY_LAYERS': _this.feature_info_query,
                });

                if (!url) {
                    console.log(_this.layer_id + " no url for click listener.")
                    return;
                }

                fetch(url)
                    .then(function(res) {
                        if (["application/json", "application/geo+json"].includes(_this.feature_info_format)) {
                            return res.json()
                        } else {
                            return res.text()
                        }
                    })
                    .then(function (data) {
                        
                        if (!data.features || data.features.length === 0) {
                            _this.selectedFeatures = []
                            return
                        }

                        const feature = data.features[0];
                        
                        const newFeatureWrapper = _this.createSelectedFeature(feature)
                        
                        _this.selectedFeatures = [newFeatureWrapper]
                        _this.selectedLegendElements = _this.selectedFeatures.map(function(f) {
                            return f.legendId
                        })
                        return true;
                    })
                    .catch(err => console.error(_this.layer_id + " fetch error: " + err));
            })
        },
        getFeatureProperty(f, prop) {
            return f.properties[prop]
        },
        generateLegendKey(feature) {
            const value = this.getFeatureProperty(feature, this.feature_identifier_key)

            var legend = this.layer_legend

            if ('transform' in legend.legend_identifier) {
                if (legend.legend_identifier.transform == "intervals") {
                    var idx = 0
                    var interval_val = legend.legend_identifier.intervals[idx]
                    while (value >= interval_val) {
                        idx++
                        interval_val = legend.legend_identifier.intervals[idx]
                    }
                    return legend.legend_identifier.intervals[idx-1].toString()
                } else {
                    console.log(this.layer_id + ': legend_identifier with transform that\'s not yet implemented: ' + legend.legend_identifier.transform)
                }
            } else {
                return value.toString()
            }
        },
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
        <layer-info-modal
            v-model="showOriginInfo"
            :layer-id="layer_id"
            :title="originInfoTitle"
            :description="originInfoDescription"
            :type-label="type"
            :reference-year-label="originReferenceYearLabel"
            :country-code="originCountryCode"
            :country-flag-class="originCountryFlagClass"
            :official-website="originOfficialWebsite"
            :service-url="originServiceUrl"
            :provider-badges="originProviderBadges"
        ></layer-info-modal>
        <button
            v-if="layer_legend && layer_legend.legend_elements"
            type="button"
            class="layer-legend-toggle"
            @click.stop="showLegend = !showLegend"
            :title="showLegend ? 'Hide legend' : 'Show legend'"
        ><i class="fa" :class="showLegend ? 'fa-chevron-up' : 'fa-chevron-down'"></i></button>
        <div class="spinner-border" v-show="isLoading" role="status"><span class="sr-only">Loading...</span></div>
        <div class="layer-legend-inline" v-if="layer_legend && layer_legend.legend_elements && showLegend">
            <div class="legend-item" v-for="entry in displayedLegendEntries" :key="entry.key">
                <span
                    class="legend-swatch"
                    :class="{ 'legend-swatch--nodata': entry.element.color === null }"
                    :style="entry.element.color !== null ? { background: entry.element.color } : {}"
                ></span>
                <span class="legend-label">{{ entry.element[layer_legend.legend_text] }}</span>
            </div>
            <a
                v-if="hasLegendOverflow"
                href="#"
                class="tcd-pixels-link"
                @click.prevent.stop="showFullLegend = !showFullLegend"
            >{{ showFullLegend ? 'Show less' : 'Show full legend' }}</a>
        </div>
    </div>
</template>