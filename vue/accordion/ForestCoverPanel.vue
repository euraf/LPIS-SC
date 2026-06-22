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
					<p class="tcd-section-label">Selected region</p>
					<div class="insight-cards">
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + forestColor(results.forestPct) }">
							<span class="card-label">Forest cover</span>
							<span class="card-value" :style="{ color: forestColor(results.forestPct) }">
								{{ results.forestPct !== null ? results.forestPct.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Forest pixels</span>
							<span class="card-value">{{ results.forestPixels }}</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Total valid pixels</span>
							<span class="card-value">{{ results.totalPixels }}</span>
						</div>
						<template v-if="results.policyHasParcelStats">
							<div class="insight-card">
								<span class="card-label">Parcel avg forest share</span>
								<span class="card-value" :style="{ color: forestColor(results.parcelAvgPct) }">
									{{ results.parcelAvgPct !== null ? results.parcelAvgPct.toFixed(1) + ' %' : '—' }}
								</span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 5% forest share</span>
								<span class="card-value" v-html="thresholdSummary(results.gt5Count, results.gt5AreaHa, results.gt5SharePct)"></span>
							</div>
							<div class="insight-card">
								<span class="card-label">&gt; 10% forest share</span>
								<span class="card-value" v-html="thresholdSummary(results.gt10Count, results.gt10AreaHa, results.gt10SharePct)"></span>
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
							:style="{ borderLeft: '3px solid ' + forestColor(parcel.forestPct) }"
						>
							<span class="card-label">{{ parcel.id }}</span>
							<span class="card-value" :style="{ color: forestColor(parcel.forestPct) }">
								{{ parcel.forestPct !== null ? parcel.forestPct.toFixed(1) + ' % forest cover' : '—' }}
							</span>
						</div>
					</div>
					<p class="tcd-section-label" style="margin-top:10px;">All selected parcels (farm)</p>
					<div class="insight-cards">
						<div class="insight-card" :style="{ borderLeft: '3px solid ' + forestColor(results.farmForestPct) }">
							<span class="card-label">Forest share</span>
							<span class="card-value" :style="{ color: forestColor(results.farmForestPct) }">
								{{ results.farmForestPct !== null ? results.farmForestPct.toFixed(1) + ' %' : '—' }}
							</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Forest pixels</span>
							<span class="card-value">{{ results.farmForestPixels }}</span>
						</div>
						<div class="insight-card">
							<span class="card-label">Total valid pixels</span>
							<span class="card-value">{{ results.totalPixels }}</span>
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
				return { country: "", nuts1: "", nuts2: "", nuts3: "", lau: "" };
			},
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
				this.calculateForestCover();
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
			if (this.opening) this.calculateForestCover();
		},
		policyStatsLevel() {
			if (!this.isPolicyMode) return;
			if (!this.hasTarget) {
				this._removeParcelHoverLayer();
				this.results = null;
				this.errorMessage = null;
				return;
			}
			if (this.opening) this.calculateForestCover();
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
				if (this.opening) this.calculateForestCover();
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
				if (!this.isPolicyLauLevel) return "Forest/non-forest is currently available for LAU level only.";
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
		_featureAreaHa(feature, featureProjection) {
			if (!feature || !feature.getGeometry) return 0;
			const geom = feature.getGeometry();
			if (!geom) return 0;
			const areaGeom = geom.clone();
			const srcProj = featureProjection || "EPSG:3857";
			if (srcProj !== "EPSG:3857") areaGeom.transform(srcProj, "EPSG:3857");
			return areaGeom.getArea() / 10000;
		},
		thresholdSummary(count, areaHa, sharePct) {
			const safeCount = Number.isFinite(count) ? count : 0;
			const label = safeCount === 1 ? "parcel" : "parcels";
			const areaTxt = Number.isFinite(areaHa) ? areaHa.toFixed(1) : "0.0";
			const shareTxt = Number.isFinite(sharePct) ? sharePct.toFixed(1) : "0.0";
			return `<p style="margin:0;">${safeCount} ${label}</p><p style="margin:2px 0 0 0;">${areaTxt} ha</p><p style="margin:2px 0 0 0;">${shareTxt}% of LPIS identified area</p>`;
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
			if (typeof feature.getId === "function" && typeof feature.getGeometry === "function") return feature;
			try {
				return new ol.format.GeoJSON().readFeature(feature, {
					dataProjection: "EPSG:4326",
					featureProjection: "EPSG:3857",
				});
			} catch (_) {
				return null;
			}
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
		forestColor(pct) {
			if (pct === null) return "#888";
			if (pct < 20) return "#9fb39f";
			if (pct < 50) return "#4f8c4f";
			return "#1f5f1f";
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
			const olFeature = new ol.format.GeoJSON().readFeature(feature, {
				dataProjection: "EPSG:4326",
				featureProjection: "EPSG:3857",
			});
			return olFeature;
		},
		_buildWmsRequest(layerObj, mapExtent) {
			const source = layerObj.layer.getSource();
			const sourceUrls = source.getUrls ? source.getUrls() : null;
			const baseUrl = (sourceUrls && sourceUrls.length ? sourceUrls[0] : source.getUrl());
			const params = source.getParams();
			const layerParam = (params && (params.LAYERS || params.layers)) || layerObj.layer_name;
			if (!baseUrl || !layerParam) {
				throw new Error("Forest layer request cannot be built (missing URL or layer name).");
			}
			const proj = layerObj.layer_projection;

			const corners = [
				[mapExtent[0], mapExtent[1]],
				[mapExtent[2], mapExtent[1]],
				[mapExtent[0], mapExtent[3]],
				[mapExtent[2], mapExtent[3]],
			].map((c) => proj4("EPSG:3857", proj, c));

			const xs = corners.map((c) => c[0]);
			const ys = corners.map((c) => c[1]);
			const minx = Math.min.apply(null, xs);
			const miny = Math.min.apply(null, ys);
			const maxx = Math.max.apply(null, xs);
			const maxy = Math.max.apply(null, ys);

			const spanX = maxx - minx;
			const spanY = maxy - miny;
			if (!(spanX > 0) || !(spanY > 0)) {
				throw new Error("Selected region has invalid extent for forest raster request.");
			}

			// Keep request dimensions stable for geographic layers where metadata grid hints can be unreliable.
			const targetLongSide = 1200;
			let width;
			let height;
			if (spanX >= spanY) {
				width = targetLongSide;
				height = Math.max(1, Math.round(targetLongSide * (spanY / spanX)));
			} else {
				height = targetLongSide;
				width = Math.max(1, Math.round(targetLongSide * (spanX / spanY)));
			}

			const isWms130Epsg4326 = proj === "EPSG:4326";
			const bbox = isWms130Epsg4326
				? [miny, minx, maxy, maxx].join(",")
				: [minx, miny, maxx, maxy].join(",");

			const url = `${baseUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
				`&FORMAT=image/tiff` +
				`&TRANSPARENT=TRUE` +
				`&LAYERS=${layerParam}` +
				`&WIDTH=${width}&HEIGHT=${height}` +
				`&CRS=${proj}&BBOX=${bbox}` +
				`&STYLES=`;
			return { url, width, height };
		},
		_swapEpsg4326BboxAxis(url) {
			const match = url.match(/BBOX=([^&]+)/i);
			if (!match || !match[1]) return url;
			const parts = match[1].split(",").map((v) => Number(v));
			if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return url;
			const swapped = [parts[1], parts[0], parts[3], parts[2]].join(",");
			return url.replace(match[0], `BBOX=${swapped}`);
		},
		async _loadTiff(url) {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Forest raster request failed (${response.status})`);
			}

			const contentType = (response.headers.get("content-type") || "").toLowerCase();
			const buffer = await response.arrayBuffer();
			const bytes = new Uint8Array(buffer);

			const isLittleEndianTiff = bytes.length >= 4 && bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00;
			const isBigEndianTiff = bytes.length >= 4 && bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A;
			if (!isLittleEndianTiff && !isBigEndianTiff) {
				if (contentType.includes("xml") || contentType.includes("text")) {
					const text = new TextDecoder("utf-8").decode(bytes);
					const serviceExceptionMatch = text.match(/<ServiceException[^>]*>([\s\S]*?)<\/ServiceException>/i);
					if (serviceExceptionMatch && serviceExceptionMatch[1]) {
						const msg = serviceExceptionMatch[1].replace(/\s+/g, " ").trim();
						throw new Error(msg || "Forest raster request returned a service exception.");
					}
					const preview = text.slice(0, 320).replace(/\s+/g, " ").trim();
					throw new Error(preview || "Forest raster request returned a non-TIFF response.");
				}
				throw new Error("Forest raster request returned a non-TIFF response.");
			}

			return GeoTIFF.fromArrayBuffer(buffer);
		},
		_decodeForestPixel(samples, idx, nodata) {
			if (!samples || !samples.length) return { valid: false, forest: false };

			if (samples.length === 1) {
				const value = Number(samples[0][idx]);
				if (!Number.isFinite(value)) return { valid: false, forest: false };
				if (nodata !== null && value === nodata) return { valid: false, forest: false };
				if (value === 1) return { valid: true, forest: true };
				if (value === 0) return { valid: true, forest: false };
				return { valid: false, forest: false };
			}

			if (samples.length >= 4) {
				const alpha = Number(samples[3][idx]);
				if (!Number.isFinite(alpha)) return { valid: false, forest: false };
				// WMS styled TIFF commonly uses alpha channel to mark class visibility.
				return { valid: true, forest: alpha > 0 };
			}

			if (samples.length >= 3) {
				const r = Number(samples[0][idx]);
				const g = Number(samples[1][idx]);
				const b = Number(samples[2][idx]);
				if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
					return { valid: false, forest: false };
				}
				// Fallback heuristic for RGB renderings where forest is styled green.
				return { valid: true, forest: (g > r + 5) && (g > b + 5) };
			}

			return { valid: false, forest: false };
		},
		async calculateForestCover() {
			if (this.isCalculating) return;
			this.isCalculating = true;
			this.errorMessage = null;
			this.results = null;

			try {
				const forestLayer = this.layers["jrc_gfc_2020_v2"];
				if (!forestLayer) throw new Error("jrc_gfc_2020_v2 layer not loaded");

				const targets = [];
				let policyParcelData = { features: [], truncated: false };
				let policyParcels = [];
				let policyParcelPolygons = [];
				if (this.isPolicyMode) {
					const regionFeature = await this.loadPolicyRegionFeature();
					if (!regionFeature) throw new Error("Selected region geometry not found");
					targets.push({
						id: this.policySelection[this.policyStatsLevel],
						feature: regionFeature,
						projection: "EPSG:3857",
						forest: 0,
						valid: 0,
					});

					if (this.policySupportsParcelStats) {
						const regionGeoJson = new ol.format.GeoJSON().writeFeatureObject(regionFeature, {
							featureProjection: "EPSG:3857",
							dataProjection: "EPSG:4326",
						});
						const layer = this.policyParcelLayer;
						policyParcelData = layer ? await this.fetchPolicyParcels(layer, regionGeoJson) : { features: [], truncated: false };
						policyParcels = policyParcelData.features
							.map((feature) => this.normalizeGeoJsonFeature(feature))
							.filter((feature) => !!feature)
							.map((feature) => ({
								id: String(feature.get("OSA_ID") || feature.get("PAR_ID") || feature.get("GISCO_ID") || feature.get("LAU_ID") || feature.getId() || "parcel"),
								feature,
								areaHa: this._featureAreaHa(feature, "EPSG:3857"),
								forest: 0,
								valid: 0,
							}));
						policyParcelPolygons = policyParcels.map((parcel) => {
							const gj = new ol.format.GeoJSON().writeFeatureObject(parcel.feature, {
								featureProjection: "EPSG:3857",
								dataProjection: "EPSG:4326",
							});
							return { parcel, gj, bbox: turf.bbox(gj) };
						});
					}
				} else {
					if (!this.selectedFeaturesAll.length) throw new Error("No features selected");
					this.selectedFeaturesAll.forEach((sf) => {
						targets.push({
							id: sf.id,
							feature: sf.feature,
							projection: sf.projection || "EPSG:3857",
							forest: 0,
							valid: 0,
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

				const request = this._buildWmsRequest(forestLayer, [minX, minY, maxX, maxY]);
				const maxPixels = 2000000;
				if ((request.width * request.height) > maxPixels) {
					throw new Error("Selected area is too large for browser-side forest calculation. Please choose a smaller region.");
				}

				VueBus.$emit("changeMessage", "Downloading forest cover raster...");
				let tiff;
				try {
					tiff = await this._loadTiff(request.url);
				} catch (err) {
					const msg = err && err.message ? err.message : "";
					const isBboxError = /Invalid values for BBOX/i.test(msg);
					const isEpsg4326 = forestLayer.layer_projection === "EPSG:4326";
					if (!isBboxError || !isEpsg4326) throw err;

					const fallbackUrl = this._swapEpsg4326BboxAxis(request.url);
					tiff = await this._loadTiff(fallbackUrl);
				}
				let image = await tiff.getImage();
				let raster = await image.readRasters();

				const width = image.getWidth();
				const height = image.getHeight();
				const bbox = image.getBoundingBox();
				const nodata = image.fileDirectory.GDAL_NODATA != null ? Number(image.fileDirectory.GDAL_NODATA) : null;
				const stepX = (bbox[2] - bbox[0]) / width;
				const stepY = (bbox[3] - bbox[1]) / height;

				VueBus.$emit("changeMessage", `Analysing ${(width * height).toLocaleString()} pixels...`);
				await new Promise((r) => setTimeout(r, 50));

				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						const idx = y * width + x;
						const decoded = this._decodeForestPixel(raster, idx, nodata);
						if (!decoded.valid) continue;

						const coordX = bbox[0] + (x + 0.5) * stepX;
						const coordY = bbox[3] - (y + 0.5) * stepY;
						const ll = ol.proj.transform([coordX, coordY], forestLayer.layer_projection, "EPSG:4326");
						const lon = ll[0];
						const lat = ll[1];
						const pt = turf.point([lon, lat]);

						for (let i = 0; i < polygons.length; i += 1) {
							const p = polygons[i];
							const b = p.bbox;
							if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
							if (turf.booleanPointInPolygon(pt, p.gj)) {
								p.t.valid += 1;
								if (decoded.forest) p.t.forest += 1;
								break;
							}
						}

						for (let i = 0; i < policyParcelPolygons.length; i += 1) {
							const p = policyParcelPolygons[i];
							const b = p.bbox;
							if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
							if (turf.booleanPointInPolygon(pt, p.gj)) {
								p.parcel.valid += 1;
								if (decoded.forest) p.parcel.forest += 1;
								break;
							}
						}
					}
				}

				if (this.isPolicyMode) {
					const t = targets[0];
					const policyHasParcelStats = this.policySupportsParcelStats;
					const parcelResults = policyParcels.map((p) => ({
						id: p.id,
						areaHa: p.areaHa,
						forestPct: p.valid > 0 ? (100 * p.forest / p.valid) : null,
					}));
					const parcelAvgCount = parcelResults.filter((p) => p.forestPct !== null).length;
					const parcelAvgSum = parcelResults.reduce((s, p) => s + (p.forestPct !== null ? p.forestPct : 0), 0);
					const gt5Count = parcelResults.filter((p) => p.forestPct !== null && p.forestPct > 5).length;
					const gt10Count = parcelResults.filter((p) => p.forestPct !== null && p.forestPct > 10).length;
					const identifiedAreaHa = parcelResults.reduce((s, p) => s + (p.forestPct !== null ? p.areaHa : 0), 0);
					const gt5AreaHa = parcelResults.reduce((s, p) => s + (p.forestPct !== null && p.forestPct > 5 ? p.areaHa : 0), 0);
					const gt10AreaHa = parcelResults.reduce((s, p) => s + (p.forestPct !== null && p.forestPct > 10 ? p.areaHa : 0), 0);
					const gt5SharePct = identifiedAreaHa > 0 ? (gt5AreaHa / identifiedAreaHa) * 100 : 0;
					const gt10SharePct = identifiedAreaHa > 0 ? (gt10AreaHa / identifiedAreaHa) * 100 : 0;
					this.results = {
						forestPixels: t.forest,
						totalPixels: t.valid,
						forestPct: t.valid > 0 ? (100 * t.forest / t.valid) : null,
						policyHasParcelStats,
						parcelCount: parcelResults.length,
						parcelAvgPct: parcelAvgCount > 0 ? parcelAvgSum / parcelAvgCount : null,
						gt5Count,
						gt10Count,
						identifiedAreaHa,
						gt5AreaHa,
						gt10AreaHa,
						gt5SharePct,
						gt10SharePct,
						note: !policyHasParcelStats
							? "Parcel-level LPIS stats are not currently available for the selected country; showing regional stats only."
							: (policyParcelData.truncated ? "LPIS parcel fetch truncated at 10,000 features; counts may be incomplete." : null),
					};
				} else {
					const parcels = targets.map((t) => ({
						id: t.id,
						forestPixels: t.forest,
						validPixels: t.valid,
						forestPct: t.valid > 0 ? (100 * t.forest / t.valid) : null,
					}));
					const farmForest = targets.reduce((s, t) => s + t.forest, 0);
					const farmValid = targets.reduce((s, t) => s + t.valid, 0);
					this.results = {
						parcels,
						farmForestPixels: farmForest,
						totalPixels: farmValid,
						farmForestPct: farmValid > 0 ? (100 * farmForest / farmValid) : null,
					};
				}

				tiff = null; image = null; raster = null;
				VueBus.$emit("clearMessage");
			} catch (err) {
				this.errorMessage = err && err.message ? err.message : "Forest cover calculation failed.";
				VueBus.$emit("changeMessage", this.errorMessage);
				VueBus.$emit("clearMessage");
			} finally {
				this.isCalculating = false;
			}
		},
	},
};
</script>
