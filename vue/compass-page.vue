<template>
	<div class="compass-page">
		<div class="compass-shell farmer-shell">
			<header class="compass-ui-header">
				<div class="compass-branding">
					<div class="brand-mark compass-brand-mark">
						<span class="brand-ring"><i class="fa fa-compass"></i></span>
						<span class="brand-copy">LPIS-SC</span>
					</div>
					<label class="compass-title-select-shell mb-0" for="profile-select">
						<select
							id="profile-select"
							class="compass-title-select"
							v-model="activeProfile"
							@change="setProfile(activeProfile)"
						>
							<option v-for="profile in profileDefs" :key="profile.id" :value="profile.id">
								{{ profile.title }} View
							</option>
						</select>
					</label>
				</div>
				<div class="compass-top-actions">
					<!--button class="tour-button" type="button">Guided Tour</button-->
					<div class="compass-menu-links">
						<a class="header-link-button" href="#" @click.prevent="goToLandingSection('about')">About</a>
						<a
							class="header-link-button header-link-button-prominent"
							href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog"
							target="_blank"
							rel="noopener noreferrer"
						>Feedback &amp; Ideas</a>
					</div>
				</div>
			</header>

			<section class="farmer-layout" :class="{ 'policy-layout': isPolicyMaker }">
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
							<button class="accordion-header" type="button" @click="toggleLeftLayerAccordion('lpis')">
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
											<component :is="layer.type === 'MVT' ? 'layer-mvt' : 'layer-wfs'" :layer_id="layer.id" :layer_props="layer"></component>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.indicator }">
							<button class="accordion-header" type="button" @click="toggleLeftLayerAccordion('indicator')">
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
											<layer-wms :layer_id="'tree_cover_density_2021'" :layer_props="layers['tree_cover_density_2021']"></layer-wms>
										</li>
										<li v-if="layers['jrc_gfc_2020_v2']">
											<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
											<layer-wms :layer_id="'jrc_gfc_2020_v2'" :layer_props="layers['jrc_gfc_2020_v2']"></layer-wms>
										</li>
										<li v-if="layers['woody_vegetation_layer_2021']">
											<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
											<layer-wms :layer_id="'woody_vegetation_layer_2021'" :layer_props="layers['woody_vegetation_layer_2021']"></layer-wms>
										</li>
										<li v-if="layers['small_woody_features_2021']">
											<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-tree"></i></span>
											<layer-wms :layer_id="'small_woody_features_2021'" :layer_props="layers['small_woody_features_2021']"></layer-wms>
										</li>
										<li v-if="layers['clc_2018']">
											<span class="layer-symbol" aria-hidden="true"><i class="fa-solid fa-map"></i></span>
											<layer-wms :layer_id="'clc_2018'" :layer_props="layers['clc_2018']"></layer-wms>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.orthophoto }">
							<button class="accordion-header" type="button" @click="toggleLeftLayerAccordion('orthophoto')">
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
													@change="setOrthophotoBasemap($event.target.checked)"
												>
												<label class="form-check-label" for="orthophoto-world-imagery">World Imagery (Esri)</label>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div class="accordion-section" :class="{ 'is-open': leftLayerAccordion.administrative }">
							<button class="accordion-header" type="button" @click="toggleLeftLayerAccordion('administrative')">
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
				<aside class="farm-right-panel policy-insights-panel" v-if="isPolicyMaker">
						<div class="panel-title-row">
							<h3>{{ subjectTitle }}</h3>
							<span>{{ profileTitle }} Mode</span>
						</div>
						<div class="policy-picker-shell">
							<div class="policy-breadcrumb" v-if="policyBreadcrumbParts.length">
								<span
									v-for="(part, idx) in policyBreadcrumbParts"
									:key="part.level"
									class="policy-breadcrumb-part"
								>
									<span v-if="idx > 0" class="policy-breadcrumb-sep">&gt;</span>
									<span>{{ part.label }}</span>
								</span>
							</div>
							<div class="policy-picker-grid">
								<label>
									{{ policyPickerLabel }}
									<select v-model="policyPickerValue" @change="onPolicySelectionChange(policyPickerLevel)">
										<option value="">Select {{ policyPickerLabel }}</option>
										<option v-for="item in policyPickerOptions" :key="item.id" :value="item.id">{{ item.label }}</option>
									</select>
								</label>
							</div>
							<div class="policy-picker-actions mt-2">
								<button
									type="button"
									class="tour-button"
									:disabled="!policyCanShowStats"
									@click="showPolicyStats"
								>
									Show {{ policyPickerLabel }} stats
								</button>
								<!-- needs further work button
									type="button"
									class="tour-button"
									v-if="policyCanStartCompare"
									@click="startPolicyCompare"
								>
									Compare to other region
								</button-->
								<button
									type="button"
									class="tour-button"
									v-if="policyNextLevel"
									:disabled="!policyCanGoNext"
									@click="goToNextPolicyLevel"
								>
									Select {{ policyNextLevelLabel }}
								</button>
								<button
									type="button"
									class="tour-button"
									v-if="policyPreviousLevel"
									@click="goToPreviousPolicyLevel"
								>
									Back to {{ policyPreviousLevelLabel }}
								</button>
							</div>
							<div v-if="policyCompareEnabled" class="policy-compare-shell mt-3">
								<div class="policy-breadcrumb" v-if="policyCompareBreadcrumbParts.length">
									<span
										v-for="(part, idx) in policyCompareBreadcrumbParts"
										:key="`compare-${part.level}`"
										class="policy-breadcrumb-part"
									>
										<span v-if="idx > 0" class="policy-breadcrumb-sep">&gt;</span>
										<span>{{ part.label }}</span>
									</span>
								</div>
								<div class="policy-picker-grid">
									<label>
										Compare {{ policyComparePickerLabel }}
										<select v-model="policyComparePickerValue" @change="onPolicyCompareSelectionChange(policyComparePickerLevel)">
											<option value="">Select {{ policyComparePickerLabel }}</option>
											<option v-for="item in policyComparePickerOptions" :key="`compare-${item.id}`" :value="item.id">{{ item.label }}</option>
										</select>
									</label>
								</div>
								<div class="policy-picker-actions mt-2">
									<!-- needs further work button
										type="button"
										class="tour-button"
										:disabled="!policyCompareCanShow"
										@click="showPolicyComparison"
									>
										Show comparison
									</button-->
									<button
										type="button"
										class="tour-button"
										v-if="policyCompareNextLevel"
										:disabled="!policyCompareCanGoNext"
										@click="goToNextPolicyCompareLevel"
									>
										Select {{ policyCompareNextLevelLabel }}
									</button>
									<button
										type="button"
										class="tour-button"
										v-if="policyComparePreviousLevel"
										@click="goToPreviousPolicyCompareLevel"
									>
										Back to {{ policyComparePreviousLevelLabel }}
									</button>
								</div>
							</div>
						</div>

						<div class="indicator-accordion">
							<div
								class="accordion-section"
								v-for="category in policyIndicatorCategories"
								:key="category.id"
								:class="{ 'is-open': category.open }"
							>
								<button class="accordion-header" type="button" @click="toggleCategory(category.id)">
									<span class="accordion-icon">{{ category.icon }}</span>
									<span class="accordion-title">{{ category.title }}</span>
									<span class="accordion-chevron">
										<i class="fa fa-chevron-down"></i>
									</span>
								</button>

								<div class="accordion-body tcd-panel" v-if="category.id === 'treecover'">
									<tcd-panel
										:opening="category.open"
										mode="policymaker"
										:any-selected-feature="anySelectedFeature"
										:selected-features-all="selectedFeaturesAll"
										:nuts-lau-hierarchy="nutsLauHierarchy"
										:policy-stats-level="policyStatsLevel"
										:policy-selection="policySelection"
									/>
								</div>

								<div class="accordion-body tcd-panel" v-if="category.id === 'forestcover'">
									<forest-cover-panel
										:opening="category.open"
										mode="policymaker"
										:any-selected-feature="anySelectedFeature"
										:selected-features-all="selectedFeaturesAll"
										:nuts-lau-hierarchy="nutsLauHierarchy"
										:policy-stats-level="policyStatsLevel"
										:policy-selection="policySelection"
									/>
								</div>

								<div class="accordion-body tcd-panel" v-if="category.id === 'woodyvegetation'">
									<woody-vegetation-panel
										:opening="category.open"
										mode="policymaker"
										:any-selected-feature="anySelectedFeature"
										:selected-features-all="selectedFeaturesAll"
										:nuts-lau-hierarchy="nutsLauHierarchy"
										:policy-stats-level="policyStatsLevel"
										:policy-selection="policySelection"
									/>
								</div>

								<div class="accordion-body lulc-panel" v-if="category.id === 'lulc'">
									<policy-lulc-panel
										:opening="category.open"
										:layers="layers"
										:nuts-lau-hierarchy="nutsLauHierarchy"
										:policy-stats-level="policyStatsLevel"
										:policy-selection="policySelection"
										:policy-compare-stats-level="policyCompareStatsLevel"
										:policy-compare-selection="policyCompareSelection"
									/>
								</div>

							</div>
						</div>
				</aside>

				<div class="farm-map-stage">
					<div class="basemap-switcher" v-if="basemapOptions.length">
						<label for="basemap-select">Basemap</label>
						<select id="basemap-select" v-model="activeBasemap" @change="applyBasemap(activeBasemap)">
							<option v-for="item in basemapOptions" :key="item.key" :value="item.key">
								{{ item.label }}
							</option>
						</select>
						<button type="button" class="attribution-toggle-btn" @click="showAttribution = !showAttribution">
							{{ showAttribution ? 'Hide attribution' : 'Show attribution' }}
						</button>
					</div>
					<div class="farm-map-canvas" :class="{ 'show-attribution': showAttribution }">
						<div id="compass-map" class="compass-map"></div>
						<div class="map-zoom-badge" aria-live="polite">
							Zoom {{ currentMapZoomLabel }}
						</div>
					</div>
				</div>

				<aside v-if="isFarmer || isResearcher" class="farm-right-panel">
					<div class="panel-title-row">
						<h3>{{ subjectTitle }}</h3>
						<span>{{ subjectId }}</span>
					</div>
					<div v-if="isFarmer" class="mt-2">
						<button
							type="button"
							class="tour-button"
							:disabled="!fullFarmAction.available"
							:title="fullFarmAction.available ? '' : fullFarmAction.disabledHint"
							@click="onSelectFullFarmClick"
						>{{ fullFarmAction.available
							? (fullFarmAction.isFull ? 'Full farm retrieved' : 'Select full farm')
							: fullFarmAction.disabledLabel }}</button>
					</div>

					<div class="indicator-accordion">
						<div
							class="accordion-section"
							v-for="category in indicatorCategories"
							:key="category.id"
							:class="{ 'is-open': category.open }"
						>
							<button class="accordion-header" type="button" @click="toggleCategory(category.id)">
								<span class="accordion-icon">{{ category.icon }}</span>
								<span class="accordion-title">{{ category.title }}</span>
								<span class="accordion-chevron">
									<i class="fa fa-chevron-down"></i>
								</span>
							</button>

							<div class="accordion-body" v-if="category.id === 'parcel'">
								<parcel-overview-panel
									:opening="category.open"
									:any-selected-feature="anySelectedFeature"
									:selected-features-all="selectedFeaturesAll"
									:layers="layers"
									:admin-boundary-layers="adminBoundaryLayers"
									:nuts-lau-hierarchy="nutsLauHierarchy"
								/>
							</div>

							<div class="accordion-body tcd-panel" v-if="category.id === 'treecover'">
								<tcd-panel
									:opening="category.open"
									mode="farmer"
									:any-selected-feature="anySelectedFeature"
									:selected-features-all="selectedFeaturesAll"
								/>
							</div>

							<div class="accordion-body tcd-panel" v-if="category.id === 'forestcover'">
								<forest-cover-panel
									:opening="category.open"
									mode="farmer"
									:any-selected-feature="anySelectedFeature"
									:selected-features-all="selectedFeaturesAll"
								/>
							</div>

							<div class="accordion-body tcd-panel" v-if="category.id === 'woodyvegetation'">
								<woody-vegetation-panel
									:opening="category.open"
									mode="farmer"
									:any-selected-feature="anySelectedFeature"
									:selected-features-all="selectedFeaturesAll"
								/>
							</div>

							<div class="accordion-body lulc-panel" v-if="category.id === 'lulc'">
								<lulc-panel
									:opening="category.open"
									:any-selected-feature="anySelectedFeature"
									:selected-features-all="selectedFeaturesAll"
									:layers="layers"
								/>
							</div>

						</div>
					</div>
				</aside>
			</section>

			<footer class="compass-footer-note">
				<!--a class="footer-latest-button" href="#" @click.prevent="goToLandingSection('latest-improvements')">
					Latest improvements
				</a-->
				<div class="compass-footer-partner">
					<a href="https://mvarc.eu/" target="_blank" rel="noopener noreferrer"><img src="img/mvarc_logo.png" alt="MVARC agroecology" class="compass-footer-partner-logo" /></a>
				</div>
				<p class="compass-funding-note">
					The technical implementation of this tool is led by <a href="https://mvarc.eu/" target="_blank" rel="noopener noreferrer">MVARC</a> within the EU project <a href="https://digitaf.eu/" target="_blank" rel="noopener noreferrer">DigitAF</a> (Grant agreement n° 101059794), funded by the European Union’s Horizon Europe research and innovation programme.
				</p>
				<div class="compass-footer-partner">
					<a href="https://digitaf.eu/" target="_blank" rel="noopener noreferrer"><img src="img/logoDigitAF_HR_horiz.png" alt="DigitAF" class="compass-footer-partner-logo" /></a>
				</div>
			</footer>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
            layers: {},
            map: null,
			currentMapZoom: null,
			showAttribution: false,
			countriesLayer: null,
			visibleCountries: [],
			baseLayers: {},
			activeBasemap: "osm",
			basemapOptions: [
				{ key: "osm", label: "Street" },
				{ key: "topo", label: "Topographic" },
				{ key: "imagery", label: "Aerial" },
			],
			nutsLauHierarchy: {},
			adminBoundaryLayers: {},
			policyHighlightLayer: null,
			policyHighlightSource: null,
			policyFeatureCacheByKey: {},
			policyHighlightRequestId: 0,
			policySelection: {
				country: "",
				nuts1: "",
				nuts2: "",
				nuts3: "",
				lau: "",
			},
			policyCompareSelection: {
				country: "",
				nuts1: "",
				nuts2: "",
				nuts3: "",
				lau: "",
			},
			policyPickerLevel: "country",
			policyStatsLevel: "",
			policyCompareEnabled: false,
			policyComparePickerLevel: "country",
			policyCompareStatsLevel: "",
			policyLastZoomKey: "",
			policyOptionNames: {
				country: {},
				nuts1: {},
				nuts2: {},
				nuts3: {},
				lau: {},
			},
			policyNameCacheByUrl: {},

			indicatorCategories: [
				{
					id: 'parcel',
					title: 'Parcel Overview',
					icon: '🌾',
					open: true,
                    layers: []
				},
				{
					id: 'lulc',
					title: 'Land Use & Land Cover',
					icon: '🗺️',
					open: false,
                    layers: [ 'clc_2018' ]
				},
				{
					id: 'treecover',
					title: 'Tree Cover Density',
					icon: '🌳',
					open: false,
                    layers: [ 'tree_cover_density_2021' ]
				},
				{
					id: 'forestcover',
					title: 'Forest / Non-forest',
					icon: '🌲',
					open: false,
                    layers: [ 'jrc_gfc_2020_v2' ]
				},
				{
					id: 'woodyvegetation',
					title: 'Woody Vegetation',
					icon: '🌿',
					open: false,
                    layers: [ 'woody_vegetation_layer_2021', 'small_woody_features_2021' ]
				},
			],
			leftLayerAccordion: {
				lpis: true,
				indicator: true,
				administrative: false,
				orthophoto: false,
			},
			fullFarmActionVersion: 0,
			onLayerApiReadyHandler: null,
        }
    },
    created() {
		this.layers = MAP_LAYERS;

        const validProfiles = Object.keys(this.profileDefs);
		const validBasemaps = this.basemapOptions.map((item) => item.key);
		const queryProfile = this.$route.query.profile;
		const queryBasemap = this.$route.query.basemap;
		const storedProfile = localStorage.getItem("lpis_sc_profile");

		const queryCandidate = validProfiles.includes(queryProfile) ? queryProfile : null;
		const basemapCandidate = validBasemaps.includes(queryBasemap) ? queryBasemap : null;
		const storedCandidate = validProfiles.includes(storedProfile) ? storedProfile : null;
		const resolvedProfile = queryCandidate || storedCandidate || "farmer";
		const resolvedBasemap = basemapCandidate || "osm";

		this.activeProfile = resolvedProfile;
		this.activeBasemap = resolvedBasemap;
		this.applyPolicyStateFromQuery();

        // Keep profile and basemap in URL for shareable, explicit state.
		if (queryCandidate !== resolvedProfile || basemapCandidate !== resolvedBasemap) {
			this.$router.replace({
				name: "compass",
				query: {
					...this.$route.query,
					profile: resolvedProfile,
					basemap: resolvedBasemap,
				},
			});
		}
    },
	mounted() {
		this.$nextTick(() => {
			this.loadNutsLauHierarchy();
			this.setupMap();
		});
		this.onLayerApiReadyHandler = () => {
			this.fullFarmActionVersion += 1;
		};
		VueBus.$on('layerApiReady', this.onLayerApiReadyHandler);
		window.addEventListener("resize", this.refreshMapSize);
	},
	beforeDestroy() {
		if (this.onLayerApiReadyHandler) {
			VueBus.$off('layerApiReady', this.onLayerApiReadyHandler);
		}
		window.removeEventListener("resize", this.refreshMapSize);
	},
	watch: {
		visibleCountries() {
			this.refreshAdminBoundaries();
		},
		nutsLauHierarchy() {
			this.refreshAdminBoundaries();
		},
		activeProfile(profile) {
			if (profile === "policymaker") {
				this.initPolicySelection();
			}
			this.updatePolicySelectionHighlight();
			this.persistPolicyQuery();
		},
		policySelection: {
			deep: true,
			handler() {
				this.updatePolicySelectionHighlight();
				this.persistPolicyQuery();
			},
		},
		policyCompareSelection: {
			deep: true,
			handler() {
				this.updatePolicySelectionHighlight();
				this.persistPolicyQuery();
			},
		},
		policyStatsLevel() {
			this.updatePolicySelectionHighlight();
			this.persistPolicyQuery();
		},
		policyCompareEnabled() {
			this.updatePolicySelectionHighlight();
			this.persistPolicyQuery();
		},
		policyCompareStatsLevel() {
			this.updatePolicySelectionHighlight();
			this.persistPolicyQuery();
		},
	},
    computed: {
		profileDefs() {
			return this.$root.$data.profiles
		},
		activeProfile: {
			get: function() {
			return this.$root.$data.selectedProfile
			},
			set: function(profile) {
				this.$set(this.$root.$data, "selectedProfile", profile)
			}
		},
		profileData() {
			return this.profileDefs[this.activeProfile] || this.profileDefs.farmer;
		},
		profileTitle() {
			return this.profileData.title;
		},
		currentMapZoomLabel() {
			if (typeof this.currentMapZoom !== "number") return "—";
			return Math.round(this.currentMapZoom * 100) / 100;
		},
		isResearcher() {
			return this.activeProfile === "researcher";
		},
		isFarmer() {
			return this.activeProfile === "farmer";
		},
		isPolicyMaker() {
			return this.activeProfile === "policymaker";
		},
		policyLevelOrder() {
			return ["country", "nuts1", "nuts2", "nuts3", "lau"];
		},
		policyPickerLabel() {
			return this.getPolicyLevelLabel(this.policyPickerLevel);
		},
		policyPickerValue: {
			get: function() {
				return this.policySelection[this.policyPickerLevel] || "";
			},
			set: function(value) {
				this.$set(this.policySelection, this.policyPickerLevel, value || "");
			}
		},
		policyPickerOptions() {
			if (this.policyPickerLevel === "country") return this.policyCountryOptions;
			if (this.policyPickerLevel === "nuts1") return this.policyNuts1Options;
			if (this.policyPickerLevel === "nuts2") return this.policyNuts2Options;
			if (this.policyPickerLevel === "nuts3") return this.policyNuts3Options;
			if (this.policyPickerLevel === "lau") return this.policyLauOptions;
			return [];
		},
		policyCanShowStats() {
			return !!this.policyPickerValue;
		},
		policyNextLevel() {
			const idx = this.policyLevelOrder.indexOf(this.policyPickerLevel);
			if (idx < 0 || idx === this.policyLevelOrder.length - 1) return "";
			return this.policyLevelOrder[idx + 1];
		},
		policyNextLevelLabel() {
			if (!this.policyNextLevel) return "";
			return this.getPolicyLevelLabel(this.policyNextLevel);
		},
		policyPreviousLevel() {
			const idx = this.policyLevelOrder.indexOf(this.policyPickerLevel);
			if (idx <= 0) return "";
			return this.policyLevelOrder[idx - 1];
		},
		policyPreviousLevelLabel() {
			if (!this.policyPreviousLevel) return "";
			return this.getPolicyLevelLabel(this.policyPreviousLevel);
		},
		policyCanGoNext() {
			return !!this.policyNextLevel && !!this.policyPickerValue;
		},
		policyBreadcrumbParts() {
			const parts = [];
			for (const level of this.policyLevelOrder) {
				const id = this.policySelection[level];
				if (!id) {
					break;
				}
				parts.push({
					level,
					label: `${this.getPolicyLevelLabel(level)}: ${this.getPolicySelectedLabel(level, id)}`,
				});
			}
			return parts;
		},
		policyCanStartCompare() {
			if (!this.policyStatsLevel) return false;
			return !!this.policySelection[this.policyStatsLevel];
		},
		policyCompareLevelOrder() {
			if (!this.policyStatsLevel) {
				return ["country"];
			}
			const maxIdx = this.policyLevelOrder.indexOf(this.policyStatsLevel);
			if (maxIdx < 0) {
				return ["country"];
			}
			return this.policyLevelOrder.slice(0, maxIdx + 1);
		},
		policyComparePickerLabel() {
			return this.getPolicyLevelLabel(this.policyComparePickerLevel);
		},
		policyComparePickerValue: {
			get: function() {
				return this.policyCompareSelection[this.policyComparePickerLevel] || "";
			},
			set: function(value) {
				this.$set(this.policyCompareSelection, this.policyComparePickerLevel, value || "");
			}
		},
		policyComparePickerOptions() {
			if (this.policyComparePickerLevel === "country") return this.policyCountryOptions;
			if (this.policyComparePickerLevel === "nuts1") return this.policyCompareNuts1Options;
			if (this.policyComparePickerLevel === "nuts2") return this.policyCompareNuts2Options;
			if (this.policyComparePickerLevel === "nuts3") return this.policyCompareNuts3Options;
			if (this.policyComparePickerLevel === "lau") return this.policyCompareLauOptions;
			return [];
		},
		policyCompareNuts1Options() {
			const countryData = this.getCountryData(this.policyCompareSelection);
			if (!countryData || !countryData.nuts1) return [];
			return Object.keys(countryData.nuts1)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts1[id]) }));
		},
		policyCompareNuts2Options() {
			const nuts1Data = this.getNuts1Data(this.policyCompareSelection);
			if (!nuts1Data || !nuts1Data.nuts2) return [];
			return Object.keys(nuts1Data.nuts2)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts2[id]) }));
		},
		policyCompareNuts3Options() {
			const nuts2Data = this.getNuts2Data(this.policyCompareSelection);
			if (!nuts2Data || !nuts2Data.nuts3) return [];
			return Object.keys(nuts2Data.nuts3)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts3[id]) }));
		},
		policyCompareLauOptions() {
			const nuts3Data = this.getNuts3Data(this.policyCompareSelection);
			if (!nuts3Data) return [];
			const hierarchyIds = nuts3Data.lau ? Object.keys(nuts3Data.lau) : [];
			const loadedIds = Object.keys(this.policyOptionNames.lau);
			const optionIds = hierarchyIds.length ? hierarchyIds : loadedIds;
			if (!optionIds.length) return [];
			return optionIds
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.lau[id]) }));
		},
		policyCompareNextLevel() {
			const idx = this.policyCompareLevelOrder.indexOf(this.policyComparePickerLevel);
			if (idx < 0 || idx === this.policyCompareLevelOrder.length - 1) return "";
			return this.policyCompareLevelOrder[idx + 1];
		},
		policyCompareNextLevelLabel() {
			if (!this.policyCompareNextLevel) return "";
			return this.getPolicyLevelLabel(this.policyCompareNextLevel);
		},
		policyComparePreviousLevel() {
			const idx = this.policyCompareLevelOrder.indexOf(this.policyComparePickerLevel);
			if (idx <= 0) return "";
			return this.policyCompareLevelOrder[idx - 1];
		},
		policyComparePreviousLevelLabel() {
			if (!this.policyComparePreviousLevel) return "";
			return this.getPolicyLevelLabel(this.policyComparePreviousLevel);
		},
		policyCompareCanGoNext() {
			return !!this.policyCompareNextLevel && !!this.policyComparePickerValue;
		},
		policyCompareCanShow() {
			if (!this.policyStatsLevel) return false;
			return this.policyComparePickerLevel === this.policyStatsLevel && !!this.policyComparePickerValue;
		},
		policyCompareBreadcrumbParts() {
			const parts = [];
			for (const level of this.policyCompareLevelOrder) {
				const id = this.policyCompareSelection[level];
				if (!id) {
					break;
				}
				parts.push({
					level,
					label: `${this.getPolicyLevelLabel(level)}: ${this.getPolicySelectedLabel(level, id)}`,
				});
			}
			return parts;
		},
		policyIndicatorCategories() {
			return this.indicatorCategories.filter((category) => category.id !== "parcel");
		},
		policyCountryOptions() {
			if (!this.nutsLauHierarchy || !this.nutsLauHierarchy.nuts0) {
				return [];
			}
			return Object.keys(this.nutsLauHierarchy.nuts0)
				.filter((id) => id != 'file')
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.country[id]) }));
		},
		policyNuts1Options() {
			const countryData = this.getCountryData();
			if (!countryData || !countryData.nuts1) return [];
			return Object.keys(countryData.nuts1)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts1[id]) }));
		},
		policyNuts2Options() {
			const nuts1Data = this.getNuts1Data();
			if (!nuts1Data || !nuts1Data.nuts2) return [];
			return Object.keys(nuts1Data.nuts2)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts2[id]) }));
		},
		policyNuts3Options() {
			const nuts2Data = this.getNuts2Data();
			if (!nuts2Data || !nuts2Data.nuts3) return [];
			return Object.keys(nuts2Data.nuts3)
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.nuts3[id]) }));
		},
		policyLauOptions() {
			const nuts3Data = this.getNuts3Data();
			if (!nuts3Data) return [];
			const hierarchyIds = nuts3Data.lau ? Object.keys(nuts3Data.lau) : [];
			const loadedIds = Object.keys(this.policyOptionNames.lau);
			const optionIds = hierarchyIds.length ? hierarchyIds : loadedIds;
			if (!optionIds.length) return [];
			return optionIds
				.sort((a, b) => a.localeCompare(b))
				.map((id) => ({ id, label: this.buildPolicyOptionLabel(id, this.policyOptionNames.lau[id]) }));
		},
		lpisLayers() {
			if (!this.map || !this.countriesLayer || !this.visibleCountries.length) {
				return {};
			}
			const _this = this;
			return Object.filter(this.layers, function(x) {
				if (!['WFS', 'MVT'].includes(x.type) || !x.country_code) return false;
				if (_this.visibleCountries.includes(x.country_code)) return true;
				// hide the layer if it was visible but country is no longer in view
				if (x.show) {
					VueBus.$emit('updateLayerVisibility', x.id, false);
					x.show = false;
				}
				return false;
			});
		},
		orthophotoLayers() {
			if (!this.map || !this.countriesLayer || !this.visibleCountries.length) {
				return {};
			}
			const _this = this;
			return Object.filter(this.layers, function(x) {
				if (!x.country_code || !Array.isArray(x.layer_groups) || !x.layer_groups.includes('orthophoto')) return false;
				if (_this.visibleCountries.includes(x.country_code)) return true;
				if (x.show) {
					VueBus.$emit('updateLayerVisibility', x.id, false);
					x.show = false;
				}
				return false;
			});
		},
		subjectTitle() {
			return {
				"policymaker": "My Region",
				"farmer": "My Farm",
				"researcher": "" // TODO
			}[this.activeProfile]
		},
		farmId() {
			const layers = Object.values(this.layers || {});

			for (const layer of layers) {
				if (!layer || !Array.isArray(layer.selectedFeatures) || layer.selectedFeatures.length === 0) {
					continue;
				}

				const selectedWrapper = layer.selectedFeatures[0];
				const feature = selectedWrapper && selectedWrapper.feature;
				if (!feature || typeof feature.get !== "function") {
					continue;
				}

				if (layer.farm_id_key) {
					const key = layer.farm_id_key;
					const value = feature.get(key) ?? feature.get(String(key).toLowerCase()) ?? feature.get(String(key).toUpperCase());
					if (value != null && String(value).trim() !== "") {
						return String(value);
					}
				}

				if (layer.farmPrompt && layer.farmPrompt.farmId != null && String(layer.farmPrompt.farmId).trim() !== "") {
					return String(layer.farmPrompt.farmId);
				}
			}

			return "";
		},
		subjectId() {
			if (this.activeProfile === "researcher") {
				return ; //TODO
			}
			if (this.activeProfile === "policymaker") {
				if (!this.policyStatsLevel) {
					return "Select level";
				}
				const id = this.policySelection[this.policyStatsLevel];
				if (!id) {
					return "Select level";
				}
				if (this.policyCompareStatsLevel) {
					const compareId = this.policyCompareSelection[this.policyCompareStatsLevel];
					if (compareId) {
						return `${this.getPolicyLevelLabel(this.policyStatsLevel)}: ${id} vs ${compareId}`;
					}
				}
				return `${this.getPolicyLevelLabel(this.policyStatsLevel)}: ${id}`;
			}
			if (this.activeProfile === "farmer") {
				if (!this.anySelectedFeature) {
					return "Select parcel";
				}
				return this.farmId ? `Farm ID: ${this.farmId}` : "Farm ID unavailable";
			}
			return this.farmId ? `Farm ID: ${this.farmId}` : "";
		},
		fullFarmAction() {
			this.fullFarmActionVersion;
			const layers = Object.values(this.layers || {});
			for (const layer of layers) {
				if (!layer) {
					continue;
				}

				let state = null;
				if (typeof layer.getFullFarmActionState === 'function') {
					state = layer.getFullFarmActionState();
				} else if (layer.farmPrompt && layer.farmPrompt.farmId != null && String(layer.farmPrompt.farmId).trim() !== '') {
					state = {
						available: true,
						isFull: false,
						farmId: layer.farmPrompt.farmId
					};
				}

				if (state && state.available) {
					return {
						available: true,
						isFull: !!state.isFull,
						farmId: state.farmId,
						layerId: layer.id,
						disabledLabel: '',
						disabledHint: ''
					};
				}
			}

			const selectedLayer = layers.find(layer =>
				layer && Array.isArray(layer.selectedFeatures) && layer.selectedFeatures.length > 0
			);

			if (!selectedLayer) {
				return {
					available: false,
					isFull: false,
					farmId: null,
					layerId: null,
					disabledLabel: 'Select parcel first',
					disabledHint: 'Select a parcel to enable full-farm retrieval.'
				};
			}

			const supportsFarm = !!(selectedLayer.farm_id_key || selectedLayer.farm_id_ref);
			if (!supportsFarm) {
				return {
					available: false,
					isFull: false,
					farmId: null,
					layerId: selectedLayer.id,
					disabledLabel: 'Farm ID unavailable',
					disabledHint: 'Farm ID not available for this layer.'
				};
			}

			return {
				available: false,
				isFull: false,
				farmId: null,
				layerId: selectedLayer.id,
				disabledLabel: 'Select full farm',
				disabledHint: 'Unable to retrieve full farm for current selection.'
			};
		},
		anySelectedFeature() {
			for (const layer of Object.values(this.layers)) {
				if (layer.selectedFeatures && layer.selectedFeatures.length > 0) return true;
			}
			return false;
		},
		selectedFeaturesAll() {
			// Flat list of selected feature wrappers across all visible LPIS layers
			const result = [];
			for (const layer of Object.values(this.layers)) {
				if (['WFS', 'MVT'].includes(layer.type) && layer.show && layer.selectedFeatures) {
					result.push(...layer.selectedFeatures);
				}
			}
			return result;
		},
    },
    methods: {
		goToLandingSection(section) {
			this.$router.push({
				name: "home",
				query: { section },
			});
		},
		setProfile(profile) {
			if (!this.profileDefs[profile]) {
				return;
			}

			this.activeProfile = profile;
			localStorage.setItem("lpis_sc_profile", profile);
			this.$router.replace({
				name: "compass",
				query: {
					...this.$route.query,
					profile,
				},
			});

			if (profile === "policymaker") {
				this.initPolicySelection();
			}
		},
		ensurePolicyHighlightLayer() {
			if (!this.map || this.policyHighlightLayer) return;
			this.policyHighlightSource = new ol.source.Vector({ features: [] });
			this.policyHighlightLayer = new ol.layer.Vector({
				source: this.policyHighlightSource,
				zIndex: 70,
				style: (feature) => {
					const role = feature.get("highlightRole") || "primary";
					const color = role === "compare" ? "rgba(255, 140, 0, 1)" : "rgba(255, 210, 0, 1)";
					const fill = role === "compare" ? "rgba(255, 140, 0, 0.08)" : "rgba(255, 210, 0, 0.10)";
					return new ol.style.Style({
						stroke: new ol.style.Stroke({ color, width: 3 }),
						fill: new ol.style.Fill({ color: fill }),
					});
				},
			});
			this.map.addLayer(this.policyHighlightLayer);
		},
		clearPolicySelectionHighlight() {
			if (this.policyHighlightSource) {
				this.policyHighlightSource.clear();
			}
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
		async resolvePolicyFeature(selection, level) {
			if (!selection || !level) return null;
			const regionRef = this.getRegionFileForSelection(selection, level);
			if (!regionRef || !regionRef.file || !regionRef.featureId) return null;

			const cacheKey = `${selection.country || ""}|${level}|${regionRef.featureId}`;
			if (this.policyFeatureCacheByKey[cacheKey]) {
				return this.policyFeatureCacheByKey[cacheKey].clone();
			}

			const url = `https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/${regionRef.file}`;
			const response = await fetch(url);
			if (!response.ok) return null;
			const geojson = await response.json();
			if (!geojson || !Array.isArray(geojson.features)) return null;

			const target = geojson.features.find((feature) => {
				if (!feature || !feature.properties) return false;
				const props = feature.properties;
				const fid = props[regionRef.idField] || props.GISCO_ID || feature.id;
				return String(fid) === String(regionRef.featureId);
			});
			if (!target) return null;

			const olFeature = new ol.format.GeoJSON().readFeature(target, {
				dataProjection: "EPSG:4326",
				featureProjection: "EPSG:3857",
			});
			if (!olFeature || !olFeature.getGeometry()) return null;

			this.$set(this.policyFeatureCacheByKey, cacheKey, olFeature);
			return olFeature.clone();
		},
		getPrimaryHighlightLevel() {
			if (this.policyStatsLevel && this.policySelection[this.policyStatsLevel]) {
				return this.policyStatsLevel;
			}
			return this.inferPolicyLevelFromSelection(this.policySelection);
		},
		getCompareHighlightLevel() {
			if (!this.policyCompareEnabled) return "";
			if (this.policyCompareStatsLevel && this.policyCompareSelection[this.policyCompareStatsLevel]) {
				return this.policyCompareStatsLevel;
			}
			return this.inferPolicyLevelFromSelection(this.policyCompareSelection);
		},
		async updatePolicySelectionHighlight() {
			if (!this.map) return;
			this.ensurePolicyHighlightLayer();
			if (!this.policyHighlightSource) return;

			if (!this.isPolicyMaker) {
				this.clearPolicySelectionHighlight();
				return;
			}

			const requestId = ++this.policyHighlightRequestId;
			const features = [];

			const primaryLevel = this.getPrimaryHighlightLevel();
			if (primaryLevel) {
				const primaryFeature = await this.resolvePolicyFeature(this.policySelection, primaryLevel);
				if (requestId !== this.policyHighlightRequestId) return;
				if (primaryFeature) {
					primaryFeature.set("highlightRole", "primary");
					features.push(primaryFeature);
				}
			}

			const compareLevel = this.getCompareHighlightLevel();
			if (compareLevel) {
				const compareFeature = await this.resolvePolicyFeature(this.policyCompareSelection, compareLevel);
				if (requestId !== this.policyHighlightRequestId) return;
				if (compareFeature) {
					compareFeature.set("highlightRole", "compare");
					features.push(compareFeature);
				}
			}

			this.policyHighlightSource.clear();
			if (features.length) {
				this.policyHighlightSource.addFeatures(features);
				const nextZoomKey = this.getPolicyZoomKey(this.policySelection, primaryLevel);
				if (primaryLevel && nextZoomKey && nextZoomKey !== this.policyLastZoomKey) {
					this.policyLastZoomKey = nextZoomKey;
					this.zoomToPolicySelection(primaryLevel, this.policySelection);
				}
			}
		},
		getPolicyZoomKey(selection, level) {
			if (!level || !selection) return "";
			return `${level}:${selection[level] || ""}`;
		},
		emptyPolicySelection() {
			return {
				country: "",
				nuts1: "",
				nuts2: "",
				nuts3: "",
				lau: "",
			};
		},
		setPolicySelectionValues(targetSelection, values) {
			const next = values || this.emptyPolicySelection();
			this.$set(targetSelection, "country", next.country || "");
			this.$set(targetSelection, "nuts1", next.nuts1 || "");
			this.$set(targetSelection, "nuts2", next.nuts2 || "");
			this.$set(targetSelection, "nuts3", next.nuts3 || "");
			this.$set(targetSelection, "lau", next.lau || "");
		},
		inferPolicyLevelFromSelection(selection) {
			if (!selection) return "";
			if (selection.lau) return "lau";
			if (selection.nuts3) return "nuts3";
			if (selection.nuts2) return "nuts2";
			if (selection.nuts1) return "nuts1";
			if (selection.country) return "country";
			return "";
		},
		normalizePolicySelection(selection, level) {
			const next = this.emptyPolicySelection();
			if (!selection) return next;
			const maxIdx = this.policyLevelOrder.indexOf(level);
			if (maxIdx < 0) return next;

			next.country = selection.country || "";
			if (!next.country) return next;
			if (maxIdx >= 1) next.nuts1 = selection.nuts1 || "";
			if (maxIdx >= 2) next.nuts2 = selection.nuts2 || "";
			if (maxIdx >= 3) next.nuts3 = selection.nuts3 || "";
			if (maxIdx >= 4) next.lau = selection.lau || "";
			return next;
		},
		readPolicySelectionFromQuery(prefix) {
			return {
				country: String(this.$route.query[`${prefix}c`] || ""),
				nuts1: String(this.$route.query[`${prefix}n1`] || ""),
				nuts2: String(this.$route.query[`${prefix}n2`] || ""),
				nuts3: String(this.$route.query[`${prefix}n3`] || ""),
				lau: String(this.$route.query[`${prefix}l`] || ""),
			};
		},
		applyPolicyStateFromQuery() {
			const query = this.$route.query || {};
			const allowedLevels = this.policyLevelOrder;

			const primaryFromQuery = this.readPolicySelectionFromQuery("p");
			const inferredPrimaryLevel = this.inferPolicyLevelFromSelection(primaryFromQuery);
			const queryPrimaryLevel = String(query.psl || "");
			const primaryLevel = allowedLevels.includes(queryPrimaryLevel) ? queryPrimaryLevel : inferredPrimaryLevel;
			const primarySelection = this.normalizePolicySelection(primaryFromQuery, primaryLevel);

			this.setPolicySelectionValues(this.policySelection, primarySelection);
			this.policyStatsLevel = primaryLevel || "";
			this.policyPickerLevel = primaryLevel || "country";

			const compareFromQuery = this.readPolicySelectionFromQuery("q");
			const inferredCompareLevel = this.inferPolicyLevelFromSelection(compareFromQuery);
			const queryCompareLevel = String(query.csl || "");
			let compareLevel = allowedLevels.includes(queryCompareLevel) ? queryCompareLevel : inferredCompareLevel;
			const compareEnabledRaw = String(query.ce || "").toLowerCase();
			let compareEnabled = compareEnabledRaw === "1" || compareEnabledRaw === "true";

			if (!this.policyStatsLevel || compareLevel !== this.policyStatsLevel) {
				compareEnabled = false;
				compareLevel = "";
			}

			const compareSelection = this.normalizePolicySelection(compareFromQuery, compareLevel);
			const primaryId = this.policyStatsLevel ? (this.policySelection[this.policyStatsLevel] || "") : "";
			const compareId = compareLevel ? (compareSelection[compareLevel] || "") : "";
			if (!compareId || compareId === primaryId) {
				compareEnabled = false;
				compareLevel = "";
			}

			if (!compareEnabled) {
				this.policyCompareEnabled = false;
				this.policyCompareStatsLevel = "";
				this.policyComparePickerLevel = "country";
				this.setPolicySelectionValues(this.policyCompareSelection, this.emptyPolicySelection());
				this.preloadPolicyNamesForSelection(this.policyStatsLevel, this.policySelection);
				return;
			}

			this.policyCompareEnabled = true;
			this.policyCompareStatsLevel = compareLevel;
			this.policyComparePickerLevel = compareLevel;
			this.setPolicySelectionValues(this.policyCompareSelection, compareSelection);
			this.preloadPolicyNamesForSelection(this.policyStatsLevel, this.policySelection);
			this.preloadPolicyNamesForSelection(this.policyCompareStatsLevel, this.policyCompareSelection);
		},
		preloadPolicyNamesForSelection(level, selection) {
			if (!level || !selection || !selection.country) return;
			if (!this.nutsLauHierarchy || !this.nutsLauHierarchy.nuts0) return;

			const order = this.policyLevelOrder;
			const maxIdx = order.indexOf(level);
			if (maxIdx < 0) return;

			for (let i = 0; i <= maxIdx; i += 1) {
				const lv = order[i];
				this.loadPolicyNamesForCurrentSelection(lv, selection);
			}
		},
		setQueryValueOrDelete(query, key, value) {
			if (value === null || value === undefined || value === "") {
				delete query[key];
				return;
			}
			query[key] = String(value);
		},
		persistPolicyQuery() {
			if (!this.$router || !this.$route) return;

			const nextQuery = { ...this.$route.query };
			this.setQueryValueOrDelete(nextQuery, "pc", this.policySelection.country);
			this.setQueryValueOrDelete(nextQuery, "pn1", this.policySelection.nuts1);
			this.setQueryValueOrDelete(nextQuery, "pn2", this.policySelection.nuts2);
			this.setQueryValueOrDelete(nextQuery, "pn3", this.policySelection.nuts3);
			this.setQueryValueOrDelete(nextQuery, "pl", this.policySelection.lau);
			this.setQueryValueOrDelete(nextQuery, "psl", this.policyStatsLevel);

			if (this.policyCompareEnabled) {
				this.setQueryValueOrDelete(nextQuery, "ce", "1");
				this.setQueryValueOrDelete(nextQuery, "qc", this.policyCompareSelection.country);
				this.setQueryValueOrDelete(nextQuery, "qn1", this.policyCompareSelection.nuts1);
				this.setQueryValueOrDelete(nextQuery, "qn2", this.policyCompareSelection.nuts2);
				this.setQueryValueOrDelete(nextQuery, "qn3", this.policyCompareSelection.nuts3);
				this.setQueryValueOrDelete(nextQuery, "ql", this.policyCompareSelection.lau);
				this.setQueryValueOrDelete(nextQuery, "csl", this.policyCompareStatsLevel);
			} else {
				delete nextQuery.ce;
				delete nextQuery.qc;
				delete nextQuery.qn1;
				delete nextQuery.qn2;
				delete nextQuery.qn3;
				delete nextQuery.ql;
				delete nextQuery.csl;
			}

			const current = this.$route.query || {};
			const currentKeys = Object.keys(current).sort();
			const nextKeys = Object.keys(nextQuery).sort();
			if (currentKeys.length === nextKeys.length) {
				let changed = false;
				for (let i = 0; i < currentKeys.length; i += 1) {
					const key = currentKeys[i];
					if (key !== nextKeys[i] || String(current[key]) !== String(nextQuery[key])) {
						changed = true;
						break;
					}
				}
				if (!changed) return;
			}

			this.$router.replace({
				name: "compass",
				query: nextQuery,
			});
		},
		getPolicyLevelLabel(level) {
			const labels = {
				country: "Country",
				nuts1: "NUTS1",
				nuts2: "NUTS2",
				nuts3: "NUTS3",
				lau: "LAU",
			};
			return labels[level] || "Level";
		},
		getPolicySelectedLabel(level, id) {
			const names = this.policyOptionNames[level] || {};
			const name = names[id];
			if (!name || String(name).trim() === "") {
				return id;
			}
			return `${id} - ${name}`;
		},
		goToNextPolicyLevel() {
			if (!this.policyCanGoNext) {
				return;
			}
			this.policyPickerLevel = this.policyNextLevel;
		},
		goToPreviousPolicyLevel() {
			if (!this.policyPreviousLevel) {
				return;
			}
			this.policyPickerLevel = this.policyPreviousLevel;
		},
		showPolicyStats() {
			if (!this.policyCanShowStats) {
				return;
			}
			this.policyStatsLevel = this.policyPickerLevel;
			this.policyCompareEnabled = false;
			this.policyCompareStatsLevel = "";
			this.zoomToPolicySelection(this.policyPickerLevel);
		},
		startPolicyCompare() {
			if (!this.policyCanStartCompare) {
				return;
			}
			this.policyCompareEnabled = true;
			this.policyComparePickerLevel = "country";
			this.policyCompareStatsLevel = "";
			this.setPolicySelectionValues(this.policyCompareSelection, this.emptyPolicySelection());
		},
		goToNextPolicyCompareLevel() {
			if (!this.policyCompareCanGoNext) {
				return;
			}
			this.policyComparePickerLevel = this.policyCompareNextLevel;
		},
		goToPreviousPolicyCompareLevel() {
			if (!this.policyComparePreviousLevel) {
				return;
			}
			this.policyComparePickerLevel = this.policyComparePreviousLevel;
		},
		showPolicyComparison() {
			if (!this.policyCompareCanShow) {
				return;
			}
			this.policyCompareStatsLevel = this.policyComparePickerLevel;
			this.zoomToPolicySelection(this.policyComparePickerLevel, this.policyCompareSelection);
		},
		setupMap() {
			if (!window.ol || this.map) {
				return;
			}
            
			const { center: initCenter, zoom: initZoom } = this.parseInitialMapState();

			const osmLayer = new ol.layer.Tile({
				source: new ol.source.OSM(),
				visible: this.activeBasemap === "osm",
			});

			const topoLayer = new ol.layer.Tile({
				source: new ol.source.XYZ({
					url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
					attributions:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
					crossOrigin: "anonymous",
				}),
				visible: this.activeBasemap === "topo",
			});

			const imageryLayer = new ol.layer.Tile({
				source: new ol.source.XYZ({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
					attributions:
						'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
					crossOrigin: "anonymous",
				}),
				visible: this.activeBasemap === "imagery",
			});

			const imageryLabelsLayer = new ol.layer.Tile({
				source: new ol.source.XYZ({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
					attributions: 'Labels: Esri World Boundaries and Places',
					crossOrigin: "anonymous",
				}),
				visible: this.activeBasemap === "imagery",
			});

			this.baseLayers = {
				osm: osmLayer,
				topo: topoLayer,
				imagery: imageryLayer,
				imageryLabels: imageryLabelsLayer,
			};

            // Countries layer — drives lpisLayers visibility by currently visible country
			const countriesSource = new ol.source.Vector({
				url: 'data/europe_countries.geojson',
				// url: 'https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/v1/NUTS0_RG_01M_2024_4326.geojson',
				format: new ol.format.GeoJSON({
					dataProjection: 'EPSG:3857',
					featureProjection: 'EPSG:3857',
				}),
			});
			this.countriesLayer = new ol.layer.Vector({
				source: countriesSource,
				visible: true,
				style: new ol.style.Style({})
			});
			countriesSource.on('featuresloadend', () => {
				this.getVisibleCountries();
				this.refreshAdminBoundaries();
			});

            this.map = new ol.Map({
				target: "compass-map",
				layers: [osmLayer, topoLayer, imageryLayer, imageryLabelsLayer, this.countriesLayer],
				view: new ol.View({
					center: initCenter,
					zoom: initZoom,
					projection: "EPSG:3857",
					constrainResolution: true,
				}),
			});

			this.map.addControl(new ol.control.ScaleLine());
			this.addLocateControl();
			this.applyBasemap(this.activeBasemap);
			this.updateCurrentMapZoom();
			this.map.getView().on("change:resolution", () => {
				this.updateCurrentMapZoom();
			});

			if (window.Geocoder) {
				const geocoder = new Geocoder("nominatim", {
					provider: "photon",
					lang: "en",
					placeholder: "Search for ...",
					limit: 5,
					autoComplete: true,
					keepOpen: true,
					preventMarker: true,
				});
				geocoder.on("addresschosen", (evt) => {
					const coords = evt && evt.coordinate ? evt.coordinate : null;
					if (coords) {
						this.map.getView().animate({ center: coords, zoom: 15, duration: 700 });
					}
				});
				this.map.addControl(geocoder);
			}

			this.map.on("moveend", () => {
				this.updateCurrentMapZoom();
				this.getVisibleCountries();
				this.refreshAdminBoundaries();
				this.persistMapQuery();
			});

			this.refreshMapSize();
			this.$nextTick(() => {
				this.map.updateSize();
				this.getVisibleCountries();
				this.initPolicySelection();
				this.updatePolicySelectionHighlight();
			});
			this.persistMapQuery();
        },
		initPolicySelection() {
			if (!this.isPolicyMaker) {
				return;
			}
			if (this.policySelection.country) {
				const restoredPrimaryLevel = this.policyStatsLevel || this.inferPolicyLevelFromSelection(this.policySelection) || "country";
				this.policyPickerLevel = restoredPrimaryLevel;
				if (this.policyCompareEnabled) {
					this.policyComparePickerLevel = this.policyCompareStatsLevel || this.inferPolicyLevelFromSelection(this.policyCompareSelection) || "country";
				}
				this.preloadPolicyNamesForSelection(this.policyStatsLevel, this.policySelection);
				if (this.policyCompareEnabled) {
					this.preloadPolicyNamesForSelection(this.policyCompareStatsLevel, this.policyCompareSelection);
				}
				this.persistPolicyQuery();
				return;
			}
			this.policyPickerLevel = "country";
			if (this.visibleCountries && this.visibleCountries.length) {
				this.policySelection.country = this.visibleCountries[0];
				this.onPolicySelectionChange("country");
			}
		},
		onPolicySelectionChange(level) {
			this.policyPickerLevel = level;
			this.policyStatsLevel = "";
			this.policyCompareEnabled = false;
			this.policyCompareStatsLevel = "";
			if (level === "country") {
				this.policySelection.nuts1 = "";
				this.policySelection.nuts2 = "";
				this.policySelection.nuts3 = "";
				this.policySelection.lau = "";
				this.policyOptionNames.nuts2 = {};
				this.policyOptionNames.nuts3 = {};
				this.policyOptionNames.lau = {};
				this.loadPolicyNamesForCurrentSelection("nuts1");
			}
			if (level === "nuts1") {
				this.policySelection.nuts2 = "";
				this.policySelection.nuts3 = "";
				this.policySelection.lau = "";
				this.policyOptionNames.nuts3 = {};
				this.policyOptionNames.lau = {};
				this.loadPolicyNamesForCurrentSelection("nuts2");
			}
			if (level === "nuts2") {
				this.policySelection.nuts3 = "";
				this.policySelection.lau = "";
				this.policyOptionNames.lau = {};
				this.loadPolicyNamesForCurrentSelection("nuts3");
			}
			if (level === "nuts3") {
				this.policySelection.lau = "";
				this.loadPolicyNamesForCurrentSelection("lau");
			}
		},
		onPolicyCompareSelectionChange(level) {
			this.policyComparePickerLevel = level;
			this.policyCompareStatsLevel = "";
			if (level === "country") {
				this.policyCompareSelection.nuts1 = "";
				this.policyCompareSelection.nuts2 = "";
				this.policyCompareSelection.nuts3 = "";
				this.policyCompareSelection.lau = "";
				this.loadPolicyNamesForCurrentSelection("nuts1", this.policyCompareSelection);
			}
			if (level === "nuts1") {
				this.policyCompareSelection.nuts2 = "";
				this.policyCompareSelection.nuts3 = "";
				this.policyCompareSelection.lau = "";
				this.loadPolicyNamesForCurrentSelection("nuts2", this.policyCompareSelection);
			}
			if (level === "nuts2") {
				this.policyCompareSelection.nuts3 = "";
				this.policyCompareSelection.lau = "";
				this.loadPolicyNamesForCurrentSelection("nuts3", this.policyCompareSelection);
			}
			if (level === "nuts3") {
				this.policyCompareSelection.lau = "";
				this.loadPolicyNamesForCurrentSelection("lau", this.policyCompareSelection);
			}
		},
		buildPolicyOptionLabel(id, name) {
			if (!name || String(name).trim() === "") {
				return id;
			}
			return `${id} - ${name}`;
		},
		loadPolicyNamesForCurrentSelection(level, selection) {
			const policySelection = selection || this.policySelection;
			const BASE = "https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/";
			let file = "";
			let idField = "";
			let nameField = "";

			if (level === "country") {
				const countryData = this.getCountryData();
				if (!this.nutsLauHierarchy || !this.nutsLauHierarchy.nuts0) return;
				file = this.nutsLauHierarchy.nuts0.file;
				idField = "NUTS_ID";
				nameField = "NUTS_NAME";
			}
			if (level === "nuts1") {
				const countryData = this.getCountryData(policySelection);
				if (!countryData || !countryData.file) return;
				file = countryData.file;
				idField = "NUTS_ID";
				nameField = "NUTS_NAME";
			}
			if (level === "nuts2") {
				const nuts1Data = this.getNuts1Data(policySelection);
				if (!nuts1Data || !nuts1Data.file) return;
				file = nuts1Data.file;
				idField = "NUTS_ID";
				nameField = "NUTS_NAME";
			}
			if (level === "nuts3") {
				const nuts2Data = this.getNuts2Data(policySelection);
				if (!nuts2Data || !nuts2Data.file) return;
				file = nuts2Data.file;
				idField = "NUTS_ID";
				nameField = "NUTS_NAME";
			}
			if (level === "lau") {
				const nuts3Data = this.getNuts3Data(policySelection);
				if (!nuts3Data || !nuts3Data.file) return;
				file = nuts3Data.file;
				idField = "LAU_ID";
				nameField = "LAU_NAME";
			}

			if (!file || !idField || !nameField) return;
			const url = BASE + file;
			this.loadPolicyNamesFromFile(url, idField, nameField, level);
		},
		loadPolicyNamesFromFile(url, idField, nameField, level) {
			const cached = this.policyNameCacheByUrl[url];
			if (cached) {
				this.policyOptionNames[level] = cached;
				return;
			}

			fetch(url)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed loading option names");
					}
					return response.json();
				})
				.then((geojson) => {
					const names = {};
					if (geojson && Array.isArray(geojson.features)) {
						geojson.features.forEach((feature) => {
							if (!feature || !feature.properties) return;
							const id = feature.properties[idField] || feature.id;
							const name = feature.properties[nameField];
							if (id) {
								names[id] = name || "";
							}
						});
					}
					this.$set(this.policyNameCacheByUrl, url, names);
					this.policyOptionNames[level] = names;
				})
				.catch(() => {
					this.policyOptionNames[level] = this.policyOptionNames[level] || {};
				});
		},
		getCountryData(selection) {
			const policySelection = selection || this.policySelection;
			const country = policySelection.country;
			if (!country || !this.nutsLauHierarchy || !this.nutsLauHierarchy.nuts0) {
				return null;
			}
			return this.nutsLauHierarchy.nuts0[country] || null;
		},
		getNuts1Data(selection) {
			const policySelection = selection || this.policySelection;
			const countryData = this.getCountryData(policySelection);
			const nuts1 = policySelection.nuts1;
			if (!countryData || !countryData.nuts1 || !nuts1) {
				return null;
			}
			return countryData.nuts1[nuts1] || null;
		},
		getNuts2Data(selection) {
			const policySelection = selection || this.policySelection;
			const nuts1Data = this.getNuts1Data(policySelection);
			const nuts2 = policySelection.nuts2;
			if (!nuts1Data || !nuts1Data.nuts2 || !nuts2) {
				return null;
			}
			return nuts1Data.nuts2[nuts2] || null;
		},
		getNuts3Data(selection) {
			const policySelection = selection || this.policySelection;
			const nuts2Data = this.getNuts2Data(policySelection);
			const nuts3 = policySelection.nuts3;
			if (!nuts2Data || !nuts2Data.nuts3 || !nuts3) {
				return null;
			}
			return nuts2Data.nuts3[nuts3] || null;
		},
		zoomToPolicySelection(level, selection) {
			if (!this.map || !this.isPolicyMaker) return;
			const policySelection = selection || this.policySelection;

			const zoomCap = {
				country: 6,
				nuts1: 8,
				nuts2: 10,
				nuts3: 11,
				lau: 13,
			};

			if (level === "country") {
				const countryId = policySelection.country;
				if (!countryId || !this.countriesLayer) return;
				const source = this.countriesLayer.getSource();
				if (!source) return;
				const features = source.getFeatures();
				if (!features || !features.length) return;
				const target = features.find((f) => f.get("CNTR_ID") === countryId);
				if (!target || !target.getGeometry()) return;
				this.map.getView().fit(target.getGeometry().getExtent(), {
					padding: [40, 40, 40, 40],
					duration: 650,
					maxZoom: zoomCap.country,
				});
				return;
			}

			const BASE = "https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/";
			let sourceUrl = "";
			let featureId = "";
			let featureLevel = level;

			if (level === "nuts1") {
				const countryData = this.getCountryData(policySelection);
				if (!countryData || !countryData.file || !policySelection.nuts1) return;
				sourceUrl = BASE + countryData.file;
				featureId = policySelection.nuts1;
			}
			if (level === "nuts2") {
				const nuts1Data = this.getNuts1Data(policySelection);
				if (!nuts1Data || !nuts1Data.file || !policySelection.nuts2) return;
				sourceUrl = BASE + nuts1Data.file;
				featureId = policySelection.nuts2;
			}
			if (level === "nuts3") {
				const nuts2Data = this.getNuts2Data(policySelection);
				if (!nuts2Data || !nuts2Data.file || !policySelection.nuts3) return;
				sourceUrl = BASE + nuts2Data.file;
				featureId = policySelection.nuts3;
			}
			if (level === "lau") {
				const nuts3Data = this.getNuts3Data(policySelection);
				if (!nuts3Data || !nuts3Data.file || !policySelection.lau) return;
				sourceUrl = BASE + nuts3Data.file;
				featureId = policySelection.lau;
				featureLevel = "lau";
			}

			if (!sourceUrl || !featureId) return;
			this.ensureAdminLayer(sourceUrl, featureLevel);
			const entry = this.adminBoundaryLayers[sourceUrl];
			if (!entry || !entry.layer) return;

			const source = entry.layer.getSource();
			let fitted = false;
			const fitFeature = () => {
				if (fitted) return;
				let target = null;
				source.forEachFeature((feature) => {
					if (target) return;
					const fid = feature.get("NUTS_ID") || feature.get("LAU_ID") || feature.getId();
					if (fid === featureId) {
						target = feature;
					}
				});

				if (!target || !target.getGeometry()) return;
				fitted = true;
				this.map.getView().fit(target.getGeometry().getExtent(), {
					padding: [40, 40, 40, 40],
					duration: 650,
					maxZoom: zoomCap[level] || 12,
				});
			};

			if (entry.loaded) {
				fitFeature();
				return;
			}

			// Force source load even if layer currently not visible at this zoom.
			const size = this.map.getSize();
			if (size && size[0] > 0 && size[1] > 0) {
				source.loadFeatures(
					this.map.getView().calculateExtent(size),
					this.map.getView().getResolution(),
					this.map.getView().getProjection()
				);
			}
			source.once("featuresloadend", fitFeature);

			// Fallback for cases where source loading is delayed by visibility/loading strategy.
			this.fitFeatureFromGeoJson(sourceUrl, featureId, zoomCap[level] || 12, () => !fitted, () => {
				fitted = true;
			});
		},
		fitFeatureFromGeoJson(url, featureId, maxZoom, canFit, onFit) {
			fetch(url)
				.then((response) => {
					if (!response.ok) throw new Error("Failed loading admin boundary");
					return response.json();
				})
				.then((geojson) => {
					if (!geojson || !Array.isArray(geojson.features) || !canFit()) return;

					const target = geojson.features.find((feature) => {
						if (!feature || !feature.properties) return false;
						const fid = feature.properties.NUTS_ID || feature.properties.LAU_ID || feature.id;
						return fid === featureId;
					});

					if (!target || !target.geometry || !canFit()) return;

					const olFeature = new ol.format.GeoJSON().readFeature(target, {
						dataProjection: "EPSG:4326",
						featureProjection: "EPSG:3857",
					});

					if (!olFeature || !olFeature.getGeometry()) return;
					onFit();
					this.map.getView().fit(olFeature.getGeometry().getExtent(), {
						padding: [40, 40, 40, 40],
						duration: 650,
						maxZoom,
					});
				})
				.catch(() => {});
		},
		refreshMapSize() {
			if (this.map) {
				this.map.updateSize();
			}
		},
		parseInitialMapState() {
			let center = ol.proj.fromLonLat([-8.42, 39.5]);
			let zoom = 6;

			if (this.$route.query.center) {
				const parts = String(this.$route.query.center).split(",").map(Number);
				if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
					center = parts;
				}
			}

			if (this.$route.query.zoom) {
				const parsedZoom = Number(this.$route.query.zoom);
				if (!isNaN(parsedZoom)) {
					zoom = parsedZoom;
				}
			}

			return { center, zoom };
		},
		getVisibleCountries() {
			if (!this.map || !this.countriesLayer) return;
			const size = this.map.getSize();
			if (!size || size[0] === 0 || size[1] === 0) return;
			const mapExtent = this.map.getView().calculateExtent(size);
			const countries = [];
			this.countriesLayer.getSource().forEachFeature((feature) => {
				if (feature.getGeometry().intersectsExtent(mapExtent)) {
					// countries.push(feature.get('CNTR_CODE')); // for NUTS0
					countries.push(feature.get('CNTR_ID')); // for europe_countries
				}
			});
			this.visibleCountries = countries;
			if (this.isPolicyMaker && !this.policySelection.country && countries.length) {
				this.policySelection.country = countries[0];
			}
		},
		applyBasemap(key) {
			if (!this.baseLayers || !Object.keys(this.baseLayers).length) {
				this.activeBasemap = key;
				return;
			}

			const nextKey = this.baseLayers[key] ? key : "osm";
			Object.keys(this.baseLayers).forEach((layerKey) => {
				const isImageryLabels = layerKey === "imageryLabels";
				this.baseLayers[layerKey].setVisible(
					layerKey === nextKey || (isImageryLabels && nextKey === "imagery")
				);
			});
			this.activeBasemap = nextKey;
			this.persistMapQuery();
		},
		persistMapQuery() {
			if (!this.map) {
				return;
			}

			const view = this.map.getView();
			const center = view.getCenter();
			const zoom = view.getZoom();
			if (!center || typeof zoom !== "number") {
				return;
			}

			const serializedCenter = center.map((v) => Number(v).toFixed(2)).join(",");
			const serializedZoom = String(Math.round(zoom * 100) / 100);
			const serializedBasemap = this.activeBasemap || "osm";

			if (
				this.$route.query.center === serializedCenter &&
				this.$route.query.zoom === serializedZoom &&
				this.$route.query.basemap === serializedBasemap
			) {
				return;
			}

			this.$router.replace({
				name: "compass",
				query: {
					...this.$route.query,
					profile: this.activeProfile,
					basemap: serializedBasemap,
					center: serializedCenter,
					zoom: serializedZoom,
				},
			});
		},
		updateCurrentMapZoom() {
			if (!this.map) return;
			const zoom = this.map.getView().getZoom();
			this.currentMapZoom = typeof zoom === "number" && !Number.isNaN(zoom) ? zoom : null;
		},
		addLocateControl() {
			const locateBtn = document.createElement("button");
			locateBtn.className = "ol-locate-btn";
			locateBtn.title = "Go to my location";
			locateBtn.innerHTML = '<i class="fa fa-location-crosshairs" aria-hidden="true"></i>';

			locateBtn.onclick = () => {
				if (!navigator.geolocation) {
					return;
				}
				navigator.geolocation.getCurrentPosition((position) => {
					const coords = ol.proj.fromLonLat([
						position.coords.longitude,
						position.coords.latitude,
					]);
					this.map.getView().animate({ center: coords, zoom: 15, duration: 700 });
				});
			};

			const locateInner = document.createElement("div");
			locateInner.className = "ol-control";
			locateInner.appendChild(locateBtn);

			const locateWrapper = document.createElement("div");
			locateWrapper.className = "ol-unselectable ol-custom-locate";
			locateWrapper.appendChild(locateInner);

			this.map.addControl(new ol.control.Control({ element: locateWrapper }));
		},
		loadNutsLauHierarchy() {
			if (Object.keys(this.nutsLauHierarchy).length) {
				return Promise.resolve(this.nutsLauHierarchy);
			}

			return fetch("https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/nuts_lau_hierarchy.json")
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed loading NUTS/LAU hierarchy file");
					}
					return response.json();
				})
				.then((hierarchy) => {
					this.nutsLauHierarchy = hierarchy
					this.loadPolicyNamesForCurrentSelection("country");
					this.preloadPolicyNamesForSelection(this.policyStatsLevel, this.policySelection);
					if (this.policyCompareEnabled) {
						this.preloadPolicyNamesForSelection(this.policyCompareStatsLevel, this.policyCompareSelection);
					}
					this.refreshAdminBoundaries();
					this.updatePolicySelectionHighlight();
					return this.nutsLauHierarchy
				})
				.catch(() => {
					this.nutsLauHierarchy = {};
					return {};
				});
		},
		refreshAdminBoundaries() {
			const H = this.nutsLauHierarchy;
			if (!H || !H.nuts0 || !this.map || !this.visibleCountries.length) return;

			const BASE = 'https://raw.githubusercontent.com/euraf/eu-nuts-lau/master/';
			const zoom = this.map.getView().getZoom();
			const size = this.map.getSize();
			if (!size || size[0] === 0) return;
			const extent = this.map.getView().calculateExtent(size);

			const T = { nuts1: 5, nuts2: 7, nuts3: 9, lau: 11 };
			const shouldBeVisible = new Set();

			if (zoom >= T.nuts1) {
				for (const cc of this.visibleCountries) {
					const ccData = H.nuts0[cc];
					if (!ccData || !ccData.file) continue;

					const nuts1Url = BASE + ccData.file;
					shouldBeVisible.add(nuts1Url);
					this.ensureAdminLayer(nuts1Url, 'nuts1');

					if (zoom >= T.nuts2 && ccData.nuts1) {
						for (const [n1id, n1data] of Object.entries(ccData.nuts1)) {
							if (!n1data || !n1data.file) continue;
							if (!this.adminFeatureIntersectsExtent(nuts1Url, n1id, extent)) continue;

							const nuts2Url = BASE + n1data.file;
							shouldBeVisible.add(nuts2Url);
							this.ensureAdminLayer(nuts2Url, 'nuts2');

							if (zoom >= T.nuts3 && n1data.nuts2) {
								for (const [n2id, n2data] of Object.entries(n1data.nuts2)) {
									if (!n2data || !n2data.file) continue;
									if (!this.adminFeatureIntersectsExtent(nuts2Url, n2id, extent)) continue;

									const nuts3Url = BASE + n2data.file;
									shouldBeVisible.add(nuts3Url);
									this.ensureAdminLayer(nuts3Url, 'nuts3');

									if (zoom >= T.lau && n2data.nuts3) {
										for (const [n3id, n3data] of Object.entries(n2data.nuts3)) {
											if (!n3data || !n3data.file) continue;
											if (!this.adminFeatureIntersectsExtent(nuts3Url, n3id, extent)) continue;

											const lauUrl = BASE + n3data.file;
											shouldBeVisible.add(lauUrl);
											this.ensureAdminLayer(lauUrl, 'lau');
										}
									}
								}
							}
						}
					}
				}
			}

			for (const [url, entry] of Object.entries(this.adminBoundaryLayers)) {
				if (entry.layer) entry.layer.setVisible(shouldBeVisible.has(url));
			}
		},
		ensureAdminLayer(url, level) {
			if (this.adminBoundaryLayers[url]) return;

			const strokes = {
				nuts1: { color: 'rgba(50,50,50,0.9)',   width: 2   },
				nuts2: { color: 'rgba(60,60,60,0.75)',  width: 2 },
				nuts3: { color: 'rgba(80,80,80,0.6)',   width: 2  },
				lau:   { color: 'rgba(100,100,100,0.5)', width: 2 },
			};
			const s = strokes[level] || strokes.nuts3;

			const source = new ol.source.Vector({
				url: url,
				format: new ol.format.GeoJSON({
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857',
				}),
			});
			source.on('featuresloadend', () => {
				this.$set(this.adminBoundaryLayers[url], 'loaded', true);
				this.refreshAdminBoundaries();
			});

			const layer = new ol.layer.Vector({
				source,
				visible: false,
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({ color: s.color, width: s.width }),
					fill: new ol.style.Fill({ color: 'rgba(0,0,0,0)' }),
				}),
			});

			this.map.addLayer(layer);
			this.$set(this.adminBoundaryLayers, url, { layer, loaded: false, level });
		},
		adminFeatureIntersectsExtent(sourceUrl, featureId, extent) {
			const entry = this.adminBoundaryLayers[sourceUrl];
			if (!entry || !entry.loaded) return false;
			const source = entry.layer.getSource();
			let intersects = false;
			source.forEachFeature((feature) => {
				if (intersects) return;
				const fid = feature.get('NUTS_ID') || feature.get('LAU_ID') || feature.getId();
				if (fid === featureId && feature.getGeometry().intersectsExtent(extent)) {
					intersects = true;
				}
			});
			return intersects;
		},
		toggleLeftLayerAccordion(section) {
			if (!Object.prototype.hasOwnProperty.call(this.leftLayerAccordion, section)) {
				return;
			}
			this.$set(this.leftLayerAccordion, section, !this.leftLayerAccordion[section]);
		},
		setOrthophotoBasemap(enabled) {
			this.applyBasemap(enabled ? 'imagery' : 'osm');
		},
		onSelectFullFarmClick() {
			if (!this.fullFarmAction.available || !this.fullFarmAction.layerId) {
				return;
			}

			const layer = this.layers[this.fullFarmAction.layerId];
			if (layer && typeof layer.selectFullFarmFromCurrentSelection === 'function') {
				layer.selectFullFarmFromCurrentSelection();
			}
		},
        toggleCategory(id) {
			const cat = this.indicatorCategories.find((c) => c.id === id);
			if (!cat) return;
			const opening = !cat.open;
			if (this.isPolicyMaker) {
				// In policy mode, keep other sections open for side-by-side comparison.
				cat.open = opening;
			} else {
				// Farmer mode keeps single-open accordion behavior.
				this.indicatorCategories.forEach((c) => { c.open = false; });
				cat.open = opening;
			}
            cat.layers.forEach((ly) => {
                VueBus.$emit('updateLayerVisibility', ly, opening);
                this.layers[ly].show = opening;
            })
		},
    }
}
</script>