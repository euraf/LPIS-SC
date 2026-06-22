const projectRoot = window.location.pathname.substring(0, window.location.pathname.indexOf("LPIS-SC")) + "LPIS-SC/";

// ── Globals shared with layer components ────────────────────────────────────
var VueBus = new Vue();

const MAP_PROJECTION  = 'EPSG:3857';
const TURF_PROJECTION = 'EPSG:4326';

const DEBUG = true;
const debugConsole = {
	log:     (...a) => { if (DEBUG) console.log(...a);   },
	warn:    (...a) => { if (DEBUG) console.warn(...a);  },
	error:   (...a) => { if (DEBUG) console.error(...a); },
	time:    (l)    => { if (DEBUG) { debugConsole._t = debugConsole._t || {}; debugConsole._t[l] = performance.now(); } },
	timeEnd: (l)    => { if (DEBUG) { const e = (performance.now() - (debugConsole._t || {})[l]) / 1000; console.log(`${l}: ${e.toFixed(3)}s`); } },
};
window.debugConsole = debugConsole;

function roundTwoDecimals(nr) {
	if (nr == null || isNaN(nr) || nr === '') return '-';
	const n = parseFloat(nr);
	return isNaN(n) ? '-' : n.toFixed(2);
}
function roundInteger(nr) {
	if (nr == null || isNaN(nr) || nr === '') return '-';
	const n = parseInt(nr);
	return isNaN(n) ? '-' : n;
}
Object.filter = function(obj, predicate) {
	const result = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key) && predicate(obj[key])) result[key] = obj[key];
	}
	return result;
};

// ── Register layer Vue components globally ───────────────────────────────────
httpVueLoader.register(Vue, 'vue/layer-wfs.vue');
httpVueLoader.register(Vue, 'vue/layer-wms.vue');
httpVueLoader.register(Vue, 'vue/layer-tilexyz.vue');
httpVueLoader.register(Vue, 'vue/layer-mvt.vue');
httpVueLoader.register(Vue, 'vue/accordion/ParcelOverviewPanel.vue');
httpVueLoader.register(Vue, 'vue/accordion/TcdPanel.vue');
httpVueLoader.register(Vue, 'vue/accordion/ForestCoverPanel.vue');
httpVueLoader.register(Vue, 'vue/accordion/WoodyVegetationPanel.vue');
httpVueLoader.register(Vue, 'vue/accordion/LulcPanel.vue');
httpVueLoader.register(Vue, 'vue/accordion/PolicyLulcPanel.vue');
httpVueLoader.register(Vue, 'vue/shared/LulcPieChart.vue');

// ── Router ───────────────────────────────────────────────────────────────────
const router = new VueRouter({
	mode: "history",
	base: projectRoot,
	routes: [
		{
			path: "/",
			name: "home",
			component: httpVueLoader("vue/landing-page.vue"),
		},
		{
			path: "/compass",
			name: "compass",
			component: httpVueLoader("vue/compass-page.vue"),
		},
		{
			path: "*",
			redirect: "/",
		},
	],
	scrollBehavior() {
		return { x: 0, y: 0 };
	},
});

// ── Root Vue — load layer JSON data before showing the app ───────────────────
var app = new Vue({
	el: "#app",
	router,
	data: {
		loaded: false,
		selectedProfile: "farmer",
		profiles: {
			researcher: {
				id: "researcher",
				title: "Researcher",
				icon: "fa-flask",
				tagline: "Full methodology, raw datasets, analytical tools.",
				features: ["Raw indicators", "Benchmark explorer", "Data export API"],
			},
			farmer: {
				id: "farmer",
				title: "Farmer",
				icon: "fa-tractor",
				tagline: "Your farm at a glance with practical recommendations.",
				features: ["Parcel scorecards", "Action tips", "Year-over-year trends"],
			},
			policymaker: {
				id: "policymaker",
				title: "Policymaker",
				icon: "fa-university",
				tagline: "Regional overview, CAP dashboards, and reports.",
				features: ["Regional dashboard", "Policy filters", "Report mode"],
			},
		},
	},
	created() {
		this.loadData();
	},
	methods: {
		loadData() {
			const _this = this;
			const requests = [];
			for (const layer_code of LAYERS_LIST) {
				MAP_LAYERS[layer_code] = {};
				requests.push(
					$.getJSON('data/layers/' + layer_code + '.json', function(layer) {
						MAP_LAYERS[layer.id] = layer;
					})
				);
			}
			Promise.allSettled(requests).then(function() {
				_this.loaded = true;
			});
		},
	},
});