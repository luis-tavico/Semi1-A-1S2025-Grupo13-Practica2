const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const fileRoutes = require('./src/routes/fileRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await sequelize.sync();
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});