<template>
	<div class="tcd-panel">
		<div v-if="!hasTarget" class="accordion-note">
			{{ emptyMessage }}
		</div>
		<div v-else>
			<div v-if="isCalculating" class="accordion-note">Calculating... <span class="spinner-border spinner-border-sm" role="status"></span></div>
			<div v-if="errorMessage" class="accordion-note" style="margin-bottom: 8px; color: #b23b2a;">
				{{ errorMessage }}
			</div>
			<div v-if="results">
				<template v-if="isPolicyMode">
					<!-- Woody Vegetation Layer section -->
					<p class="tcd-section-label">Woody Vegetation — Selected region</p>
					<div class="insight-cards">
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + wvlColor(results.wvlPct) }">
							<span class="card-label">Woody vegetation cover</span>
							<span class="card-value" :style="{ color: wvlColor(results.wvlPct) }">
								{{ results.wvlPct !== null ? results.wvlPct.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Woody pixels</span>
							<span class="card-value">{{ results.wvlPixels }}</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Total valid pixels</span>
							<span class="card-value">{{ results.wvlTotalPixels }}</span>
						</div>
						<template v-if="results.policyHasParcelStats">
							<div class="insight-card">
								<span class="card-label">Parcel avg WV share</span>
								<span class="card-value" :style="{ color: wvlColor(results.wvlParcelAvgPct) }">
									{{ results.wvlParcelAvgPct !== null ? results.wvlParcelAvgPct.toFixed(1) + ' %' : '—' }}
								</span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 5% WV share</span>
								<span class="card-value" v-html="thresholdSummary(results.wvlGt5Count, results.wvlGt5AreaHa, results.wvlGt5SharePct)"></span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 10% WV share</span>
								<span class="card-value" v-html="thresholdSummary(results.wvlGt10Count, results.wvlGt10AreaHa, results.wvlGt10SharePct)"></span>
							</div>
						</template>
					</div>

					<!-- Small Woody Features section -->
					<p class="tcd-section-label" style="margin-top: 12px;">Small Woody Features — Selected region</p>
					<div class="insight-cards">
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + swfColor(results.swfPct) }">
							<span class="card-label">SWF cover</span>
							<span class="card-value" :style="{ color: swfColor(results.swfPct) }">
								{{ results.swfPct !== null ? results.swfPct.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">SWF pixels</span>
							<span class="card-value">{{ results.swfPixels }}</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Total valid pixels</span>
							<span class="card-value">{{ results.swfTotalPixels }}</span>
						</div>
						<template v-if="results.policyHasParcelStats">
							<div class="insight-card">
								<span class="card-label">Parcel avg SWF share</span>
								<span class="card-value" :style="{ color: swfColor(results.swfParcelAvgPct) }">
									{{ results.swfParcelAvgPct !== null ? results.swfParcelAvgPct.toFixed(1) + ' %' : '—' }}
								</span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 1% SWF share</span>
								<span class="card-value" v-html="thresholdSummary(results.swfGt1Count, results.swfGt1AreaHa, results.swfGt1SharePct)"></span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 5% SWF share</span>
								<span class="card-value" v-html="thresholdSummary(results.swfGt5Count, results.swfGt5AreaHa, results.swfGt5SharePct)"></span>
							</div>
							<div class="insight-card">
								<span class="card-label">LPIS parcels analysed</span>
								<span class="card-value">{{ results.parcelCount }}</span>
							</div>
						</template>
					</div>

					<div v-if="results.note" class="accordion-note" style="margin-top: 8px;">
						{{ results.note }}
					</div>
				</template>

				<template v-else>
					<p class="tcd-section-label">Per parcel</p>
					<div class="insight-cards">
						<div
							class="insight-card"
							v-for="parcel in results.parcels"
							:key="parcel.id"
							@mouseenter="highlightParcelCard(parcel.id)"
							@mouseleave="clearParcelCardHighlight()"
						>
							<span class="card-label">{{ parcel.id }}</span>
							<span class="card-value">
								<span :style="{ color: wvlColor(parcel.wvlPct) }">{{ parcel.wvlPct !== null ? parcel.wvlPct.toFixed(1) + '% WV' : '—' }}</span>
								&nbsp;|&nbsp;
								<span :style="{ color: swfColor(parcel.swfPct) }">{{ parcel.swfPct !== null ? parcel.swfPct.toFixed(1) + '% SWF' : '—' }}</span>
							</span>
						</div>
					</div>
					<p class="tcd-section-label" style="margin-top: 10px;">All selected parcels (farm)</p>
					<div class="insight-cards">
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + wvlColor(results.farmWvlPct) }">
							<span class="card-label">Woody vegetation share</span>
							<span class="card-value" :style="{ color: wvlColor(results.farmWvlPct) }">
								{{ results.farmWvlPct !== null ? results.farmWvlPct.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + swfColor(results.farmSwfPct) }">
							<span class="card-label">Small woody features share</span>
							<span class="card-value" :style="{ color: swfColor(results.farmSwfPct) }">
								{{ results.farmSwfPct !== null ? results.farmSwfPct.toFixed(1) + ' %' : '—' }}
							</span>
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
			default: function() { return []; },
		},
		nutsLauHierarchy: {
			type: Object,
			default: function() { return {}; },
		},
		policyStatsLevel: {
			type: String,
			default: "",
		},
		policySelection: {
			type: Object,
			default: function() { return { country: "", nuts1: "", nuts2: "", nuts3: "", lau: "" }; },
		},
		anySelectedFeature: {
			type: Boolean,
			required: true,
		},
		opening: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			isCalculating: false,
			results: null,
			errorMessage: null,
			parcelHoverLayer: null,
			parcelHoverSource: null,
		};
	},
	watch: {
		opening(isOpening) {
			if (isOpening && this.hasTarget) {
				this.calculateWoody();
			} else if (!isOpening) {
				this._removeParcelHoverLayer();
				this.results = null;
				this.errorMessage = null;
			}
		},
		selectedFeaturesAll() {
			if (this.isPolicyMode) return;
			if (!this.anySelectedFeature) {
				this._removeParcelHoverLayer();
				this.results = null;
				this.errorMessage = null;
				return;
			}
			if (this.opening) this.calculateWoody();
		},
		policyStatsLevel() {
			if (!this.isPolicyMode) return;
			if (!this.hasTarget) {
				this._removeParcelHoverLayer();
				this.results = null;
				this.errorMessage = null;
				return;
			}
			if (this.opening) this.calculateWoody();
		},
		policySelection: {
			deep: true,
			handler() {
				if (!this.isPolicyMode) return;
				if (!this.hasTarget) {
					this._removeParcelHoverLayer();
					this.results = null;
					this.errorMessage = null;
					return;
				}
				if (this.opening) this.calculateWoody();
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
				if (!this.isPolicyLauLevel) return "Woody vegetation stats are available at LAU level only.";
				return "Select LAU region and click Show stats.";
			}
			return "Select a parcel on the map to calculate.";
		},
		layers() {
			return this.$parent.$data.layers;
		},
		map() {
			return this.$parent.$data.map;
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
		},
	},
	methods: {
		wvlColor(pct) {
			if (pct === null || pct === undefined) return "#888";
			if (pct < 5) return "#a8c88e";
			if (pct < 20) return "#75dd00";
			return "#3a8a00";
		},
		swfColor(pct) {
			if (pct === null || pct === undefined) return "#888";
			if (pct < 1) return "#c8d860";
			if (pct < 5) return "#b8d400";
			return "#7a9000";
		},
		thresholdSummary(count, areaHa, sharePct) {
			const safeCount = Number.isFinite(count) ? count : 0;
			const label = safeCount === 1 ? "parcel" : "parcels";
			const areaTxt = Number.isFinite(areaHa) ? areaHa.toFixed(1) : "0.0";
			const shareTxt = Number.isFinite(sharePct) ? sharePct.toFixed(1) : "0.0";
			return `<p style="margin:0;">${safeCount} ${label}</p><p style="margin:2px 0 0 0;">${areaTxt} ha</p><p style="margin:2px 0 0 0;">${shareTxt}% of LPIS identified area</p>`;
		},
		_featureAreaHa(feature, featureProjection) {
			if (!feature || !feature.getGeometry) return 0;
			const geom = feature.getGeometry();
			if (!geom) return 0;
			const areaGeom = geom.clone();
			const srcProj = featureProjection || "EPSG:3857";
			if (srcProj !== "EPSG:3857") areaGeom.transform(srcProj, "EPSG:3857");
			return areaGeom.getArea() / 10000;
		},
		highlightParcelCard(parcelId) {
			if (!this.map || !parcelId) return;
			const selected = (this.selectedFeaturesAll || []).find((sf) => String(sf.id) === String(parcelId));
			if (!selected || !selected.feature || !selected.feature.getGeometry) return;
			this._ensureParcelHoverLayer();
			if (!this.parcelHoverSource) return;
			const geom = selected.feature.getGeometry().clone();
			const srcProj = selected.projection || "EPSG:3857";
			if (srcProj !== "EPSG:3857") geom.transform(srcProj, "EPSG:3857");
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
					stroke: new ol.style.Stroke({ color: "rgba(0, 180, 255, 0.95)", width: 3, lineDash: [7, 4] }),
					fill: new ol.style.Fill({ color: "rgba(0, 180, 255, 0.08)" }),
				}),
			});
			this.map.addLayer(this.parcelHoverLayer);
		},
		_removeParcelHoverLayer() {
			if (this.parcelHoverLayer && this.map) this.map.removeLayer(this.parcelHoverLayer);
			this.parcelHoverLayer = null;
			this.parcelHoverSource = null;
		},
		getRegionFileForSelection(selection, level) {
			const hierarchy = this.nutsLauHierarchy || {};
			const countryCode = selection && selection.country;
			if (!hierarchy.nuts0 || !countryCode || !hierarchy.nuts0[countryCode]) return null;
			if (level === "country") return { file: hierarchy.nuts0.file, idField: "NUTS_ID", featureId: countryCode };
			const countryData = hierarchy.nuts0[countryCode];
			if (level === "nuts1") return { file: countryData.file, idField: "NUTS_ID", featureId: selection.nuts1 };
			const n1 = selection.nuts1 && countryData.nuts1 ? countryData.nuts1[selection.nuts1] : null;
			if (level === "nuts2") return n1 ? { file: n1.file, idField: "NUTS_ID", featureId: selection.nuts2 } : null;
			const n2 = n1 && selection.nuts2 && n1.nuts2 ? n1.nuts2[selection.nuts2] : null;
			if (level === "nuts3") return n2 ? { file: n2.file, idField: "NUTS_ID", featureId: selection.nuts3 } : null;
			const n3 = n2 && selection.nuts3 && n2.nuts3 ? n2.nuts3[selection.nuts3] : null;
			if (level === "lau") return n3 ? { file: n3.file, idField: "LAU_ID", featureId: selection.lau } : null;
			return null;
		},
		async loadPolicyRegionFeature() {
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
			return new ol.format.GeoJSON().readFeature(feature, {
				dataProjection: "EPSG:4326",
				featureProjection: "EPSG:3857",
			});
		},
		async fetchPolicyParcels(layer, targetGeoJson) {
			if (!layer || !targetGeoJson) return { features: [], truncated: false };
			if (layer.type === 'MVT') return this.fetchPolicyParcelsFromMvt(layer, targetGeoJson);
			if (!layer || !layer.source_url || !targetGeoJson) return { features: [], truncated: false };
			const bbox = turf.bbox(targetGeoJson);
			const urlBase = layer.source_url
				.replace(/\[layer_name\]/g, layer.layer_name)
				.replace(/\[layer_name_detail\]/g, layer.layer_name_detail)
				.replace(/\[layer_projection\]/g, "EPSG:4326")
				.replace("[extent]", bbox.join(","));
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
				try { return turf.booleanIntersects(feature, targetGeoJson); }
				catch (_) { return true; }
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
			if (typeof feature.getId === "function" && typeof feature.getGeometry === "function") return feature;
			try {
				return new ol.format.GeoJSON().readFeature(feature, {
					dataProjection: "EPSG:4326",
					featureProjection: "EPSG:3857",
				});
			} catch (_) { return null; }
		},
		_buildWmsRequest(layerObj, mapExtent) {
			const source = layerObj.layer.getSource();
			const sourceUrls = source.getUrls ? source.getUrls() : null;
			const baseUrl = (sourceUrls && sourceUrls.length ? sourceUrls[0] : source.getUrl());
			const params = source.getParams();
			const layerParam = (params && (params.LAYERS || params.layers)) || layerObj.layer_name;
			if (!baseUrl || !layerParam) throw new Error("WMS request cannot be built (missing URL or layer name).");
			const proj = layerObj.layer_projection;
			const pixelSize = layerObj.layer_resolution;
			const originX = layerObj.layer_origin_x;
			const originY = layerObj.layer_origin_y;
			const corners = [
				[mapExtent[0], mapExtent[1]],
				[mapExtent[2], mapExtent[1]],
				[mapExtent[0], mapExtent[3]],
				[mapExtent[2], mapExtent[3]],
			].map((c) => proj4("EPSG:3857", proj, c));
			const xs = corners.map((c) => c[0]);
			const ys = corners.map((c) => c[1]);
			const minx = Math.min(...xs);
			const miny = Math.min(...ys);
			const maxx = Math.max(...xs);
			const maxy = Math.max(...ys);
			if (!(maxx > minx) || !(maxy > miny)) throw new Error("Selected region has invalid extent for raster request.");

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

			const bbox = proj === "EPSG:4326"
				? [snappedMinY, snappedMinX, snappedMaxY, snappedMaxX].join(",")
				: [snappedMinY, snappedMinX, snappedMaxY, snappedMaxX].join(",");
			const url = `${baseUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&LAYERS=${layerParam}&WIDTH=${width}&HEIGHT=${height}&CRS=${proj}&BBOX=${bbox}&STYLES=`;
			return { url, width, height, bboxProj: [snappedMinX, snappedMinY, snappedMaxX, snappedMaxY] };
		},
		async _loadPngPixels(url, width, height) {
			const response = await fetch(url);
			if (!response.ok) {
				const text = await response.text().catch(() => "");
				const m = text.match(/<ServiceException[^>]*>([\s\S]*?)<\/ServiceException>/i);
				if (m && m[1]) throw new Error(m[1].replace(/\s+/g, " ").trim() || "Raster request returned a service exception.");
				throw new Error(`Raster request failed (${response.status})`);
			}
			const blob = await response.blob();
			const bitmap = await createImageBitmap(blob);
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(bitmap, 0, 0, width, height);
			return ctx.getImageData(0, 0, width, height).data;
		},
		// Decode a single pixel from a canvas RGBA Uint8ClampedArray.
		// Background for both WVL and SWF is #f0f0f0 (near-grey, RGB ~240,240,240).
		// Feature pixels are green/yellow-green (low B channel).
		_decodePngPixel(data, idx) {
			const base = idx * 4;
			const r = data[base];
			const g = data[base + 1];
			const b = data[base + 2];
			const a = data[base + 3];
			if (a < 10) return { valid: true, positive: false };
			const maxCh = r > g ? (r > b ? r : b) : (g > b ? g : b);
			const minCh = r < g ? (r < b ? r : b) : (g < b ? g : b);
			// Grey background: all channels high and nearly equal
			const isBackground = minCh > 190 && (maxCh - minCh) < 30;
			return { valid: true, positive: !isBackground };
		},
		async calculateWoody() {
			if (this.isCalculating) return;
			this.isCalculating = true;
			this.errorMessage = null;
			this.results = null;

			try {
				const wvlLayerObj = this.layers["woody_vegetation_layer_2021"];
				const swfLayerObj = this.layers["small_woody_features_2021"];
				if (!wvlLayerObj && !swfLayerObj) throw new Error("Woody vegetation layers are not loaded.");

				const targets = [];
				let policyParcelData = { features: [], truncated: false };
				let policyParcels = [];
				let policyParcelPolygons = [];

				if (this.isPolicyMode) {
					const regionFeature = await this.loadPolicyRegionFeature();
					if (!regionFeature) throw new Error("Selected region geometry not found.");
					targets.push({
						id: this.policySelection[this.policyStatsLevel],
						feature: regionFeature,
						projection: "EPSG:3857",
						wvl: 0, wvlValid: 0,
						swf: 0, swfValid: 0,
					});

					if (this.policySupportsParcelStats) {
						const regionGeoJson = new ol.format.GeoJSON().writeFeatureObject(regionFeature, {
							featureProjection: "EPSG:3857",
							dataProjection: "EPSG:4326",
						});
						const parcelLayer = this.policyParcelLayer;
						policyParcelData = parcelLayer
							? await this.fetchPolicyParcels(parcelLayer, regionGeoJson)
							: { features: [], truncated: false };
						policyParcels = policyParcelData.features
							.map((f) => this.normalizeGeoJsonFeature(f))
							.filter(Boolean)
							.map((f) => ({
								id: String(f.get("OSA_ID") || f.get("PAR_ID") || f.get("GISCO_ID") || f.get("LAU_ID") || f.getId() || "parcel"),
								feature: f,
								areaHa: this._featureAreaHa(f, "EPSG:3857"),
								wvl: 0, wvlValid: 0,
								swf: 0, swfValid: 0,
							}));
						policyParcelPolygons = policyParcels.map((p) => {
							const gj = new ol.format.GeoJSON().writeFeatureObject(p.feature, {
								featureProjection: "EPSG:3857",
								dataProjection: "EPSG:4326",
							});
							return { parcel: p, gj, bbox: turf.bbox(gj) };
						});
					}
				} else {
					if (!this.selectedFeaturesAll.length) throw new Error("No features selected.");
					this.selectedFeaturesAll.forEach((sf) => {
						targets.push({
							id: sf.id,
							feature: sf.feature,
							projection: sf.projection || "EPSG:3857",
							wvl: 0, wvlValid: 0,
							swf: 0, swfValid: 0,
						});
					});
				}

				let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
				const polygons = targets.map((t) => {
					const ext = t.feature.getGeometry().getExtent();
					if (ext[0] < minX) minX = ext[0];
					if (ext[1] < minY) minY = ext[1];
					if (ext[2] > maxX) maxX = ext[2];
					if (ext[3] > maxY) maxY = ext[3];
					const gj = new ol.format.GeoJSON().writeFeatureObject(t.feature, {
						featureProjection: t.projection,
						dataProjection: "EPSG:4326",
					});
					return { t, gj, bbox: turf.bbox(gj) };
				});

				const mapExtent = [minX, minY, maxX, maxY];
				const maxPixels = 2000000;
				const wvlRequest = wvlLayerObj ? this._buildWmsRequest(wvlLayerObj, mapExtent) : null;
				const swfRequest = swfLayerObj ? this._buildWmsRequest(swfLayerObj, mapExtent) : null;

				const refRequest = wvlRequest || swfRequest;
				if (refRequest && (refRequest.width * refRequest.height) > maxPixels) {
					throw new Error("Selected area is too large. Please choose a smaller LAU region.");
				}

				VueBus.$emit("changeMessage", "Downloading woody vegetation rasters...");
				await new Promise((r) => setTimeout(r, 50));

				const [wvlPngData, swfPngData] = await Promise.all([
					wvlRequest ? this._loadPngPixels(wvlRequest.url, wvlRequest.width, wvlRequest.height) : Promise.resolve(null),
					swfRequest ? this._loadPngPixels(swfRequest.url, swfRequest.width, swfRequest.height) : Promise.resolve(null),
				]);

				const width = refRequest.width;
				const height = refRequest.height;
				const bboxProj = refRequest.bboxProj;
				const layerProjection = (wvlLayerObj || swfLayerObj).layer_projection;
				const stepX = (bboxProj[2] - bboxProj[0]) / width;
				const stepY = (bboxProj[3] - bboxProj[1]) / height;

				VueBus.$emit("changeMessage", `Analysing ${(width * height).toLocaleString()} pixels...`);
				await new Promise((r) => setTimeout(r, 50));

				const totalPixels = width * height;
				let processedPixels = 0;
				let lastUiYield = 0;

				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						const idx = y * width + x;
						processedPixels++;

						const wvlDecoded = wvlPngData ? this._decodePngPixel(wvlPngData, idx) : null;
						const swfDecoded = swfPngData ? this._decodePngPixel(swfPngData, idx) : null;

						const coordX = bboxProj[0] + (x + 0.5) * stepX;
						const coordY = bboxProj[3] - (y + 0.5) * stepY;
						const ll = ol.proj.transform([coordX, coordY], layerProjection, "EPSG:4326");
						const lon = ll[0];
						const lat = ll[1];
						const pt = turf.point([lon, lat]);

						for (let i = 0; i < polygons.length; i++) {
							const p = polygons[i];
							const b = p.bbox;
							if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
							if (turf.booleanPointInPolygon(pt, p.gj)) {
								if (wvlDecoded) { p.t.wvlValid++; if (wvlDecoded.positive) p.t.wvl++; }
								if (swfDecoded) { p.t.swfValid++; if (swfDecoded.positive) p.t.swf++; }
								break;
							}
						}

						for (let i = 0; i < policyParcelPolygons.length; i++) {
							const p = policyParcelPolygons[i];
							const b = p.bbox;
							if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
							if (turf.booleanPointInPolygon(pt, p.gj)) {
								if (wvlDecoded) { p.parcel.wvlValid++; if (wvlDecoded.positive) p.parcel.wvl++; }
								if (swfDecoded) { p.parcel.swfValid++; if (swfDecoded.positive) p.parcel.swf++; }
								break;
							}
						}

						if (processedPixels - lastUiYield >= 10000 || processedPixels === totalPixels) {
							lastUiYield = processedPixels;
							await this.$nextTick();
							await new Promise((resolve) => setTimeout(resolve, 0));
						}
					}
				}

				if (this.isPolicyMode) {
					const t = targets[0];
					const policyHasParcelStats = this.policySupportsParcelStats;
					const parcelResults = policyParcels.map((p) => ({
						id: p.id,
						areaHa: p.areaHa,
						wvlPct: p.wvlValid > 0 ? (100 * p.wvl / p.wvlValid) : null,
						swfPct: p.swfValid > 0 ? (100 * p.swf / p.swfValid) : null,
					}));

					const wvlIdentifiedAreaHa = parcelResults.reduce((s, p) => s + (p.wvlPct !== null ? p.areaHa : 0), 0);
					const swfIdentifiedAreaHa = parcelResults.reduce((s, p) => s + (p.swfPct !== null ? p.areaHa : 0), 0);

					const wvlAvgCount = parcelResults.filter((p) => p.wvlPct !== null).length;
					const wvlAvgSum = parcelResults.reduce((s, p) => s + (p.wvlPct !== null ? p.wvlPct : 0), 0);
					const wvlGt5 = parcelResults.filter((p) => p.wvlPct !== null && p.wvlPct > 5);
					const wvlGt10 = parcelResults.filter((p) => p.wvlPct !== null && p.wvlPct > 10);
					const wvlGt5AreaHa = wvlGt5.reduce((s, p) => s + p.areaHa, 0);
					const wvlGt10AreaHa = wvlGt10.reduce((s, p) => s + p.areaHa, 0);

					const swfAvgCount = parcelResults.filter((p) => p.swfPct !== null).length;
					const swfAvgSum = parcelResults.reduce((s, p) => s + (p.swfPct !== null ? p.swfPct : 0), 0);
					const swfGt1 = parcelResults.filter((p) => p.swfPct !== null && p.swfPct > 1);
					const swfGt5 = parcelResults.filter((p) => p.swfPct !== null && p.swfPct > 5);
					const swfGt1AreaHa = swfGt1.reduce((s, p) => s + p.areaHa, 0);
					const swfGt5AreaHa = swfGt5.reduce((s, p) => s + p.areaHa, 0);

					this.results = {
						wvlPct: t.wvlValid > 0 ? (100 * t.wvl / t.wvlValid) : null,
						wvlPixels: t.wvl,
						wvlTotalPixels: t.wvlValid,
						swfPct: t.swfValid > 0 ? (100 * t.swf / t.swfValid) : null,
						swfPixels: t.swf,
						swfTotalPixels: t.swfValid,
						policyHasParcelStats,
						parcelCount: parcelResults.length,
						wvlParcelAvgPct: wvlAvgCount > 0 ? wvlAvgSum / wvlAvgCount : null,
						wvlGt5Count: wvlGt5.length,
						wvlGt5AreaHa,
						wvlGt5SharePct: wvlIdentifiedAreaHa > 0 ? (wvlGt5AreaHa / wvlIdentifiedAreaHa) * 100 : 0,
						wvlGt10Count: wvlGt10.length,
						wvlGt10AreaHa,
						wvlGt10SharePct: wvlIdentifiedAreaHa > 0 ? (wvlGt10AreaHa / wvlIdentifiedAreaHa) * 100 : 0,
						swfParcelAvgPct: swfAvgCount > 0 ? swfAvgSum / swfAvgCount : null,
						swfGt1Count: swfGt1.length,
						swfGt1AreaHa,
						swfGt1SharePct: swfIdentifiedAreaHa > 0 ? (swfGt1AreaHa / swfIdentifiedAreaHa) * 100 : 0,
						swfGt5Count: swfGt5.length,
						swfGt5AreaHa,
						swfGt5SharePct: swfIdentifiedAreaHa > 0 ? (swfGt5AreaHa / swfIdentifiedAreaHa) * 100 : 0,
						note: !policyHasParcelStats
							? "Parcel-level LPIS stats are not currently available for the selected country; showing regional stats only."
							: (policyParcelData.truncated ? "LPIS parcel fetch truncated at 10,000 features; counts may be incomplete." : null),
					};
				} else {
					const parcels = targets.map((t) => ({
						id: t.id,
						wvlPct: t.wvlValid > 0 ? (100 * t.wvl / t.wvlValid) : null,
						swfPct: t.swfValid > 0 ? (100 * t.swf / t.swfValid) : null,
					}));
					const farmWvl = targets.reduce((s, t) => s + t.wvl, 0);
					const farmWvlValid = targets.reduce((s, t) => s + t.wvlValid, 0);
					const farmSwf = targets.reduce((s, t) => s + t.swf, 0);
					const farmSwfValid = targets.reduce((s, t) => s + t.swfValid, 0);
					this.results = {
						parcels,
						farmWvlPct: farmWvlValid > 0 ? (100 * farmWvl / farmWvlValid) : null,
						farmSwfPct: farmSwfValid > 0 ? (100 * farmSwf / farmSwfValid) : null,
					};
				}

				VueBus.$emit("clearMessage");
			} catch (err) {
				this.errorMessage = err && err.message ? err.message : "Woody vegetation calculation failed.";
				VueBus.$emit("changeMessage", this.errorMessage);
				VueBus.$emit("clearMessage");
			} finally {
				this.isCalculating = false;
			}
		},
	},
};
</script>
