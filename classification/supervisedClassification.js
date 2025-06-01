var geometry = ee.Geometry.Polygon(
  [[[51.06292958958561, 35.84607683539046],
    [51.06292958958561, 35.559474077751595],
    [51.68365712864811, 35.559474077751595],
    [51.68365712864811, 35.84607683539046]]], null, false);

var aoi = geometry;

var startDate = '2023-06-01';
var endDate = '2023-10-01';

// Load Landsat 9 image collection
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate(startDate, endDate)
  .filterBounds(AOI);

// Function to apply scaling factors for Landsat 9
function applyScaleFactors(image) {
  var opticalBands = image.select(['SR_B[1-7]']).multiply(0.0000275).add(-0.2);
  var thermalBands = image.select(['ST_B.*']).multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// Apply scaling factors and calculate NDVI and NDBI
function addIndices(image) {
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
  var ndbi = image.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI');
  return image.addBands([ndvi, ndbi]);
}

// Prepare composite with indices
var composite = landsat9
  .map(applyScaleFactors)
  .map(addIndices)
  .median()
  .clip(AOI)
  .select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'NDVI', 'NDBI']);

// Load training data
var training = W.merge(G).merge(I).merge(I);

// Sample the composite at training points
var trainingData = composite.sampleRegions({
  collection: training,
  properties: ['LC'],
  scale: 30,
  tileScale: 1,
  geometries: false
});
print(trainingData);

// Train a Random Forest classifier
var classifier = ee.Classifier.smileRandomForest(100)
  .train({
    features: trainingData,
    classProperty: 'LC',
  });

// Classify the composite
var classified = composite.classify(classifier);

// Visualize the results
var palette = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // Colors for classes 0 to 3
Map.addLayer(composite, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0, max: 0.3}, 'RGB Composite');
Map.addLayer(composite, {bands: ['SR_B5', 'SR_B3', 'SR_B2'], min: 0, max: 0.3}, 'False Color Composite');
Map.addLayer(composite.select('NDVI'), {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI');
Map.addLayer(composite.select('NDBI'), {min: -1, max: 1, palette: ['blue', 'white', 'brown']}, 'NDBI');
Map.addLayer(classified, {min: 0, max: 3, palette: palette}, 'Classified Image');
Map.centerObject(AOI, 10);

// Accuracy assessment
print('confusion matrix', classifier.confusionMatrix());
print('overal accuracy', classifier.confusionMatrix().accuracy());

// Export result
Export.image.toDrive({
  image : classified,
  description : 'classified_2022',
  scale : 10,
  region : AOI,
  maxPixels: 1e9
});
