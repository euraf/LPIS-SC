<template>
	<div class="layer-load-status" :class="{ 'is-open': showError }" aria-live="polite">
		<div v-if="loading" class="spinner-border" role="status" aria-label="Loading layer">
			<span class="sr-only">Loading...</span>
		</div>
		<template v-else-if="errorMessage">
			<button
				type="button"
				class="layer-load-warning"
				:aria-expanded="showError ? 'true' : 'false'"
				:aria-controls="popupId"
				:aria-label="showError ? 'Hide layer loading error' : 'Show layer loading error'"
				:title="showError ? 'Hide layer loading error' : 'Show layer loading error'"
				@click.stop="showError = !showError"
			>
				<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
			</button>
			<div v-if="showError" :id="popupId" class="layer-load-error-popup" role="alert">
				<p>{{ errorMessage }}</p>
				<button type="button" aria-label="Close layer error" @click.stop="showError = false">
					<i class="fa fa-times" aria-hidden="true"></i>
				</button>
			</div>
		</template>
	</div>
</template>

<script>
module.exports = {
	props: {
		loading: {
			type: Boolean,
			default: false,
		},
		errorMessage: {
			type: String,
			default: null,
		},
		layerId: {
			type: String,
			required: true,
		},
	},
	data() {
		return { showError: false };
	},
	computed: {
		popupId() {
			return `layer-load-error-${this.layerId}`;
		},
	},
	watch: {
		loading(isLoading) {
			if (isLoading) this.showError = false;
		},
		errorMessage(message) {
			if (!message) this.showError = false;
		},
	},
};
</script>