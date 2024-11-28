import { Worker } from 'worker_threads';
import fs from 'fs';
import { parse } from 'json2csv';
import path from 'path';




const splitArray = (array, numChunks) => {
  const chunks = [];
  const chunkSize = Math.ceil(array.length / numChunks);
  for (let i = 0; i < numChunks; i++) {
    chunks.push(array.slice(i * chunkSize, i * chunkSize + chunkSize));
  }
  return chunks;
};

const runWorker = (workerData, swiggy) => {
  return new Promise((resolve, reject) => {
    const workerPath = swiggy? path.resolve(__dirname, 'swiggyWorker.ts')
    : path.resolve(__dirname, 'scrapeWorker.ts');
    // for both swiggy and zomato 
    const worker = new Worker(workerPath, { workerData });
    worker.on('message', resolve); 
    worker.on('error', reject); 
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};



 const main = async (restaurantLinks , multicitiy, filename, swiggy, both) => {
  const numWorkers = 4; // Adjust based on available resources
  

  console.log(`Distributing ${restaurantLinks.length} URLs among ${numWorkers} workers...`);

  let mergedResults = [];
    let results : any;
  if (both) {
    console.log('restaurantLinks.swiggy', restaurantLinks.swiggy);
    const chunkssforZomaato= splitArray(restaurantLinks.zomato, numWorkers);
    const zomatoPromises = chunkssforZomaato.map((chunk) => runWorker(chunk, false));
    const zomatoResults = await Promise.all(zomatoPromises);
    const chunkssforswiggy = splitArray(restaurantLinks.swiggy, numWorkers);
    const swiggyPromises = chunkssforswiggy.map((chunk) => runWorker(chunk, true));
    const swiggyResults = await Promise.all(swiggyPromises);
    results = [...swiggyResults, ...zomatoResults];
    mergedResults = [...swiggyResults.flat(), ...zomatoResults.flat()];
  } else {
    const chunks = splitArray(restaurantLinks, numWorkers);
    const promises = chunks.map((chunk) => runWorker(chunk, swiggy));
    results = await Promise.all(promises);

    mergedResults = results.flat();
  }
  
   console.log('All scraping completed:');
  // console.log(JSON.stringify(mergedResults, null, 2));
  try {
    const fields = [
      'restaurantName',
      'overallRating',
      'totalRating',
      'deliveryRating',
      'totalDeliveryRating',
      'openTime',
      'phoneNumber',
      'address',
      'url',
      'underFour',
      'fourToSeven',
      'aboveSeven',
    ];

   if(multicitiy){
      const opts = { fields };
      const csv = parse(mergedResults, opts); 
      const dirPath = path.resolve(__dirname, '../../files'); 
      const filePath = path.join(dirPath, `${filename}-allcity.csv`);
      if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        fs.appendFileSync(filePath , csv);
      } else {
        fs.writeFileSync(filePath, csv);
      }

      return results;
   }else{   
      const opts = { fields };
      const csv = parse(mergedResults, opts);
      const random = Math.floor(Math.random() * 1000000);
      const dirPath = path.resolve(__dirname, '../../files'); 
      const filePath = path.join(dirPath, `${filename}-${random}.csv`);
      if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, csv);
         return results;}
    } catch (err) {
      console.error('Error while converting JSON to CSV:', err);
    }


  return mergedResults;
};

export default main;
