import express ,{ Application } from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
dotenv.config();
import routes from './Routes/index';
import cors from 'cors';



const app: Application = express();
// allow all origins
app.use(cors());
app.use(helmet());

app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
