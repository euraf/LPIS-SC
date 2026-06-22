<template>
	<div class="tcd-panel">
		<div v-if="!hasTarget" class="accordion-note">
			{{ emptyMessage }}
		</div>
		<div v-else>
			<div v-if="isCalculating" class="accordion-note">
				Calculating… {{ calculationStatus ? calculationStatus + ' ' : '' }}
				<span class="spinner-border spinner-border-sm" role="status"></span>
			</div>
			<div v-if="isPolicyMode ? (policyResults && policyResults.length) : tcdResults">
				<template v-if="isPolicyMode">
					<div v-for="block in policyResults" :key="block.key" style="margin-bottom: 14px;">
						<p class="tcd-section-label">{{ block.title }}</p>
						<div class="insight-cards">
							<div class="insight-card" :style="{ borderLeft: '3px solid ' + tcdColor(block.avgPct) }">
								<span class="card-label">Region avg TCD</span>
								<span class="card-value" :style="{ color: tcdColor(block.avgPct) }">
									{{ block.avgPct !== null ? block.avgPct.toFixed(1) + ' %' : '—' }}
								</span>
							</div>
							<template v-if="block.policyHasParcelStats">
								<div class="insight-card">
									<span class="card-label">Parcel avg TCD</span>
									<span class="card-value" :style="{ color: tcdColor(block.parcelAvgPct) }">
										{{ block.parcelAvgPct !== null ? block.parcelAvgPct.toFixed(1) + ' %' : '—' }}
									</span>
								</div>
								<div class="insight-card">
									<span class="card-label">&gt; 5% TCD</span>
									<span class="card-value" v-html="thresholdSummary(block.gt5Count, block.gt5AreaHa, block.gt5SharePct)"></span>
								</div>
								<div class="insight-card">
									<span class="card-label">&gt; 10% TCD</span>
									<span class="card-value" v-html="thresholdSummary(block.gt10Count, block.gt10AreaHa, block.gt10SharePct)"></span>
								</div>
								<div class="insight-card">
									<span class="card-label">LPIS parcels analysed</span>
									<span class="card-value">{{ block.parcelCount }}</span>
								</div>
							</template>
						</div>
						<div v-if="block.note" class="accordion-note" style="margin-top: 8px;">
							{{ block.note }}
						</div>
					</div>
				</template>
				<template v-else>
					<p class="tcd-section-label">Per parcel</p>
					<div class="insight-cards">
						<div
							class="insight-card"
							v-for="parcel in tcdResults.parcels"
							:key="parcel.id"
							@mouseenter="highlightParcelCard(parcel.id)"
							@mouseleave="clearParcelCardHighlight()"
							:style="{ borderLeft: '3px solid ' + tcdColor(parcel.avg) }"
						>
							<span class="card-label">{{ parcel.id }}</span>
							<span class="card-value" :style="{ color: tcdColor(parcel.avg) }">
								avg {{ parcel.avg !== null ? parcel.avg.toFixed(1) : '—' }} % TCD
							</span>
						</div>
					</div>
					<p class="tcd-section-label" style="margin-top:10px;">All selected parcels (farm)</p>
					<div class="insight-cards">
						<div class="insight-card">
							<span class="card-label">Pixels analysed</span>
							<span class="card-value">
								{{ tcdResults.totalPixels }}
								<a href="#" class="tcd-pixels-link" @click.prevent="toggleTcdPixels()">
									{{ showTcdPixels ? 'hide pixels' : 'show pixels' }}
								</a>
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Avg TCD</span>
							<span class="card-value" :style="{ color: tcdColor(tcdResults.farmParcelAvg) }">
								{{ tcdResults.farmParcelAvg !== null ? tcdResults.farmParcelAvg.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">&gt; 5% TCD</span>
							<span class="card-value" v-html="thresholdSummary(tcdResults.farmGt5Count, tcdResults.farmGt5AreaHa, tcdResults.farmGt5SharePct)"></span>
						</div>
						<div class="insight-card">
							<span class="card-label">&gt; 10% TCD</span>
							<span class="card-value" v-html="thresholdSummary(tcdResults.farmGt10Count, tcdResults.farmGt10AreaHa, tcdResults.farmGt10SharePct)"></span>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: {
		mode: {
			type: String,
			default: "farmer",
		},
		selectedFeaturesAll: {
			type: Array,
			default: function() {
				return [];
			},
		},
		nutsLauHierarchy: {
			type: Object,
			default: function() {
				return {};
			},
		},
		policyStatsLevel: {
			type: String,
			default: "",
		},
		policySelection: {
			type: Object,
			default: function() {
				return {
					country: "",
					nuts1: "",
					nuts2: "",
					nuts3: "",
					lau: "",
				};
			},
		},
		anySelectedFeature: {
			type: Boolean,
			required: true,
		},
		opening: {
			type: Boolean,
			required: true,
		}
	},
	data() {
		return {
			isCalculating: false,
			calculationStatus: "",
			tcdResults: null,
			policyResults: null,
			tcdPixelLayer: null,
			parcelHoverLayer: null,
			parcelHoverSource: null,
			showTcdPixels: false,
		}
	},
	watch: {
		opening(isOpening) {
			if (isOpening && this.hasTarget) {
				this.calculateTCDForCurrentMode();
			} else if (!isOpening) {
				this._removeTcdPixelLayer();
				this._removeParcelHoverLayer();
				this.showTcdPixels = false;
				this.policyResults = null;
			}
		},
		selectedFeaturesAll() {
			if (this.isPolicyMode) return;

			if (!this.anySelectedFeature) {
				this._removeTcdPixelLayer();
				this._removeParcelHoverLayer();
				this.showTcdPixels = false;
				this.tcdResults = null;
				this.policyResults = null;
				return;
			}

			if (this.opening) {
				this.tcdResults = null;
				if (this.anySelectedFeature) this.calculateTCDForCurrentMode();
			}
		},
		policyStatsLevel() {
			if (!this.isPolicyMode) return;
			if (!this.hasTarget) {
				this.tcdResults = null;
				this.policyResults = null;
				this._removeTcdPixelLayer();
				this._removeParcelHoverLayer();
				this.showTcdPixels = false;
				return;
			}
			if (this.opening) this.calculateTCDForCurrentMode();
		},
		policySelection: {
			deep: true,
			handler() {
				if (!this.isPolicyMode) return;
				if (!this.hasTarget) {
					this.tcdResults = null;
					this.policyResults = null;
					this._removeTcdPixelLayer();
						this._removeParcelHoverLayer();
					this.showTcdPixels = false;
					return;
				}
				if (this.opening) this.calculateTCDForCurrentMode();
			},
		},
	},
	computed: {
		isPolicyMode() {
			return this.mode === "policymaker";
		},
		isPolicyLauLevel() {
			return this.policyStatsLevel === "lau";
		},
		hasRegionTarget() {
			if (!this.policyStatsLevel || !this.isPolicyLauLevel) return false;
			return !!(this.policySelection && this.policySelection[this.policyStatsLevel]);
		},
		hasAnyPolicyRegion() {
			if (!this.policyStatsLevel) return false;
			return !!(this.policySelection && this.policySelection[this.policyStatsLevel]);
		},
		hasTarget() {
			return this.isPolicyMode ? this.hasRegionTarget : this.anySelectedFeature;
		},
		emptyMessage() {
			if (this.isPolicyMode) {
				if (!this.hasAnyPolicyRegion) return "Select region and click Show stats.";
				if (!this.isPolicyLauLevel) return "TCD is currently available for LAU level only.";
				return "Select LAU region and click Show stats.";
			}
			return "Select a parcel on the map to calculate.";
		},
		map() {
			return this.$parent.$data.map
		},
		layers() {
			return this.$parent.$data.layers
		},
		policyParcelLayer() {
			const country = String((this.policySelection && this.policySelection.country) || '').toUpperCase();
			if (!this.isPolicyMode || !country) return null;
			if (country === 'PT') {
				const preferredIds = ['lpis_pt_ocupacaosolo_2024', 'lpis_pt_parcelas_2024'];
				for (const id of preferredIds) {
					const layer = this.layers && this.layers[id];
					if (layer && layer.type === 'WFS' && layer.source_url) return layer;
				}
			}
			const countryLayers = Object.values(this.layers || {}).filter((layer) => {
				return layer && layer.country_code === country && ['MVT', 'WFS'].includes(layer.type) && layer.source_url;
			});
			return countryLayers.find((layer) => layer.type === 'MVT') || countryLayers.find((layer) => layer.type === 'WFS') || null;
		},
		policySupportsParcelStats() {
			return this.isPolicyMode && !!this.policyParcelLayer;
		}
	},
	methods: {
		_featureAreaHa(feature, featureProjection) {
			if (!feature) return 0;

			try {
				if (feature.getGeometry) {
					const geom = feature.getGeometry();
					if (geom) {
						const areaGeom = (typeof geom.clone === 'function') ? geom.clone() : geom;
						const srcProj = featureProjection || 'EPSG:3857';
						if (srcProj !== 'EPSG:3857' && areaGeom && typeof areaGeom.transform === 'function') {
							areaGeom.transform(srcProj, 'EPSG:3857');
						}
						if (areaGeom && typeof areaGeom.getArea === 'function') {
							return areaGeom.getArea() / 10000;
						}
					}
				}

				let geojsonFeature = null;
				if (feature.type === 'Feature' && feature.geometry) {
					geojsonFeature = feature;
				} else if (feature.getGeometry) {
					geojsonFeature = new ol.format.GeoJSON().writeFeatureObject(feature, {
						featureProjection: featureProjection || 'EPSG:3857',
						dataProjection: 'EPSG:4326',
					});
				}

				if (geojsonFeature) {
					return turf.area(geojsonFeature) / 10000;
				}
			} catch (_) {
				return 0;
			}

			return 0;
		},
		thresholdSummary(count, areaHa, sharePct) {
			const safeCount = Number.isFinite(count) ? count : 0;
			const label = safeCount === 1 ? 'parcel' : 'parcels';
			const areaTxt = Number.isFinite(areaHa) ? areaHa.toFixed(1) : '0.0';
			const shareTxt = Number.isFinite(sharePct) ? sharePct.toFixed(1) : '0.0';
			return `<p style="margin:0;">${safeCount} ${label}</p><p style="margin:2px 0 0 0;">${areaTxt} ha</p><p style="margin:2px 0 0 0;">${shareTxt}% of LPIS identified area</p>`;
		},
		highlightParcelCard(parcelId) {
			if (!this.map || !parcelId) return;
			const selected = (this.selectedFeaturesAll || []).find((sf) => String(sf.id) === String(parcelId));
			if (!selected || !selected.feature || !selected.feature.getGeometry) return;

			this._ensureParcelHoverLayer();
			if (!this.parcelHoverSource) return;

			const geom = selected.feature.getGeometry().clone();
			const srcProj = selected.projection || 'EPSG:3857';
			if (srcProj !== 'EPSG:3857') geom.transform(srcProj, 'EPSG:3857');

			this.parcelHoverSource.clear();
			this.parcelHoverSource.addFeature(new ol.Feature(geom));
		},
		clearParcelCardHighlight() {
			if (this.parcelHoverSource) this.parcelHoverSource.clear();
		},
		_ensureParcelHoverLayer() {
			if (!this.map || this.parcelHoverLayer) return;
			this.parcelHoverSource = new ol.source.Vector({ features: [] });
			this.parcelHoverLayer = new ol.layer.Vector({
				source: this.parcelHoverSource,
				zIndex: 72,
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({ color: 'rgba(0, 180, 255, 0.95)', width: 3, lineDash: [7, 4] }),
					fill: new ol.style.Fill({ color: 'rgba(0, 180, 255, 0.08)' }),
				}),
			});
			this.map.addLayer(this.parcelHoverLayer);
		},
		_removeParcelHoverLayer() {
			if (this.parcelHoverLayer && this.map) {
				this.map.removeLayer(this.parcelHoverLayer);
			}
			this.parcelHoverLayer = null;
			this.parcelHoverSource = null;
		},
		tcdColor(pct) {
			if (pct === null) return '#888';
			if (pct < 5) return '#c9a227';
			if (pct < 10) return '#7cb87c';
			return '#2e7d32';
		},
		async calculateTCDForCurrentMode() {
			if (this.isPolicyMode) {
				return this.calculateRegionTCD();
			}
			return this.calculateParcelTCD();
		},
		buildPolicyBboxGeoJson(regionGeoJson, halfSideMeters) {
			try {
				const regionFeature = new ol.format.GeoJSON().readFeature(regionGeoJson, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857',
				});
				if (!regionFeature || !regionFeature.getGeometry()) return null;
				const extent = regionFeature.getGeometry().getExtent();
				const centerX = (extent[0] + extent[2]) / 2;
				const centerY = (extent[1] + extent[3]) / 2;
				const squareExtent = [
					centerX - halfSideMeters,
					centerY - halfSideMeters,
					centerX + halfSideMeters,
					centerY + halfSideMeters,
				];
				return new ol.format.GeoJSON().writeFeatureObject(
					new ol.Feature(ol.geom.Polygon.fromExtent(squareExtent)),
					{
						featureProjection: 'EPSG:3857',
						dataProjection: 'EPSG:4326',
					}
				);
			} catch (_) {
				return null;
			}
		},
		async fetchPolicyParcels(layer, targetGeoJson) {
			if (!layer || !targetGeoJson) return { features: [], truncated: false };
			if (layer.type === 'MVT') return this.fetchPolicyParcelsFromMvt(layer, targetGeoJson);
			if (!layer || !layer.source_url || !targetGeoJson) return { features: [], truncated: false };
			const bbox = turf.bbox(targetGeoJson);
			const urlBase = layer.source_url
				.replace(/\[layer_name\]/g, layer.layer_name)
				.replace(/\[layer_name_detail\]/g, layer.layer_name_detail)
				.replace(/\[layer_projection\]/g, 'EPSG:4326')
				.replace('[extent]', bbox.join(','));

			const pageSize = 2000;
			const maxFeatureCap = 10000;
			let allFeatures = [];
			let startIndex = 0;
			let totalFeatures = null;

			while (startIndex < maxFeatureCap) {
				const url = `${urlBase}&maxFeatures=${pageSize}&startIndex=${startIndex}`;
				const response = await fetch(url);
				if (!response.ok) break;
				const data = await response.json();
				if (!data.features || !data.features.length) break;
				allFeatures = allFeatures.concat(data.features);
				if (totalFeatures === null) {
					totalFeatures = data.totalFeatures ?? data.numberMatched ?? data.features.length;
				}
				startIndex += data.features.length;
				if (startIndex >= totalFeatures || data.features.length < pageSize) break;
			}

			const truncated = startIndex >= maxFeatureCap;
			const features = allFeatures.filter((feature) => {
				if (!feature || !feature.geometry) return false;
				try {
					return turf.booleanIntersects(feature, targetGeoJson);
				} catch (_) {
					return true;
				}
			});

			return { features, truncated };
		},
		async fetchTileJsonMetadata(layer) {
			if (layer.tilejson_meta) return layer.tilejson_meta;
			const response = await fetch(`https://lpis.regenfarmer.com/api/tilesets/${layer.layer_name}`);
			if (!response.ok) throw new Error(`Could not load LPIS tile metadata for ${layer.layer_name}.`);
			const data = await response.json();
			this.$set(layer, 'tilejson_meta', data);
			return data;
		},
		_lonToTileX(lon, zoom) {
			const tiles = Math.pow(2, zoom);
			const normalized = ((lon + 180) / 360) * tiles;
			return Math.max(0, Math.min(tiles - 1, Math.floor(normalized)));
		},
		_latToTileY(lat, zoom) {
			const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
			const rad = clampedLat * Math.PI / 180;
			const tiles = Math.pow(2, zoom);
			const normalized = (1 - Math.log(Math.tan(rad) + (1 / Math.cos(rad))) / Math.PI) / 2 * tiles;
			return Math.max(0, Math.min(tiles - 1, Math.floor(normalized)));
		},
		_tileBounds4326(x, y, z) {
			const tiles = Math.pow(2, z);
			const west = x / tiles * 360 - 180;
			const east = (x + 1) / tiles * 360 - 180;
			const north = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / tiles))) * 180 / Math.PI);
			const south = (Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / tiles))) * 180 / Math.PI);
			return [west, south, east, north];
		},
		_mergeMvtParcelFeature(targetFeature, incomingFeature) {
			if (!targetFeature || !incomingFeature || !targetFeature.getGeometry || !incomingFeature.getGeometry) return;
			const targetGeom = targetFeature.getGeometry();
			const incomingGeom = incomingFeature.getGeometry();
			if (!targetGeom || !incomingGeom) return;
			const toMultiCoords = (geom) => {
				if (geom.getType() === 'Polygon') return [geom.getCoordinates()];
				if (geom.getType() === 'MultiPolygon') return geom.getCoordinates();
				return [];
			};
			const mergedCoords = toMultiCoords(targetGeom).concat(toMultiCoords(incomingGeom));
			if (mergedCoords.length) targetFeature.setGeometry(new ol.geom.MultiPolygon(mergedCoords));
		},
		async fetchPolicyParcelsFromMvt(layer, targetGeoJson) {
			const meta = await this.fetchTileJsonMetadata(layer);
			const bbox = turf.bbox(targetGeoJson);
			const zoom = Number.isFinite(meta.maxzoom) ? meta.maxzoom : 14;
			const minTileX = this._lonToTileX(bbox[0], zoom);
			const maxTileX = this._lonToTileX(bbox[2], zoom);
			const minTileY = this._latToTileY(bbox[3], zoom);
			const maxTileY = this._latToTileY(bbox[1], zoom);
			const format = new ol.format.MVT({
				featureClass: ol.Feature,
				layers: Array.isArray(meta.vector_layers) ? meta.vector_layers.map((entry) => entry.id) : undefined,
			});
			const featureIdKey = (layer.feature_infos && layer.feature_infos.feature_identifier && layer.feature_infos.feature_identifier.key) || 'AutoID';
			const mergedFeatures = new Map();
			let tileCounter = 0;
			let truncated = false;
			for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
				for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
					tileCounter += 1;
					if (tileCounter > 256) {
						truncated = true;
						break;
					}
					const url = meta.tiles[0].replace('{z}', zoom).replace('{x}', tileX).replace('{y}', tileY);
					const response = await fetch(url);
					if (!response.ok) continue;
					const buffer = await response.arrayBuffer();
					const tileExtent3857 = ol.proj.transformExtent(this._tileBounds4326(tileX, tileY, zoom), 'EPSG:4326', 'EPSG:3857');
					let tileFeatures = [];
					try {
						tileFeatures = format.readFeatures(buffer, { extent: tileExtent3857, featureProjection: 'EPSG:3857' });
					} catch (_) {
						continue;
					}
					for (const feature of tileFeatures) {
						if (!feature || !feature.getGeometry) continue;
						const geom = feature.getGeometry();
						if (!geom || ['Point', 'MultiPoint'].includes(geom.getType())) continue;
						if (feature.get('clustered') || feature.get('point_count')) continue;
						const featureGeoJson = new ol.format.GeoJSON().writeFeatureObject(feature, {
							featureProjection: 'EPSG:3857',
							dataProjection: 'EPSG:4326',
						});
						try {
							if (!turf.booleanIntersects(featureGeoJson, targetGeoJson)) continue;
						} catch (_) {
							continue;
						}
						const featureId = feature.get(featureIdKey) ?? feature.getId() ?? feature.get('AutoID');
						if (featureId === undefined || featureId === null) continue;
						const key = String(featureId);
						if (!mergedFeatures.has(key)) {
							mergedFeatures.set(key, feature.clone());
						} else {
							this._mergeMvtParcelFeature(mergedFeatures.get(key), feature);
						}
					}
				}
				if (truncated) break;
			}
			return { features: Array.from(mergedFeatures.values()), truncated };
		},
		normalizeGeoJsonFeature(feature) {
			if (!feature) return null;
			if (typeof feature.getId === 'function' && typeof feature.getGeometry === 'function') {
				return feature;
			}
			try {
				return new ol.format.GeoJSON().readFeature(feature, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857',
				});
			} catch (_) {
				return null;
			}
		},
		async calculateTcdBlock(targetGeoJson, targetTitle) {
			const rasterLayer = this.layers['tree_cover_density_2021'];
			if (!rasterLayer) throw new Error('tree_cover_density_2021 layer not loaded');

			const olTargetFeature = new ol.format.GeoJSON().readFeature(targetGeoJson, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
			});
			if (!olTargetFeature || !olTargetFeature.getGeometry()) throw new Error('Invalid target geometry');

			const extent = olTargetFeature.getGeometry().getExtent();
			const bbox = turf.bbox(targetGeoJson);
			const [minLon, minLat, maxLon, maxLat] = bbox;

			let parcelData = { features: [], truncated: false };
			const shouldCalculatePolicyParcelStats = !this.isPolicyMode || this.policySupportsParcelStats;
			if (this.isPolicyMode && shouldCalculatePolicyParcelStats) {
				const layer = this.policyParcelLayer;
				parcelData = layer ? await this.fetchPolicyParcels(layer, targetGeoJson) : { features: [], truncated: false };
			}

			const parcelStats = parcelData.features
				.map((feature) => this.normalizeGeoJsonFeature(feature))
				.filter((feature) => !!feature)
				.map((feature) => {
					const featureId = feature.get('OSA_ID') || feature.get('PAR_ID') || feature.get('GISCO_ID') || feature.get('LAU_ID') || feature.getId();
					return {
						id: String(featureId || 'parcel'),
						feature,
						areaHa: this._featureAreaHa(feature, 'EPSG:3857'),
						sum: 0,
						count: 0,
					};
				});

			const turfPolygons = parcelStats.map((ps) => {
				const gj = new ol.format.GeoJSON().writeFeatureObject(ps.feature, {
					featureProjection: 'EPSG:3857',
					dataProjection: 'EPSG:4326',
				});
				return { ps, gj, bbox: turf.bbox(gj) };
			});

			const url = this._tcdWMSUrl(rasterLayer, extent);
			VueBus.$emit('changeMessage', `Downloading Tree Cover Density raster for ${targetTitle}...`);
			let tiff = await GeoTIFF.fromUrl(url, { allowFullFile: true });
			let image = await tiff.getImage();
			let raster = await image.readRasters({ interleave: true });

			const [a, , , tx, c, d, , ty] = image.fileDirectory.ModelTransformation;
			const width = image.getWidth();
			const height = image.getHeight();
			const nodata = image.fileDirectory.GDAL_NODATA != null ? Number(image.fileDirectory.GDAL_NODATA) : null;

			VueBus.$emit('changeMessage', `Analysing ${(width * height).toLocaleString()} pixels for ${targetTitle}...`);
			await new Promise((r) => setTimeout(r, 50));

			let sum = 0;
			let count = 0;
			const pixelPoints = [];
			let lastProgressUpdate = 0;
			let lastUiYield = 0;
			const totalPixels = width * height;
			this.calculationStatus = `${targetTitle}: 0 / ${totalPixels.toLocaleString()} pixels`;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const value = raster[y * width + x];
					if (value === null || value === undefined) continue;
					if (nodata !== null && value === nodata) continue;

					const coordX = a * (x + 0.5) + tx;
					const coordY = d * (y + 0.5) + ty;
					const [lon, lat] = ol.proj.transform([coordX, coordY], rasterLayer.layer_projection, 'EPSG:4326');
					if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;

					const pt = turf.point([lon, lat]);
					if (!turf.booleanPointInPolygon(pt, targetGeoJson)) continue;

					sum += value;
					count += 1;
					pixelPoints.push([coordX, coordY, value]);

					for (const tp of turfPolygons) {
						const [bMinLon, bMinLat, bMaxLon, bMaxLat] = tp.bbox;
						if (lon < bMinLon || lon > bMaxLon || lat < bMinLat || lat > bMaxLat) continue;
						if (turf.booleanPointInPolygon(pt, tp.gj)) {
							tp.ps.sum += value;
							tp.ps.count += 1;
							break;
						}
					}
					const processedPixels = y * width + x + 1;
					if (processedPixels - lastProgressUpdate >= 2500 || processedPixels === totalPixels) {
						lastProgressUpdate = processedPixels;
						this.calculationStatus = `${targetTitle}: ${processedPixels.toLocaleString()} / ${totalPixels.toLocaleString()} pixels`;
					}
					if (processedPixels - lastUiYield >= 10000 || processedPixels === totalPixels) {
						lastUiYield = processedPixels;
						await this.$nextTick();
						await new Promise((resolve) => setTimeout(resolve, 0));
					}
				}
			}

			const parcels = parcelStats.map((ps) => ({
				id: ps.id,
				avg: ps.count > 0 ? ps.sum / ps.count : null,
				areaHa: ps.areaHa,
				count: ps.count,
			}));
			const parcelAvgCount = parcels.filter((parcel) => parcel.avg !== null).length;
			const parcelAvgSum = parcels.reduce((s, parcel) => s + (parcel.avg !== null ? parcel.avg : 0), 0);
			const gt5Count = parcels.filter((parcel) => parcel.avg !== null && parcel.avg > 5).length;
			const gt10Count = parcels.filter((parcel) => parcel.avg !== null && parcel.avg > 10).length;
			const identifiedAreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null ? parcel.areaHa : 0), 0);
			const gt5AreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null && parcel.avg > 5 ? parcel.areaHa : 0), 0);
			const gt10AreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null && parcel.avg > 10 ? parcel.areaHa : 0), 0);
			const gt5SharePct = identifiedAreaHa > 0 ? (gt5AreaHa / identifiedAreaHa) * 100 : 0;
			const gt10SharePct = identifiedAreaHa > 0 ? (gt10AreaHa / identifiedAreaHa) * 100 : 0;

			tiff = null; image = null; raster = null;

			return {
				key: targetTitle,
				title: targetTitle,
				avgPct: count > 0 ? sum / count : null,
				totalPixels: count,
				policyHasParcelStats: shouldCalculatePolicyParcelStats,
				parcelCount: parcels.length,
				parcelAvgPct: parcelAvgCount > 0 ? parcelAvgSum / parcelAvgCount : null,
				gt5Count,
				gt10Count,
				identifiedAreaHa,
				gt5AreaHa,
				gt10AreaHa,
				gt5SharePct,
				gt10SharePct,
				parcels,
					note: !shouldCalculatePolicyParcelStats
						? 'Parcel-level LPIS stats are not currently available for the selected country; showing regional stats only.'
					: (parcelData.truncated ? 'LPIS parcel fetch truncated at 10,000 features; counts may be incomplete.' : null),
				pixelPoints,
				rasterProj: rasterLayer.layer_projection,
			};
		},
		getRegionFileForSelection(selection, level) {
			const hierarchy = this.nutsLauHierarchy || {};
			const countryCode = selection && selection.country;
			if (!hierarchy.nuts0 || !countryCode || !hierarchy.nuts0[countryCode]) return null;

			if (level === "country") {
				return { file: hierarchy.nuts0.file, idField: "NUTS_ID", featureId: countryCode };
			}

			const countryData = hierarchy.nuts0[countryCode];
			if (level === "nuts1") {
				return { file: countryData.file, idField: "NUTS_ID", featureId: selection.nuts1 };
			}

			const nuts1Node = selection.nuts1 && countryData.nuts1 ? countryData.nuts1[selection.nuts1] : null;
			if (level === "nuts2") {
				return nuts1Node ? { file: nuts1Node.file, idField: "NUTS_ID", featureId: selection.nuts2 } : null;
			}

			const nuts2Node = nuts1Node && selection.nuts2 && nuts1Node.nuts2 ? nuts1Node.nuts2[selection.nuts2] : null;
			if (level === "nuts3") {
				return nuts2Node ? { file: nuts2Node.file, idField: "NUTS_ID", featureId: selection.nuts3 } : null;
			}

			const nuts3Node = nuts2Node && selection.nuts3 && nuts2Node.nuts3 ? nuts2Node.nuts3[selection.nuts3] : null;
			if (level === "lau") {
				return nuts3Node ? { file: nuts3Node.file, idField: "LAU_ID", featureId: selection.lau } : null;
			}

			return null;
		},
		async loadPolicyRegionGeoJson() {
			if (!this.hasRegionTarget) return null;
			const ref = this.getRegionFileForSelection(this.policySelection, this.policyStatsLevel);
			if (!ref || !ref.file || !ref.featureId) return null;

			const url = `https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/${ref.file}`;
			const response = await fetch(url);
			if (!response.ok) return null;
			const geojson = await response.json();
			if (!geojson || !Array.isArray(geojson.features)) return null;

			const feature = geojson.features.find((candidate) => {
				if (!candidate || !candidate.properties) return false;
				const props = candidate.properties;
				const fid = props[ref.idField] || props.GISCO_ID || candidate.id;
				return String(fid) === String(ref.featureId);
			});

			if (!feature || !feature.geometry) return null;
			return feature;
		},
		// ─── Tree Cover Density calculation ───────────────────────────────────────
		// Ported from LUCIM averageRasterValueForPolygons, simplified to TCD only.
		// Uses: GeoTIFF (global), turf (global), proj4 (global), ol (global).
		// Requires: layer.selectedFeatures, this.layers['tree_cover_density_2021'].
		async calculateParcelTCD() {
			if (this.isCalculating) return;
			this.isCalculating = true;
			this.calculationStatus = '';
			this.tcdResults = null;
			this._removeTcdPixelLayer();
			this.showTcdPixels = false;

			try {
				const rasterLayer = this.layers['tree_cover_density_2021'];
				if (!rasterLayer) throw new Error('tree_cover_density_2021 layer not loaded');

				// Collect all selected features across all visible WFS layers
				const selectedAll = this.selectedFeaturesAll;
				if (!selectedAll.length) throw new Error('No features selected');

				// Build per-parcel stats buckets
				const parcelStats = selectedAll.map(sf => ({
					id: sf.id,
					feature: sf.feature,
					projection: sf.projection || 'EPSG:3857',
					areaHa: this._featureAreaHa(sf.feature, sf.projection || 'EPSG:3857'),
					sum: 0,
					count: 0,
				}));

				// Compute overall bbox of all selected features (in MAP_PROJECTION)
				let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
				parcelStats.forEach(ps => {
					const ext = ps.feature.getGeometry().getExtent();
					if (ext[0] < minX) minX = ext[0];
					if (ext[1] < minY) minY = ext[1];
					if (ext[2] > maxX) maxX = ext[2];
					if (ext[3] > maxY) maxY = ext[3];
				});

				// Prepare Turf polygons (EPSG:4326) + bboxes for fast pre-filter
				const TURF_PROJ = 'EPSG:4326';
				const turfPolygons = parcelStats.map(ps => {
					const gj = new ol.format.GeoJSON().writeFeatureObject(ps.feature, {
						featureProjection: ps.projection,
						dataProjection: TURF_PROJ,
					});
					if (gj.geometry && gj.geometry.type === 'MultiPolygon') {
						// split into first polygon for bbox; full geometry used for pip
					}
					const bbox = turf.bbox(gj);
					return { ps, gj, bbox };
				});

				// Fetch WMS as GeoTIFF
				const url = this._tcdWMSUrl(rasterLayer, [minX, minY, maxX, maxY]);
				VueBus.$emit('changeMessage', 'Downloading Tree Cover Density raster…');
				let tiff = await GeoTIFF.fromUrl(url, { allowFullFile: true });
				let image = await tiff.getImage();
				let raster = await image.readRasters({ interleave: true });

				const [a, , , tx, c, d, , ty] = image.fileDirectory.ModelTransformation;
				const width = image.getWidth();
				const height = image.getHeight();
				const nodata = image.fileDirectory.GDAL_NODATA != null
					? Number(image.fileDirectory.GDAL_NODATA) : null;

				// Convert overall bbox to TURF_PROJ for quick pixel rejection
				const mainBboxTurf = ol.proj.transformExtent([minX, minY, maxX, maxY], 'EPSG:3857', TURF_PROJ);
				const [mainMinLon, mainMinLat, mainMaxLon, mainMaxLat] = mainBboxTurf;

				VueBus.$emit('changeMessage', `Analysing ${(width * height).toLocaleString()} pixels…`);
				await new Promise(r => setTimeout(r, 50));

				let totalInsideCount = 0;
				const pixelPoints = [];
				let lastProgressUpdate = 0;
				const totalPixels = width * height;
				this.calculationStatus = `farm: 0 / ${totalPixels.toLocaleString()} pixels`;

				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						const value = raster[y * width + x];
						if (value === null || value === undefined) continue;
						if (nodata !== null && value === nodata) continue;

						// Pixel centre in raster projection (EPSG:3035)
						const coordX = a * (x + 0.5) + tx;
						const coordY = d * (y + 0.5) + ty;
						const [lon, lat] = ol.proj.transform([coordX, coordY], rasterLayer.layer_projection, TURF_PROJ);

						// Quick main-bbox rejection
						if (lon < mainMinLon || lon > mainMaxLon || lat < mainMinLat || lat > mainMaxLat) continue;

						const pt = turf.point([lon, lat]);

						for (const tp of turfPolygons) {
							const [bMinLon, bMinLat, bMaxLon, bMaxLat] = tp.bbox;
							if (lon < bMinLon || lon > bMaxLon || lat < bMinLat || lat > bMaxLat) continue;
							if (turf.booleanPointInPolygon(pt, tp.gj)) {
								tp.ps.sum += value;
								tp.ps.count++;
								totalInsideCount++;
								pixelPoints.push([coordX, coordY, value]);
								break;
							}
						}
					}
					const processedPixels = (y + 1) * width;
					if (processedPixels - lastProgressUpdate >= 2500 || processedPixels === totalPixels) {
						lastProgressUpdate = processedPixels;
						this.calculationStatus = `farm: ${processedPixels.toLocaleString()} / ${totalPixels.toLocaleString()} pixels`;
					}
				}

				// Build results
				const parcels = parcelStats.map(ps => ({
					id: ps.id,
					avg: ps.count > 0 ? ps.sum / ps.count : null,
					areaHa: ps.areaHa,
					count: ps.count,
				}));

				const farmSum = parcelStats.reduce((s, ps) => s + ps.sum, 0);
				const farmCount = parcelStats.reduce((s, ps) => s + ps.count, 0);
				const farmParcelAvgCount = parcels.filter((parcel) => parcel.avg !== null).length;
				const farmParcelAvgSum = parcels.reduce((s, parcel) => s + (parcel.avg !== null ? parcel.avg : 0), 0);
				const farmGt5Count = parcels.filter((parcel) => parcel.avg !== null && parcel.avg > 5).length;
				const farmGt10Count = parcels.filter((parcel) => parcel.avg !== null && parcel.avg > 10).length;
				const farmIdentifiedAreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null ? parcel.areaHa : 0), 0);
				const farmGt5AreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null && parcel.avg > 5 ? parcel.areaHa : 0), 0);
				const farmGt10AreaHa = parcels.reduce((s, parcel) => s + (parcel.avg !== null && parcel.avg > 10 ? parcel.areaHa : 0), 0);
				const farmGt5SharePct = farmIdentifiedAreaHa > 0 ? (farmGt5AreaHa / farmIdentifiedAreaHa) * 100 : 0;
				const farmGt10SharePct = farmIdentifiedAreaHa > 0 ? (farmGt10AreaHa / farmIdentifiedAreaHa) * 100 : 0;

				this.tcdResults = {
					parcels,
					farmAvg: farmCount > 0 ? farmSum / farmCount : null,
					farmParcelAvg: farmParcelAvgCount > 0 ? farmParcelAvgSum / farmParcelAvgCount : null,
					farmGt5Count,
					farmGt10Count,
					farmIdentifiedAreaHa,
					farmGt5AreaHa,
					farmGt10AreaHa,
					farmGt5SharePct,
					farmGt10SharePct,
					totalPixels: totalInsideCount,
					pixelPoints,
					rasterProj: rasterLayer.layer_projection,
				};

				// Memory cleanup
				tiff = null; image = null; raster = null;

				VueBus.$emit('changeMessage', `TCD calculated: ${totalInsideCount} pixels in ${parcelStats.length} parcel(s).`);
				VueBus.$emit('clearMessage');

			} catch (err) {
				console.error('TCD calculation error:', err);
				VueBus.$emit('changeMessage', `TCD error: ${err.message}`);
				VueBus.$emit('clearMessage');
			} finally {
				this.isCalculating = false;
				this.calculationStatus = '';
			}
		},
		async calculateRegionTCD() {
			if (this.isCalculating) return;
			this.isCalculating = true;
			this.tcdResults = null;
			this.policyResults = null;
			this._removeTcdPixelLayer();
			this.showTcdPixels = false;

			try {
				if (!this.hasRegionTarget) throw new Error('No region selected');

				const regionFeatureGeoJson = await this.loadPolicyRegionGeoJson();
				if (!regionFeatureGeoJson) throw new Error('Selected region geometry not found');
				const regionBlock = await this.calculateTcdBlock(regionFeatureGeoJson, 'Selected LAU');
				this.policyResults = [regionBlock];

				VueBus.$emit('changeMessage', `TCD calculated for ${this.policyResults.length} policy region(s).`);
				VueBus.$emit('clearMessage');
			} catch (err) {
				console.error('TCD calculation error:', err);
				VueBus.$emit('changeMessage', `TCD error: ${err.message}`);
				VueBus.$emit('clearMessage');
			} finally {
				this.isCalculating = false;
				this.calculationStatus = '';
			}
		},
		_tcdWMSUrl(rasterLayerObj, mapExtent) {
			// Build a WMS GetMap URL returning a GeoTIFF crop for the given extent.
			// Snaps to the raster grid (same logic as LUCIM getWMSUrlForFeature).
			const source = rasterLayerObj.layer.getSource();
			const baseUrl = source.getUrls()[0];
			const params = source.getParams();
			const layerParam = params.LAYERS;
			const pixelSize = rasterLayerObj.layer_resolution;
			const originX = rasterLayerObj.layer_origin_x;
			const originY = rasterLayerObj.layer_origin_y;
			const proj = rasterLayerObj.layer_projection;

			// Transform all 4 corners from MAP_PROJECTION → raster projection
			const corners = [
				[mapExtent[0], mapExtent[1]],
				[mapExtent[2], mapExtent[1]],
				[mapExtent[0], mapExtent[3]],
				[mapExtent[2], mapExtent[3]],
			].map(c => proj4('EPSG:3857', proj, c));

			const xs = corners.map(c => c[0]);
			const ys = corners.map(c => c[1]);
			const minx = Math.min(...xs);
			const miny = Math.min(...ys);
			const maxx = Math.max(...xs);
			const maxy = Math.max(...ys);

			// Snap outward to grid
			const minCol = Math.floor((minx - originX) / pixelSize);
			const maxCol = Math.ceil((maxx - originX) / pixelSize);
			const minRow = Math.ceil((originY - maxy) / pixelSize);
			const maxRow = Math.floor((originY - miny) / pixelSize);

			const snappedMinX = originX + minCol * pixelSize;
			const snappedMaxX = originX + maxCol * pixelSize;
			const snappedMaxY = originY - minRow * pixelSize;
			const snappedMinY = originY - maxRow * pixelSize;

			const width = Math.round((snappedMaxX - snappedMinX) / pixelSize);
			const height = Math.round((snappedMaxY - snappedMinY) / pixelSize);

			// WMS 1.3.0 with CRS=EPSG:3035 — axis order is lat,lon
			const bbox = [snappedMinY, snappedMinX, snappedMaxY, snappedMaxX].join(',');

			return `${baseUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
				`&FORMAT=image/geotiff` +
				`&TRANSPARENT=FALSE` +
				`&LAYERS=${layerParam}` +
				`&WIDTH=${width}&HEIGHT=${height}` +
				`&CRS=${proj}&BBOX=${bbox}` +
				`&STYLES=`;
		},
		toggleTcdPixels() {
			if (this.showTcdPixels) {
				this._removeTcdPixelLayer();
				this.showTcdPixels = false;
			} else {
				this._addTcdPixelLayer();
				this.showTcdPixels = true;
			}
		},

		_addTcdPixelLayer() {
			if (!this.tcdResults || !this.tcdResults.pixelPoints.length || !this.map) return;
			const proj = this.tcdResults.rasterProj || 'EPSG:3035';
			const features = this.tcdResults.pixelPoints.map(([x, y]) => {
				const coord = ol.proj.transform([x, y], proj, 'EPSG:3857');
				return new ol.Feature(new ol.geom.Point(coord));
			});
			const pixelStyle = new ol.style.Style({
				image: new ol.style.Circle({
					radius: 2,
					fill: new ol.style.Fill({ color: 'rgba(60,60,60,0.75)' }),
				}),
			});
			this.tcdPixelLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features }),
				zIndex: 50,
				style: pixelStyle,
			});
			this.map.addLayer(this.tcdPixelLayer);
		},

		_removeTcdPixelLayer() {
			if (this.tcdPixelLayer) {
				this.map.removeLayer(this.tcdPixelLayer);
				this.tcdPixelLayer = null;
			}
		},
	},
};
</script>
