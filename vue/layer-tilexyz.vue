<script>
module.exports = {
    name: "layer-tilexyz",
    mixins: [ layer_mixin ],
    props: [ 'layer_id', 'layer_props' ],
	data() {
        this.$set(this.layer_props, "layer", null)
        this.$set(this.layer_props, "selectedFeatures", [])
        this.$set(this.layer_props, "selectedLegendElements", [])
        this.$set(this.layer_props, "olLayerType", 'Tile')
        this.$set(this.layer_props, "olSourceType", 'XYZ')
        this.$set(this.layer_props, "eventResource", 'tile')
        this.$set(this.layer_props, "isLoading", false)
        this.$set(this.layer_props, "tilesLoading", 0)
        this.$set(this.layer_props, "trackedLoadCount", 0)
        this.$set(this.layer_props, "loadBatchFailures", 0)
        this.$set(this.layer_props, "consecutiveLoadFailures", 0)
        this.$set(this.layer_props, "loadFailureDetail", "")
        this.$set(this.layer_props, "loadErrorMessage", null)
        
		return this.layer_props
	},
    mounted() {
        
        this.source.on('tileloadstart', () => {
            this.tilesLoading++;
            this.trackLayerLoadStart();
        });
        this.source.on('tileloadend', () => {
            this.tilesLoading = Math.max(0, this.tilesLoading - 1);
            this.trackLayerLoadEnd(null, false);
        });
        this.source.on('tileloaderror', (event) => {
            this.tilesLoading = Math.max(0, this.tilesLoading - 1);
            this.trackLayerLoadEnd(event, true);
        });
        
        this.$nextTick(() => {
            this.setupLayerObjFunctions()
        })

    },
    computed: {
        url() {
            return this.source_url
        }
    },
    methods: {
        addClickListener() {
            // no need for now
            return
        }
    }
}
</script>

<template>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" :id="layer_id + '_checkbox'"
            :disabled="disabled"
            @change="setShow($event.target.checked)"
            v-model="show">
        <label class="form-check-label" :for="layer_id + '_checkbox'">{{ name_en }}</label>
        <layer-info-modal
            :layer-visible="show"
            :layer-id="layer_id"
            :title="originInfoTitle"
            :description="originInfoDescription"
            :type-label="type"
            :reference-year-label="originReferenceYearLabel"
            :country-code="originCountryCode"
            :country-flag-class="originCountryFlagClass"
            :official-website="originOfficialWebsite"
            :service-url="originServiceUrl"
            :provider-badges="originProviderBadges"
        ></layer-info-modal>
        <layer-load-status :loading="isLoading" :error-message="loadErrorMessage" :layer-id="layer_id"></layer-load-status>
    </div>
</template>