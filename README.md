# LPIS Sustainability Compass (LPIS-SC)

The LPIS Sustainability Compass is a lightweight, browser-based geospatial analysis tool designed to explore agricultural land use and environmental indicators using publicly available geospatial datasets.

## Overview

The tool enables interactive exploration and analysis of agricultural landscapes by integrating LPIS data with Earth Observation products and other open geospatial datasets.

It supports multi-scale spatial analysis, from individual parcels to regional and administrative levels, and provides contextual insights into land use, tree cover, and landscape structure.

## Key Features

- Interactive visualisation of LPIS parcel and farm data  
- Integration of external geospatial datasets (e.g. Copernicus, JRC)  
- On-the-fly spatial analysis in the browser  
- Contextual comparison with surrounding areas (e.g. 5 × 5 km)  
- Aggregation at multiple spatial levels (parcel, farm, LAU, NUTS)  

## Data Sources

The application relies on publicly available geospatial web services, including:

- LPIS / GSAA datasets provided by Member States (via WFS)
- Copernicus Land Monitoring Service products
- JRC datasets (e.g. Global Forest Cover)

All data is accessed dynamically through web services (WFS/WMS/XYZ tiles) and is not stored locally.

## Technology Stack

- JavaScript / HTML / CSS
- OpenLayers (web mapping)
- Turf.js (geospatial analysis)
- Vue.js (user interface)
- Bootstrap (UI styling)

## Access

The tool is available online:

https://mvagroecology.github.io/lucim

## Contributing

Contributions, suggestions, and feedback are welcome.

- Use the **Feedback & Ideas** button in the application  
- Report issues or propose improvements via GitHub issues  
- Suggest new spatial analysis modules if supporting data is available via open services (e.g. WFS/WMS)

## License

MIT

## Acknowledgements

This tool was developed within the DigitAF project, focusing on improving the use of geospatial data for agricultural and environmental analysis in Europe.