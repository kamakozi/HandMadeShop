import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'user',
  database: 'itemdb',
});

// Connect
db.connect((err: any) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

// Get all items
app.get('/items', (req: Request, res: Response) => {
  db.query('SELECT * FROM items', (err: any, results: any) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new item
app.post('/items', (req: Request, res: Response) => {
  const { title, description, availableUnits } = req.body;

  db.query(
    'INSERT INTO items (title, description, available_units) VALUES (?, ?, ?)',
    [title, description, availableUnits],
    (err: any, result: any) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'Item created', id: result.insertId });
    }
  );
});

// Delete item by ID
app.delete('/items/:id', (req: Request, res: Response) => {
  const itemId = parseInt(req.params.id);
  db.query('DELETE FROM items WHERE id = ?', [itemId], (err: any) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Item deleted' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
