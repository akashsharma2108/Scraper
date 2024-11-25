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

const runWorker = (workerData) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, 'scrapeWorker.ts');
    const worker = new Worker(workerPath, { workerData });
    worker.on('message', resolve); // Receive results
    worker.on('error', reject); // Handle errors
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

 const main = async (restaurantLinks) => {
  const numWorkers = 4; // Adjust based on available resources
  const chunks = splitArray(restaurantLinks, numWorkers);

  console.log(`Distributing ${restaurantLinks.length} URLs among ${numWorkers} workers...`);

  const promises = chunks.map((chunk) => runWorker(chunk));
  const results = await Promise.all(promises);

  // Merge results from all workers
  const mergedResults = results.flat();
  
  console.log('All scraping completed:');
  console.log(JSON.stringify(mergedResults, null, 2));
  try {
      // Convert JSON to CSV
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
        'aboveSeven'
      ];
      const opts = { fields };
      const csv = parse(mergedResults, opts);
  
      // Save the CSV to a file
      const random = Math.floor(Math.random() * 1000000);
      const filePath = `./output-${random}.csv`;
      fs.writeFileSync(filePath, csv);
         return results;
      console.log(`CSV file successfully saved to ${filePath}`);
    } catch (err) {
      console.error('Error while converting JSON to CSV:', err);
    }
  return mergedResults;
};

export default main;
