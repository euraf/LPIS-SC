<template>
	<div>
		<div v-if="!anySelectedFeature" class="accordion-note">Select a parcel on the map.</div>
		<div v-else class="insight-cards">
			<div class="insight-card">
				<span class="card-label">Total Area</span>
				<span class="card-value">{{ parcelOverview.totalArea }}</span>
			</div>
			<div class="insight-card">
				<span class="card-label">Nr. of Parcels</span>
				<span class="card-value">{{ parcelOverview.nrParcels }}</span>
			</div>
			<div class="insight-card">
				<span class="card-label">Country</span>
				<span class="card-value">{{ parcelOverview.country }}</span>
			</div>
			<div class="insight-card">
				<span class="card-label">NUTS2 Region</span>
				<span class="card-value">{{ parcelOverview.nuts2 }}</span>
			</div>
			<div class="insight-card">
				<span class="card-label">NUTS3 Region</span>
				<span class="card-value">{{ parcelOverview.nuts3 }}</span>
			</div>
			<div class="insight-card">
				<span class="card-label">LAU Region</span>
				<span class="card-value">{{ parcelOverview.lau }}</span>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: {
		selectedFeaturesAll: {
			type: Array,
			default: function() { return []; },
		},
		layers: {
			type: Object,
			required: true,
		},
		adminBoundaryLayers: {
			type: Object,
			default: function() { return {}; },
		},
		nutsLauHierarchy: {
			type: Object,
			default: function() { return {}; },
		},
		opening: {
			type: Boolean,
			requried: true,
		},
	},
	computed: {
		anySelectedFeature() {
			return this.selectedFeaturesAll.length > 0;
		},
		parcelOverview() {
			const all = this.selectedFeaturesAll;
			if (!all.length) return null;

			let totalArea = 0;
			const countryCodes = new Set();
			for (const sf of all) {
				const layer = this.layers[sf.layerId];
				if (layer && typeof layer.getFeatureAreaHa === 'function') totalArea += layer.getFeatureAreaHa(sf.feature) || 0;
				else if (sf.area) totalArea += sf.area;
				if (layer && layer.country_code) countryCodes.add(layer.country_code);
			}

			const nuts2Map = new Map();
			const nuts3Map = new Map();
			const lauMap = new Map();

			for (const sf of all) {
				const lonLat = this.getFeatureCentroidLonLat(sf);
				if (!lonLat) continue;
				const coord3857 = ol.proj.transform(lonLat, 'EPSG:4326', 'EPSG:3857');

				const lauFeature = this.findFeatureAtCoord(coord3857, 'lau');
				if (!lauFeature) continue;

				const lauCode = lauFeature.get('GISCO_ID') || lauFeature.get('LAU_ID');
				const lauName = lauFeature.get('LAU_NAME');
				if (lauCode) lauMap.set(lauCode, { code: lauCode, name: lauName || null });

				if (!lauCode) continue;
				const codes = this.findNutsCodesFromLauId(lauCode);
				if (!codes) continue;

				if (codes.nuts3 && !nuts3Map.has(codes.nuts3)) {
					const f = this.findFeatureByNutsId(codes.nuts3, 'nuts3');
					nuts3Map.set(codes.nuts3, { code: codes.nuts3, name: f ? f.get('NUTS_NAME') : null });
				}
				if (codes.nuts2 && !nuts2Map.has(codes.nuts2)) {
					const f = this.findFeatureByNutsId(codes.nuts2, 'nuts2');
					nuts2Map.set(codes.nuts2, { code: codes.nuts2, name: f ? f.get('NUTS_NAME') : null });
				}
			}

			const sort = map => Array.from(map.values()).sort((a, b) => {
				const ak = (a.code || a.name || '').toLowerCase();
				const bk = (b.code || b.name || '').toLowerCase();
				return ak < bk ? -1 : ak > bk ? 1 : 0;
			});

			return {
				totalArea: totalArea > 0 ? totalArea.toFixed(2) + ' ha' : '—',
				nrParcels: all.length,
				country: countryCodes.size ? Array.from(countryCodes).join(', ') : '—',
				nuts2: this.formatRegionSummary(sort(nuts2Map)),
				nuts3: this.formatRegionSummary(sort(nuts3Map)),
				lau:   this.formatRegionSummary(sort(lauMap)),
			};
		},
	},
	methods: {
		getFeatureCentroidLonLat(featureWrapper) {
			if (!featureWrapper || !featureWrapper.feature) return null;
			try {
				const feature = featureWrapper.feature;
				const gj = new ol.format.GeoJSON().writeFeatureObject(
					typeof feature.getId === 'function'
						? feature
						: new ol.format.GeoJSON().readFeature(feature, { dataProjection: 'EPSG:3857', featureProjection: 'EPSG:4326' }),
					{ featureProjection: featureWrapper.projection || 'EPSG:3857', dataProjection: 'EPSG:4326' }
				);
				const centroid = turf.centroid(gj);
				const coords = centroid && centroid.geometry ? centroid.geometry.coordinates : null;
				if (!coords || coords.length !== 2) return null;
				return coords;
			} catch (_) { return null; }
		},
		findFeatureAtCoord(coord3857, level) {
			for (const entry of Object.values(this.adminBoundaryLayers)) {
				if (!entry || !entry.loaded || entry.level !== level) continue;
				const hits = entry.layer.getSource().getFeaturesAtCoordinate(coord3857);
				if (hits.length) return hits[0];
			}
			return null;
		},
		findFeatureByNutsId(nutsId, level) {
			for (const entry of Object.values(this.adminBoundaryLayers)) {
				if (!entry || !entry.loaded || entry.level !== level) continue;
				const f = entry.layer.getSource().getFeatures().find(f => f.get('NUTS_ID') === nutsId);
				if (f) return f;
			}
			return null;
		},
		findNutsCodesFromLauId(lauId) {
			const H = this.nutsLauHierarchy;
			if (!H || !H.nuts0) return null;
			const cc = lauId.split('_')[0];
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
		},
		formatRegionSummary(regions) {
			if (!Array.isArray(regions) || !regions.length) return '—';
			const formatted = regions.map(r => {
				if (r.code && r.name) return r.code + ' ' + r.name;
				if (r.code) return r.code;
				return r.name;
			});
			if (formatted.length <= 3) return formatted.join(', ');
			return formatted.slice(0, 3).join(', ') + ' (+' + (formatted.length - 3) + ' more)';
		},
	},
};
</script>
