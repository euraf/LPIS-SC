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
						<div class="nav-links" :class="{ 'is-open': mobileMenuOpen }">
							<a href="#" @click="closeMobileMenu">About</a>
							<a href="#" @click="closeMobileMenu">Features</a>
							<a href="#" @click="closeMobileMenu">Case Studies</a>
							<a href="#" @click="closeMobileMenu">Documentation</a>
						</div>
						<div class="nav-actions">
							<button
								class="menu-button"
								type="button"
								@click="toggleMobileMenu"
								:aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
								:aria-expanded="mobileMenuOpen ? 'true' : 'false'"
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
						<h1>LPIS Sustainability Compass</h1>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer luctus sem at
							neque fermentum, sed dictum tellus volutpat for European agroforestry planning.
						</p>
						<div class="hero-actions">
							<a class="primary-button" href="#" @click.prevent="openProfileOverlay">Open the Compass</a>
							<a class="secondary-button" href="#">Watch Demo</a>
						</div>
					</div>

					<div class="hero-visual">
						<div class="map-window">
							<div class="map-window-top">
								<span class="tab active"></span>
								<span class="tab"></span>
								<span class="tab"></span>
								<div class="map-window-pill">Scenario view</div>
							</div>
							<div class="map-window-body">
								<aside class="map-sidebar left-sidebar">
									<div class="sidebar-header"></div>
									<div class="sidebar-block tall"></div>
									<div class="sidebar-block"></div>
								</aside>
								<div class="map-canvas">
									<div class="parcel parcel-a"></div>
									<div class="parcel parcel-b"></div>
									<div class="parcel parcel-c"></div>
									<div class="parcel parcel-d"></div>
									<div class="route route-main"></div>
									<div class="route route-secondary"></div>
									<div class="map-tag tag-one">Pastures</div>
									<div class="map-tag tag-two">Hedgerows</div>
								</div>
								<aside class="map-sidebar right-sidebar">
									<div class="sidebar-chip"></div>
									<div class="sidebar-chip"></div>
									<div class="sidebar-card"></div>
									<div class="sidebar-card short"></div>
								</aside>
							</div>
						</div>
					</div>
				</div>

				<section class="how-section">
					<div class="section-head">
						<p class="section-overline">How It Works</p>
						<h2>From parcels to practical guidance</h2>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis tincidunt risus, non posuere odio.
						</p>
					</div>
					<div class="how-steps">
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-map-marker"></i></div>
							<h3>Pick your area</h3>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						</article>
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-clone"></i></div>
							<h3>Select your parcels</h3>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						</article>
						<article class="how-step">
							<div class="how-icon"><i class="fa fa-bar-chart"></i></div>
							<h3>Get insights</h3>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						</article>
					</div>
				</section>

				<section class="case-studies-section">
					<div class="section-head section-head-row">
						<div>
							<p class="section-overline">Featured Case Studies</p>
							<h2>Discover pilot territories</h2>
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent malesuada velit sit amet sem mattis ultrices.
							</p>
						</div>
						<a class="view-all-link" href="#"><i class="fa fa-flag"></i> View all</a>
					</div>
					<div class="case-grid">
						<article class="case-card">
							<div class="case-image case-image-a"></div>
							<div class="case-body">
								<h3>Alentejo</h3>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis sem sed.</p>
								<div class="case-meta">
									<span><i class="fa fa-map-o"></i> Drylands</span>
									<span><i class="fa fa-line-chart"></i> 6 indicators</span>
								</div>
							</div>
						</article>
						<article class="case-card">
							<div class="case-image case-image-b"></div>
							<div class="case-body">
								<h3>Smaland</h3>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis feugiat dolor a ipsum finibus.</p>
								<div class="case-meta">
									<span><i class="fa fa-tree"></i> Woodlands</span>
									<span><i class="fa fa-line-chart"></i> 8 indicators</span>
								</div>
							</div>
						</article>
						<article class="case-card">
							<div class="case-image case-image-c"></div>
							<div class="case-body">
								<h3>Burgos</h3>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis mi at nisl tincidunt.</p>
								<div class="case-meta">
									<span><i class="fa fa-leaf"></i> Agroforestry</span>
									<span><i class="fa fa-line-chart"></i> 5 indicators</span>
								</div>
							</div>
						</article>
					</div>
				</section>

				<section class="digitaf-section">
					<div class="digitaf-cta">
						<p class="section-overline">Built Within DigitAF</p>
						<h2>Connected to the wider agroforestry toolkit</h2>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur dapibus id justo eget pulvinar.
						</p>
						<a class="primary-button" href="#">Learn more</a>
						<div class="flag-row" aria-label="Country flags">
							<span class="flag flag-pt"></span>
							<span class="flag flag-se"></span>
							<span class="flag flag-de"></span>
							<span class="flag flag-fr"></span>
							<span class="flag flag-es"></span>
							<span class="flag flag-hr"></span>
						</div>
					</div>
					<div class="digitaf-links">
						<div>
							<h4>Platform</h4>
							<ul>
								<li><a href="#">Overview</a></li>
								<li><a href="#">Use Cases</a></li>
								<li><a href="#">Data Sources</a></li>
							</ul>
						</div>
						<div>
							<h4>Open Data</h4>
							<ul>
								<li><a href="#">Catalog</a></li>
								<li><a href="#">API Access</a></li>
								<li><a href="#">Metadata</a></li>
							</ul>
						</div>
						<div>
							<h4>Team</h4>
							<ul>
								<li><a href="#">Partners</a></li>
								<li><a href="#">Governance</a></li>
								<li><a href="#">Contact</a></li>
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
		continueWithProfile(profileId) {
			const targetProfile = profileId || this.selectedProfile;
			localStorage.setItem("lpis_sc_profile", targetProfile);
			this.profileOverlayOpen = false;
			this.$router.push({ name: "compass", query: { profile: targetProfile } });
		},
	},
};
</script>