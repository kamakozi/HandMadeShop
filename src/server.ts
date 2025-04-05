import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express, { Request, Response } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql, { ResultSetHeader, FieldPacket } from 'mysql2';
import bodyParser from 'body-parser';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ Middleware for parsing JSON
app.use(bodyParser.json());

// ✅ MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'user',
  database: 'itemdb',
});

db.connect((err: any) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL!');
});

// ✅ API: GET all items
app.get('/api/items', (req: Request, res: Response): void => {
  db.query('SELECT * FROM items', (err: any, results: any) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
    return;
  });
});

// ✅ API: POST a new item
app.post('/api/items', (req: Request, res: Response): void => {
  const { title, description, availableUnits } = req.body;

  db.query(
    'INSERT INTO items (title, description, available_units) VALUES (?, ?, ?)',
    [title, description, availableUnits],
    (err: any, result: ResultSetHeader, fields: FieldPacket[]) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      // ✅ Fix TS4111 by using ['id']
      res.status(201).send({
        message: 'Item created',
        ['id']: result.insertId, // ✅ Fully safe
      });
      return;
    }
  );
});

// ✅ API: DELETE item by ID
app.delete('/api/items/:id', (req: Request, res: Response): void => {
  const itemId = parseInt(req.params.id);

  db.query(
    'DELETE FROM items WHERE id = ?',
    [itemId],
    (err: any, result: ResultSetHeader, fields: FieldPacket[]) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.send({
        message: 'Item deleted',
        ['affectedRows']: result.affectedRows, // optional fix for TS4111
      });
      return;
    }
  );
});

// ✅ Serve static files from /browser
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ✅ Let Angular handle all other routes (SSR)
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

// ✅ Start server if this is the entry point
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`🚀 Node Express server listening on http://localhost:${port}`);
  });
}

// ✅ Export SSR handler for Angular
export const reqHandler = createNodeRequestHandler(app);
