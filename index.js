import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import companyRoutes from './routes/company.js';
import locationRoutes from './routes/location.js';
import usersRoutes from './routes/users.js';
import categoryRoutes from './routes/category.js';
import skillRoutes from './routes/skill.js';
import attributesRoutes from './routes/attributes.js';
import action_planRoutes from './routes/action_plan.js';
import mysql from 'mysql2';
import CompanyData from './models/CompanyData.js';

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());

app.use('/company',companyRoutes);
app.use('/location',locationRoutes);
app.use('/users',usersRoutes);
app.use('/category',categoryRoutes);
app.use('/skill',skillRoutes);
app.use('/attributes',attributesRoutes);
app.use('/action_plan',action_planRoutes);
//const CONNECTION_URL = 'mongodb+srv://muskan:1ASVCr7yBZQUKzh4@ratings-dev.knldc.mongodb.net/ratings?authSource=admin&replicaSet=atlas-11l9kt-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Isolated%20Edition%20Beta&ssl=true';
//const CONNECTION_URL = 'mongodb+srv://free_user:Servefirst2021@cluster0.gdowm.mongodb.net/ratings?retryWrites=true&w=majority';
const CONNECTION_URL = 'mongodb+srv://free_user:Servefirst2021@cluster0.gdowm.mongodb.net/ratings_migration?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5000;

app.get("/", async (req, res,next) => {
      res.send({ success: true, message: 'Welcomw to SFratings Backend.'})
});

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
      .catch((error) => console.log(error.message));

mongoose.set('useFindAndModify', false);   



