// Center the map on the Area of Interest (AOI)
Map.centerObject(AOI);

// Define the date range for the analysis
var startDate = '2024-06-01';
var endDate = '2024-10-01';

// Load and process Landsat 9 imagery
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate(startDate, endDate) // Filter images by date range
  .filterBounds(AOI)              // Filter images by the Area of Interest
  .map(applyScaleFactors)         // Apply scaling factors to optical and thermal bands
  .map(clipper)                   // Clip images to the AOI
  .map(calLST)                    // Calculate Land Surface Temperature (LST)
  .map(addIndices);               // Add NDVI and NDBI indices
  // .filter(ee.Filter.lt('CLOUD_COVER', 10)); // Optional: Filter by cloud cover (commented out)

// Print the processed image collection for inspection
print('Landsat 9 Image Collection:', landsat9);

// Function to apply scaling factors to optical and thermal bands
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.*').multiply(0.0000275).add(-0.2); // Scale optical bands
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0); // Scale thermal bands
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true); // Replace original bands with scaled ones
}

// Function to clip images to the AOI
function clipper(image) {
  return image.clip(AOI); // Clip the image to the Area of Interest
}

// Function to calculate NDVI and NDBI indices
function addIndices(image) {
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI'); // Calculate NDVI
  var ndbi = image.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI'); // Calculate NDBI
  return image.addBands([ndvi, ndbi]); // Add indices as new bands
}

// Function to calculate Land Surface Temperature in Celsius
function calLST(image) {
  var lstCelsius = image.select('ST_B10').subtract(273.15).rename('LSTc'); // Convert Kelvin to Celsius
  return image.addBands(lstCelsius); // Add LST band
}

// Add layers to the map for visualization
Map.addLayer(landsat9.median().select('LSTc'), {
  min: 30,
  max: 55,
  palette: ['blue', 'yellow', 'green', 'red']
}, 'Land Surface Temperature (Celsius)');

Map.addLayer(landsat9.median().select('NDVI'), {
  min: -1,
  max: 1,
  palette: ['black', 'white', 'green'] // Fixed typo: pallete -> palette
}, 'NDVI');

Map.addLayer(landsat9.median().select('NDBI'), {
  min: -1,
  max: 1,
  palette: ['black', 'white', 'red'] // Fixed typo: pallete -> palette
}, 'NDBI');

Map.addLayer(landsat9.median(), {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0,
  max: 0.30
}, 'True Color Composite');

// Merge training datasets (assumes w, g, I are predefined feature collections)
var training = w.merge(g).merge(I);
print('Training Data:', training);

// Create a composite image with selected bands
var composite = landsat9.median()
  .select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'NDVI', 'NDBI']);
print('Composite Image:', composite);

// Sample the composite image for training data
var trainingData = composite.sampleRegions({
  collection: training,
  properties: ['LC'], // Land cover property
  scale: 30,
  tileScale: 1,
  geometries: false
});
print('Training Data Sampled:', trainingData);

// Train a Random Forest classifier
var classifier = ee.Classifier.smileRandomForest(100).train({
  features: trainingData,
  classProperty: 'LC' // Classify based on land cover
});

// Classify the composite image
var classified = composite.classify(classifier);
Map.addLayer(classified, {
  min: 0,
  max: 2,
  palette: ['#0339ff', 'green', 'black']
}, 'Classified 2024 (Supervised)');

// Print classifier performance metrics
print('Confusion Matrix:', classifier.confusionMatrix());
print('Overall Accuracy:', classifier.confusionMatrix().accuracy());

// Unsupervised classification using K-Means clustering
var training2 = composite.sample({
  region: AOI,
  scale: 30,
  numPixels: 500
});

var numClasses = 5;
var clusterer = ee.Clusterer.wekaKMeans(numClasses).train(training2);

// Perform unsupervised classification
var classified2 = composite.cluster(clusterer);
Map.addLayer(classified2, {
  min: 0,
  max: numClasses - 1,
  palette: ['#0339ff', 'green', 'black', 'white', 'yellow']
}, 'Classified 2024 (Unsupervised)');

// Export the unsupervised classification result to Google Drive
Export.image.toDrive({
  image: classified2,
  description: 'classified2',
  folder: 'GEE_exports',
  region: AOI,
  scale: 30,
  maxPixels: 1e9
});