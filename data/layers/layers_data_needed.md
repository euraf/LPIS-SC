# The "Layer" object

## Layer data: initial JSON basic structure

The new layer .json file should be named with it's `id`. Please use only letters, numbers, and underscores in the file name - no spaces or special characters. The file should contain the following information:

```json
{
  "_comment": [
    "Add here any text that might be useful to describe the layer.",
    "Including weblinks to sources of information."
  ],
  "id": "only letters, numbers, and underscores, no spaces or special characters. this needs to be the file name. e.g. lpis_fr_2025",
  "name": "original layer name",
  "name_en": "english version of the layer name",
  "country_code": "e.g. PT",
  "attributions": "any needed attributions. these will be displayed in the [i] symbol at the bottom right of the map viewer.",
  "type": "one of: WFS, WMS, tileXYZ",
  "show": false,
  "disabled": false,
  "baselayer": false,
  "minZoom": 12,
  "zIndex": 1,
  "opacity": 1,
  "layer_groups": [ "copernicus", "jrc" ],
  "source_url": "the url to load the data. it can have the following placeholders, that will be replaced by other layer properties or generated values: [layer_name], [layer_name_detail], [layer_projection], [extent]",
  "layer_name": "optional. if needed for source_url",
  "layer_name_detail": "optional. if needed for source_url",
  "layer_projection": "compulsory. needed for coordinate transformation. in the format EPSG:3857",
  "layer_origin_x": 0,
  "layer_origin_y": 0,
  "layer_resolution": 0,
  "needs_loader": false,
  "feature_infos": {
      "feature_identifier": { "name": "", "key": "" },
      "feature_landuse": { "name": "", "key": "" },
      "feature_area": { "name": "", "key": "", "unit": "square_m or ha" },
      "others": [{ "name": "", "key": "" }]
  },
  "layer_legend": {
    "legend_identifier": "",
    "legend_text": "",
    "legend_elements": {
      "key": {
        "label": "",
        "label_en": "",
        "color": null
      }
    }
  },
  "layer_style": {
    "selected_fill_color": null,
    "selected_stroke_color": null,
    "fill_color": null,
    "stroke_color": null
  }
}
```
### id

### _comment

### name

### name_en

### country_code

### attributions

### type

### show

### disabled

### baselayer

### minZoom

### zIndex

### opacity

### layer_groups

### source_url
[layer_name], [layer_name_detail], [layer_projection], [extent]

### layer_name

### layer_name_detail

### layer_projection

### layer_origin_x

### layer_origin_y

### layer_resolution

### needs_loader

### feature_infos

### layer_legend

### layer_style


## Layer data: generated within the app

### bboxes
5, 10, user-defined?
{
    bbox_5: {
        bboxLayer: square layer,
        bboxPixelsLayers: {
            raster_id: point layer
        },
        stats: {
            all: {

            },
            withinPolygons: {

            }
        }
    }
}

point = {
    feature: object,
    withinPolygons: true (accounted for parcels, for farm and for bbox)/false (only accounted for bbox)
}

### nuts
{
    nutes details, name, area, etc,
    nutsLayer: nuts boundary,
    nutsPixelsLayer: point layer,
    stats: {

    }
}

### eventResource

### isLoading

### layer

### olFormatType

### olLayerType

### olSourceType

### selectedFeatures
[ featureA, featureB ]
featureA = {
    feature: object,
    info: [],
    layerId: string,
    layerName: string,
    legendId: code,
    projection: "EPSG:3857",
    stats: {
        raster_id_sum: number,
        raster_id_avg: number,
        etc
    }
}
### selectedFeaturesSummary
{
    area: number,
    stats : {

    }
}

### selectedLegendElements
[ legend code ]

### stats
{
    raster_id_sum: number,
    raster_id_avg: number,
    etc
}