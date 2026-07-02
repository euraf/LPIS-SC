<template>
	<div class="landing-page" :class="{ 'profile-overlay-open': profileOverlayOpen }">
		<div class="ambient ambient-left"></div>
		<div class="ambient ambient-right"></div>
		<section class="frame-shell">
			<div class="browser-shell">
				<div class="browser-topbar">
					<nav class="main-nav">
						<div class="brand-mark">
							<span class="brand-ring"><i class="fa fa-compass"></i></span>
							<span class="brand-copy">LPIS-SC</span>
						</div>
						<div id="landing-nav-links" class="nav-links" :class="{ 'is-open': mobileMenuOpen }">
							<a href="#spatial-insights" @click.prevent="scrollToSection('spatial-insights')">Spatial Insights</a>
							<a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')">How It Works</a>
							<a href="#covered-countries" @click.prevent="scrollToSection('covered-countries')">Countries</a>
							<a href="#digitaf" @click.prevent="scrollToSection('digitaf')">Learn More</a>
							<a href="https://github.com/euraf/LPIS-SC" target="_blank" rel="noopener noreferrer" @click="closeMobileMenu">GitHub</a>
						</div>
						<div class="nav-actions">
							<button
								class="menu-button"
								type="button"
								@click="toggleMobileMenu"
								:aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
								:aria-expanded="mobileMenuOpen ? 'true' : 'false'"
								aria-controls="landing-nav-links"
							>
								<i class="fa" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
							</button>
							<button class="icon-button" aria-label="Search"><i class="fa fa-search"></i></button>
							<a class="launch-button" href="#" @click.prevent="openProfileOverlay">Open Compass</a>
						</div>
					</nav>
				</div>

				<div class="hero-grid">
					<div class="hero-copy">
						<p class="hero-overline">Linking LPIS Data to Sustainability &amp; Policy Insights</p>
						<h1>LPIS Sustainability Compass</h1>
						<p>
							A web-based spatial analysis tool that integrates LPIS, Copernicus, JRC and other
							public datasets for farm- and parcel-level sustainability insights across 10+ EU countries.
							Multi-scale analysis from individual parcels to NUTS1 level, running entirely in your browser.
						</p>
						<div class="hero-actions">
							<a class="primary-button" href="#" @click.prevent="openProfileOverlay">Open the Compass</a>
							<a class="secondary-button" href="https://github.com/euraf/LPIS-SC" target="_blank" rel="noopener noreferrer">View on GitHub</a>
						</div>
						<div class="hero-badges">
							<span class="hero-badge"><i class="fa fa-lock"></i> No login required</span>
							<span class="hero-badge"><i class="fa fa-desktop"></i> Fully client-side</span>
							<span class="hero-badge"><i class="fa fa-code-fork"></i> Open source</span>
						</div>
					</div>

					<div class="hero-visual">
						<div class="screenshot-frame">
							<div class="screenshot-topbar">
								<span class="screenshot-dot dot-red"></span>
								<span class="screenshot-dot dot-yellow"></span>
								<span class="screenshot-dot dot-green"></span>
								<span class="screenshot-label">LPIS-SC &middot; Farmer View &mdash; Alentejo, Portugal</span>
							</div>
							<img src="img/lpis_sc.png" alt="LPIS Sustainability Compass showing Alentejo, Portugal with LPIS parcels and indicator layers" class="screenshot-img" />
						</div>
					</div>
				</div>

				<section id="spatial-insights" class="features-section">
					<div class="section-head">
						<p class="section-overline">Spatial Insights</p>
						<h2>Beyond map visualisation</h2>
						<p>
							LPIS-SC transforms LPIS and Earth observation data into actionable spatial insights
							across scales — from individual parcels to administrative regions.
						</p>
					</div>
					<div class="features-grid">
						<article class="how-step feature-step">
							<img src="img/contextual.png" alt="Regional context view comparing administrative region statistics on the LPIS Sustainability Compass" class="feature-image" />
							<div class="feature-copy">
								<h3>Contextual assessment</h3>
								<p>Compare how a farm or region relates to its surrounding landscape using LPIS, CLC 2018 and pre-computed statistics across LAU, NUTS3/2/1 and national level.</p>
							</div>
						</article>
						<article class="how-step feature-step">
							<img src="img/consistency.png" alt="Land use and land cover comparison charts for selected LPIS region" class="feature-image" />
							<div class="feature-copy">
								<h3>Classification consistency</h3>
								<p>Identify discrepancies between LPIS land use declarations and remote sensing products (TCD, GFC, CLC, Woody Vegetation) — relevant for agroforestry detection and deforestation-free supply chains.</p>
							</div>
						</article>
						<article class="how-step feature-step">
							<img src="img/tree_cover.png" alt="Tree Cover Density panel showing per-parcel and farm-level statistics" class="feature-image" />
							<div class="feature-copy">
								<h3>Tree cover &amp; agroforestry</h3>
								<p>Compute per-parcel and farm-level mean Tree Cover Density. Classify farmland against 5 % and 10 % TCD thresholds to identify tree-rich areas and agroforestry potential.</p>
							</div>
						</article>
						<article class="how-step feature-step">
							<img src="img/multiscale.png" alt="Multi-scale satellite and parcel overlays used for spatial analysis in LPIS Sustainability Compass" class="feature-image" />
							<div class="feature-copy">
								<h3>Multi-scale analysis</h3>
								<p>On-the-fly client-side processing using Turf.js — from 5&times;5 km neighbourhood analysis up to NUTS1 and country level, with no server required.</p>
							</div>
						</article>
					</div>
				</section>

				<section id="how-it-works" class="how-section">
					<div class="section-head">
						<p class="section-overline">How It Works</p>
						<h2>From parcels to sustainability insights</h2>
						<p>
							Three steps to explore agroforestry indicators for any farm or administrative region in Europe.
						</p>
					</div>
					<div class="how-steps">
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-user-circle"></i></div>
							<h3>Choose your profile</h3>
							<p><strong>Farmer:</strong> parcel- and farm-level analysis, comparison with surrounding area and regional averages. <strong>Policy Maker:</strong> administrative-level dashboard across LAU, NUTS3/2/1.</p>
						</article>
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-map"></i></div>
							<h3>Navigate to your area</h3>
							<p>Pan and zoom the interactive map. LPIS parcel layers load live from official WFS/WMS services — nothing is stored locally.</p>
						</article>
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-bar-chart"></i></div>
							<h3>Get spatial insights</h3>
							<p>Statistics are computed on-the-fly in your browser: TCD per parcel, land use composition, forest cover, woody vegetation and LULC classification consistency.</p>
						</article>
					</div>
				</section>

				<section id="covered-countries" class="case-studies-section">
					<div class="section-head section-head-row">
						<div>
							<p class="section-overline">Covered Countries</p>
							<h2>Open LPIS data across Europe</h2>
							<p>
								LPIS-SC integrates official land parcel datasets from national registries across the EU, with more countries added regularly.
							</p>
						</div>
						<a class="launch-button" href="#" @click.prevent="openProfileOverlay">Open Compass</a>
					</div>
					<div class="case-grid">
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('AT')"><span class="flag flag-at"></span> Austria</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('BE')"><span class="flag flag-be"></span> Belgium</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('CZ')"><span class="flag flag-cz"></span> Czech Republic</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('DK')"><span class="flag flag-dk"></span> Denmark</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('FI')"><span class="flag flag-fi"></span> Finland</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('FR')"><span class="flag flag-fr"></span> France</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('DE')"><span class="flag flag-de"></span> Germany</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('IE')"><span class="flag flag-ie"></span> Ireland</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('NL')"><span class="flag flag-nl"></span> Netherlands</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('PT')"><span class="flag flag-pt"></span> Portugal</a>
						<a class="country-pill" href="#" @click.prevent="openCountryCompass('ES')"><span class="flag flag-es"></span> Spain</a>
					</div>
				</section>

				<section id="digitaf" class="digitaf-section">
					<div class="digitaf-header">
						<a class="digitaf-logo-link" href="https://digitaf.eu" target="_blank" rel="noopener noreferrer" aria-label="DigitAF website">
							<img src="img/logoDigitAF_HR.png" alt="DigitAF" class="digitaf-logo" />
						</a>
						<div class="digitaf-cta">
							<p class="digitaf-overline">Part of DigitAF Virtual Space</p>
							<h2>Built Within DigitAF</h2>
							<p>
								LPIS-SC is developed under the DigitAF project (Grant Agreement n.º 101059794),
								funded by the European Union's Horizon Europe research and innovation programme.
							</p>
							<a class="digitaf-cta-button" href="https://digitaf.eu" target="_blank" rel="noopener noreferrer">Visit DigitAF</a>
						</div>
					</div>
					<div class="digitaf-links">
						<div>
							<h4>Publications</h4>
							<ul>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.15084362" target="_blank" rel="noopener noreferrer"><b>D1.2 Database on Availability of Agri-Environmental Indices</b> in Member States at NUTS3, and Options for Data Collection at Farm Scale.</a></li>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.15609503" target="_blank" rel="noopener noreferrer"><b>D1.4 AF-LPIS spatial policy models</b> implemented for use in LL: The LPIS sustainability compass.</a></li>
								<li><i class="fa-solid fa-tv"></i> <a href="https://doi.org/10.5281/zenodo.20966559" target="_blank" rel="noopener noreferrer"><b>EURAF2026 The LPIS Sustainability Compass</b>: Linking Parcel Data to Sustainability and Policy Insights</a></li>
							</ul>
						</div>
						<div>
							<h4>Policy Briefings</h4>
							<ul>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.7936686" target="_blank" rel="noopener noreferrer"><b>#12 Defining European forests and agroforests in the EUDR</b></a></li>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.7792656" target="_blank" rel="noopener noreferrer"><b>#21 Landscape Features in the new CAP</b></a></li>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.7828434" target="_blank" rel="noopener noreferrer"><b>#22 Agroforestry Definitions in the New CAP</b></a></li>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.7987086" target="_blank" rel="noopener noreferrer"><b>#25 Options for FAO Reporting on Trees Outside Forests</b></a></li>
								<li><i class="fa-regular fa-file-pdf"></i> <a href="https://doi.org/10.5281/zenodo.15712677" target="_blank" rel="noopener noreferrer"><b>#68 Availability and use of IACS geospatial data in the EU</b></a></li>
							</ul>
						</div>
						<div>
							<h4>Open ecosystem</h4>
							<ul>
								<li><a href="https://land.copernicus.eu/" target="_blank" rel="noopener noreferrer"><b>Copernicus Land Monitoring Service (CMLS)</b></a></li>
								<li><a href="https://forobs.jrc.ec.europa.eu/glc2000" target="_blank" rel="noopener noreferrer"><b>Joint Research Centre (JRC) spatial datasets</b></a></li>
								<li><a href="https://maps.regenfarmer.com/" target="_blank" rel="noopener noreferrer"><b>Regen Farmer LPIS API</b></a></li>
								<li><i class="fa-brands fa-github"></i> <a href="https://github.com/euraf/eu-lpis-stats" target="_blank" rel="noopener noreferrer"><b>LPIS Statistics by Administrative Unit</b></a></li>
								<li><i class="fa-brands fa-github"></i> <a href="https://github.com/euraf/eu-nuts-lau" target="_blank" rel="noopener noreferrer"> <b>EU Administrative Units for Web Mapping</b></a></li>
							</ul>
							<h4 class="mt-4">Contribute</h4>
							<ul>
								<li><i class="fa-regular fa-comment"></i> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer"><b>Share feedback and ideas</b> through the “Feedback & Ideas” button in the application</a></li>
								<li><i class="fa-regular fa-lightbulb"></i> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfpRQTzxsG4rifDJK5qVnv1yfuQl1Gf5hqWRZZf962Nc5Y6zQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer"><b>Suggest new spatial insights</b></a></li>
								<li><i class="fa-brands fa-github"></i> <a href="https://github.com/euraf/LPIS-SC/issues" target="_blank" rel="noopener noreferrer"><b>Report issues or request features</b></a></li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</section>

		<div class="profile-overlay" v-if="profileOverlayOpen" @click.self="closeProfileOverlay">
			<div class="profile-dialog" role="dialog" aria-modal="true" aria-label="Choose your profile">
				<button class="profile-close" type="button" @click="closeProfileOverlay" aria-label="Close profile selection">
					<i class="fa fa-times"></i>
				</button>
				<p class="profile-overline">Tailor Your Experience</p>
				<h2>How would you like to explore?</h2>
				<p class="profile-subtitle">Choose your profile to customize your Compass experience.</p>
				<p class="profile-step"><i class="fa fa-check-circle"></i> Step 1 of 1: Choose your profile</p>

				<div class="profile-grid">
					<article
						v-for="profile in profiles"
						:key="profile.id"
						class="profile-card"
						:class="{ 'is-selected': selectedProfile === profile.id }"
						@click="selectProfile(profile.id)"
					>
						<div class="profile-icon"><i class="fa" :class="profile.icon"></i></div>
						<h3>{{ profile.title }}</h3>
						<p class="profile-tagline">{{ profile.tagline }}</p>
						<ul>
							<li v-for="feature in profile.features" :key="feature">{{ feature }}</li>
						</ul>
						<button class="profile-continue" type="button" @click.stop="continueWithProfile(profile.id)">
							Continue
						</button>
					</article>
				</div>

				<p class="profile-footnote">You can switch profiles anytime from Settings.</p>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			mobileMenuOpen: false,
			profileOverlayOpen: false,
		};
	},
	computed: {
		profiles() {
			return this.$root.$data.profiles
		},
		selectedProfile() {
			return this.$root.$data.selectedProfile
		}
	},
	methods: {
		toggleMobileMenu() {
			this.mobileMenuOpen = !this.mobileMenuOpen;
		},
		closeMobileMenu() {
			this.mobileMenuOpen = false;
		},
		scrollToSection(sectionId) {
			this.closeMobileMenu();
			this.$nextTick(() => {
				const section = this.$el && this.$el.querySelector(`#${sectionId}`);
				if (!section) {
					return;
				}
				section.scrollIntoView({ behavior: "smooth", block: "start" });
			});
		},
		openProfileOverlay() {
			this.profileOverlayOpen = true;
			this.mobileMenuOpen = false;
		},
		closeProfileOverlay() {
			this.profileOverlayOpen = false;
		},
		selectProfile(profileId) {
			this.selectedProfile = profileId;
		},
		openCountryCompass(countryCode) {
			const countryTargets = {
				AT: { lon: 14.55, lat: 47.52, zoom: 7 },
				BE: { lon: 4.67, lat: 50.64, zoom: 8 },
				CZ: { lon: 15.47, lat: 49.8, zoom: 7 },
				DK: { lon: 10.0, lat: 56.1, zoom: 7 },
				FI: { lon: 26.0, lat: 64.5, zoom: 6 },
				FR: { lon: 2.45, lat: 46.6, zoom: 6 },
				DE: { lon: 10.45, lat: 51.17, zoom: 6.5 },
				IE: { lon: -8.0, lat: 53.4, zoom: 7 },
				NL: { lon: 5.29, lat: 52.13, zoom: 8 },
				PT: { lon: -8.42, lat: 39.5, zoom: 7 },
				ES: { lon: -3.7, lat: 40.4, zoom: 6 },
			};

			const target = countryTargets[countryCode];
			if (!target) {
				return;
			}

			const x = target.lon * 20037508.34 / 180;
			let y = Math.log(Math.tan((90 + target.lat) * Math.PI / 360)) / (Math.PI / 180);
			y = y * 20037508.34 / 180;

			localStorage.setItem("lpis_sc_profile", "farmer");
			this.$router.push({
				name: "compass",
				query: {
					profile: "farmer",
					basemap: "osm",
					center: `${x.toFixed(2)},${y.toFixed(2)}`,
					zoom: String(target.zoom),
				},
			});
		},
		continueWithProfile(profileId) {
			const targetProfile = profileId || this.selectedProfile;
			localStorage.setItem("lpis_sc_profile", targetProfile);
			this.profileOverlayOpen = false;
			this.$router.push({ name: "compass", query: { profile: targetProfile } });
		},
	},
};
</script>