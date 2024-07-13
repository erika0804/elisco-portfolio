
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class: Intro to Remote Sensing 
// Authors: Lily Kaplan, Erika Lisco, Milagros Becerra, Monica Muñoz 
// Project: We are addressing above-ground water fluctuations in Mexico City, Mexico from 2015-2022. 
// We will look at climate conditions to compare the dry and wet seasons based on El Nino and La Nina conditions.
// More info: https://clarkuedu-my.sharepoint.com/:w:/r/personal/likaplan_clarku_edu/Documents/Intro_Remote_Sensing_Shared/Mini%20Project%20Report.docx?d=w630e0c2d70934d9ea1ffcde919c8c7b7&csf=1&web=1&e=n6enpV
////////////////////////////////////////////////////////////////////////////////////////////////////////
//2 hard classifications of the wet and dry years

////////////////////////////////////////DRY/////////////////////////////////////////////////////
//PART 1. PRE-PROCESSING
//  creating a spatial and temporal filter
//------------------------------------------------------------------------------------------
//Spatial filter
var SpatFiltered = sentinel.filterBounds(aoi);
//Time filter
var dry1 = SpatFiltered.filterDate('2019-01-01', '2019-04-30');
var dry2 = SpatFiltered.filterDate('2019-12-01' , '2019-12-31');
// images with less than 10% cloud cover
var drymerge = ee.ImageCollection(dry1.merge(dry2));
var qualityfilterdry = drymerge.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 10);

//-------------------------------------------------------------------------------------------
//Create cloud mask using Sentine-2 QA60 band
//-------------------------------------------------------------------------------------------
//Function to mask clouds using Sentine-2 QA60 band

function maskS2clouds(image) {
  var qa = image.select('QA60');
  
  //Bits 10 and 11 are clouds and cirrus. Select those bits 
  var cloudBitMask = 1 << 10; //pushes '1' 10 spaces to the left: 01000000000
  var cirrusBitMask = 1<< 11; //pushes '1' 11 spaces to the left: 10000000000
  //Both flags should be set to zero, indicating clear conditions
  //We keep the pixel if the Bit is zero
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));
  //Return the masked bands ans scale data using metadata scaling factor
  return image.updateMask(mask).divide(10000)
      .select('B.*')
      .copyProperties(image, ["system:time_start"]);
}

//Once the function is created, we can apply function to the selected images
var CloudMasked_dry = qualityfilterdry.map(maskS2clouds);

print(CloudMasked_dry);

//-----------------------------------------------------------------------------------------------------
//Combine the masked images using median operator and then visualize
//-----------------------------------------------------------------------------------------------------
var CloudMaskMedian_dry = CloudMasked_dry.median().clip(aoi);
 
 //visualize the FCC
var falseColor1 = {
   bands: ["B11","B8","B4"], //SWIR, NIR, Red
   min: 0,
   max: 0.5
 };
 
Map.addLayer (CloudMaskMedian_dry, falseColor1, "median cloud masked false color dry");
print ('median of all filtered', CloudMaskMedian_dry);

 //PART 2. CREATION OF TRAINING SITES
 //----------------------------------------------------------------------------------------------------
 //Merge training sites into single feature collection
 //----------------------------------------------------------------------------------------------------
var MergedTrain_dry = Water.merge(Roads)
                           .merge(Forest)
                           .merge(Vegetation_BareSoil)
                           .merge(Buildings)
                           .merge(Mountain_Shadow);
print('merged train',MergedTrain_dry);

//PART 3. CREATING SIGNATURES FOR CLASSIFICATION
//-----------------------------------------------------------------------------------------------------
//Create signatures for the classification
//-----------------------------------------------------------------------------------------------------
//Specify the bands to use in the classification
 
var bands = ['B2', 'B3', 'B8', 'B11'];
 
//Extract training data by overlaying the merged training sites to the bands and extracting values
//of each band for each point. Add new column with random number that will be used to partition data for validation.
 
var points = CloudMaskMedian_dry.select(bands).sampleRegions({
  collection:MergedTrain_dry,
  properties: ['Label'],
  scale: 30
}).randomColumn(); // To divide into training and validation
 
