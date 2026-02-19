// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Custom Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.log(`\n[${timestamp}] ${method} ${url}`);
  
  // Log request body for POST and PUT requests
  if ((method === 'POST' || method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define validation rules for menu items
const validateMenuItem = [
  body('name')
    .isString().withMessage('Name must be a string')
    .trim()
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description')
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('category')
    .isString().withMessage('Category must be a string')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, beverage'),
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Ingredients must be an array with at least 1 item'),
  body('available')
    .optional()
    .isBoolean().withMessage('Available must be a boolean')
];

// Validation error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Define routes and implement middleware here

// GET / - Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Menu API Server',
    endpoints: {
      'GET /api/menu': 'Retrieve all menu items',
      'GET /api/menu/:id': 'Retrieve a specific menu item',
      'POST /api/menu': 'Add a new menu item',
      'PUT /api/menu/:id': 'Update an existing menu item',
      'DELETE /api/menu/:id': 'Remove a menu item'
    }
  });
});

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req, res) => {
  const item = menuItems.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  res.status(200).json(item);
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', validateMenuItem, handleValidationErrors, (req, res) => {
  const { name, description, price, category, ingredients, available } = req.body;

  // Create new item
  const newItem = {
    id: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1,
    name,
    description,
    price: parseFloat(price),
    category,
    ingredients,
    available: available !== undefined ? available : true
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', validateMenuItem, handleValidationErrors, (req, res) => {
  const item = menuItems.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  // Update fields from validated request
  item.name = req.body.name;
  item.description = req.body.description;
  item.price = parseFloat(req.body.price);
  item.category = req.body.category;
  item.ingredients = req.body.ingredients;
  item.available = req.body.available !== undefined ? req.body.available : true;

  res.status(200).json(item);
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const index = menuItems.findIndex(item => item.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const deletedItem = menuItems.splice(index, 1);
  res.status(200).json({ message: 'Menu item deleted', item: deletedItem[0] });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
