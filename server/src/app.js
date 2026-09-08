const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const courseLevelRoutes = require('./routes/courseLevels');
const formConfigRoutes = require('./routes/formConfig');
const courseRoutes = require('./routes/courses');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', courseLevelRoutes);
app.use('/api', formConfigRoutes);
app.use('/api', courseRoutes);

module.exports = app;
