<template>
	<aside class="farm-left-panel" :class="{ 'policy-layers-panel': isPolicyMaker }">
		<div class="panel-title-row">
			<h3>Data Layers</h3>
			<span>{{ profileTitle }} Mode</span>
		</div>
		<div class="indicator-accordion layer-accordion">
			<div
				class="accordion-section"
				v-if="Object.keys(lpisLayers).length"
				:class="{ 'is-open': leftLayerAccordion.lpis }"
			>
				<button class="accordion-header" type="button" @click="$emit('toggle-left-layer-accordion', 'lpis')">
					<span class="accordion-icon">🌾</span>
					<span class="accordion-title">LPIS Layers</span>
					<span class="accordion-chevron">
						<i class="fa fa-chevron-down"></i>
					</span>
				</button>
				<div class="accordion-body">
					<div class="layer-group layer-group--accordion">
						<ul>
							<li v-for="layer in lpisLayers" :key="layer.id">
								<span
									class="flag"
									:class="'flag-' + layer.country_code.toLowerCase()"
									:aria-label="layer.country_code"
								></span>
								<component
									:is="layer.type === 'MVT' ? 'layer-mvt' : 'layer-wfs'"
									:layer_id="layer.id"
									:layer_props="layer"
									:map-instance="mapInstance"
								></component>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.indicator }">
				<button class="accordion-header" type="button" @click="$emit('toggle-left-layer-accordion', 'indicator')">
					<span class="accordion-icon">📊</span>
					<span class="accordion-title">Indicator Layers</span>
					<span class="accordion-chevron">
						<i class="fa fa-chevron-down"></i>
					</span>
				</button>
				<div class="accordion-body">
					<div class="layer-group layer-group--accordion">
						<ul>
							<li v-if="layers['tree_cover_density_2021']">
								<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
								<layer-wms :layer_id="'tree_cover_density_2021'" :layer_props="layers['tree_cover_density_2021']" :map-instance="mapInstance"></layer-wms>
							</li>
							<li v-if="layers['jrc_gfc_2020_v2']">
								<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
								<layer-wms :layer_id="'jrc_gfc_2020_v2'" :layer_props="layers['jrc_gfc_2020_v2']" :map-instance="mapInstance"></layer-wms>
							</li>
							<li v-if="layers['woody_vegetation_layer_2021']">
								<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
								<layer-wms :layer_id="'woody_vegetation_layer_2021'" :layer_props="layers['woody_vegetation_layer_2021']" :map-instance="mapInstance"></layer-wms>
							</li>
							<li v-if="layers['small_woody_features_2021']">
								<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
								<layer-wms :layer_id="'small_woody_features_2021'" :layer_props="layers['small_woody_features_2021']" :map-instance="mapInstance"></layer-wms>
							</li>
							<li v-if="layers['clc_2018']">
								<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-map"></i></span>
								<layer-wms :layer_id="'clc_2018'" :layer_props="layers['clc_2018']" :map-instance="mapInstance"></layer-wms>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.orthophoto }">
				<button class="accordion-header" type="button" @click="$emit('toggle-left-layer-accordion', 'orthophoto')">
					<span class="accordion-icon">🛰️</span>
					<span class="accordion-title">Orthophoto Layers</span>
					<span class="accordion-chevron">
						<i class="fa fa-chevron-down"></i>
					</span>
				</button>
				<div class="accordion-body">
					<div class="layer-group layer-group--accordion">
						<ul>
							<li v-for="layer in orthophotoLayers" :key="layer.id">
								<span
									class="flag"
									:class="'flag-' + layer.country_code.toLowerCase()"
									:aria-label="layer.country_code"
								></span>
								<component
									:is="layer.type === 'tileXYZ' ? 'layer-tilexyz' : 'layer-wms'"
									:layer_id="layer.id"
									:layer_props="layer"
									:map-instance="mapInstance"
								></component>
							</li>
							<li>
								<span><i class="fa-solid fa-earth-europe"></i></span>
								<div class="form-check">
									<input
										id="orthophoto-world-imagery"
										class="form-check-input"
										type="checkbox"
										:checked="activeBasemap === 'imagery'"
										@change="$emit('set-orthophoto-basemap', $event.target.checked)"
									>
									<label class="form-check-label" for="orthophoto-world-imagery">World Imagery (Esri)</label>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.administrative }">
				<button class="accordion-header" type="button" @click="$emit('toggle-left-layer-accordion', 'administrative')">
					<span class="accordion-icon">🧭</span>
					<span class="accordion-title">Administrative Layers</span>
					<span class="accordion-chevron">
						<i class="fa fa-chevron-down"></i>
					</span>
				</button>
				<div class="accordion-body">
					<div class="layer-group layer-group--accordion">
						<ul>
							<li>
								<span class="layer-dot" style="background-color: rgba(50,50,50,0.9)"></span>
								<span class="layer-label">NUTS1 <small>(zoom ≥ 5)</small></span>
							</li>
							<li>
								<span class="layer-dot" style="background-color: rgba(60,60,60,0.75)"></span>
								<span class="layer-label">NUTS2 <small>(zoom ≥ 7)</small></span>
							</li>
							<li>
								<span class="layer-dot" style="background-color: rgba(80,80,80,0.6)"></span>
								<span class="layer-label">NUTS3 <small>(zoom ≥ 9)</small></span>
							</li>
							<li>
								<span class="layer-dot" style="background-color: rgba(100,100,100,0.5)"></span>
								<span class="layer-label">LAU <small>(zoom ≥ 11)</small></span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</aside>
</template>

<script>
module.exports = {
	props: {
		profileTitle: {
			type: String,
			required: true,
		},
		isPolicyMaker: {
			type: Boolean,
			default: false,
		},
		layers: {
			type: Object,
			required: true,
		},
		lpisLayers: {
			type: Object,
			required: true,
		},
		orthophotoLayers: {
			type: Object,
			required: true,
		},
		mapInstance: {
			type: Object,
			default: null,
		},
		leftLayerAccordion: {
			type: Object,
			required: true,
		},
		activeBasemap: {
			type: String,
			required: true,
		},
	},
};
</script>
