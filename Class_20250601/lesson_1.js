Map.centerObject(tehran)

var imageCollection = ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_NO2")
        .filterDate("2021-01-01", "2022-01-01")
        .filterBounds(tehran);
  print(imageCollection, 'Image collection info');

var singleImage = ee.Image("COPERNICUS/S5P/NRTI/L3_NO2/20210104T100445_20210104T104833");
  print(singleImage, 'Single image info');

Map.addLayer(singleImage);