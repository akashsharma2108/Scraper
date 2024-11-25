import express from 'express';
import  getRestroData  from '../Workers/getlink';

export const Scrapper = async (req : express.Request, res : express.Response) => {
  const { restroName } = req.body;

  if (!restroName) {
    return res.status(400).json({ message: 'Please provide a restaurant name' });
  }

  try {
    const data = await getRestroData(restroName) as any;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error while scraping data:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

  
};
