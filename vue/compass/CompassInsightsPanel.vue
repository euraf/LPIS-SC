<template>
	<aside v-if="isPolicyMaker" class="farm-right-panel policy-insights-panel" :class="{ 'is-mobile-open': mobileOpen }" :aria-hidden="mobileOpen ? 'false' : null">
		<div class="panel-title-row">
			<h3>{{ subjectTitle }}</h3>
			<span>{{ profileTitle }} Mode</span>
			<button class="mobile-panel-close" type="button" aria-label="Close insights panel" @click="$emit('close-mobile-panel')">
				<i class="fa fa-times" aria-hidden="true"></i>
			</button>
		</div>
		<div class="policy-picker-shell">
			<div class="policy-breadcrumb" v-if="policy.breadcrumbParts.length">
				<span
					v-for="(part, idx) in policy.breadcrumbParts"
					:key="part.level"
					class="policy-breadcrumb-part"
				>
					<span v-if="idx > 0" class="policy-breadcrumb-sep">&gt;</span>
					<span>{{ part.label }}</span>
				</span>
			</div>
			<div class="policy-picker-grid">
				<label>
					{{ policy.pickerLabel }}
					<select
						:value="policy.pickerValue"
						@change="$emit('policy-selection-change', { level: policy.pickerLevel, value: $event.target.value })"
					>
						<option value="">Select {{ policy.pickerLabel }}</option>
						<option v-for="item in policy.pickerOptions" :key="item.id" :value="item.id">{{ item.label }}</option>
					</select>
				</label>
			</div>
			<div class="policy-picker-actions mt-2">
				<button type="button" class="tour-button" :disabled="!policy.canShowStats" @click="$emit('show-policy-stats')">
					Show {{ policy.pickerLabel }} stats
				</button>
				<button
					type="button"
					class="tour-button"
					v-if="policy.nextLevel"
					:disabled="!policy.canGoNext"
					@click="$emit('go-to-next-policy-level')"
				>
					Select {{ policy.nextLevelLabel }}
				</button>
				<button
					type="button"
					class="tour-button"
					v-if="policy.previousLevel"
					@click="$emit('go-to-previous-policy-level')"
				>
					Back to {{ policy.previousLevelLabel }}
				</button>
			</div>
			<div v-if="policy.compareEnabled" class="policy-compare-shell mt-3">
				<div class="policy-breadcrumb" v-if="policy.compareBreadcrumbParts.length">
					<span
						v-for="(part, idx) in policy.compareBreadcrumbParts"
						:key="`compare-${part.level}`"
						class="policy-breadcrumb-part"
					>
						<span v-if="idx > 0" class="policy-breadcrumb-sep">&gt;</span>
						<span>{{ part.label }}</span>
					</span>
				</div>
				<div class="policy-picker-grid">
					<label>
						Compare {{ policy.comparePickerLabel }}
						<select
							:value="policy.comparePickerValue"
							@change="$emit('policy-compare-selection-change', { level: policy.comparePickerLevel, value: $event.target.value })"
						>
							<option value="">Select {{ policy.comparePickerLabel }}</option>
							<option v-for="item in policy.comparePickerOptions" :key="`compare-${item.id}`" :value="item.id">{{ item.label }}</option>
						</select>
					</label>
				</div>
				<div class="policy-picker-actions mt-2">
					<button
						type="button"
						class="tour-button"
						v-if="policy.compareNextLevel"
						:disabled="!policy.compareCanGoNext"
						@click="$emit('go-to-next-policy-compare-level')"
					>
						Select {{ policy.compareNextLevelLabel }}
					</button>
					<button
						type="button"
						class="tour-button"
						v-if="policy.comparePreviousLevel"
						@click="$emit('go-to-previous-policy-compare-level')"
					>
						Back to {{ policy.comparePreviousLevelLabel }}
					</button>
				</div>
			</div>
		</div>

		<div class="indicator-accordion">
			<div
				class="accordion-section"
				v-for="category in indicatorCategories"
				:key="category.id"
				:class="{ 'is-open': category.open }"
			>
				<button class="accordion-header" type="button" @click="$emit('toggle-category', category.id)">
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
						:map-instance="mapInstance"
						:layers="layers"
						:nuts-lau-hierarchy="nutsLauHierarchy"
						:policy-stats-level="policy.statsLevel"
						:policy-selection="policy.selection"
					></tcd-panel>
				</div>

				<div class="accordion-body tcd-panel" v-if="category.id === 'forestcover'">
					<forest-cover-panel
						:opening="category.open"
						mode="policymaker"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
						:nuts-lau-hierarchy="nutsLauHierarchy"
						:policy-stats-level="policy.statsLevel"
						:policy-selection="policy.selection"
					></forest-cover-panel>
				</div>

				<div class="accordion-body tcd-panel" v-if="category.id === 'woodyvegetation'">
					<woody-vegetation-panel
						:opening="category.open"
						mode="policymaker"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
						:nuts-lau-hierarchy="nutsLauHierarchy"
						:policy-stats-level="policy.statsLevel"
						:policy-selection="policy.selection"
					></woody-vegetation-panel>
				</div>

				<div class="accordion-body lulc-panel" v-if="category.id === 'lulc'">
					<policy-lulc-panel
						:opening="category.open"
						:layers="layers"
						:nuts-lau-hierarchy="nutsLauHierarchy"
						:policy-stats-level="policy.statsLevel"
						:policy-selection="policy.selection"
						:policy-compare-stats-level="policy.compareStatsLevel"
						:policy-compare-selection="policy.compareSelection"
					></policy-lulc-panel>
				</div>
			</div>
		</div>
	</aside>

	<aside v-else-if="isFarmer || isResearcher" class="farm-right-panel" :class="{ 'is-mobile-open': mobileOpen }" :aria-hidden="mobileOpen ? 'false' : null">
		<div class="panel-title-row">
			<h3>{{ subjectTitle }}</h3>
			<span>{{ subjectId }}</span>
			<button class="mobile-panel-close" type="button" aria-label="Close insights panel" @click="$emit('close-mobile-panel')">
				<i class="fa fa-times" aria-hidden="true"></i>
			</button>
		</div>
		<div v-if="isFarmer" class="mt-2">
			<button
				type="button"
				class="tour-button"
				:disabled="!fullFarmAction.available"
				:title="fullFarmAction.available ? '' : fullFarmAction.disabledHint"
				@click="$emit('select-full-farm')"
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
				<button class="accordion-header" type="button" @click="$emit('toggle-category', category.id)">
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
					></parcel-overview-panel>
				</div>

				<div class="accordion-body tcd-panel" v-if="category.id === 'treecover'">
					<tcd-panel
						:opening="category.open"
						mode="farmer"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
					></tcd-panel>
				</div>

				<div class="accordion-body tcd-panel" v-if="category.id === 'forestcover'">
					<forest-cover-panel
						:opening="category.open"
						mode="farmer"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
					></forest-cover-panel>
				</div>

				<div class="accordion-body tcd-panel" v-if="category.id === 'woodyvegetation'">
					<woody-vegetation-panel
						:opening="category.open"
						mode="farmer"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
					></woody-vegetation-panel>
				</div>

				<div class="accordion-body lulc-panel" v-if="category.id === 'lulc'">
					<lulc-panel
						:opening="category.open"
						:any-selected-feature="anySelectedFeature"
						:selected-features-all="selectedFeaturesAll"
						:map-instance="mapInstance"
						:layers="layers"
						:admin-boundary-layers="adminBoundaryLayers"
						:nuts-lau-hierarchy="nutsLauHierarchy"
					></lulc-panel>
				</div>
			</div>
		</div>
	</aside>
</template>

<script>
module.exports = {
	props: {
		mobileOpen: {
			type: Boolean,
			default: false,
		},
		isPolicyMaker: {
			type: Boolean,
			default: false,
		},
		isFarmer: {
			type: Boolean,
			default: false,
		},
		isResearcher: {
			type: Boolean,
			default: false,
		},
		profileTitle: {
			type: String,
			required: true,
		},
		subjectTitle: {
			type: String,
			required: true,
		},
		subjectId: {
			type: String,
			required: true,
		},
		fullFarmAction: {
			type: Object,
			default: function() { return {}; },
		},
		policy: {
			type: Object,
			default: function() { return {}; },
		},
		indicatorCategories: {
			type: Array,
			default: function() { return []; },
		},
		anySelectedFeature: {
			type: Boolean,
			default: false,
		},
		selectedFeaturesAll: {
			type: Array,
			default: function() { return []; },
		},
		layers: {
			type: Object,
			required: true,
		},
		mapInstance: {
			type: Object,
			default: null,
		},
		adminBoundaryLayers: {
			type: Object,
			default: function() { return {}; },
		},
		nutsLauHierarchy: {
			type: Object,
			default: function() { return {}; },
		},
	},
};
</script>
