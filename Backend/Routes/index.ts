import express from 'express';
import { Scrapper } from '../controller/Scraper/Scraper';


const mainRouter = express.Router();

mainRouter.post('/scrapedata', Scrapper);


export default mainRouter;