print(points.first(), points);
 
//Visualize signatures
// Extract mean for each class - are they separable? - only really care if water is seperable from other classes
var WaterSig = CloudMaskMedian_dry.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Water,30);
print(WaterSig, 'WaterSig');

var RoadsSig = CloudMaskMedian_dry.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Roads,30);
print(RoadsSig, 'RoadsSig');
                                  
var ForestSig = CloudMaskMedian_dry.select(bands)
                                   .reduceRegion(ee.Reducer.mean(), Forest,30);
print(ForestSig, 'ForestSig');

var Mountain_shadowSig = CloudMaskMedian_dry.select(bands)
                                            .reduceRegion(ee.Reducer.mean(), Mountain_Shadow,30);
print(Mountain_shadowSig, 'Mountain_shadowSig');
                                  
var BuildingsSig = CloudMaskMedian_dry.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Buildings,30);
print(BuildingsSig, 'BuildingsSig');

var Vegetation_baresoilSig = CloudMaskMedian_dry.select(bands)
                                                .reduceRegion(ee.Reducer.mean(), Vegetation_BareSoil,30);
print(Vegetation_baresoilSig, 'Vegetation_baresoilSig');


//------------------------------------------------------------------------------------------------------------
//Partition training data into training and testing
//------------------------------------------------------------------------------------------------------------
//Randomly split the samples to set some aside for testing the model's accuracy
//using the 'random' column. Roughly 80% for training, 20% for testing
var split = 0.8; //set split to 80%
var training = points.filter(ee.Filter.lt('random', split)); //less than 80%
var testing = points.filter(ee.Filter.gte('random', split)); //remaining 20% for testing

//Print these variables to see how much training and testing data you are using
print('Samples n =', points.aggregate_count('.all'));
print('Training n =', training.aggregate_count('.all'));
print('Testing n =', testing.aggregate_count('.all'));

//PART 4. RUN SUPERVISED CLASSIFICATION
//-------------------------------------------------------------------------------------------------------------

// Random forest
//300 trees 4 varribles per split 
var classifierRF_dry = ee.Classifier.smileRandomForest(300,4).train({
  features: training,
  classProperty: 'Label',
  inputProperties: bands
});

//apply train classifier to the image
var classifiedRF_dry = CloudMaskMedian_dry.select(bands).classify(classifierRF_dry);

//Create palette for the final land cover map classifications
var Palette = 
'<RasterSymbolizer>'+
' <ColorMap type="intervals">'+
    '<ColorMapEntry color = "#1e3888" quantity="1" label="Water"/>'+
    '<ColorMapEntry color = "#788475" quantity="3" label="Roads"/>'+
    '<ColorMapEntry color="#ea9999" quantity="2" label="Vegetation_BareSoil"/>' +
    '<ColorMapEntry color="#76a5af" quantity="6" label="Buildings"/>' +
    '<ColorMapEntry color="#93c47d" quantity="5" label="Mountain_Shadow"/>' +
    '<ColorMapEntry color="#008000" quantity="4" label="Forest"/>' +
  '</ColorMap>'+
'</RasterSymbolizer>';

//Add final map to the display with the specifited palette
Map.addLayer(classifiedRF_dry.sldStyle(Palette),{}, "Land Classification");

//center the map for display
Map.setCenter(-99.1332, 19.4326);

//Add final map to the display with the specifited palette
Map.addLayer (classifiedRF_dry.sldStyle(Palette), {}, "Random Forest Classification_dry");


//PART 5. ACCURACY ASSESSMENT
//--------------------------------------------------------------------------------------------------------
//Use testing data to eveluate the accuracy of the classification
//--------------------------------------------------------------------------------------------------------

//Evaluation of Random Forest results
var confusionMatrix = classifierRF_dry.confusionMatrix(); //goodness of fit of model -accuracy of training
print ('Confusion matrix RF CM:', confusionMatrix);
print('Training Overall Accuracy RF CM:', confusionMatrix.accuracy ());
print ('Training Users Accuracy RF CM: ', confusionMatrix.consumersAccuracy());
print('Training Producers Accuracy RF CM: ', confusionMatrix.producersAccuracy());

