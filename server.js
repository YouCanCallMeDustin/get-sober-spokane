console.log('Starting server...');
const express = require('express');
const app = express();
const PORT = 3001;
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs')));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/api/contact', (req, res) => {
  console.log('Received contact form submission:', req.body);
  res.json({ success: true, received: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 