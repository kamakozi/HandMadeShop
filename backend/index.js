const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'user',
  database: 'itemdb',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});


app.get('/items', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


app.post('/items', (req, res) => {
  const { title, description, availableUnits } = req.body;
  db.query(
    'INSERT INTO items (title, description, available_units) VALUES (?, ?, ?)',
    [title, description, availableUnits],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'Item created', id: result.insertId });
    }
  );
});


app.delete('/items/:id', (req, res) => {
  db.query('DELETE FROM items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Item deleted' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
