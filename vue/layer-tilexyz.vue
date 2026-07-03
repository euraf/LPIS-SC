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
        this.$set(this.layer_props, "showOriginInfo", false)
        
		return this.layer_props
	},
    mounted() {
        
        this.source.on('tileloadstart', () => {
            if (this.tilesLoading == 0) {
                this.$set(this, 'isLoading', true);
            }
            this.tilesLoading++;
        });
        this.source.on('tileloadend', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
        });
        this.source.on('tileloaderror', () => {
            this.tilesLoading--;
            if (this.tilesLoading === 0) {
                this.$set(this, 'isLoading', false);
            }
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
            v-model="showOriginInfo"
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
        <div class="spinner-border" v-if="isLoading" role="status"><span class="sr-only">Loading...</span></div>
    </div>
</template>