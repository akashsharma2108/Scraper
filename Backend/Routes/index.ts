import express from 'express';
import { Scrapper } from '../controller/Scraper/Scraper';
import {getallcsvfiles} from '../controller/getfiles/Getfiles';


const mainRouter = express.Router();

mainRouter.post('/scrapedata', Scrapper);
mainRouter.post('/allcsvfiles', getallcsvfiles);


export default mainRouter;
