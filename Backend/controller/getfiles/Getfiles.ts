import express from 'express';
import fs from 'fs';
import path from 'path';

export const getallcsvfiles = async (req: express.Request, res: express.Response) => {
  const { userName } = req.body;

  if (!userName) {
    return res.status(400).json({ message: 'userName is required' });
  }

  try {
    const dirPath = path.resolve(__dirname, '../../files'); 
    const files = fs.readdirSync(dirPath); 

    const csvFiles = files.filter(file => file.includes(userName) && file.endsWith('.csv'));

    if (csvFiles.length === 0) {
      return res.status(404).json({ message: 'No CSV files found for the given userName' });
    }

    // Process each file and create blob-like structure
    const fileData = csvFiles.map(file => {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8'); // Read the file content
      
      return {
        filename: file,
        filetype: 'csv',
        blobdata: Buffer.from(fileContent).toString('base64'), // Encode content to base64
      };
    });

    res.status(200).json(fileData);
  } catch (error: any) {
    console.error('Error while processing files:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
