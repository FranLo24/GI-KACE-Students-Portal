const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const courseLevelRoutes = require('./routes/courseLevels');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', courseLevelRoutes);

module.exports = app;
