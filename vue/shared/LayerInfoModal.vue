<script>
module.exports = {
    name: "layer-info-modal",
    props: {
        layerVisible: {
            type: Boolean,
            default: true,
        },
        layerId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        typeLabel: {
            type: String,
            default: '',
        },
        referenceYearLabel: {
            type: String,
            default: 'Not specified',
        },
        countryCode: {
            type: String,
            default: '',
        },
        countryFlagClass: {
            type: String,
            default: '',
        },
        officialWebsite: {
            type: String,
            default: '',
        },
        serviceUrl: {
            type: String,
            default: '',
        },
        providerBadges: {
            type: Array,
            default: function() {
                return []
            },
        },
        layerGroupLabels: {
            type: Array,
            default: function() {
                return []
            },
        }
    },
    data() {
        return {
            isOpen: false,
        }
    },
    computed: {
        hasLayerGroups() {
            return this.layerGroupLabels.length > 0
        }
    },
    watch: {
        layerVisible(isVisible) {
            if (!isVisible) {
                this.isOpen = false
            }
        }
    },
    methods: {
        setOpen(next) {
            this.isOpen = next
        }
    }
}
</script>

<template>
    <span class="layer-info-modal-shell">
        <button
            type="button"
            class="layer-origin-toggle"
            :title="isOpen ? 'Hide layer info' : 'Show layer info'"
            @click.stop="setOpen(!isOpen)"
        ><i class="fa fa-info-circle" aria-hidden="true"></i><span class="sr-only">Layer info</span></button>

        <div class="layer-origin-modal-backdrop" v-if="isOpen" @click.self="setOpen(false)">
            <div class="layer-origin-modal" role="dialog" aria-modal="true" :aria-labelledby="layerId + '_origin_title'">
                <div class="layer-origin-modal-header">
                    <h5 class="layer-origin-modal-title" :id="layerId + '_origin_title'">{{ title }}</h5>
                    <button type="button" class="layer-origin-modal-close" @click="setOpen(false)" aria-label="Close layer info">&times;</button>
                </div>
                <div class="layer-origin-providers" v-if="providerBadges.length">
                    <div class="layer-origin-provider" v-for="provider in providerBadges" :key="provider.id">
                        <img class="layer-origin-provider-logo" :src="provider.logo" :alt="provider.name + ' logo'">
                        <span class="layer-origin-provider-name">{{ provider.subname }}</span>
                    </div>
                </div>
                <div class="layer-origin-meta">
                    <div class="layer-origin-meta-item">
                        <span class="layer-origin-meta-label">Layer ID</span>
                        <span class="layer-origin-meta-value">{{ layerId }}</span>
                    </div>
                    <div class="layer-origin-meta-item" v-if="typeLabel">
                        <span class="layer-origin-meta-label">Type</span>
                        <span class="layer-origin-meta-value">{{ typeLabel }}</span>
                    </div>
                    <div class="layer-origin-meta-item">
                        <span class="layer-origin-meta-label">Reference year</span>
                        <span class="layer-origin-meta-value">{{ referenceYearLabel }}</span>
                    </div>
                    <div class="layer-origin-meta-item" v-if="countryCode">
                        <span class="layer-origin-meta-label">Country</span>
                        <span class="layer-origin-country"><span class="flag layer-origin-flag" :class="countryFlagClass"></span>{{ countryCode }}</span>
                    </div>
                    <div class="layer-origin-meta-item" v-if="hasLayerGroups">
                        <span class="layer-origin-meta-label">Groups</span>
                        <div class="layer-origin-group-list">
                            <span class="layer-origin-group-chip" v-for="group in layerGroupLabels" :key="group">{{ group }}</span>
                        </div>
                    </div>
                    <div class="layer-origin-meta-item" v-if="officialWebsite">
                        <span class="layer-origin-meta-label">Website</span>
                        <a class="layer-origin-service-link" :href="officialWebsite" target="_blank" rel="noopener noreferrer">Open official website</a>
                    </div>
                    <div class="layer-origin-meta-item" v-else>
                        <span class="layer-origin-meta-label">Website</span>
                        <span class="layer-origin-meta-value">Not specified</span>
                    </div>
                    <div class="layer-origin-meta-item" v-if="serviceUrl">
                        <span class="layer-origin-meta-label">Service</span>
                        <a class="layer-origin-service-link" :href="serviceUrl" target="_blank" rel="noopener noreferrer">Open service URL</a>
                    </div>
                </div>
                <div class="layer-origin-text">{{ description }}</div>
            </div>
        </div>
    </span>
</template>