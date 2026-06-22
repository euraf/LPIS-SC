<template>
	<div v-if="displayedSlices && displayedSlices.length" :style="containerStyle">
		<p class="lulc-chart-sublabel" v-if="subtitleHtml" v-html="subtitleHtml"></p>
		<div class="lulc-pie-wrapper">
			<svg class="lulc-pie-svg" viewBox="0 0 120 120">
				<circle
					v-if="displayedSlices.length === 1"
					cx="60"
					cy="60"
					r="50"
					:fill="displayedSlices[0].color || defaultColor"
				/>
				<path
					v-else
					v-for="(slice, i) in displayedSlices"
					:key="i"
					:d="pieSlicePath(slice.startAngle, slice.endAngle)"
					:fill="slice.color || defaultColor"
					stroke="#fff"
					stroke-width="1.5"
				/>
			</svg>
			<div class="lulc-pie-legend">
				<div class="lulc-pie-legend-row" v-for="(slice, i) in displayedSlices" :key="i">
					<span class="lulc-pie-dot" :style="{ background: slice.color || defaultColor }"></span>
					<span
						class="lulc-pie-legend-label"
						:class="{ 'lulc-pie-legend-label--highlight': isHighlightedSlice(slice) }"
						:title="slice.label"
					>{{ slice.label }}</span>
					<span class="lulc-pie-legend-pct">{{ slice.pct.toFixed(0) }}%</span>
				</div>
			</div>
		</div>
		<p v-if="countNoteHtml" style="font-size:0.7rem;color:#888;margin:4px 0 0;" v-html="countNoteHtml"></p>
		<div v-if="internalToggleText" style="margin-top:3px;text-align:right;font-size:0.7rem;">
			<a href="#" class="tcd-pixels-link" @click.prevent="showAll = !showAll">{{ internalToggleText }}</a>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: {
		slices: {
			type: Array,
			default: function() {
				return [];
			},
		},
		subtitleHtml: {
			type: String,
			default: "",
		},
		defaultColor: {
			type: String,
			default: "#aaa",
		},
		countNoteHtml: {
			type: String,
			default: "",
		},
		maxSlices: {
			type: Number,
			default: 4,
		},
		containerStyle: {
			type: Object,
			default: function() {
				return {};
			},
		},
		highlightLabels: {
			type: Array,
			default: function() {
				return [];
			},
		},
	},
	data() {
		return { showAll: false };
	},
	computed: {
		highlightLabelSet() {
			return new Set((this.highlightLabels || []).map((x) => String(x || '').trim().toLowerCase()));
		},
		displayedSlices() {
			if (!this.slices || !this.slices.length) return [];
			let items = this.slices;
			if (!this.showAll && this.maxSlices > 0 && items.length > this.maxSlices) {
				const top = items.slice(0, this.maxSlices);
				const rest = items.slice(this.maxSlices);
				const otherPct = rest.reduce((s, x) => s + (x.pct || 0), 0);
				const otherArea = rest.reduce((s, x) => s + (x.area || x.areaHa || 0), 0);
				items = [...top, { label: 'Other', color: '#bbb', pct: otherPct, area: otherArea, areaHa: otherArea, areaStr: otherArea.toFixed(1) + ' ha' }];
			}
			let angle = -Math.PI / 2;
			return items.map((item) => {
				const sweep = (item.pct / 100) * 2 * Math.PI;
				const slice = { ...item, startAngle: angle, endAngle: angle + sweep };
				angle += sweep;
				return slice;
			});
		},
		internalToggleText() {
			if (!this.slices || this.maxSlices <= 0 || this.slices.length <= this.maxSlices) return '';
			return this.showAll ? 'show top ' + this.maxSlices + ' only' : 'show all ' + this.slices.length + ' classes';
		},
	},
	methods: {
		isHighlightedSlice(slice) {
			if (!slice || !slice.label) return false;
			return this.highlightLabelSet.has(String(slice.label).trim().toLowerCase());
		},
		pieSlicePath(startAngle, endAngle) {
			const cx = 60;
			const cy = 60;
			const r = 50;
			const x1 = cx + r * Math.cos(startAngle);
			const y1 = cy + r * Math.sin(startAngle);
			const x2 = cx + r * Math.cos(endAngle);
			const y2 = cy + r * Math.sin(endAngle);
			const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
			return "M " + cx + " " + cy + " L " + x1.toFixed(3) + " " + y1.toFixed(3) + " A " + r + " " + r + " 0 " + largeArc + " 1 " + x2.toFixed(3) + " " + y2.toFixed(3) + " Z";
		},
	},
};
</script>
