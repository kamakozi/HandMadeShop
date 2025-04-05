import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express, { Request, Response } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql, {ResultSetHeader, FieldPacket, Connection} from 'mysql2';
import bodyParser from 'body-parser';
import {Item} from './app/components/item/item';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ Middleware for parsing JSON
app.use(bodyParser.json());

// ✅ MySQL database connection
const db:Connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'user',
  database: 'itemdb',
});

db.connect((err: mysql.QueryError | null) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL!');
});

// ✅ API: GET all items


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

app.get('/api/items', (req: Request, res: Response)  => {
  db.query('SELECT * FROM items', (err , results ) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);

  });
});

// ✅ API: POST a new item
app.post('/api/items', (req: Request, res: Response): void => {
  const { title, description, availableUnits } = req.body as Item;

  db.query(
    'INSERT INTO items (title, description, available_units) VALUES (?, ?, ?)',
    [title, description, availableUnits],
    (err: any, result: any) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      // ✅ Fix TS4111 by using ['id']
      res.status(201).send({
        message: 'Item created',
        ['id']: result.insertId, // ✅ Fully safe
      });
    }
  );
});

// ✅ API: DELETE item by ID
app.delete('/api/items/:id', (req: Request, res: Response): void => {
  const itemId = parseInt(req.params['id']);

  db.query(
    'DELETE FROM items WHERE id = ?',
    [itemId],
    (err) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.send({
        message: 'Item deleted',
      });
    }
  );
});


// ✅ Start server if this is the entry point

// if (isMainModule(import.meta.url)) {
const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`🚀 Node Express server listening on http://localhost:${port}`);
});
// }




// ✅ Export SSR handler for Angular
export const reqHandler = createNodeRequestHandler(app);

