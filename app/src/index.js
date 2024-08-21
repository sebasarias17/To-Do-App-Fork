const express = require('express');
const os = require('os');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// Función para obtener la dirección IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i = 0; i < interfaces[iface].length; i++) {
      const alias = interfaces[iface][i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1'; // En caso de que no se encuentre ninguna IP externa, se usa localhost
}

db.init().then(() => {
    const port = 3000;
    const ip = getLocalIP();
    app.listen(port, '0.0.0.0', () => console.log(`App running at http://${ip}:${port}`));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
