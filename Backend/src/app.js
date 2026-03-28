const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Shërbejmë folderin Frontend si skedarë statikë
app.use(express.static(path.join(__dirname, '../../Frontend')));

// 2. Route për API
app.use('/api/products', productRoutes);

// 3. Kur hapim http://localhost:5000, dërgoje te Dashboard.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/Dashboard.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveri u ndez me sukses!`);
    console.log(`👉 Shko te: http://localhost:5000`);
});