var validation = testing.classify(classifierRF_dry); //accuracy assessemnt on independent points
var testAccuracy = validation.errorMatrix('Label','classification');
print('Validation Error Matrix RF AT', testAccuracy);
print ('Validation Overall Accuracy RF AT: ', testAccuracy.accuracy());
print('Validation Users Accuracy RF AT: ', testAccuracy.consumersAccuracy ());
print('Validation Producers Accuracy RF AT: ', testAccuracy.producersAccuracy ());


// Repeat for dry season of the wettest year
////////////////////////////////////////DRY/////////////////////////////////////////////////////
//PART 1. PRE-PROCESSING
//  creating a spatial and temporal filter
//------------------------------------------------------------------------------------------
//Spatial filter
var SpatFiltered = sentinel.filterBounds(aoi);
//Time filter
var wet_dryszn = SpatFiltered.filterDate('2018-01-01', '2018-04-30');
var wet_dryszn2 = SpatFiltered.filterDate('2018-12-01' , '2018-12-31');
// images with less than 10% cloud cover
var wet_dryszn_merge = ee.ImageCollection(wet_dryszn.merge(wet_dryszn2));
// images with less than 10% cloud cover
var qualityfilter_wet = wet_dryszn_merge.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 10);

//-------------------------------------------------------------------------------------------
//Create cloud mask using Sentine-2 QA60 band
//-------------------------------------------------------------------------------------------
//Function to mask clouds using Sentine-2 QA60 band

function maskS2clouds(image) {
  var qa = image.select('QA60');
  
  //Bits 10 and 11 are clouds and cirrus. Select those bits 
  var cloudBitMask = 1 << 10; //pushes '1' 10 spaces to the left: 01000000000
  var cirrusBitMask = 1<< 11; //pushes '1' 11 spaces to the left: 10000000000
  //Both flags should be set to zero, indicating clear conditions
  //We keep the pixel if the Bit is zero
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0));
  //Return the masked bands ans scale data using metadata scaling factor
  return image.updateMask(mask).divide(10000)
      .select('B.*')
      .copyProperties(image, ["system:time_start"]);
}

//Once the function is created, we can apply function to the selected images
var CloudMasked_wet = qualityfilter_wet.map(maskS2clouds);

print(CloudMasked_wet);

//-----------------------------------------------------------------------------------------------------
//Combine the masked images using median operator and then visualize
//-----------------------------------------------------------------------------------------------------
var CloudMaskMedian_wet = CloudMasked_wet.median().clip(aoi);
 
//visualize the FCC
var falseColor1 = {
  bands: ["B11","B8","B4"],
  min: 0,
  max: 0.5
};
 
Map.addLayer (CloudMaskMedian_wet, falseColor1, "median cloud masked false color");
print ('median of all filtered', CloudMaskMedian_wet);

//PART 2. CREATION OF TRAINING SITES
//----------------------------------------------------------------------------------------------------
//Merge training sites into single feature collection
//----------------------------------------------------------------------------------------------------
var MergedTrain_wet = Water.merge(Roads)
                           .merge(Forest)
                           .merge(Vegetation_BareSoil)
                           .merge(Buildings)
                           .merge(Mountain_Shadow);
print('merged train',MergedTrain_wet);

//PART 3. CREATING SIGNATURES FOR CLASSIFICATION
//-----------------------------------------------------------------------------------------------------
//Create signatures for the classification
//-----------------------------------------------------------------------------------------------------
//Specify the bands to use in the classification
 
var bands = ['B2', 'B3', 'B8', 'B11'];
 
//Extract training data by overlaying the merged training sites to the bands and extracting values
//of each band for each point. Add new column with random number that will be used to partition data for validation.
 
var points = CloudMaskMedian_wet.select(bands).sampleRegions({
  collection:MergedTrain_wet,
  properties: ['Label'],
  scale: 30
}).randomColumn(); // To divide into training and validation
 
