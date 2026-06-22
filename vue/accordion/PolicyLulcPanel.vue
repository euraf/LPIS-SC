<template>
	<div class="lulc-panel">
		<div v-if="!hasPrimaryTarget" class="accordion-note">
			Select region and click Show stats.
		</div>
		<div v-else>
			<div v-if="isLoading" class="accordion-note" style="margin-bottom: 8px;">
				Loading regional stats... <span class="spinner-border spinner-border-sm" role="status"></span>
			</div>

			<div v-if="lpisUnavailableNote" class="accordion-note" style="margin-bottom: 8px;">
				{{ lpisUnavailableNote }}
			</div>

			<div v-if="errorMessage" class="accordion-note" style="margin-bottom: 8px; color: #b23b2a;">
				{{ errorMessage }}
			</div>

			<div v-if="primarySlices.length">
				<p class="tcd-section-label">LPIS land use by selected region</p>
				<lulc-pie-chart
					:slices="primarySlices"
					:subtitle-html="primarySubtitle"
					default-color="#86d94c">
				</lulc-pie-chart>
			</div>

			<div v-if="showCompare && compareSlices.length" style="margin-top: 12px;">
				<lulc-pie-chart
					:slices="compareSlices"
					:subtitle-html="compareSubtitle"
					default-color="#5b8def"
					:container-style="primarySlices.length ? { marginTop: '10px' } : {}">
				</lulc-pie-chart>
			</div>

			<div v-if="showCompare && compareDeltaRows.length" style="margin-top: 12px;">
				<p class="tcd-section-label">LPIS class-by-class delta</p>
				<div style="overflow-x: auto;">
					<table class="table table-sm" style="font-size: 0.8rem; margin-bottom: 0;">
						<thead>
							<tr>
								<th style="white-space: nowrap;">Class</th>
								<th style="white-space: nowrap; text-align: right;">Selected %</th>
								<th style="white-space: nowrap; text-align: right;">Compare %</th>
								<th style="white-space: nowrap; text-align: right;">Delta pp</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="row in compareDeltaRows" :key="row.label">
								<td>
									<span v-if="row.color" style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle;" :style="{ background: row.color }"></span>
									{{ row.label }}
								</td>
								<td style="text-align: right;">{{ row.primaryPct.toFixed(1) }}</td>
								<td style="text-align: right;">{{ row.comparePct.toFixed(1) }}</td>
								<td style="text-align: right;" :style="{ color: row.deltaPct > 0 ? '#0a7a2f' : (row.deltaPct < 0 ? '#b23b2a' : '#444') }">{{ formatSigned(row.deltaPct) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div v-if="clcPrimarySlices.length" style="margin-top: 12px;">
				<p class="tcd-section-label">CLC 2018 land cover by selected region</p>
				<lulc-pie-chart
					:slices="clcPrimarySlices"
					:subtitle-html="clcPrimarySubtitle"
					default-color="#e31a1c">
				</lulc-pie-chart>
			</div>

			<div v-if="showCompare && clcCompareSlices.length" style="margin-top: 12px;">
				<lulc-pie-chart
					:slices="clcCompareSlices"
					:subtitle-html="clcCompareSubtitle"
					default-color="#fb6a4a"
					:container-style="clcPrimarySlices.length ? { marginTop: '10px' } : {}">
				</lulc-pie-chart>
			</div>

			<div v-if="showCompare && clcCompareDeltaRows.length" style="margin-top: 12px;">
				<p class="tcd-section-label">CLC class-by-class delta</p>
				<div style="overflow-x: auto;">
					<table class="table table-sm" style="font-size: 0.8rem; margin-bottom: 0;">
						<thead>
							<tr>
								<th style="white-space: nowrap;">Class</th>
								<th style="white-space: nowrap; text-align: right;">Selected %</th>
								<th style="white-space: nowrap; text-align: right;">Compare %</th>
								<th style="white-space: nowrap; text-align: right;">Delta pp</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="row in clcCompareDeltaRows" :key="`clc-${row.label}`">
								<td>
									<span v-if="row.color" style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle;" :style="{ background: row.color }"></span>
									{{ row.label }}
								</td>
								<td style="text-align: right;">{{ row.primaryPct.toFixed(1) }}</td>
								<td style="text-align: right;">{{ row.comparePct.toFixed(1) }}</td>
								<td style="text-align: right;" :style="{ color: row.deltaPct > 0 ? '#0a7a2f' : (row.deltaPct < 0 ? '#b23b2a' : '#444') }">{{ formatSigned(row.deltaPct) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div v-if="clcErrorMessage" class="accordion-note" style="margin-top: 8px; color: #b23b2a;">
				{{ clcErrorMessage }}
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: {
		opening: {
			type: Boolean,
			required: true,
		},
		layers: {
			type: Object,
			required: true,
		},
		nutsLauHierarchy: {
			type: Object,
			required: true,
		},
		policyStatsLevel: {
			type: String,
			default: "",
		},
		policySelection: {
			type: Object,
			required: true,
		},
		policyCompareStatsLevel: {
			type: String,
			default: "",
		},
		policyCompareSelection: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			isLoading: false,
			errorMessage: null,
			primaryStats: null,
			compareStats: null,
			countryLpisStatsSupport: {},
			clcErrorMessage: null,
			clcPrimaryRawRows: null,
			clcCompareRawRows: null,
			clcGeometryCacheByKey: {},
			clcStatsCacheByKey: {},
		};
	},
	watch: {
		opening(isOpening) {
			if (isOpening) {
				this.loadRegionalStats();
			} else {
				this.resetState();
			}
		},
		policyStatsLevel() {
			if (this.opening) this.loadRegionalStats();
		},
		policyCompareStatsLevel() {
			if (this.opening) this.loadRegionalStats();
		},
		policySelection: {
			deep: true,
			handler() {
				if (this.opening) this.loadRegionalStats();
			},
		},
		policyCompareSelection: {
			deep: true,
			handler() {
				if (this.opening) this.loadRegionalStats();
			},
		},
	},
	computed: {
		hasPrimaryTarget() {
			if (!this.policyStatsLevel) return false;
			return !!this.getSelectedId(this.policySelection, this.policyStatsLevel);
		},
		showCompare() {
			if (!this.policyCompareStatsLevel || !this.policyStatsLevel) return false;
			if (this.policyCompareStatsLevel !== this.policyStatsLevel) return false;
			const compareId = this.getSelectedId(this.policyCompareSelection, this.policyCompareStatsLevel);
			const primaryId = this.getSelectedId(this.policySelection, this.policyStatsLevel);
			if (!compareId || !primaryId) return false;
			return compareId !== primaryId;
		},
		lpisUnavailableNote() {
			const country = (this.policySelection && this.policySelection.country ? String(this.policySelection.country) : '').toUpperCase();
			if (!country) return null;
			if (!Object.prototype.hasOwnProperty.call(this.countryLpisStatsSupport, country)) return null;
			if (this.countryLpisStatsSupport[country]) return null;
			return `LPIS regional stats are not currently published for ${country}.`;
		},
		legendElements() {
			const countryCode = (this.policySelection.country || "").toUpperCase();
			const allLayers = Object.values(this.layers || {});
			const matchingLayer = allLayers.find((ly) => {
				if (!ly || ly.type !== "WFS") return false;
				if (!ly.feature_infos || !ly.feature_infos.feature_landuse) return false;
				if (!ly.layer_legend || !ly.layer_legend.legend_elements) return false;
				return !countryCode || (ly.country_code || "").toUpperCase() === countryCode;
			});
			if (matchingLayer) return matchingLayer.layer_legend.legend_elements || {};
			const fallbackLayer = allLayers.find((ly) => ly && ly.layer_legend && ly.layer_legend.legend_elements);
			return fallbackLayer ? fallbackLayer.layer_legend.legend_elements || {} : {};
		},
		clcLegendElements() {
			const clcLayer = this.layers && this.layers.clc_2018;
			if (!clcLayer || !clcLayer.layer_legend) return {};
			return clcLayer.layer_legend.legend_elements || {};
		},
		primarySlices() {
			return this.buildSlices(this.primaryStats);
		},
		compareSlices() {
			return this.buildSlices(this.compareStats);
		},
		clcPrimarySlices() {
			return this.buildClcSlices(this.clcPrimaryRawRows);
		},
		clcCompareSlices() {
			return this.buildClcSlices(this.clcCompareRawRows);
		},
		primarySubtitle() {
			if (!this.policyStatsLevel) return "Selected region";
			const id = this.getSelectedId(this.policySelection, this.policyStatsLevel);
			return `${this.getPolicyLevelLabel(this.policyStatsLevel)} - ${id || ""}`;
		},
		compareSubtitle() {
			if (!this.policyCompareStatsLevel) return "Compare region";
			const id = this.getSelectedId(this.policyCompareSelection, this.policyCompareStatsLevel);
			return `${this.getPolicyLevelLabel(this.policyCompareStatsLevel)} - ${id || ""}`;
		},
		clcPrimarySubtitle() {
			if (!this.policyStatsLevel) return "CLC 2018";
			const id = this.getSelectedId(this.policySelection, this.policyStatsLevel);
			return `CLC 2018 - ${this.getPolicyLevelLabel(this.policyStatsLevel)} ${id || ""}`;
		},
		clcCompareSubtitle() {
			if (!this.policyCompareStatsLevel) return "CLC 2018 compare";
			const id = this.getSelectedId(this.policyCompareSelection, this.policyCompareStatsLevel);
			return `CLC 2018 - ${this.getPolicyLevelLabel(this.policyCompareStatsLevel)} ${id || ""}`;
		},
		compareDeltaRows() {
			if (!this.showCompare || !this.primarySlices.length || !this.compareSlices.length) return [];

			const byLabelPrimary = {};
			const byLabelCompare = {};
			this.primarySlices.forEach((slice) => {
				byLabelPrimary[slice.label] = slice;
			});
			this.compareSlices.forEach((slice) => {
				byLabelCompare[slice.label] = slice;
			});

			const labels = Array.from(new Set([
				...Object.keys(byLabelPrimary),
				...Object.keys(byLabelCompare),
			]));

			return labels
				.map((label) => {
					const primary = byLabelPrimary[label] || { pct: 0, color: null };
					const compare = byLabelCompare[label] || { pct: 0, color: null };
					return {
						label,
						color: primary.color || compare.color || null,
						primaryPct: primary.pct || 0,
						comparePct: compare.pct || 0,
						deltaPct: (compare.pct || 0) - (primary.pct || 0),
					};
				})
				.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
		},
		clcCompareDeltaRows() {
			if (!this.showCompare || !this.clcPrimarySlices.length || !this.clcCompareSlices.length) return [];

			const byLabelPrimary = {};
			const byLabelCompare = {};
			this.clcPrimarySlices.forEach((slice) => {
				byLabelPrimary[slice.label] = slice;
			});
			this.clcCompareSlices.forEach((slice) => {
				byLabelCompare[slice.label] = slice;
			});

			const labels = Array.from(new Set([
				...Object.keys(byLabelPrimary),
				...Object.keys(byLabelCompare),
			]));

			return labels
				.map((label) => {
					const primary = byLabelPrimary[label] || { pct: 0, color: null };
					const compare = byLabelCompare[label] || { pct: 0, color: null };
					return {
						label,
						color: primary.color || compare.color || null,
						primaryPct: primary.pct || 0,
						comparePct: compare.pct || 0,
						deltaPct: (compare.pct || 0) - (primary.pct || 0),
					};
				})
				.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
		},
	},
	methods: {
		resetState() {
			this.isLoading = false;
			this.errorMessage = null;
			this.primaryStats = null;
			this.compareStats = null;
			this.clcErrorMessage = null;
			this.clcPrimaryRawRows = null;
			this.clcCompareRawRows = null;
		},
		getPolicyLevelLabel(level) {
			const labels = {
				country: "Country",
				nuts1: "NUTS1",
				nuts2: "NUTS2",
				nuts3: "NUTS3",
				lau: "LAU",
			};
			return labels[level] || "Region";
		},
		getSelectedId(selection, level) {
			if (!selection || !level) return "";
			return selection[level] || "";
		},
		formatSigned(value) {
			const numeric = Number(value || 0);
			const sign = numeric > 0 ? "+" : "";
			return `${sign}${numeric.toFixed(1)}`;
		},
		buildSlices(stats) {
			if (!stats || !stats.CLA_OCU_SIGLA) return [];
			const rows = Object.entries(stats.CLA_OCU_SIGLA)
				.map(([code, value]) => {
					const area = Number((value && value.area_ha) || 0);
					const entry = this.legendElements[code] || {};
					const label = entry.CLA_OCU_DESCR_en || entry.label_en || entry.label || code;
					return {
						code,
						label,
						color: entry.color || null,
						area,
					};
				})
				.filter((row) => row.area > 0)
				.sort((a, b) => b.area - a.area);

			const total = rows.reduce((sum, row) => sum + row.area, 0);
			if (!total) return [];
			return rows.map((row) => ({
				label: row.label,
				color: row.color,
				area: row.area,
				pct: (row.area / total) * 100,
				areaStr: `${row.area.toFixed(1)} ha`,
			}));
		},
		buildClcSlices(rawRows) {
			if (!rawRows || !rawRows.length) return [];
			const totalArea = rawRows.reduce((sum, row) => sum + (Number(row.areaHa) || 0), 0);
			if (!totalArea) return [];

			return rawRows
				.map((row) => {
					const code = String(row.code);
					const legend = this.clcLegendElements[code] || {};
					const label = legend.label_en || legend.label || `CLC ${code}`;
					const area = Number(row.areaHa) || 0;
					return {
						label,
						color: legend.color || null,
						area,
						pct: (area / totalArea) * 100,
					};
				})
				.filter((row) => row.area > 0)
				.sort((a, b) => b.area - a.area);
		},
		getSelectionCacheKey(selection, level) {
			if (!selection || !level) return "";
			return `${(selection.country || "").toUpperCase()}|${level}|${selection[level] || ""}|${selection.nuts3 || ""}`;
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
		geoJsonGeometryToEsriPolygon(geometry) {
			if (!geometry || !geometry.type || !geometry.coordinates) return null;
			const rings = [];

			if (geometry.type === "Polygon") {
				geometry.coordinates.forEach((ring) => {
					rings.push(ring.map((point) => [Number(point[0]), Number(point[1])]));
				});
			}

			if (geometry.type === "MultiPolygon") {
				geometry.coordinates.forEach((polygon) => {
					polygon.forEach((ring) => {
						rings.push(ring.map((point) => [Number(point[0]), Number(point[1])]));
					});
				});
			}

			if (!rings.length) return null;
			return {
				rings,
				spatialReference: { wkid: 4326 },
			};
		},
		async resolveRegionGeometry(selection, level) {
			const cacheKey = this.getSelectionCacheKey(selection, level);
			if (!cacheKey) return null;
			if (this.clcGeometryCacheByKey[cacheKey]) return this.clcGeometryCacheByKey[cacheKey];

			const regionRef = this.getRegionFileForSelection(selection, level);
			if (!regionRef || !regionRef.file || !regionRef.featureId) return null;

			const url = `https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/${regionRef.file}`;
			const response = await fetch(url);
			if (!response.ok) return null;
			const geojson = await response.json();
			if (!geojson || !Array.isArray(geojson.features)) return null;

			const feature = geojson.features.find((candidate) => {
				if (!candidate || !candidate.properties) return false;
				const props = candidate.properties;
				const featureId = props[regionRef.idField] || props.GISCO_ID || candidate.id;
				return String(featureId) === String(regionRef.featureId);
			});

			if (!feature || !feature.geometry) return null;
			const esriGeometry = this.geoJsonGeometryToEsriPolygon(feature.geometry);
			if (!esriGeometry) return null;

			this.$set(this.clcGeometryCacheByKey, cacheKey, esriGeometry);
			return esriGeometry;
		},
		async queryClcDistributionForRegion(selection, level) {
			const cacheKey = this.getSelectionCacheKey(selection, level);
			if (!cacheKey) return null;
			if (this.clcStatsCacheByKey[cacheKey]) return this.clcStatsCacheByKey[cacheKey];

			const geometry = await this.resolveRegionGeometry(selection, level);
			if (!geometry) return null;

			const outStatistics = [{
				statisticType: "sum",
				onStatisticField: "Area_Ha",
				outStatisticFieldName: "total_area_ha",
			}];

			const body = new URLSearchParams({
				f: "json",
				// Exclude CLC water and marine classes (5xx) for land-cover policy summaries.
				where: "Code_18 NOT LIKE '5%'",
				geometry: JSON.stringify(geometry),
				geometryType: "esriGeometryPolygon",
				inSR: "4326",
				spatialRel: "esriSpatialRelIntersects",
				outStatistics: JSON.stringify(outStatistics),
				groupByFieldsForStatistics: "Code_18",
				returnGeometry: "false",
			});

			const response = await fetch("https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_LAEA/MapServer/0/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				},
				body: body.toString(),
			});

			if (!response.ok) return null;
			const data = await response.json();
			if (!data || !Array.isArray(data.features)) return null;

			const rows = data.features
				.map((feature) => {
					const attrs = feature && feature.attributes ? feature.attributes : {};
					const code = attrs.Code_18 != null ? String(attrs.Code_18) : null;
					const areaHa = Number(attrs.total_area_ha || 0);
					return { code, areaHa };
				})
				.filter((row) => row.code && row.areaHa > 0)
				.sort((a, b) => b.areaHa - a.areaHa);

			this.$set(this.clcStatsCacheByKey, cacheKey, rows);
			return rows;
		},
		async loadRegionalStats() {
			if (!this.opening) return;
			if (!this.hasPrimaryTarget) {
				this.primaryStats = null;
				this.compareStats = null;
				this.clcPrimaryRawRows = null;
				this.clcCompareRawRows = null;
				this.errorMessage = null;
				this.clcErrorMessage = null;
				return;
			}

			this.isLoading = true;
			this.errorMessage = null;
			this.clcErrorMessage = null;

			try {
				const country = (this.policySelection && this.policySelection.country ? String(this.policySelection.country) : '').toUpperCase();
				const hasCountryLpisStats = await this.hasCountryLpisStats(country);

				const primaryPromise = hasCountryLpisStats
					? this.fetchRegionStats(this.policySelection, this.policyStatsLevel)
					: Promise.resolve(null);
				const comparePromise = (hasCountryLpisStats && this.showCompare)
					? this.fetchRegionStats(this.policyCompareSelection, this.policyCompareStatsLevel)
					: Promise.resolve(null);
				const clcPrimaryPromise = this.queryClcDistributionForRegion(this.policySelection, this.policyStatsLevel);
				const clcComparePromise = this.showCompare
					? this.queryClcDistributionForRegion(this.policyCompareSelection, this.policyCompareStatsLevel)
					: Promise.resolve(null);

				const [primary, compare, clcPrimary, clcCompare] = await Promise.all([
					primaryPromise,
					comparePromise,
					clcPrimaryPromise,
					clcComparePromise,
				]);

				this.primaryStats = primary;
				this.compareStats = compare;
				this.clcPrimaryRawRows = clcPrimary;
				this.clcCompareRawRows = clcCompare;

				if (hasCountryLpisStats && !primary) {
					this.errorMessage = "No LPIS stats found for selected region.";
				}
				if (!clcPrimary || !clcPrimary.length) {
					this.clcErrorMessage = "CLC regional stats unavailable for selected region.";
				}
			} catch (error) {
				this.primaryStats = null;
				this.compareStats = null;
				this.clcPrimaryRawRows = null;
				this.clcCompareRawRows = null;
				this.errorMessage = "Failed loading LPIS regional stats.";
				this.clcErrorMessage = "Failed loading CLC regional stats.";
			} finally {
				this.isLoading = false;
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
		async fetchRegionStats(selection, level) {
			if (!selection || !level) return null;
			const country = (selection.country || "").toUpperCase();
			if (!country) return null;
				if (!(await this.hasCountryLpisStats(country))) return null;

			const baseUrl = "https://raw.githubusercontent.com/euraf/eu-lpis-stats/refs/heads/master/v1/";
			let url = "";

			if (level === "country") {
				url = `${baseUrl}${country}/${country}.json`;
			}
			if (level === "nuts1" || level === "nuts2" || level === "nuts3") {
				const id = selection[level];
				if (!id) return null;
				url = `${baseUrl}${country}/${id}.json`;
			}
			if (level === "lau") {
				const lauId = selection.lau;
				const nuts3Id = selection.nuts3;
				if (!lauId || !nuts3Id) return null;
				url = `${baseUrl}${country}/${nuts3Id}_lau.json`;
			}

			if (!url) return null;
			const response = await fetch(url);
			if (!response.ok) return null;
			const data = await response.json();
			if (level !== "lau") return data;
			if (!data || !data.lau) return null;
			return data.lau[selection.lau] || null;
		},
	},
};
</script>
