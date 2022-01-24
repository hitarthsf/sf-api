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
import action_planRoutes from './routes/actionPlan.js';
import abusiveWordsRoutes from './routes/abusiveWords.js';
import privacyLocationRoutes from './routes/privacyLocation.js';
import authRoutes from './routes/auth.js';
import stateRoutes from './routes/state.js';
import ratingRoutes from './routes/ratings.js';
import dashboardRoutes from './routes/dashboard.js';
import migrationRoutes from './routes/migration.js';
import frontRatingAppRoutes from './routes/frontRatingApp.js';
import screenSaverRoutes from './routes/screenSaver.js';
import tagRoutes from './routes/tag.js';
import customerAuditRoutes from './routes/customerAudit.js';
import clientSurveyRoutes from './routes/clientSurvey.js';
import skillProfileRoutes from './routes/skillProfile.js';
import hubSpotRoutes from './routes/hubSpot.js';
import generalRoutes from './routes/general.js';

import apiRoutes from './routes/api.js';
import cronRoutes from './routes/cron.js'
//dot env configuration
import dotenv from 'dotenv';
//import passport from 'passport';
import userRoutes from './routes/user.js';
import fileUpload from 'express-fileupload';
// load env
dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());
app.use(fileUpload());

// init and configure passport
//app.use(passport.initialize());

app.use('/company',companyRoutes);
app.use('/location',locationRoutes);
app.use('/users',usersRoutes);
app.use('/category',categoryRoutes);
app.use('/skill',skillRoutes);
app.use('/attributes',attributesRoutes);
app.use('/action_plan',action_planRoutes);
app.use('/privacyLocation',privacyLocationRoutes);
app.use('/auth',authRoutes);
app.use('/user',userRoutes);
app.use('/state',stateRoutes);
app.use('/abusiveWords',abusiveWordsRoutes);
app.use('/rating',ratingRoutes);
app.use('/dashboard',dashboardRoutes);
app.use('/migration',migrationRoutes);
app.use('/front',frontRatingAppRoutes);
app.use('/screenSaver',screenSaverRoutes);
app.use('/tag',tagRoutes);
app.use('/customerAudit',customerAuditRoutes);
app.use('/clientSurvey',clientSurveyRoutes);
app.use('/skillProfile',skillProfileRoutes);
app.use('/hubSpot',hubSpotRoutes);
app.use('/general',generalRoutes);
app.use('/api',apiRoutes);
app.use('/cron',cronRoutes);


const CONNECTION_URL = process.env.MONGO_URL
const PORT = process.env.PORT || 5000;

app.get("/", async (req, res,next) => {
      res.send({ success: true, message: 'Welcome to SF ratings Backend.'})
});

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
      .catch((error) => console.log(error.message));

mongoose.set('useFindAndModify', false);



