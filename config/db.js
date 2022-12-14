const mongoose = require('mongoose');
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.r5ay06b.mongodb.net/mern`

mongoose
    .set('strictQuery', true)
    .connect(url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB', err))