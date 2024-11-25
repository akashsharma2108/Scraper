import { Worker } from 'worker_threads';
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
  return mergedResults;
};

export default main;
