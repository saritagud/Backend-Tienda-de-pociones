const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://tiendaPociones:tiendaPociones@tiendapociones.3dtqomq.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Esquema pociones
const potionSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  category: String,
  ingredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }]
});
  
  const Potion = mongoose.model('Potion', potionSchema);

// Esquema ingredientes
const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
  });
  
const Ingredient = mongoose.model('Ingredient', ingredientSchema);
  

//Agregar poción
app.post('/agregar', (req, res) => {
  const potionData = req.body;
  const ingredients = req.body.ingredients;

  const newPotion = new Potion(potionData);

  newPotion.save()
    .then((potion) => {
      let ingredientPromises = [];
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientId = ingredients[i];
        ingredientPromises.push(
          Ingredient.findById(ingredientId)
            .then((ingredient) => {
              if (ingredient) {
                ingredient.quantity -= 1;
                return ingredient.save();
              }
            })
        );
      }

      Promise.all(ingredientPromises)
        .then(() => {
          res.json(potion);
        })
        .catch((error) => {
          res.status(500).json({ error: 'No se ha podido actualizar los ingredientes' });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: 'No se ha podido crear la poción' });
    });
});


// Ver pociones
app.get('/potions', (req, res) => {
  Potion.find()
    .then((potions) => {
      res.json(potions);
    })
    .catch((error) => {
      res.status(500).json({ error: 'No se ha podido obtener la poción' });
    });
});

// Ver por id
app.get('/potions/:id', (req, res) => {
  const potionId = req.params.id;

  Potion.findById(potionId)
    .then((potion) => {
      if (!potion) {
        res.status(404).json({ error: 'No se ha encontrado la poción' });
      } else {
        res.json(potion);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'No se ha podido obtener la poción' });
    });
});

//Editar poción
app.put('/editar/:id', (req, res) => {
  const potionId = req.params.id;
  const potionData = req.body;
  const ingredients = req.body.ingredients;

  Potion.findById(potionId)
    .then((potion) => {
      if (!potion) {
        res.status(404).json({ error: 'No se ha encontrado la poción' });
      } else {
        const currentIngredients = potion.ingredients;

        potion.name = potionData.name;
        potion.description = potionData.description;
        potion.price = potionData.price;
        potion.quantity = potionData.quantity;
        potion.category = potionData.category;
        potion.ingredients = ingredients;

        let ingredientPromises = [];
        let previousIngredientPromises = [];

        for (let i = 0; i < ingredients.length; i++) {
          const ingredientId = ingredients[i];
          ingredientPromises.push(
            Ingredient.findById(ingredientId)
              .then((ingredient) => {
                if (ingredient) {
                  ingredient.quantity -= 1;
                  return ingredient.save();
                }
              })
          );
        }

        for (let i = 0; i < currentIngredients.length; i++) {
          const ingredientId = currentIngredients[i];
          if (!ingredients.includes(ingredientId)) {
            previousIngredientPromises.push(
              Ingredient.findById(ingredientId)
                .then((ingredient) => {
                  if (ingredient) {
                    ingredient.quantity += 1;
                    return ingredient.save();
                  }
                })
            );
          }
        }

        Promise.all([...ingredientPromises, ...previousIngredientPromises])
          .then(() => {
            potion.save()
              .then((updatedPotion) => {
                res.json(updatedPotion);
              })
              .catch((error) => {
                res.status(500).json({ error: 'No se ha podido actualizar la poción' });
              });
          })
          .catch((error) => {
            res.status(500).json({ error: 'No se ha podido actualizar los ingredientes' });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'No se ha podido obtener la poción' });
    });
});


// Eliminar poción
app.delete('/eliminar/:id', (req, res) => {
  const potionId = req.params.id;

  Potion.findById(potionId)
    .populate('ingredients')
    .then(potion => {
      if (!potion) {
        return res.status(404).json({ error: 'No se ha encontrado la poción' });
      }

      potion.ingredients.forEach(ingredient => {
        ingredient.quantity += ingredient.quantity;
      });

      Promise.all(potion.ingredients.map(ingredient => ingredient.save()))
        .then(() => {
          
          Potion.findByIdAndRemove(potionId)
            .then(() => res.json({ message: 'Se ha eliminado la poción' }))
            .catch(error => res.status(500).json({ error: 'No se ha podido eliminar la poción' }));
        })
        .catch(error => res.status(500).json({ error: 'No se ha podido actualizar los ingredientes' }));
    })
    .catch(error => res.status(500).json({ error: 'No se ha podido obtener la poción' }));
});

// Ver ingredientes
app.get('/ingredients', (req, res) => {
  Ingredient.find()
    .then((ingredients) => {
      res.json(ingredients);
    })
    .catch((error) => {
      res.status(500).json({ error: 'No se ha podido obtener la lista de ingredientes' });
    });
});


app.listen(3000, () => {
  console.log('server on port 3000');
});