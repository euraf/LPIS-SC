var layer_mixin = {
    // avoid using data() {...} in mixins because references get lost when merging with components own data objects
    computed: {
        map() {
            return this.$parent.$data.map
        },
        source() {
            return this.layer?.getSource()
        },
        feature_identifier_key() {
            return this.feature_infos.feature_identifier?.key
        },
        legendEntries() {
            var legendElements = this.layer_legend && this.layer_legend.legend_elements
                ? this.layer_legend.legend_elements
                : null

            if (!legendElements) {
                return []
            }

            return Object.keys(legendElements).map(function(key) {
                return {
                    key: key,
                    element: legendElements[key]
                }
            })
        },
        displayedLegendEntries() {
            if (this.showFullLegend) {
                return this.legendEntries
            }
            return this.legendEntries.slice(0, 6)
        },
        hasLegendOverflow() {
            return this.legendEntries.length > 6
        },
        originInfoTitle() {
            return this.name_en || this.name || this.layer_id
        },
        originInfoDescription() {
            if (this.short_description) {
                return String(this.short_description).trim()
            }
            return 'Metadata for this layer is still being completed.'
        },
        originOfficialWebsite() {
            return this.official_website ? String(this.official_website).trim() : ''
        },
        originServiceUrl() {
            if (!this.source_url) {
                return ''
            }
            return String(this.source_url).trim()
        },
        originCountryCode() {
            return this.country_code ? String(this.country_code).toUpperCase() : ''
        },
        originCountryFlagClass() {
            return this.originCountryCode ? 'flag-' + this.originCountryCode.toLowerCase() : ''
        },
        originReferenceYearLabel() {
            return Number.isInteger(this.reference_year) ? String(this.reference_year) : 'Not specified'
        },
        originLayerGroups() {
            return Array.isArray(this.layer_groups) ? this.layer_groups : []
        },
        originProviderBadges() {
            const providers = []
            const hasGroup = (group) => this.originLayerGroups.includes(group)

            if (hasGroup('copernicus')) {
                providers.push({
                    id: 'copernicus',
                    name: 'Copernicus',
                    subname: 'Land Monitoring Service',
                    logo: 'img/copernicus_logo.png'
                })
            }

            if (hasGroup('jrc') || String(this.layer_id || '').startsWith('jrc_')) {
                providers.push({
                    id: 'jrc',
                    name: 'Joint Research Centre',
                    subname: 'Joint Research Centre',
                    logo: 'img/jrc.jpg'
                })
            }

            if (hasGroup('regenfarmer_lpis_api')) {
                providers.push({
                    id: 'regenfarmer_lpis_api',
                    name: 'RegenFarmer LPIS API',
                    subname: 'LPIS API',
                    logo: 'img/regenfarmer-icon.png'
                })
            }

            return providers
        },
        hasOriginInfo() {
            return true
        }
    },
    created() {
        var _this = this

        // create Layer
        var source_props = {
            format: _this.format,
            url: _this.url,
            attributions: _this.attributions,
            strategy: _this.strategy,
            params: _this.params, // only for wms
            serverType: _this.serverType, // only for wms
        }
        
        if (this.needs_loader) {
            source_props.loader = this.loader
        }

        var source = new ol.source[_this.olSourceType](source_props)
        
        this.layer = new ol.layer[_this.olLayerType]({
            my_layer_id: _this.layer_id,
            source: source,
            style: _this.style,
            minZoom: _this.minZoom,
            maxZoom: _this.maxZoom,
            zIndex: _this.zIndex,
            opacity: _this.opacity
        });
        
        this.map.addLayer(this.layer);
        
        if (this.$router.currentRoute.query.layers) {
            if (this.$router.currentRoute.query.layers.includes(this.layer_id)) {
                this.setShow(true)
            } else {
                this.setShow(false)
            }
        } else {
            this.setShow(this.show)
        }
        
        // toggle events
        
        VueBus.$on('hideBaselayers', function(id) {
            if (_this.layer_id != id && _this.baselayer) {
                _this.setShow(false)
            }
        })
        
        VueBus.$on('updateLayerVisibility', function(id, toShow) {
            if (_this.layer_id == id) {
                _this.setShow(toShow)
            }
        })
        this.addClickListener()
    },
    methods: {
        setupLayerObjFunctions() {

            var layerObj = this.layer_props
            var layerVue = this

            layerObj.getFeatureProperty = layerVue.getFeatureProperty

            layerObj.generateLegendKey = layerVue.generateLegendKey

            layerObj.getInfo = function(feature, info, legend_key_obj) {
                var value = ""
                if ('keys' in legend_key_obj) {
                    if ('transform' in legend_key_obj) {
                        if (legend_key_obj.transform == "concatenate") {
                            for (key of legend_key_obj.keys) {
                                value += layerObj.getFeatureProperty(feature, key) + " - "
                            }
                            value = value.slice(0, value.length-3)
                        } else {
                            console.log(layerObj.id + ': keys with transform that\'s not yet implemented: ' + legend_key_obj.transform)
                        }
                    } else {
                        console.log(layerObj.id + ': keys with no designated transform')
                    }
                } else if ('key' in legend_key_obj) {
                    if ('transform' in legend_key_obj) {
                        // TODO REMOVE THIS TRANSFORM, SUBSTITUTED IT BY UNIT
                        if (legend_key_obj.transform == "square_m_to_ha") {
                            value = roundTwoDecimals(layerObj.getFeatureProperty(feature, legend_key_obj.key)/10000)
                        } else if (legend_key_obj.transform == "get_from_legend") {
                            var legend_value = layerObj.getFeatureProperty(feature, legend_key_obj.key)
                            var legend_key = legend_key_obj.alternate_key
                            value = layerObj.layer_legend.legend_elements[legend_value][legend_key]
                        } else {
                            console.log(layerObj.id + ': key with transform that\'s not yet implemented: ' + legend_key_obj.transform)
                        }
                    } else {
                        value = layerObj.getFeatureProperty(feature, legend_key_obj.key)
                    }
                } else {
                    console.log(layerObj.id + ': no key or keys implemented')
                }
                info.push({
                    name: legend_key_obj.name,
                    value: value
                })
            }

            layerObj.generateInfo = function(feature) {
                var info = []
                for (var [key, legend_key_obj] of Object.entries(layerObj.feature_infos)) {
                    if (key == "others") {
                        for (var legend_key_obj_other of legend_key_obj) {
                            layerObj.getInfo(feature, info, legend_key_obj_other)
                        }
                    } else {
                        layerObj.getInfo(feature, info, legend_key_obj)
                    }
                }
                return info
            }

            layerObj.getFeaturesAreaHa = function(featuresWrappers) {
                var area = 0
                for (var featureWrapper of featuresWrappers) {
                    area += layerObj.getFeatureAreaHa(featureWrapper.feature) || 0
                }
                return area
            }

            layerObj.getFeatureAreaHa = function(feature) {
                var area = null
                if (layerObj.feature_infos.feature_area) {
                    area = parseFloat(layerObj.getFeatureProperty(feature, layerObj.feature_infos.feature_area.key))
                    if (layerObj.feature_infos.feature_area.unit == 'square_m') {
                        return area / 10000
                    } else {
                        return area
                    }
                } else {
                    // if feature has no explicit area property, use turf.js
                    try {
                        let geojsonFeature = null

                        if (feature && typeof feature.getId === 'function') {
                            // OpenLayers feature path
                            geojsonFeature = new ol.format.GeoJSON().writeFeatureObject(feature, {
                                featureProjection: MAP_PROJECTION,
                                dataProjection: TURF_PROJECTION
                            })
                        } else if (feature && feature.type === 'Feature' && feature.geometry) {
                            // Raw GeoJSON feature path (e.g. WMS GetFeatureInfo responses)
                            geojsonFeature = feature
                        }

                        if (!geojsonFeature) return null
            
                        return turf.area(geojsonFeature) / 10000
                    } catch(e) {
                        feature
                        console.warn(e)
                    }
                }
            }

        },
        setShow(toShow) {
            if (this.layer) {
                this.layer.setVisible(toShow)
                if (toShow && this.layer_legend && this.layer_legend.legend_elements) {
                    this.showLegend = true
                }
                if (toShow && this.map && this.map.getView && Number.isFinite(this.minZoom)) {
                    const currentZoom = this.map.getView().getZoom()
                    if (typeof currentZoom === 'number' && currentZoom < this.minZoom) {
                        this.map.getView().animate({ zoom: this.minZoom, duration: 300 })
                    }
                }
                // For vector layers: show spinner when turning on with no cached features.
                // For tile/WMS layers: spinner is managed by tileloadstart/end events in the component.
                const isVector = typeof this.source.getFeatures === 'function';
                if (isVector) {
                    this.isLoading = toShow && this.source.getFeatures().length === 0;
                } else if (!toShow) {
                    this.isLoading = false; // always clear spinner when hiding
                }
                this.show = toShow

                if (this.baselayer && toShow) {
                    VueBus.$emit('hideBaselayers', this.layer_id)
                }

                // Update layers in router query
                if (this.$router) {
                    // Get current layers from query
                    let layers = (this.$router.currentRoute.query.layers || '').split(',')
                    if (toShow) {
                        if (!layers.includes(this.layer_id)) layers.push(this.layer_id);
                    } else {
                        layers = layers.filter(l => l !== this.layer_id);
                    }
                    const newLayers = layers.join(',');
                    if (this.$router.currentRoute.query.layers !== newLayers) {
                        this.$router.replace({
                            query: {
                                ...this.$router.currentRoute.query,
                                layers: newLayers
                            }
                        });
                    }
                }

                if (!toShow) {
                    this.showLegend = false
                    this.showFullLegend = false
                    // Clear selection
                    this.selectedFeatures = []
                    VueBus.$emit('updateSelectedFeaturesQuery', this.layer_id)
                }
            }
        },
        getWithinPolygonsAreaHa(bbox) {
            if (bbox.stats) {
                if (bbox.stats.withinPolygons) {
                    if (bbox.stats.withinPolygons.area) {
                        return bbox.stats.withinPolygons.area
                    }
                }
            }
            return null
        },
        createSelectedFeature(feature) {
            return {
                layerId: this.layer_props.id,
                layerName: this.layer_props.name_en,
                projection: MAP_PROJECTION,
                legendId: this.layer_props.generateLegendKey(feature),
                info: this.layer_props.generateInfo(feature),
                feature: feature,
                id: this.layer_props.getFeatureProperty(feature, this.layer_props.feature_infos.feature_identifier.key),
                area: this.layer_props.getFeatureAreaHa(feature),
                stats: {}
            }
        }
    }
}