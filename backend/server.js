const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs'); 
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: 'sambacarro_secret_key_angola_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sambacarro',
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  }
  console.log('Conectado ao MySQL com sucesso!');
  initDatabase();
});

// Initialize Database
function initDatabase() {
  const sql = `
    CREATE DATABASE IF NOT EXISTS sambacarro;
    USE sambacarro;

    CREATE TABLE IF NOT EXISTS cliente (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('cliente', 'admin') DEFAULT 'cliente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INT NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      mileage INT DEFAULT 0,
      fuel VARCHAR(50) DEFAULT 'Gasolina',
      transmission VARCHAR(50) DEFAULT 'Manual',
      color VARCHAR(50) DEFAULT 'Branco',
      description TEXT,
      image VARCHAR(500) DEFAULT '',
      available TINYINT(1) DEFAULT 1,
      featured TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      car_id INT NOT NULL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_price DECIMAL(12,2) NOT NULL,
      status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'confirmado',
      FOREIGN KEY (cliente_id) REFERENCES cliente(id),
      FOREIGN KEY (car_id) REFERENCES carros(id)
    );

    CREATE TABLE IF NOT EXISTS carrinho (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      car_id INT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES cliente(id),
      FOREIGN KEY (car_id) REFERENCES carros(id)
    );
  `;

  db.query(sql, (err) => {
    if (err) console.error('Erro ao inicializar banco:', err);
    else {
      console.log('Banco de dados inicializado!');
      seedData();
    }
  });
}

function seedData() {
  db.query('SELECT COUNT(*) AS count FROM cliente', (err, results) => {
    if (err || results[0].count > 0) return;

    const adminPass = bcrypt.hashSync('admin123', 10);
    const clientePass = bcrypt.hashSync('cliente123', 10);

    db.query(
      'INSERT INTO cliente (name, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      ['Administrador', 'admin@sambacars.ao', adminPass, 'admin',
       'Cliente Demo', 'cliente@email.com', clientePass, 'cliente'],
      () => console.log('Utilizadores de exemplo criados!')
    );

    const carros = [
      ['Toyota', 'Hilux', 2022, 45000, 15000, 'Gasóleo', 'Manual', 'Branco', 'Toyota Hilux robusta e confiável, ideal para terrenos angolanos. 4x4 com excelente capacidade de carga.', '', 1, 1],
      ['Toyota', 'Land Cruiser', 2021, 85000, 8000, 'Gasóleo', 'Automático', 'Preto', 'Land Cruiser V8 com máxima capacidade off-road, conforto premium e potência excepcional.', '', 1, 1],
      ['Hyundai', 'Tucson', 2023, 38000, 5000, 'Gasolina', 'Automático', 'Cinzento', 'SUV moderno com tecnologia avançada, econômico e espaçoso para toda a família.', '', 1, 1],
      ['Mitsubishi', 'L200', 2022, 42000, 20000, 'Gasóleo', 'Manual', 'Azul', 'Pickup resistente e versátil, perfeito para trabalho e aventura em qualquer terreno.', '', 1, 0],
      ['Kia', 'Sportage', 2023, 35000, 3000, 'Gasolina', 'Automático', 'Vermelho', 'SUV elegante com design moderno, cheio de tecnologia e conforto para o dia a dia.', '', 1, 1],
      ['Ford', 'Ranger', 2021, 48000, 30000, 'Gasóleo', 'Automático', 'Prata', 'Pickup poderosa com capacidade de reboque e espaço para toda a família nas viagens.', '', 1, 0],
      ['Nissan', 'X-Trail', 2022, 33000, 12000, 'Gasolina', 'Automático', 'Branco', 'SUV familiar com 7 lugares, economia de combustível e ótimo custo-benefício.', '', 1, 0],
      ['Honda', 'CR-V', 2023, 40000, 2000, 'Gasolina', 'Automático', 'Azul', 'SUV elegante com motorização eficiente, interior espaçoso e segurança de ponta.', '', 1, 1],
    ];

    db.query('SELECT COUNT(*) AS count FROM carros', (err, results) => {
      if (err || results[0].count > 0) return;
      const sql = 'INSERT INTO carros (brand, model, year, price, mileage, fuel, transmission, color, description, image, available, featured) VALUES ?';
      db.query(sql, [carros], () => console.log('Carros de exemplo inseridos!'));
    });
  });
}

