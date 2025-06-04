# 🌍 Basic to Advanced Cloud-Based Remote Sensing with Google Earth Engine (GEE)

This repository provides a curated collection of educational scripts written in JavaScript for use in the [Google Earth Engine](https://earthengine.google.com/) (GEE) Code Editor. These examples are designed for early-stage graduate students or anyone starting to explore cloud-based remote sensing. The goal is to introduce key analytical techniques—such as time series visualization, pansharpening, land surface temperature retrieval, and land cover classification—through hands-on, interpretable code.

Each script is self-contained and demonstrates a specific concept using publicly available satellite imagery from platforms like Sentinel-5P and Landsat 9. These examples were developed as part of a remote sensing teaching module at the Master's level and are structured to support both instructors and independent learners.

## 🔍 Contents

### 1. `lesson_1.js` and `lesson_2.js` (folder: `Class_20250601`)
Basic visualizations using Sentinel-5P NO₂ (TROPOMI) data:
- `lesson_1`: Adds a single image layer to the map
- `lesson_2`: Reduces a one-month collection (January 2021) and clips it to Tehran

### 2. `lesson_3.js` (folder: `Class_20250603`)
Processes Landsat 9 imagery to calculate Land Surface Temperature (LST) and indices:
- Applies scaling factors to optical and thermal bands
- Calculates LST in Celsius from the ST_B10 band
- Computes NDVI and NDBI indices
- Performs supervised (Random Forest) and unsupervised (K-means) classification
- Visualizes LST, NDVI, NDBI, true color composite, and classified maps
- Exports the unsupervised classification result to Google Drive

### 3. `lesson_4.js` (folder: `Class_20250604`)
Pansharpens Landsat 9 imagery using Intensity-Hue-Saturation (IHS) and Brovey Transform methods:
- IHS: Converts RGB to HSV, replaces the 'Value' with the panchromatic band (B8), and converts back to RGB
- Brovey: Merges panchromatic data with RGB bands, normalizing by band sum to enhance spatial details
- Visualizes original, IHS-sharpened, and Brovey-sharpened images for comparison

### 4. `pollutionTimeSeries.js`
Visualizes NO₂ concentration trends over time using Sentinel-5P (TROPOMI) data:
- Clips to a defined Area of Interest (AOI)
- Computes mean NO₂ values
- Plots a scatter chart to analyze temporal variation

### 5. `panSharpeningIHS.js`
Pansharpens Landsat 9 imagery using the Intensity-Hue-Saturation (IHS) method:
- Converts RGB to HSV color space
- Replaces 'Value' with the panchromatic band
- Converts back to RGB for a sharper visual

### 6. `panSharpeningBrovey.js`
Uses the Brovey Transform to merge high-resolution panchromatic data with multispectral bands:
- Enhances spatial details
- Maintains spectral balance in RGB + NIR

### 7. `calculatingL9LST.js`
Calculates Land Surface Temperature (LST) from Landsat 9 Level 2 imagery:
- Applies scaling factors to the ST_B10 band
- Converts from Kelvin to Celsius
- Visualizes LST with a color ramp

### 8. `supervisedClassification.js`
Performs supervised land cover classification using a Random Forest model:
- Computes NDVI and NDBI
- Trains a classifier on labeled features (e.g., water, vegetation, impervious surfaces)
- Outputs a classified map and accuracy assessment
- Includes optional export to Google Drive

### 9. `unsupervisedClassification.js`
Executes unsupervised classification using K-means clustering:
- Generates a median composite
- Clusters pixels into land cover classes without training data
- Visualizes clustered image with a distinct palette

## 🛠 Requirements

- Google Earth Engine account
- Familiarity with JavaScript and basic remote sensing principles
- Predefined geometry (`geometry` or `table`) for AOI
- Pre-labeled training FeatureCollections (`W`, `G`, `I`) for supervised classification

## 📌 Notes

- All scripts are ready to run in the GEE Code Editor.
- You may need to adapt AOI, image dates, or band selections based on your study region or use case.
- These scripts are intentionally simplified for educational clarity.

## 🧑‍🏫 About the Author

**Armin Nakhjiri**  
Remote sensing scientist  
📧 Nakhjiri.Armin@gmai.com

---

*Empowering the next generation of geospatial analysts—one script at a time.*