print(points.first(), points);
 
//Visualize signatures
var WaterSig = CloudMaskMedian_wet.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Water,30);
print(WaterSig, 'WaterSig');

var RoadsSig = CloudMaskMedian_wet.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Roads,30);
print(RoadsSig, 'RoadsSig');
                                  
var ForestSig = CloudMaskMedian_wet.select(bands)
                                   .reduceRegion(ee.Reducer.mean(), Forest,30);
print(ForestSig, 'ForestSig');

var Mountain_shadowSig = CloudMaskMedian_wet.select(bands)
                                            .reduceRegion(ee.Reducer.mean(), Mountain_Shadow,30);
print(Mountain_shadowSig, 'Mountain_shadowSig');
                                  
var BuildingsSig = CloudMaskMedian_wet.select(bands)
                                  .reduceRegion(ee.Reducer.mean(), Buildings,30);
print(BuildingsSig, 'BuildingsSig');

var Vegetation_baresoilSig = CloudMaskMedian_wet.select(bands)
                                                .reduceRegion(ee.Reducer.mean(), Vegetation_BareSoil,30);
print(Vegetation_baresoilSig, 'Vegetation_baresoilSig');

//------------------------------------------------------------------------------------------------------------
//Partition training data into training and testing
//------------------------------------------------------------------------------------------------------------
//Randomly split the samples to set some aside for testing the model's accuracy
//using the 'random' column. Roughly 80% for training, 20% for testing
var split = 0.8; //set split to 80%
var training = points.filter(ee.Filter.lt('random', split)); //less than 80%
var testing = points.filter(ee.Filter.gte('random', split)); //remaining 20% for testing

//Print these variables to see how much training and testing data you are using
print('Samples n =', points.aggregate_count('.all'));
print('Training n =', training.aggregate_count('.all'));
print('Testing n =', testing.aggregate_count('.all'));

//PART 4. RUN SUPERVISED CLASSIFICATION
//-------------------------------------------------------------------------------------------------------------

// Random forest
//300 trees 4 varribles per split 
var classifierRF_wet = ee.Classifier.smileRandomForest(300,4).train({
  features: training,
  classProperty: 'Label',
  inputProperties: bands
});

//apply train classifier to the image
var classifiedRF_wet = CloudMaskMedian_wet.select(bands).classify(classifierRF_wet);

//Create palette for the final land cover map classifications
var Palette = 
'<RasterSymbolizer>'+
' <ColorMap type="intervals">'+
    '<ColorMapEntry color = "#1e3888" quantity="1" label="Water"/>'+
    '<ColorMapEntry color = "#788475" quantity="3" label="Roads"/>'+
    '<ColorMapEntry color="#ea9999" quantity="2" label="Vegetation_BareSoil"/>' +
    '<ColorMapEntry color="#76a5af" quantity="6" label="Buildings"/>' +
    '<ColorMapEntry color="#93c47d" quantity="5" label="Mountain_Shadow"/>' +
    '<ColorMapEntry color="#008000" quantity="4" label="Forest"/>' +
  '</ColorMap>'+
'</RasterSymbolizer>';


//Add final map to the display with the specifited palette
Map.addLayer(classifiedRF_wet.sldStyle(Palette),{}, "Land Classification Wet");

//center the map for display
Map.setCenter(-99.1332, 19.4326);

//Add final map to the display with the specifited palette
Map.addLayer (classifiedRF_wet.sldStyle(Palette), {}, "Random Forest Classification_wet");


//PART 5. ACCURACY ASSESSMENT
//--------------------------------------------------------------------------------------------------------
//Use testing data to eveluate the accuracy of the classification
//--------------------------------------------------------------------------------------------------------

//Evaluation of Random Forest results
var confusionMatrix_wet = classifierRF_wet.confusionMatrix(); //goodness of fit of model -accuracy of training
print ('Confusion matrix RF CM:', confusionMatrix);
print('Training Overall Accuracy RF CM:', confusionMatrix.accuracy ());
print ('Training Users Accuracy RF CM: ', confusionMatrix.consumersAccuracy());
print('Training Producers Accuracy RF CM: ', confusionMatrix.producersAccuracy());

