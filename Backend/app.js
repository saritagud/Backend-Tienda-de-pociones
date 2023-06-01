const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://tiendaPociones:tiendaPociones@tiendapociones.3dtqomq.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const potionSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  image: String,
  category: String,
  ingredients: [String]
});

const Potion = mongoose.model('Potion', potionSchema);

// Agregar poción
app.post('/potions', (req, res) => {
  const potionData = req.body;

  const newPotion = new Potion(potionData);

  newPotion.save()
    .then((potion) => {
      res.json(potion);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error al crear la poción' });
    });
});

// Ver pociones
app.get('/potions', (req, res) => {
  Potion.find()
    .then((potions) => {
      res.json(potions);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error al obtener las pociones' });
    });
});

// Ver por id
app.get('/potions/:id', (req, res) => {
  const potionId = req.params.id;

  Potion.findById(potionId)
    .then((potion) => {
      if (!potion) {
        res.status(404).json({ error: 'Poción no encontrada' });
      } else {
        res.json(potion);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error al obtener la poción' });
    });
});

//Editar pocion
app.put('/potions/:id', (req, res) => {
  const potionId = req.params.id;
  const potionData = req.body;

  Potion.findByIdAndUpdate(potionId, potionData, { new: true })
    .then((potion) => {
      if (!potion) {
        res.status(404).json({ error: 'Poción no encontrada' });
      } else {
        res.json(potion);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error al actualizar la poción' });
    });
});

// Eliminar pocion
app.delete('/potions/:id', (req, res) => {
  const potionId = req.params.id;

  Potion.findByIdAndRemove(potionId)
    .then((potion) => {
      if (!potion) {
        res.status(404).json({ error: 'Poción no encontrada' });
      } else {
        res.json({ message: 'Poción eliminada correctamente' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error al eliminar la poción' });
    });
});

app.listen(3000, () => {
  console.log('server on port 3000');
});
