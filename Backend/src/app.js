const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Mundëson komunikimin mes Frontend dhe Backend
app.use(cors());
app.use(express.json());

// 1. LIDHJA ME FRONTEND: 
// Ky rresht i tregon serverit se ku ndodhen skedarët tuaj HTML (Dashboard, Products, etj.)
// Sipas strukturës tënde: StockFlow/Frontend/src/pages
app.use(express.static(path.join(__dirname, '../../Frontend/src/pages')));

// 2. API ROUTES:
// Kjo lidh JSON-in që pamë te localhost:5000/api/products
app.use('/api/products', productRoutes);

// 3. FAQJA KRYESORE:
// Kur shkruan thjesht localhost:5000, serveri do të hapë automatikisht Dashboard.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/src/pages/Dashboard.html'));
});

// Ndezja e serverit në portën 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Serveri u ndez me sukses!`);
    console.log(`👉 Hap browserin te: http://localhost:5000`);
    console.log(`-----------------------------------------`);
});