// ==================== AUTH ROUTES ====================

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: 'Preencha todos os campos.' });

  db.query('SELECT id FROM cliente WHERE email = ?', [email], (err, results) => {
    if (results && results.length > 0)
      return res.json({ success: false, message: 'Email já registado.' });

    const hash = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO cliente (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (err) => {
      if (err) return res.json({ success: false, message: 'Erro ao registar.' });
      res.json({ success: true, message: 'Conta criada com sucesso!' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM cliente WHERE email = ?', [email], (err, results) => {
    if (err || !results || results.length === 0)
      return res.json({ success: false, message: 'Credenciais inválidas.' });

    const cliente = results[0];
    if (!bcrypt.compareSync(password, cliente.password))
      return res.json({ success: false, message: 'Credenciais inválidas.' });

    req.session.cliente = { id: cliente.id, name: cliente.name, email: cliente.email, role: cliente.role };
    res.json({ success: true, cliente: req.session.cliente });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/session', (req, res) => {
  if (req.session.cliente) res.json({ loggedIn: true, cliente: req.session.cliente });
  else res.json({ loggedIn: false });
});

// ==================== CAR ROUTES ====================

app.get('/api/carros', (req, res) => {
  const { search, brand, fuel, transmission, minPrice, maxPrice } = req.query;
  let sql = 'SELECT * FROM carros WHERE 1=1';
  const params = [];

  if (search) { sql += ' AND (brand LIKE ? OR model LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (brand) { sql += ' AND brand = ?'; params.push(brand); }
  if (fuel) { sql += ' AND fuel = ?'; params.push(fuel); }
  if (transmission) { sql += ' AND transmission = ?'; params.push(transmission); }
  if (minPrice) { sql += ' AND price >= ?'; params.push(minPrice); }
  if (maxPrice) { sql += ' AND price <= ?'; params.push(maxPrice); }

  sql += ' ORDER BY created_at DESC';
  db.query(sql, params, (err, results) => {
    if (err) return res.json({ success: false, message: 'Erro ao buscar carros.' });
    res.json({ success: true, carros: results });
  });
});

app.get('/api/carros/featured', (req, res) => {
  db.query('SELECT * FROM carros WHERE featured = 1 AND available = 1 LIMIT 6', (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, carros: results });
  });
});

app.get('/api/carros/:id', (req, res) => {
  db.query('SELECT * FROM carros WHERE id = ?', [req.params.id], (err, results) => {
    if (err || !results || results.length === 0)
      return res.json({ success: false, message: 'Carro não encontrado.' });
    res.json({ success: true, car: results[0] });
  });
});

app.post('/api/carros', requireAdmin, (req, res) => {
  const { brand, model, year, price, mileage, fuel, transmission, color, description, image, available, featured } = req.body;
  db.query(
    'INSERT INTO carros (brand, model, year, price, mileage, fuel, transmission, color, description, image, available, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [brand, model, year, price, mileage || 0, fuel, transmission, color, description, image || '', available ? 1 : 0, featured ? 1 : 0],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Erro ao adicionar carro.' });
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.put('/api/carros/:id', requireAdmin, (req, res) => {
  const { brand, model, year, price, mileage, fuel, transmission, color, description, image, available, featured } = req.body;
  db.query(
    'UPDATE carros SET brand=?, model=?, year=?, price=?, mileage=?, fuel=?, transmission=?, color=?, description=?, image=?, available=?, featured=? WHERE id=?',
    [brand, model, year, price, mileage || 0, fuel, transmission, color, description, image || '', available ? 1 : 0, featured ? 1 : 0, req.params.id],
    (err) => {
      if (err) return res.json({ success: false, message: 'Erro ao editar carro.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/carros/:id', requireAdmin, (req, res) => {
  db.query('DELETE FROM carros WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.json({ success: false, message: 'Erro ao eliminar carro.' });
    res.json({ success: true });
  });
});

// ==================== CART ROUTES ====================

app.get('/api/carrinho', requireLogin, (req, res) => {
  const clienteId = req.session.cliente.id;
  const sql = `SELECT c.id AS carrinho_id, carros.* FROM carrinho c JOIN carros ON c.car_id = carros.id WHERE c.cliente_id = ?`;
  db.query(sql, [clienteId], (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, items: results });
  });
});

app.post('/api/carrinho', requireLogin, (req, res) => {
  const clienteId = req.session.cliente.id;
  const { car_id } = req.body;
  db.query('SELECT id FROM carrinho WHERE cliente_id = ? AND car_id = ?', [clienteId, car_id], (err, results) => {
    if (results && results.length > 0)
      return res.json({ success: false, message: 'Carro já está no carrinho.' });
    db.query('INSERT INTO carrinho (cliente_id, car_id) VALUES (?, ?)', [clienteId, car_id], (err) => {
      if (err) return res.json({ success: false, message: 'Erro ao adicionar ao carrinho.' });
      res.json({ success: true });
    });
  });
});

app.delete('/api/carrinho/:car_id', requireLogin, (req, res) => {
  db.query('DELETE FROM carrinho WHERE cliente_id = ? AND car_id = ?', [req.session.cliente.id, req.params.car_id], (err) => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

// ==================== PURCHASE ROUTES ====================

app.post('/api/purchase', requireLogin, (req, res) => {
  const clienteId = req.session.cliente.id;
  const { car_id } = req.body;

  db.query('SELECT * FROM carros WHERE id = ? AND available = 1', [car_id], (err, results) => {
    if (err || !results || results.length === 0)
      return res.json({ success: false, message: 'Carro não disponível.' });

    const car = results[0];
    db.query(
      'INSERT INTO compras (cliente_id, car_id, total_price) VALUES (?, ?, ?)',
      [clienteId, car_id, car.price],
      (err) => {
        if (err) return res.json({ success: false, message: 'Erro ao processar compra.' });
        db.query('UPDATE carros SET available = 0 WHERE id = ?', [car_id], () => {
          db.query('DELETE FROM carrinho WHERE cliente_id = ? AND car_id = ?', [clienteId, car_id], () => {
            res.json({ success: true, message: 'Compra realizada com sucesso!' });
          });
        });
      }
    );
  });
});

app.get('/api/my-compras', requireLogin, (req, res) => {
  const sql = `
    SELECT p.*, c.brand, c.model, c.year, c.image, c.color
    FROM compras p
    JOIN carros c ON p.car_id = c.id
    WHERE p.cliente_id = ?
    ORDER BY p.purchase_date DESC
  `;
  db.query(sql, [req.session.cliente.id], (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, compras: results });
  });
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/cliente', requireAdmin, (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM cliente ORDER BY created_at DESC', (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, cliente: results });
  });
});

app.get('/api/admin/compras', requireAdmin, (req, res) => {
  const sql = `
    SELECT p.*, u.name AS cliente_name, u.email AS cliente_email,
           c.brand, c.model, c.year, c.color
    FROM compras p
    JOIN cliente u ON p.cliente_id = u.id
    JOIN carros c ON p.car_id = c.id
    ORDER BY p.purchase_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, compras: results });
  });
});

// ==================== CSV EXPORT ROUTES ====================

app.get('/api/admin/export/compras', requireAdmin, (req, res) => {
  const sql = `
    SELECT p.id, u.name AS cliente, u.email,
           c.brand AS marca, c.model AS modelo, c.year AS ano, c.color AS cor,
           p.total_price AS preco_total, p.status, p.purchase_date AS data_compra
    FROM compras p
    JOIN cliente u ON p.cliente_id = u.id
    JOIN carros c ON p.car_id = c.id
    ORDER BY p.purchase_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao exportar.');
    const headers = ['ID', 'Cliente', 'Email', 'Marca', 'Modelo', 'Ano', 'Cor', 'Preço Total (kzs)', 'Estado', 'Data da Compra'];
    const rows = results.map(r => [
      r.id, `"${r.cliente}"`, `"${r.email}"`, r.marca, r.modelo,
      r.ano, r.cor, r.preco_total, r.status,
      new Date(r.data_compra).toLocaleString('pt-AO')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sambacars_compras.csv"');
    res.send('\uFEFF' + csv);
  });
});

app.get('/api/admin/export/carros', requireAdmin, (req, res) => {
  db.query('SELECT id, brand, model, year, price, mileage, fuel, transmission, color, available, featured, created_at FROM carros ORDER BY id', (err, results) => {
    if (err) return res.status(500).send('Erro ao exportar.');
    const headers = ['ID', 'Marca', 'Modelo', 'Ano', 'Preço (kzs)', 'Quilometragem', 'Combustível', 'Transmissão', 'Cor', 'Disponível', 'Destaque', 'Data de Registo'];
    const rows = results.map(r => [
      r.id, r.brand, r.model, r.year, r.price, r.mileage,
      r.fuel, r.transmission, r.color,
      r.available ? 'Sim' : 'Não',
      r.featured ? 'Sim' : 'Não',
      new Date(r.created_at).toLocaleString('pt-AO')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sambacars_inventario.csv"');
    res.send('\uFEFF' + csv);
  });
});

app.get('/api/admin/export/cliente', requireAdmin, (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM cliente ORDER BY id', (err, results) => {
    if (err) return res.status(500).send('Erro ao exportar.');
    const headers = ['ID', 'Nome', 'Email', 'Perfil', 'Data de Registo'];
    const rows = results.map(r => [
      r.id, `"${r.name}"`, `"${r.email}"`, r.role,
      new Date(r.created_at).toLocaleString('pt-AO')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sambacars_utilizadores.csv"');
    res.send('\uFEFF' + csv);
  });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) AS total FROM carros',
    'SELECT COUNT(*) AS total FROM cliente WHERE role = "cliente"',
    'SELECT COUNT(*) AS total FROM compras',
    'SELECT IFNULL(SUM(total_price), 0) AS total FROM compras WHERE status = "confirmado"'
  ];

  Promise.all(queries.map(q => new Promise((resolve, reject) => {
    db.query(q, (err, r) => err ? reject(err) : resolve(r[0]));
  }))).then(([carros, cliente, compras, revenue]) => {
    res.json({
      success: true,
      stats: {
        carros: carros.total,
        cliente: cliente.total,
        compras: compras.total,
        revenue: revenue.total
      }
    });
  }).catch(() => res.json({ success: false }));
});

// ==================== MIDDLEWARE ====================

function requireLogin(req, res, next) {
  if (!req.session.cliente) return res.status(401).json({ success: false, message: 'Precisa de fazer login.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.cliente || req.session.cliente.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Acesso negado.' });
  next();
}

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/carros', (req, res) => res.sendFile(path.join(__dirname, 'carros.html')));
app.get('/detalhe', (req, res) => res.sendFile(path.join(__dirname, 'detalhe.html')));
app.get('/carrinho', (req, res) => res.sendFile(path.join(__dirname, 'carrinho.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`sambacars a correr em http://localhost:${PORT}`);
});