var validation = testing.classify(classifierRF_wet); //accuracy assessemnt on independent points
var testAccuracy = validation.errorMatrix('Label','classification');
print('Validation Error Matrix RF AT', testAccuracy);
print ('Validation Overall Accuracy RF AT: ', testAccuracy.accuracy());
print('Validation Users Accuracy RF AT: ', testAccuracy.consumersAccuracy ());
print('Validation Producers Accuracy RF AT: ', testAccuracy.producersAccuracy ());

//PART 3. CALCULATE NDWI 

// Using classification we just created to select only values that equal class 1 (water)
var waterMask_dry = classifiedRF_dry.eq(1); // for 2019 dry season, values in hard classification that equal 1
var waterMask_wet = classifiedRF_wet.eq(1); // for 2018 wet season, values in hard classification that equal 1

var waterPixels_dry = CloudMaskMedian_dry.updateMask(waterMask_dry); 
var waterPixels_wet = CloudMaskMedian_wet.updateMask(waterMask_wet);

// calculate NDWI for dry season (2019)
var ndwi_dry = waterPixels_dry.normalizedDifference(['B3', 'B8']);
Map.addLayer(ndwi_dry, {palette: ['red', 'yellow', 'green', 'cyan', 'blue']}, 'NDWI_Dry');

// calculate NDWI for wet season (2018)
var ndwi_wet = waterPixels_wet.normalizedDifference(['B3', 'B8']);
Map.addLayer(ndwi_wet, {palette: ['red', 'yellow', 'green', 'cyan', 'blue']}, 'NDWI_Wet');

// Create NDWI masks
var ndwiThresholddry = ndwi_dry.gte(0.0); // greater than or equal to zero
var ndwiMaskdry = ndwiThresholddry.updateMask(ndwiThresholddry);
Map.addLayer(ndwiMaskdry, {palette:['#de5f5f']}, 'NDWI Mask_dry'); // red

var ndwiThresholdwet = ndwi_wet.gte(0.0);
var ndwiMaskwet = ndwiThresholdwet.updateMask(ndwiThresholdwet);
Map.addLayer(ndwiMaskwet, {palette:['#9d7bbd']}, 'NDWI Mask_wet'); // lighter purple

// Calculate the area of water extent in 2019 and 2018 dry seasons
var ndwi2019Area = ndwiMaskdry.multiply(ee.Image.pixelArea());
var ndwi2018Area = ndwiMaskwet.multiply(ee.Image.pixelArea());

// calculate pixel area for dry szn of 2019
var ndwi2019Stats = ndwi2019Area.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var ndwi2018Stats = ndwi2018Area.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var ndwi2019Final = ee.Number(ndwi2019Stats.get('nd')).divide(1e6);
var ndwi2018Final = ee.Number(ndwi2018Stats.get('nd')).divide(1e6);
print('Dry SZN 2019', ndwi2019Final);
print('Dry SZN 2018', ndwi2018Final);

var difference = ndwi2018Final.subtract(ndwi2019Final);
print('Difference between 2018 dry season and 2019 dry season:', difference);

// Area of AOI (square km)
var aoi_area = aoi.geometry().area();
var aoiAreaSqKm = ee.Number(aoi_area).divide(1e6);
print('Area of AOI', aoiAreaSqKm);

// Image differencing
var image_dif = ndwi_wet.subtract(ndwi_dry); // ndwi wet is not the wet szn, it's the wetter dry szn
Map.addLayer(image_dif, {min: -1, max: 1, palette:['red', 'white', 'blue']}, 'NDWI Image Difference');
// blue = decrease in water
// white = no change
// red = increase in water

//Export image to Drive 
  Export.image.toDrive({
    image: CloudMaskMedian_dry,
    folder: 'Labs',
    description: 'CloudMaskMedian_dry',
    scale: 10,
   maxPixels:1e13 ,  //1e13 or //965244740
    region: aoi});
