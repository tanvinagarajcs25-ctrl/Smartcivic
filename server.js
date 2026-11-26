const express = require('express');
const cors = require('cors');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/complaints', complaintRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Civic Backend is running!'
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log('Server running at http://localhost:3000');
});