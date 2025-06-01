// Load Landsat 9 image collection
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate('2023-01-01', '2023-12-31')
  .filterBounds(geometry);

// Function to apply scaling factors for Landsat 9
function applyScaleFactors(image) {
  var opticalBands = image.select(['SR_B[1-7]']).multiply(0.0000275).add(-0.2);
  var thermalBands = image.select(['ST_B.*']).multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// Apply scaling factors and select bands for classification
var composite = landsat9
  .map(applyScaleFactors)
  .median()
  .clip(geometry)
  .select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7']); // Blue, Green, Red, NIR, SWIR1, SWIR2


// Define training parameters for K-means clustering
var training = composite.sample({
  region: geometry,
  scale: 30,
  numPixels: 500
});

// Cluster the data using K-means
var numClusters = 8; // Number of clusters
var clusterer = ee.Clusterer.wekaCascadeKMeans(numClusters).train(training);

// Apply clustering to the image
var classified = composite.cluster(clusterer);

// Visualize the results
var palette = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
Map.addLayer(classified, {min: 0, max: numClusters-1, palette: palette}, 'Clustered Image');
Map.addLayer(composite, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0, max: 0.3}, 'RGB Composite');

// Center the map on the geometry
Map.centerObject(geometry, 10);