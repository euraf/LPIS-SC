<template>
	<div class="lulc-panel">
		<div v-if="!anySelectedFeature" class="accordion-note">
			Select a parcel on the map.
		</div>
		<div v-else>
			<p class="tcd-section-label">Land Use by Parcel</p>
			<div class="insight-cards lulc-parcel-cards">
				<div
					class="insight-card lulc-parcel-card"
					v-for="card in lulcParcelCards"
					:key="card.id"
					@mouseenter="highlightLulcParcelCard(card.id)"
					@mouseleave="clearLulcParcelHighlight()"
				>
					<span class="card-label lulc-card-parcel-id">{{ card.id }}</span>
					<div class="lulc-source-row" v-for="src in card.sources" :key="src.dataset">
						<span class="lulc-source-dataset">{{ src.dataset }}</span>
						<span class="lulc-source-value">
							<span v-if="src.color" class="lulc-source-dot" :style="{ background: src.color }"></span>{{ src.value }}
						</span>
					</div>
				</div>
			</div>
			<div v-if="lulcLpisNote" class="accordion-note" style="margin-top: 6px;">
				{{ lulcLpisNote }}
			</div>
			<div v-if="lpisStatsUnavailableNote" class="accordion-note" style="margin-top: 6px;">
				{{ lpisStatsUnavailableNote }}
			</div>

			<div v-if="lulcPieSlices.length || lulcClcPieSlices.length || lulcClcBboxPieSlices.length" style="margin-top: 12px;">
				<p class="tcd-section-label">Area by declared class</p>
				<lulc-pie-chart
					:slices="lulcPieSlices"
					subtitle-html="LPIS"
					default-color="#86d94c"
					:highlight-labels="farmLpisClassLabels"></lulc-pie-chart>
				<lulc-pie-chart
					:slices="lulcClcPieSlices"
					subtitle-html="CLC 2018 — farm"
					default-color="#aaa"
					:container-style="lulcPieSlices.length ? { marginTop: '10px' } : {}"></lulc-pie-chart>
			</div>
			<div v-if="lulcLpisBboxPieSlices.length" style="margin-top: 12px;">
				<p class="tcd-section-label">Surroundings land use</p>
				<lulc-pie-chart
					:slices="lulcLpisBboxPieSlices"
					:subtitle-html="lpisBboxSubtitle"
					default-color="#86d94c"
					:count-note-html="lpisBboxCountNote"
					:highlight-labels="farmLpisClassLabels"></lulc-pie-chart>
				<a href="#" class="tcd-pixels-link" @click.prevent="toggleLulcCentroids()">
					{{ showLulcCentroids ? 'hide parcel centroids' : 'show parcel centroids' }}
				</a>
			</div>
			<div v-if="lulcClcBboxPieSlices.length" style="margin-top: 12px;">
				<lulc-pie-chart
					:slices="lulcClcBboxPieSlices"
					:subtitle-html="clcBboxSubtitle"
					default-color="#aaa"
					:count-note-html="clcBboxCountNote"
					:container-style="lulcLpisBboxPieSlices.length ? { marginTop: '10px' } : {}"></lulc-pie-chart>
			</div>
			<div v-if="lulcLpisBboxPieSlices.length || lulcClcBboxPieSlices.length" style="margin-top: 4px; text-align: left; font-size: 0.75rem;">
				<a href="#" class="tcd-pixels-link" @click.prevent="toggleLulcBbox()">
					{{ showLulcBbox ? 'hide 5×5 km bbox' : 'show 5×5 km bbox' }}
				</a>
			</div>

			<div v-if="adminStatsPieSlicesByLevel.length" style="margin-top: 12px;">
				<p class="tcd-section-label">LPIS land use by administrative level</p>
				<div v-for="(lvl, idx) in adminStatsPieSlicesByLevel" :key="lvl.label">
					<lulc-pie-chart
						:slices="lvl.slices"
						:subtitle-html="lvl.label"
						default-color="#86d94c"
						:count-note-html="lvl.count ? lvl.count.toLocaleString() + ' parcels &middot; ' + (lvl.area ? lvl.area.toFixed(0) + ' ha total' : '') : ''"
						:highlight-labels="farmLpisClassLabels"
						:container-style="idx > 0 ? { marginTop: '10px' } : {}"></lulc-pie-chart>
				</div>
			</div>
		</div>

		<div v-if="isCalculatingLulc" class="accordion-note" style="margin-top: 6px;">
			Querying CLC… <span class="spinner-border spinner-border-sm" role="status"></span>
		</div>
		<div v-if="lulcClcErrorMessage && !isCalculatingLulc" class="accordion-note" style="margin-top: 6px; color: #b23b2a;">
			{{ lulcClcErrorMessage }}
			<div style="margin-top: 6px;">
				<button type="button" class="btn btn-sm btn-outline-secondary" @click="retryLulc()">Retry CLC requests</button>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: {
		selectedFeaturesAll: {
			type: Array,
			default: function() {
				return [];
			},
		},
		anySelectedFeature: {
			type: Boolean,
			required: true
		},
		opening: {
			type: Boolean,
			requried: true
		}
	},
	data() {
		return {
			isCalculatingLulc: false,
			lulcClcResults: null,
			lulcClcBboxResults: null,
			lulcLpisBboxResults: null,
			lulcClcErrorMessage: null,
			lulcAdminStats: null,
			countryLpisStatsSupport: {},
			showLulcCentroids: false,
			showLulcBbox: false,
			lulcBboxCenter: null,
			lulcParcelHoverLayer: null,
			lulcParcelHoverSource: null,
		}
	},
	watch: {
		opening(isOpening) {
			if (isOpening && this.anySelectedFeature) {
				this.calculateLULC();
			} else if (!isOpening) {
				this._removeLulcParcelHoverLayer();
				this._removeLulcCentroidLayer();
				this.showLulcCentroids = false;
				this._removeLulcBboxLayer();
				this.showLulcBbox = false;
				this.lulcBboxCenter = null;
				this.lulcClcResults = null;
				this.lulcClcBboxResults = null;
				this.lulcLpisBboxResults = null;
				this.lulcClcErrorMessage = null;
				this.lulcAdminStats = null;
			}
		},
		selectedFeaturesAll() {
			// Keep admin lookup datasets in sync with current parcel selection.

			if (!this.anySelectedFeature) {
				this._removeLulcParcelHoverLayer();
				this._removeLulcCentroidLayer();
				this.showLulcCentroids = false;
				this._removeLulcBboxLayer();
				this.showLulcBbox = false;
				this.lulcBboxCenter = null;
				this.lulcClcResults = null;
				this.lulcClcBboxResults = null;
				this.lulcLpisBboxResults = null;
				this.lulcClcErrorMessage = null;
				this.lulcAdminStats = null;
				return;
			}

			if (this.opening) {
				this.lulcClcResults = null;
				this.lulcClcBboxResults = null;
				this.lulcLpisBboxResults = null;
				this.lulcClcErrorMessage = null;
				this.lulcAdminStats = null;
				this._removeLulcBboxLayer();
				this.showLulcBbox = false;
				this.lulcBboxCenter = null;
				if (this.anySelectedFeature) this.calculateLULC();
			}
		},
	},
	computed: {
		map() {
			return this.$parent.$data.map
		},
		layers() {
			return this.$parent.$data.layers
		},
		adminBoundaryLayers() {
			return this.$parent.$data.adminBoundaryLayers || {};
		},
		nutsLauHierarchy() {
			return this.$parent.$data.nutsLauHierarchy || {};
		},
		lulcLpisNote() {
			const all = this.selectedFeaturesAll;
			if (!all.length) return null;
			const hasAny = all.some((sf) => {
				const layer = this.layers[sf.layerId];
				return layer && layer.feature_infos && layer.feature_infos.feature_landuse;
			});
			if (hasAny) return null;
			const layerIds = [...new Set(all.map((sf) => sf.layerId))];
			const hasPTParcel = layerIds.some((id) => {
				const l = this.layers[id];
				return l && l.country_code === "PT" && !l.feature_infos.feature_landuse;
			});
			if (hasPTParcel) {
				return "No land-use sub-parcels selected. For Portugal, select parcels from the LPIS PT – Land Cover 2024 layer to see declared land use.";
			}
			return "No declared land use available for the selected layer.";
		},
		lpisStatsUnavailableNote() {
			const selected = this.selectedFeaturesAll || [];
			if (!selected.length) return null;
			const firstLayer = this.layers[selected[0].layerId];
			const country = (firstLayer && firstLayer.country_code ? String(firstLayer.country_code) : '').toUpperCase();
			if (!country) return null;
			if (!Object.prototype.hasOwnProperty.call(this.countryLpisStatsSupport, country)) return null;
			if (this.countryLpisStatsSupport[country]) return null;
			return `LPIS regional stats are not currently published for ${country}.`;
		},
		lulcLpisPerParcel() {
			return this.selectedFeaturesAll.map((sf) => {
				const layer = this.layers[sf.layerId];
				let landuse = "—";
				let color = null;
				if (layer && layer.feature_infos && layer.feature_infos.feature_landuse) {
					try {
						const fi = layer.feature_infos.feature_landuse;
						const props = sf.feature.getProperties ? sf.feature.getProperties() : {};
						if (fi.transform === "get_from_legend" && layer.layer_legend) {
							const val = props[fi.key];
							const entry = (layer.layer_legend.legend_elements || {})[val];
							if (entry) {
								landuse = entry[fi.alternate_key] || entry.label_en || entry.label || String(val);
								color = entry.color;
							} else if (val != null) {
								landuse = String(val);
							}
						} else if (fi.transform === "concatenate" && fi.keys) {
							const parts = fi.keys.map((k) => props[k]).filter((v) => v != null && v !== "");
							landuse = parts.join(" — ") || "—";
							if (layer.layer_legend && layer.layer_legend.legend_identifier) {
								const legendKey = props[layer.layer_legend.legend_identifier];
								const legendEntry = (layer.layer_legend.legend_elements || {})[legendKey];
								if (legendEntry) {
									color = legendEntry.color || null;
									//landuse = [props[fi.keys[0]], legendEntry[layer.layer_legend.legend_text] ].join(" — ") || "—";
									landuse = legendEntry[layer.layer_legend.legend_text]
								}
							}
						} else if (fi.key && props[fi.key] != null) {
							landuse = String(props[fi.key]);
						}
					} catch (_) {}
				}
				return { id: sf.id, landuse, color };
			});
		},
		lulcLpisAreaBreakdown() {
			const groups = {};
			for (const sf of this.selectedFeaturesAll) {
				const layer = this.layers[sf.layerId];
				if (!layer || !layer.feature_infos || !layer.feature_infos.feature_landuse) continue;
				const fi = layer.feature_infos.feature_landuse;
				const props = sf.feature.getProperties ? sf.feature.getProperties() : {};
				let landuse = null;
				let color = null;
				if (fi.transform === "get_from_legend" && layer.layer_legend) {
					const val = props[fi.key];
					const entry = (layer.layer_legend.legend_elements || {})[val];
					if (entry) {
						landuse = entry[fi.alternate_key] || entry.label_en || entry.label || String(val);
						color = entry.color;
					} else if (val != null) {
						landuse = String(val);
					}
				} else if (fi.transform === "concatenate" && fi.keys) {
					const parts = fi.keys.map((k) => props[k]).filter((v) => v != null && v !== "");
					landuse = parts.join(" — ") || null;
					if (layer.layer_legend && layer.layer_legend.legend_identifier) {
						const legendKey = props[layer.layer_legend.legend_identifier];
						const legendEntry = (layer.layer_legend.legend_elements || {})[legendKey];
						if (legendEntry) {
							color = legendEntry.color || null;
							landuse = legendEntry[layer.layer_legend.legend_text]
						}
					}
				} else if (fi.key && props[fi.key] != null) {
					landuse = String(props[fi.key]);
				}
				if (!landuse) continue;
				let area = 0;
				if (typeof layer.getFeatureAreaHa === "function") area = layer.getFeatureAreaHa(sf.feature) || 0;
				if (!groups[landuse]) groups[landuse] = { label: landuse, color, area: 0 };
				groups[landuse].area += area;
			}
			const total = Object.values(groups).reduce((s, x) => s + x.area, 0);
			return Object.values(groups)
				.sort((a, b) => b.area - a.area)
				.map((x) => ({ ...x, pct: total > 0 ? (x.area / total) * 100 : 0, areaStr: x.area.toFixed(2) + " ha" }));
		},
		lulcParcelCards() {
			return this.selectedFeaturesAll.map((sf) => {
				const lpisItem = this.lulcLpisPerParcel.find((x) => x.id === sf.id);
				const clcItem = this.lulcClcResults && this.lulcClcResults.parcels.find((x) => x.id === sf.id);
				return {
					id: sf.id,
					sources: [
						{
							dataset: "LPIS",
							value: lpisItem ? lpisItem.landuse : "—",
							color: lpisItem ? lpisItem.color : null,
						},
						{
							dataset: "CLC 2018",
							value: clcItem ? clcItem.dominant : (this.isCalculatingLulc ? "…" : "—"),
							color: clcItem ? clcItem.color : null,
						},
					],
				};
			});
		},
		lulcPieSlices() {
			return this.lulcLpisAreaBreakdown;
		},
		lulcClcAreaBreakdown() {
			if (!this.lulcClcResults) return [];
			const groups = {};
			for (const parcel of this.lulcClcResults.parcels) {
				if (!parcel.dominant || parcel.dominant === "—") continue;
				const sf = this.selectedFeaturesAll.find((x) => x.id === parcel.id);
				if (!sf) continue;
				const layer = this.layers[sf.layerId];
				let area = 0;
				if (layer && typeof layer.getFeatureAreaHa === "function") area = layer.getFeatureAreaHa(sf.feature) || 0;
				if (!groups[parcel.dominant]) groups[parcel.dominant] = { label: parcel.dominant, color: parcel.color, area: 0 };
				groups[parcel.dominant].area += area;
			}
			const total = Object.values(groups).reduce((s, x) => s + x.area, 0);
			return Object.values(groups)
				.sort((a, b) => b.area - a.area)
				.map((x) => ({ ...x, pct: total > 0 ? (x.area / total) * 100 : 0, areaStr: x.area.toFixed(2) + " ha" }));
		},
		lulcClcPieSlices() {
			return this.lulcClcAreaBreakdown;
		},
		farmLpisClassLabels() {
			return this.lulcLpisAreaBreakdown.map((x) => x.label);
		},
		lulcClcBboxPieSlices() {
			if (!this.lulcClcBboxResults || !this.lulcClcBboxResults.length) return [];
			return this.lulcClcBboxResults;
		},
		lulcLpisBboxPieSlices() {
			if (!this.lulcLpisBboxResults || !this.lulcLpisBboxResults.length) return [];
			return this.lulcLpisBboxResults;
		},
		lpisBboxSubtitle() {
			return 'LPIS — 5×5 km bbox <span title="Note: parcels are included if their geometry intersects the 5×5 km bbox extent, but their full recorded area is counted — not just the portion inside the bbox. This is a &quot;features touching the bbox&quot; distribution, not a true areal intersection." style="cursor:help;opacity:0.55;font-size:0.85em;">ⓘ</span>';
		},
		clcBboxSubtitle() {
			return 'CLC 2018 — 5×5 km bbox <span title="Note: CLC polygons are included if they intersect the 5×5 km bbox extent, and their full recorded area is summed — not just the portion inside the bbox. CLC 2018 minimum mapping unit is 25 ha, so small features may be absent. Areas are aggregated server-side by land-use class." style="cursor:help;opacity:0.55;font-size:0.85em;">ⓘ</span>';
		},
		lpisBboxCountNote() {
			if (!this.lulcLpisBboxResults) return '';
			const warning = this.lulcLpisBboxResults._truncated ? ' — <span style="color:#c0392b;">&#9888; first 10 000 shown, may be incomplete</span>' : '';
			return this.lulcLpisBboxResults._featureCount + ' parcels analysed' + warning;
		},
		clcBboxCountNote() {
			if (!this.lulcClcBboxResults) return '';
			return this.lulcClcBboxResults.length + ' land-use classes found';
		},
		adminStatsLevels() {
			if (!this.lulcAdminStats) return [];
			const a = this.lulcAdminStats;

			const formatLevelLabel = (level, name, id) => {
				if (!id) return level;
				if (name && String(name).trim() !== '') {
					return `${level} - ${name} (${id})`;
				}
				return `${level} - ${id}`;
			};

			// Resolve legend from first selected feature's layer
			const firstSf = this.selectedFeaturesAll[0];
			const firstLayer = firstSf && this.layers[firstSf.layerId];
			const legendEls = (firstLayer && firstLayer.layer_legend && firstLayer.layer_legend.legend_elements) || {};

			const toRows = (statsObj) => {
				if (!statsObj) return null;
				const catData = statsObj.CLA_OCU_SIGLA;
				if (!catData || !Object.keys(catData).length) return null;
				const total = Object.values(catData).reduce((s, v) => s + (v.area_ha || 0), 0);
				if (total === 0) return null;
				let rows = Object.entries(catData)
					.map(([key, v]) => {
						const entry = legendEls[key];
						return {
							label: (entry && (entry.CLA_OCU_DESCR_en || entry.label_en || entry.label)) || key,
							area: v.area_ha || 0,
							pct: (v.area_ha / total) * 100,
							areaStr: (v.area_ha || 0).toFixed(1) + ' ha',
							color: (entry && entry.color) || null,
						};
					})
					.sort((x, y) => y.area - x.area);
				return rows;
			};
			const levels = [];
			if (a.lauStats && a.lauId) {
				const rows = toRows(a.lauStats);
				if (rows) levels.push({ label: formatLevelLabel('LAU', a.lauName, a.lauId), rows, count: a.lauStats.parcel_count || null, area: a.lauStats.area_ha || null });
			}
			if (a.nuts3Stats && a.nuts3Id) {
				const rows = toRows(a.nuts3Stats);
				if (rows) levels.push({ label: formatLevelLabel('NUTS3', a.nuts3Name, a.nuts3Id), rows, count: a.nuts3Stats.parcel_count || null, area: a.nuts3Stats.area_ha || null });
			}
			if (a.nuts2Stats && a.nuts2Id) {
				const rows = toRows(a.nuts2Stats);
				if (rows) levels.push({ label: formatLevelLabel('NUTS2', a.nuts2Name, a.nuts2Id), rows, count: a.nuts2Stats.parcel_count || null, area: a.nuts2Stats.area_ha || null });
			}
			if (a.nuts1Stats && a.nuts1Id) {
				const rows = toRows(a.nuts1Stats);
				if (rows) levels.push({ label: formatLevelLabel('NUTS1', a.nuts1Name, a.nuts1Id), rows, count: a.nuts1Stats.parcel_count || null, area: a.nuts1Stats.area_ha || null });
			}
			if (a.countryStats && a.countryCode) {
				const rows = toRows(a.countryStats);
				if (rows) levels.push({ label: formatLevelLabel('Country', a.countryName, a.countryCode), rows, count: a.countryStats.parcel_count || null, area: a.countryStats.area_ha || null });
			}
			return levels;
		},
		adminStatsPieSlicesByLevel() {
			return this.adminStatsLevels.map((lvl) => ({
				...lvl,
				slices: lvl.rows,
			}));
		},
	},
	methods: {
		highlightLulcParcelCard(parcelId) {
			if (!this.map || !parcelId) return;
			const selected = (this.selectedFeaturesAll || []).find((sf) => String(sf.id) === String(parcelId));
			if (!selected || !selected.feature || !selected.feature.getGeometry) return;

			this._ensureLulcParcelHoverLayer();
			if (!this.lulcParcelHoverSource) return;

			const geom = selected.feature.getGeometry().clone();
			const srcProj = selected.projection || 'EPSG:3857';
			if (srcProj !== 'EPSG:3857') geom.transform(srcProj, 'EPSG:3857');

			this.lulcParcelHoverSource.clear();
			this.lulcParcelHoverSource.addFeature(new ol.Feature(geom));
		},
		clearLulcParcelHighlight() {
			if (this.lulcParcelHoverSource) this.lulcParcelHoverSource.clear();
		},
		_ensureLulcParcelHoverLayer() {
			if (!this.map || this.lulcParcelHoverLayer) return;
			this.lulcParcelHoverSource = new ol.source.Vector({ features: [] });
			this.lulcParcelHoverLayer = new ol.layer.Vector({
				source: this.lulcParcelHoverSource,
				zIndex: 72,
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({ color: 'rgba(0, 180, 255, 0.95)', width: 3, lineDash: [7, 4] }),
					fill: new ol.style.Fill({ color: 'rgba(0, 180, 255, 0.08)' }),
				}),
			});
			this.map.addLayer(this.lulcParcelHoverLayer);
		},
		_removeLulcParcelHoverLayer() {
			if (this.lulcParcelHoverLayer && this.map) {
				this.map.removeLayer(this.lulcParcelHoverLayer);
			}
			this.lulcParcelHoverLayer = null;
			this.lulcParcelHoverSource = null;
		},
		toggleLulcCentroids() {
			if (this.showLulcCentroids) {
				this._removeLulcCentroidLayer();
				this.showLulcCentroids = false;
			} else {
				this._addLulcCentroidLayer();
				this.showLulcCentroids = true;
			}
		},

		_addLulcCentroidLayer() {
			if (!this.lulcClcResults || !this.map) return;
			const features = this.lulcClcResults.parcels
				.filter(p => p.lon != null && p.lat != null)
				.map(p => {
					const coord = ol.proj.transform([p.lon, p.lat], 'EPSG:4326', 'EPSG:3857');
					return new ol.Feature(new ol.geom.Point(coord));
				});
			const centroidStyle = new ol.style.Style({
				image: new ol.style.Circle({
					radius: 5,
					fill: new ol.style.Fill({ color: 'rgba(255, 100, 0, 0.85)' }),
					stroke: new ol.style.Stroke({ color: '#fff', width: 1.5 }),
				}),
			});
			this.lulcCentroidLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features }),
				zIndex: 50,
				style: centroidStyle,
			});
			this.map.addLayer(this.lulcCentroidLayer);
		},

		_removeLulcCentroidLayer() {
			if (this.lulcCentroidLayer) {
				this.map.removeLayer(this.lulcCentroidLayer);
				this.lulcCentroidLayer = null;
			}
		},

		toggleLulcBbox() {
			if (this.showLulcBbox) {
				this._removeLulcBboxLayer();
				this.showLulcBbox = false;
			} else {
				this._addLulcBboxLayer();
				this.showLulcBbox = true;
			}
		},

		_addLulcBboxLayer() {
			if (!this.lulcBboxCenter || !this.map) return;
			const [lon, lat] = this.lulcBboxCenter;
			const latDeg = 2.5 / 111.32;
			const lonDeg = 2.5 / (111.32 * Math.cos(lat * Math.PI / 180));
			const ring = [
				[lon - lonDeg, lat - latDeg],
				[lon + lonDeg, lat - latDeg],
				[lon + lonDeg, lat + latDeg],
				[lon - lonDeg, lat + latDeg],
				[lon - lonDeg, lat - latDeg],
			].map(c => ol.proj.transform(c, 'EPSG:4326', 'EPSG:3857'));
			const feature = new ol.Feature(new ol.geom.Polygon([ring]));
			this.lulcBboxLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features: [feature] }),
				zIndex: 49,
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({ color: '#ff1f1f', width: 3, lineDash: [8, 4] }),
					fill: new ol.style.Fill({ color: 'rgba(255, 31, 31, 0.14)' }),
				}),
			});
			this.map.addLayer(this.lulcBboxLayer);
		},

		_removeLulcBboxLayer() {
			if (this.lulcBboxLayer) {
				this.map.removeLayer(this.lulcBboxLayer);
				this.lulcBboxLayer = null;
			}
		},

		async calculateLULC() {
			if (this.isCalculatingLulc) return;
			this.isCalculatingLulc = true;
			this.lulcClcResults = null;
			this.lulcClcBboxResults = null;
			this.lulcLpisBboxResults = null;
			this.lulcClcErrorMessage = null;
			this.lulcAdminStats = null;
			this._removeLulcBboxLayer();
			this.showLulcBbox = false;
			this.lulcBboxCenter = null;

			try {
				const clcLayer = this.layers['clc_2018'];
				if (!clcLayer) throw new Error('CLC 2018 layer not loaded');
				const selectedAll = this.selectedFeaturesAll;
				if (!selectedAll.length) throw new Error('No features selected');

				const legendEls = clcLayer.layer_legend.legend_elements;

				VueBus.$emit('changeMessage', 'Querying CORINE Land Cover…');

				// Collective farm centroid for surroundings bbox query
				const allGeoJSON = selectedAll.map(sf => new ol.format.GeoJSON().writeFeatureObject(sf.feature, {
					featureProjection: sf.projection || 'EPSG:3857',
					dataProjection: 'EPSG:4326',
				}));
				const farmCentroid = turf.centroid(turf.featureCollection(allGeoJSON));
				const [farmLon, farmLat] = farmCentroid.geometry.coordinates;
				this.lulcBboxCenter = [farmLon, farmLat];

				const lpisLayerId = selectedAll[0].layerId;
				const lpisLayer = this.layers[lpisLayerId];
				const lpisCountryCode = lpisLayer && lpisLayer.country_code ? String(lpisLayer.country_code).toUpperCase() : null;
				let clcParcelFailures = 0;
				let clcBboxFailed = false;
				const [parcels, clcBboxRows, lpisBboxRows, adminStats] = await Promise.all([
					Promise.all(selectedAll.map(async sf => {
						try {
							const gj = new ol.format.GeoJSON().writeFeatureObject(sf.feature, {
								featureProjection: sf.projection || 'EPSG:3857',
								dataProjection: 'EPSG:4326',
							});
							const centroid = turf.centroid(gj);
							const [lon, lat] = centroid.geometry.coordinates;
							const code = await this._clcGetFeatureInfo(lon, lat);
							const entry = code ? legendEls[String(code)] : null;
							return {
								id: sf.id,
								lon, lat,
								clcCode: code,
								dominant: entry ? entry.label_en : (code ? `CLC ${code}` : '—'),
								color: entry ? entry.color : null,
							};
						} catch (_) {
							clcParcelFailures += 1;
							return { id: sf.id, clcCode: null, dominant: '—', color: null };
						}
					})),
					this._clcGetBboxDistribution(farmLon, farmLat, 2.5, legendEls).catch(() => {
						clcBboxFailed = true;
						return null;
					}),
					this._lpisGetBboxDistribution(lpisLayerId, farmLon, farmLat, 2.5),
					this._resolveAdminStats(farmLon, farmLat, lpisCountryCode),
				]);

				this.lulcClcResults = { parcels };
				this.lulcClcBboxResults = clcBboxRows;
				this.lulcLpisBboxResults = lpisBboxRows;
				this.lulcAdminStats = adminStats;
				if (clcParcelFailures > 0 || clcBboxFailed) {
					const parts = [];
					if (clcParcelFailures > 0) {
						parts.push(`CLC per-parcel lookup failed for ${clcParcelFailures} parcel(s).`);
					}
					if (clcBboxFailed) {
						parts.push('CLC surroundings stats request failed.');
					}
					parts.push('Please try again.');
					this.lulcClcErrorMessage = parts.join(' ');
				}
				VueBus.$emit('changeMessage', `CLC lookup complete for ${parcels.length} parcel(s).`);
				VueBus.$emit('clearMessage');

			} catch (err) {
				console.error('LULC calculation error:', err);
				VueBus.$emit('changeMessage', `LULC error: ${err.message}`);
				VueBus.$emit('clearMessage');
			} finally {
				this.isCalculatingLulc = false;
			}
		},

		async _clcGetFeatureInfo(lon, lat) {
			// Direct spatial query against the CLC2018 LAEA Feature Layer (layer 0).
			// More reliable than WMS GetFeatureInfo or MapServer identify.
			const geomJson = encodeURIComponent(JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }));
			const url =
				'https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_LAEA/MapServer/0/query' +
				'?f=json' +
				`&geometry=${geomJson}` +
				'&geometryType=esriGeometryPoint' +
				'&inSR=4326' +
				'&spatialRel=esriSpatialRelIntersects' +
				'&outFields=Code_18' +
				'&returnGeometry=false';

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('CLC per-parcel query failed with HTTP ' + response.status);
			}
			try {
				const data = await response.json();
				if (!data.features || !data.features.length) return null;
				const code = data.features[0].attributes && data.features[0].attributes.Code_18;
				return code && code !== 'Null' ? String(code) : null;
			} catch (_) { return null; }
		},

		async _clcGetBboxDistribution(lon, lat, halfKm, legendEls) {
			// Build approximate degree bbox around farm centroid (EPSG:4326)
			const latDeg = halfKm / 111.32;
			const lonDeg = halfKm / (111.32 * Math.cos(lat * Math.PI / 180));
			const bbox = [lon - lonDeg, lat - latDeg, lon + lonDeg, lat + latDeg].join(',');

			const url =
				'https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_LAEA/MapServer/0/query' +
				'?f=json' +
				'&where=1%3D1' +
				`&geometry=${bbox}` +
				'&geometryType=esriGeometryEnvelope' +
				'&inSR=4326' +
				'&spatialRel=esriSpatialRelIntersects' +
				'&outStatistics=' + encodeURIComponent(JSON.stringify([{ statisticType: 'sum', onStatisticField: 'Shape_Area', outStatisticFieldName: 'total_area' }])) +
				'&groupByFieldsForStatistics=Code_18' +
				'&returnGeometry=false';

			const resp = await fetch(url);
			if (!resp.ok) {
				throw new Error('CLC bbox stats query failed with HTTP ' + resp.status);
			}
			const data = await resp.json();
			if (!data.features || !data.features.length) return null;
			const totalM2 = data.features.reduce((s, f) => s + (f.attributes.total_area || 0), 0);
			return data.features
				.map(f => {
					const code = String(f.attributes.Code_18);
					const areaHa = (f.attributes.total_area || 0) / 10000;
					const entry = legendEls[code];
					return {
						code,
						areaHa,
						label: entry ? entry.label_en : `CLC ${code}`,
						color: entry ? entry.color : null,
						pct: totalM2 > 0 ? ((f.attributes.total_area || 0) / totalM2) * 100 : 0,
					};
				})
				.filter(x => x.areaHa > 0)
				.sort((a, b) => b.areaHa - a.areaHa);
		},

		async _lpisGetBboxDistribution(layerId, lon, lat, halfKm) {
			const layer = this.layers[layerId];
			if (!layer || layer.type !== 'WFS' || !layer.source_url) return null;
			const fi = layer.feature_infos && layer.feature_infos.feature_landuse;
			if (!fi) return null;

			// Build approximate degree bbox around centre (EPSG:4326)
			const latDeg = halfKm / 111.32;
			const lonDeg = halfKm / (111.32 * Math.cos(lat * Math.PI / 180));
			const extent = [lon - lonDeg, lat - latDeg, lon + lonDeg, lat + latDeg].join(',');

			// Request only the fields we need (no geometry → smaller payload)
			const areaFi = layer.feature_infos.feature_area;
			const fieldsSet = new Set();
			if (fi.key) fieldsSet.add(fi.key);
			if (fi.keys) fi.keys.forEach(k => fieldsSet.add(k));
			if (layer.layer_legend && layer.layer_legend.legend_identifier) fieldsSet.add(layer.layer_legend.legend_identifier);
			if (areaFi && areaFi.key) fieldsSet.add(areaFi.key);
			const propertyName = [...fieldsSet].join(',');

			const baseUrl = layer.source_url
				.replace(/\[layer_name\]/g, layer.layer_name)
				.replace(/\[layer_name_detail\]/g, layer.layer_name_detail)
				.replace(/\[layer_projection\]/g, 'EPSG:4326')
				.replace('[extent]', extent)
				+ (propertyName ? '&propertyName=' + encodeURIComponent(propertyName) : '');

			const PAGE = 2000;
			const MAX_FEATURES = 10000;

			try {
				let allFeatures = [];
				let startIndex = 0;
				let totalFeatures = null;

				do {
					const url = baseUrl + '&maxFeatures=' + PAGE + '&startIndex=' + startIndex;
					const resp = await fetch(url);
					if (!resp.ok) return null;
					const data = await resp.json();
					if (!data.features || !data.features.length) break;

					allFeatures = allFeatures.concat(data.features);

					if (totalFeatures === null) {
						// GeoServer puts total count in totalFeatures; WFS 2.0 uses numberMatched
						totalFeatures = data.totalFeatures ?? data.numberMatched ?? data.features.length;
					}

					startIndex += data.features.length;
				} while (startIndex < totalFeatures && startIndex < MAX_FEATURES && allFeatures.length === startIndex);

				const features = allFeatures;
				if (!features.length) return null;

				const legendEls = layer.layer_legend ? layer.layer_legend.legend_elements || {} : {};
				const areaUnit = areaFi ? areaFi.unit : null;
				const groups = {};

				for (const feat of features) {
					const props = feat.properties || {};
					let landuse = null;
					let color = null;

					if (fi.transform === 'get_from_legend') {
						const val = props[fi.key];
						const entry = legendEls[String(val)];
						if (entry) {
							landuse = entry[fi.alternate_key] || entry.label_en || entry.label || String(val);
							color = entry.color;
						} else if (val != null) {
							landuse = String(val);
						}
					} else if (fi.transform === 'concatenate' && fi.keys) {
						const parts = fi.keys.map(k => props[k]).filter(v => v != null && v !== '');
						landuse = parts.join(' — ') || null;
						if (layer.layer_legend && layer.layer_legend.legend_identifier) {
							const legendKey = props[layer.layer_legend.legend_identifier];
							const entry = legendEls[String(legendKey)];
							if (entry) color = entry.color || null;
							//landuse = [props[fi.keys[0]], entry[layer.layer_legend.legend_text] ].join(" — ") || "—";
							landuse = entry[layer.layer_legend.legend_text];
						}
					} else if (fi.key && props[fi.key] != null) {
						landuse = String(props[fi.key]);
					}

					if (!landuse) continue;

					let areaHa = 0;
					if (areaFi && props[areaFi.key] != null) {
						areaHa = areaUnit === 'square_m' ? props[areaFi.key] / 10000 : Number(props[areaFi.key]);
					} else if (feat.geometry) {
						areaHa = turf.area(feat) / 10000;
					}

					if (!groups[landuse]) groups[landuse] = { label: landuse, color, area: 0 };
					groups[landuse].area += areaHa;
				}

				const totalHa = Object.values(groups).reduce((s, x) => s + x.area, 0);
				if (totalHa === 0) return null;
				const truncated = startIndex >= MAX_FEATURES;
				const result = Object.values(groups)
					.sort((a, b) => b.area - a.area)
					.map(x => ({ ...x, pct: (x.area / totalHa) * 100, areaStr: x.area.toFixed(1) + ' ha' }));
				result._truncated = truncated;
				result._featureCount = allFeatures.length;
				return result;
			} catch (_) { return null; }
		},
		async _resolveAdminStats(lon, lat, countryCode) {
			if (!countryCode) return null;
			if (!(await this.hasCountryLpisStats(countryCode))) return null;

			const fetchJson = async (url) => {
				try {
					const r = await fetch(url);
					return r.ok ? r.json() : null;
				} catch (_) {
					return null;
				}
			};

			const mergeCategoryStats = (target, source) => {
				if (!source || typeof source !== 'object') return;
				for (const [key, value] of Object.entries(source)) {
					if (!target[key]) target[key] = { parcel_count: 0, farm_count: 0, osa_count: 0, area_ha: 0 };
					target[key].parcel_count += value.parcel_count || 0;
					target[key].farm_count += value.farm_count || 0;
					target[key].osa_count += value.osa_count || 0;
					target[key].area_ha += value.area_ha || 0;
				}
			};

			const mergeRegionStats = (statsList) => {
				const valid = statsList.filter(Boolean);
				if (!valid.length) return null;
				const acc = {
					parcel_count: 0,
					farm_count: 0,
					osa_count: 0,
					area_ha: 0,
					CLA_OCU_SIGLA: {},
					CAT_OCU_SIGLA: {},
				};
				for (const s of valid) {
					acc.parcel_count += s.parcel_count || 0;
					acc.farm_count += s.farm_count || 0;
					acc.osa_count += s.osa_count || 0;
					acc.area_ha += s.area_ha || 0;
					mergeCategoryStats(acc.CLA_OCU_SIGLA, s.CLA_OCU_SIGLA);
					mergeCategoryStats(acc.CAT_OCU_SIGLA, s.CAT_OCU_SIGLA);
				}
				return acc;
			};

			const findNutsCodesFromLauId = (lauId) => {
				const H = this.nutsLauHierarchy;
				if (!H || !H.nuts0) return null;
				const cc = String(lauId || '').split('_')[0];
				const ccData = H.nuts0[cc];
				if (!ccData) return null;
				for (const [n1id, n1data] of Object.entries(ccData.nuts1 || {})) {
					for (const [n2id, n2data] of Object.entries(n1data.nuts2 || {})) {
						for (const [n3id, n3data] of Object.entries(n2data.nuts3 || {})) {
							if (n3data.lau_ids && n3data.lau_ids.includes(lauId)) {
								return { nuts1: n1id, nuts2: n2id, nuts3: n3id };
							}
						}
					}
				}
				return null;
			};

			try {
				const selected = this.selectedFeaturesAll || [];
				if (!selected.length) return null;

				const adminEntries = Object.values(this.adminBoundaryLayers || {})
					.filter((entry) => entry && entry.loaded && entry.layer && ['nuts1', 'nuts2', 'nuts3', 'lau'].includes(entry.level));
				if (!adminEntries.length) return null;

				const geoJsonFmt = new ol.format.GeoJSON();
				const adminFeaturesByLevel = { nuts1: [], nuts2: [], nuts3: [], lau: [] };
				for (const entry of adminEntries) {
					const level = entry.level;
					entry.layer.getSource().forEachFeature((f) => {
						const gj = geoJsonFmt.writeFeatureObject(f, {
							featureProjection: 'EPSG:3857',
							dataProjection: 'EPSG:4326',
						});
						adminFeaturesByLevel[level].push({
							feature: gj,
							props: gj.properties || {},
						});
					});
				}

				const nuts3Ids = new Set();
				const lauMap = new Map();
				const nuts1NameById = new Map();
				const nuts2NameById = new Map();
				const nuts3NameById = new Map();
				const countryNameSet = new Set();

				for (const sf of selected) {
					const parcelGJ = geoJsonFmt.writeFeatureObject(sf.feature, {
						featureProjection: sf.projection || 'EPSG:3857',
						dataProjection: 'EPSG:4326',
					});

					for (const admin of adminFeaturesByLevel.nuts1) {
						if (turf.booleanIntersects(parcelGJ, admin.feature)) {
							const id = admin.props.NUTS_ID;
							if (id) nuts1NameById.set(String(id), admin.props.NUTS_NAME || nuts1NameById.get(String(id)) || null);
							if (admin.props.CNTR_NAME) countryNameSet.add(String(admin.props.CNTR_NAME));
						}
					}

					for (const admin of adminFeaturesByLevel.nuts2) {
						if (turf.booleanIntersects(parcelGJ, admin.feature)) {
							const id = admin.props.NUTS_ID;
							if (id) nuts2NameById.set(String(id), admin.props.NUTS_NAME || nuts2NameById.get(String(id)) || null);
							if (admin.props.CNTR_NAME) countryNameSet.add(String(admin.props.CNTR_NAME));
						}
					}

					for (const admin of adminFeaturesByLevel.nuts3) {
						if (turf.booleanIntersects(parcelGJ, admin.feature)) {
							const id = admin.props.NUTS_ID;
							if (id) nuts3Ids.add(String(id));
							if (id) nuts3NameById.set(String(id), admin.props.NUTS_NAME || nuts3NameById.get(String(id)) || null);
							if (admin.props.CNTR_NAME) countryNameSet.add(String(admin.props.CNTR_NAME));
						}
					}

					for (const admin of adminFeaturesByLevel.lau) {
						if (turf.booleanIntersects(parcelGJ, admin.feature)) {
							const lauId = admin.props.GISCO_ID || admin.props.LAU_ID;
							if (lauId) {
								lauMap.set(String(lauId), {
									id: String(lauId),
									name: admin.props.LAU_NAME || null,
									nuts3Id: admin.props.NUTS_ID || null,
								});
							}
						}
					}
				}

				for (const v of lauMap.values()) {
					if (v.nuts3Id) {
						nuts3Ids.add(String(v.nuts3Id));
						continue;
					}
					const fromHierarchy = findNutsCodesFromLauId(v.id);
					if (fromHierarchy && fromHierarchy.nuts3) nuts3Ids.add(String(fromHierarchy.nuts3));
				}

				if (!nuts3Ids.size && !lauMap.size) return null;

				const nuts3List = Array.from(nuts3Ids).sort();
				const nuts2List = Array.from(new Set([
					...Array.from(nuts2NameById.keys()),
					...nuts3List.map((id) => id.slice(0, 4)),
				])).sort();
				const nuts1List = Array.from(new Set([
					...Array.from(nuts1NameById.keys()),
					...nuts3List.map((id) => id.slice(0, 3)),
				])).sort();

				const namesForIds = (ids, mapObj) => ids
					.map((id) => mapObj.get(id))
					.filter((name) => !!name && String(name).trim() !== '')
					.join(', ');

				var GITHUB_URL = "https://raw.githubusercontent.com/euraf/eu-lpis-stats/refs/heads/master/v1/"
				const [nuts3Raw, nuts2Raw, nuts1Raw, countryStats] = await Promise.all([
					Promise.all(nuts3List.map((id) => fetchJson(GITHUB_URL + countryCode + '/' + id + '.json'))),
					Promise.all(nuts2List.map((id) => fetchJson(GITHUB_URL + countryCode + '/' + id + '.json'))),
					Promise.all(nuts1List.map((id) => fetchJson(GITHUB_URL + countryCode + '/' + id + '.json'))),
					fetchJson(GITHUB_URL + countryCode + '/' + countryCode + '.json'),
				]);

				const lauByNuts3 = {};
				for (const lau of lauMap.values()) {
					let n3 = lau.nuts3Id;
					if (!n3) {
						const mapped = findNutsCodesFromLauId(lau.id);
						n3 = mapped && mapped.nuts3 ? mapped.nuts3 : null;
					}
					if (!n3) continue;
					if (!lauByNuts3[n3]) lauByNuts3[n3] = [];
					lauByNuts3[n3].push(lau.id);
				}

				const lauFileEntries = await Promise.all(
					Object.keys(lauByNuts3).map(async (n3) => {
						const file = await fetchJson(GITHUB_URL + countryCode + '/' + n3 + '_lau.json');
						return { n3, file };
					})
				);

				const lauStatsList = [];
				for (const row of lauFileEntries) {
					if (!row.file || !row.file.lau) continue;
					for (const lauId of lauByNuts3[row.n3] || []) {
						if (row.file.lau[lauId]) lauStatsList.push(row.file.lau[lauId]);
					}
				}

				const lauList = Array.from(lauMap.values()).sort((a, b) => a.id.localeCompare(b.id));

				return {
					lauId: lauList.map((x) => x.id).join(', ') || null,
					lauName: lauList.map((x) => x.name).filter(Boolean).join(', ') || null,
					lauStats: mergeRegionStats(lauStatsList),
					nuts3Id: nuts3List.join(', ') || null,
					nuts3Name: namesForIds(nuts3List, nuts3NameById) || null,
					nuts3Stats: mergeRegionStats(nuts3Raw),
					nuts2Id: nuts2List.join(', ') || null,
					nuts2Name: namesForIds(nuts2List, nuts2NameById) || null,
					nuts2Stats: mergeRegionStats(nuts2Raw),
					nuts1Id: nuts1List.join(', ') || null,
					nuts1Name: namesForIds(nuts1List, nuts1NameById) || null,
					nuts1Stats: mergeRegionStats(nuts1Raw),
					countryCode,
					countryName: Array.from(countryNameSet).join(', ') || null,
					countryStats,
				};
			} catch (_) {
				return null;
			}
		},
		async hasCountryLpisStats(countryCode) {
			const country = (countryCode || '').toUpperCase();
			if (!country) return false;
			if (Object.prototype.hasOwnProperty.call(this.countryLpisStatsSupport, country)) {
				return !!this.countryLpisStatsSupport[country];
			}

			const url = `https://raw.githubusercontent.com/euraf/eu-lpis-stats/refs/heads/master/v1/${country}/${country}.json`;
			let available = false;
			try {
				const response = await fetch(url);
				available = response.ok;
			} catch (_) {
				available = false;
			}

			this.$set(this.countryLpisStatsSupport, country, available);
			return available;
		},
	}
}
</script>
