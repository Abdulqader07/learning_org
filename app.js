const express = require('express');
const DataBase = require('better-sqlite3');

const PORT = 3000;
const app = express();

const db = DataBase('database.db');

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// This is our database table for our main work 

db.exec(`
    CREATE TABLE IF NOT EXISTS resources(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL
        )
    `);


// ---##--- Routes ---##--- //

app.get('/', (req, res)=>{
    const stmt = db.prepare(`
        SELECT * FROM resources`);
    
    const resources = stmt.all();
    res.render('index', { resources });
});

app.get('/resource/:id/', (req, res)=>{
    const id = parseInt(req.params.id);
    const stmt = db.prepare(`
        SELECT * FROM resources WHERE id = (?)`);

    const resource = stmt.get(id);
    res.render('resource', { resource });
});

app.post('/resource/:id/', (req, res)=>{
    const id = parseInt(req.params.id);
    const stmt = db.prepare(`
        DELETE from resources WHERE id = ?`)
    stmt.run(id);
    res.redirect('/');
});

app.get('/add', (req, res)=>{
    res.render('add');
});

app.post('/add', (req, res)=>{
    const {link, name, status} = req.body;

    const number = function(status){
        if(status === 'current'){
            return 3;
        }
        else if(status === 'library'){
            return 10;
        }
        return 100;
    };

    console.log(req.body);
    const stmt = db.prepare(`
        SELECT COUNT(*) FROM resources WHERE status = ?`);
    const result = stmt.get(status);

    if(result['COUNT(*)'] < number(status)){
        const stmt = db.prepare(`
            INSERT INTO resources (link, name, status) VALUES (?, ?, ?)`);
        stmt.run(link, name, status);

        res.redirect('/');
    }
    else{
        res.status(400).render('400', { title: '400 ERROR!' });
    }
});

app.get('/update/:id/', (req, res)=>{
    const id = parseInt(req.params.id);
    const stmt = db.prepare(`
        SELECT id FROM resources WHERE id = (?)`);
    const resource = stmt.get(id);

    res.render('update', { resource });
});

app.post('/update/:id/', (req, res)=>{
    const id = parseInt(req.params.id);
    const {link, name, status} = req.body;
    const stmt = db.prepare(`
        UPDATE resources SET link = (?), name = (?), status = (?) WHERE id = (?)`);
    stmt.run(link, name, status, id);

    res.redirect(`/resource/${id}/`);
});

app.listen(PORT, ()=>{
    console.log(`listening on port: ${PORT} ..`);
});