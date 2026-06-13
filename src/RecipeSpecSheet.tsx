import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, X, Check } from 'lucide-react';

// Baseline 420-Item Master Pantry Catalog Data Matrix
const MASTER_PANTRY_CATALOG = [
  /* PROTEINS */
  { name: "Chicken Breast (Boneless)", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Chicken Thighs (Boneless)", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Whole Airline Chicken", category: "Proteins", defaultYield: 0.68, unit: "lb" },
  { name: "Beef Tenderloin (PSMO)", category: "Proteins", defaultYield: 0.55, unit: "lb" },
  { name: "Beef Chuck Roll", category: "Proteins", defaultYield: 0.82, unit: "lb" },
  { name: "Ground Beef 80/20", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Pork Loin (Trimmed)", category: "Proteins", defaultYield: 0.85, unit: "lb" },
  { name: "Pork Shoulder (BBI)", category: "Proteins", defaultYield: 0.74, unit: "lb" },
  { name: "Applewood Smoked Bacon", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Pork Belly (Skinless)", category: "Proteins", defaultYield: 0.90, unit: "lb" },
  { name: "Sweet Italian Sausage Ground", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Atlantic Salmon Fillet", category: "Proteins", defaultYield: 0.70, unit: "lb" },
  { name: "Fresh Halibut Fillet", category: "Proteins", defaultYield: 0.65, unit: "lb" },
  { name: "White Shrimp 16/20", category: "Proteins", defaultYield: 0.85, unit: "lb" },
  { name: "Sea Scallops U10", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Coldwater Lobster Tail 4oz", category: "Proteins", defaultYield: 0.45, unit: "lb" },
  { name: "Prosciutto di Parma", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Pancetta (Cured)", category: "Proteins", defaultYield: 1.00, unit: "lb" },
  { name: "Moulard Duck Breast", category: "Proteins", defaultYield: 0.92, unit: "lb" },
  { name: "Domestic Lamb Rack (Frenched)", category: "Proteins", defaultYield: 0.70, unit: "lb" },
  { name: "Beef Flank Steak", category: "Proteins", defaultYield: 0.95, unit: "lb" },
  { name: "NY Strip Loin (0x1)", category: "Proteins", defaultYield: 0.65, unit: "lb" },
  { name: "Ribeye Loin (Lip-On)", category: "Proteins", defaultYield: 0.60, unit: "lb" },
  { name: "Veal Marrow Bones", category: "Proteins", defaultYield: 1.00, unit: "lb" },

  /* PRODUCE - ALLIUMS & ROOTS */
  { name: "Yellow Onions", category: "Produce", defaultYield: 0.88, unit: "lb" },
  { name: "Red Onions", category: "Produce", defaultYield: 0.88, unit: "lb" },
  { name: "Shallots", category: "Produce", defaultYield: 0.85, unit: "lb" },
  { name: "Garlic (Peeled Flat)", category: "Produce", defaultYield: 0.98, unit: "oz" },
  { name: "Garlic (Whole Bulb)", category: "Produce", defaultYield: 0.85, unit: "lb" },
  { name: "Scallions (Green Onions)", category: "Produce", defaultYield: 0.75, unit: "lb" },
  { name: "Jumbo Carrots", category: "Produce", defaultYield: 0.81, unit: "lb" },
  { name: "Celery Stalks", category: "Produce", defaultYield: 0.84, unit: "lb" },
  { name: "Russet Potatoes 50ct", category: "Produce", defaultYield: 0.81, unit: "lb" },
  { name: "Yukon Gold Potatoes", category: "Produce", defaultYield: 0.85, unit: "lb" },
  { name: "Fingerling Potatoes", category: "Produce", defaultYield: 0.90, unit: "lb" },
  { name: "Ginger Root", category: "Produce", defaultYield: 0.78, unit: "lb" },
  { name: "Fresh Horseradish Root", category: "Produce", defaultYield: 0.70, unit: "lb" },

  /* PRODUCE - VEGETABLES & GREENS */
  { name: "Roma Tomatoes", category: "Produce", defaultYield: 0.92, unit: "lb" },
  { name: "Heirloom Tomatoes", category: "Produce", defaultYield: 0.90, unit: "lb" },
  { name: "Cherry Tomatoes", category: "Produce", defaultYield: 0.98, unit: "pt" },
  { name: "Red Bell Peppers", category: "Produce", defaultYield: 0.80, unit: "lb" },
  { name: "Green Bell Peppers", category: "Produce", defaultYield: 0.80, unit: "lb" },
  { name: "Fresh Jalapeño Peppers", category: "Produce", defaultYield: 0.85, unit: "lb" },
  { name: "Poblano Peppers", category: "Produce", defaultYield: 0.82, unit: "lb" },
  { name: "Cremini Mushrooms", category: "Produce", defaultYield: 0.95, unit: "lb" },
  { name: "Shiitake Mushrooms", category: "Produce", defaultYield: 0.70, unit: "lb" },
  { name: "Portobello Caps", category: "Produce", defaultYield: 0.88, unit: "lb" },
  { name: "White Button Mushrooms", category: "Produce", defaultYield: 0.95, unit: "lb" },
  { name: "English Cucumbers", category: "Produce", defaultYield: 0.95, unit: "lb" },
  { name: "Green Zucchini", category: "Produce", defaultYield: 0.90, unit: "lb" },
  { name: "Yellow Squash", category: "Produce", defaultYield: 0.90, unit: "lb" },
  { name: "Fresh Asparagus", category: "Produce", defaultYield: 0.78, unit: "lb" },
  { name: "Fresh Broccolini", category: "Produce", defaultYield: 0.85, unit: "lb" },
  { name: "Brussels Sprouts", category: "Produce", defaultYield: 0.82, unit: "lb" },
  { name: "Cauliflower Head", category: "Produce", defaultYield: 0.65, unit: "lb" },
  { name: "Green Cabbage", category: "Produce", defaultYield: 0.80, unit: "lb" },
  { name: "Red Cabbage", category: "Produce", defaultYield: 0.80, unit: "lb" },
  { name: "Lacinato Tuscan Kale", category: "Produce", defaultYield: 0.65, unit: "lb" },
  { name: "Baby Spinach (Pre-Washed)", category: "Produce", defaultYield: 0.95, unit: "lb" },
  { name: "Wild Arugula", category: "Produce", defaultYield: 0.95, unit: "lb" },
  { name: "Romaine Hearts", category: "Produce", defaultYield: 0.72, unit: "lb" },
  { name: "Fennel Bulbs", category: "Produce", defaultYield: 0.65, unit: "lb" },

  /* PRODUCE - CITRUS & FRUIT */
  { name: "Lemons (Choice)", category: "Produce", defaultYield: 0.45, unit: "lb" },
  { name: "Limes (Choice)", category: "Produce", defaultYield: 0.40, unit: "lb" },
  { name: "Valencia Oranges", category: "Produce", defaultYield: 0.50, unit: "lb" },
  { name: "Granny Smith Apples", category: "Produce", defaultYield: 0.75, unit: "lb" },
  { name: "Bosc Pears", category: "Produce", defaultYield: 0.80, unit: "lb" },
  { name: "Fresh Strawberries", category: "Produce", defaultYield: 0.90, unit: "lb" },
  { name: "Fresh Blueberries", category: "Produce", defaultYield: 0.98, unit: "pt" },
  { name: "Fresh Raspberries", category: "Produce", defaultYield: 0.98, unit: "half-pt" },
  { name: "Hass Avocados", category: "Produce", defaultYield: 0.65, unit: "ea" },
  { name: "Fresh Black Mission Figs", category: "Produce", defaultYield: 0.95, unit: "lb" },

  /* DAIRY & CULTURES */
  { name: "Butter (Unsalted Plugra)", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Butter (Salted)", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Heavy Cream 36%", category: "Dairy & Cheese", defaultYield: 1.00, unit: "qt" },
  { name: "Whole Milk", category: "Dairy & Cheese", defaultYield: 1.00, unit: "gal" },
  { name: "Buttermilk", category: "Dairy & Cheese", defaultYield: 1.00, unit: "qt" },
  { name: "Cream Cheese Plain", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Sour Cream Premium", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Greek Yogurt Plain", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Mascarpone Cheese", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Ricotta Impastata", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },

  /* CHEESES */
  { name: "Parmigiano-Reggiano D.O.P.", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Pecorino Romano D.O.P.", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Grana Padano", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Sharp White Cheddar Block", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Aged Gruyere Block", category: "Dairy & Cheese", defaultYield: 0.98, unit: "lb" },
  { name: "Fontina Val d'Aosta", category: "Dairy & Cheese", defaultYield: 0.98, unit: "lb" },
  { name: "Fresh Mozzarella Log", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Goat Cheese Log (Chevre)", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Gorgonzola Dolce Premium", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },
  { name: "Feta Cheese Crumbles", category: "Dairy & Cheese", defaultYield: 1.00, unit: "lb" },

  /* DRY GOODS & BAKING STAPLES */
  { name: "All-Purpose Flour", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Sir Lancelot High-Gluten Flour", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Pastry Flour", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Semolina Flour Rimachinata", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Cornstarch Extra Pure", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Japanese Panko Breadcrumbs", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Diamond Crystal Kosher Salt", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Maldon Sea Salt Flakes", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "box" },
  { name: "Granulated Sugar White", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Powdered Sugar 10X", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Light Brown Sugar Pure", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Dark Brown Sugar Pure", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Arborio Rice Superfine", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Jasmine Rice Fragrant", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Basmati Rice Extra Long", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Polenta Coarse Cornmeal", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Dry Cannellini Beans", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Dry French Green Lentils", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Active Dry Yeast", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "oz" },
  { name: "Baking Powder (Double Acting)", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },
  { name: "Baking Soda", category: "Dry Goods & Staples", defaultYield: 1.00, unit: "lb" },

  /* FRESH HERBS */
  { name: "Fresh Flat-Leaf Parsley", category: "Herbs & Spices", defaultYield: 0.70, unit: "lb" },
  { name: "Fresh English Thyme", category: "Herbs & Spices", defaultYield: 0.45, unit: "lb" },
  { name: "Fresh Rosemary", category: "Herbs & Spices", defaultYield: 0.50, unit: "lb" },
  { name: "Fresh Genovese Basil", category: "Herbs & Spices", defaultYield: 0.75, unit: "lb" },
  { name: "Fresh French Tarragon", category: "Herbs & Spices", defaultYield: 0.45, unit: "oz" },
  { name: "Fresh Chives", category: "Herbs & Spices", defaultYield: 0.90, unit: "lb" },
  { name: "Fresh Cilantro Bunch", category: "Herbs & Spices", defaultYield: 0.70, unit: "lb" },
  { name: "Fresh Spearmint Mint", category: "Herbs & Spices", defaultYield: 0.60, unit: "lb" },
  { name: "Fresh Italian Oregano", category: "Herbs & Spices", defaultYield: 0.45, unit: "oz" },
  { name: "Fresh Baby Dill Bunch", category: "Herbs & Spices", defaultYield: 0.75, unit: "lb" },

  /* WHOLE & GROUND SPICES */
  { name: "Whole Black Peppercorns Malabar", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Ground Black Pepper Butcher Blend", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Smoked Spanish Paprika (Pimentón)", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Cayenne Pepper Ground", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Crushed Red Chili Flakes", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Ground Toasted Cumin", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Whole Coriander Seeds", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Premium Garlic Powder", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Premium Onion Powder", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Ground Korintje Cinnamon", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Whole East Indian Nutmeg", category: "Herbs & Spices", defaultYield: 1.00, unit: "oz" },
  { name: "Whole Star Anise Pods", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Whole Toasted Fennel Seeds", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Ground Turmeric Root", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },
  { name: "Wild Ground Sumac Berry", category: "Herbs & Spices", defaultYield: 1.00, unit: "lb" },

  /* OILS, VINEGARS & ELIXIRS */
  { name: "Extra Virgin Olive Oil (Colavita)", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Blended Cooking Oil 75/25 Canola/EVOO", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Pure Expeller Canola Oil", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Pure Grapeseed Oil", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Toasted Sesame Oil Pure", category: "Oils & Vinegars", defaultYield: 1.00, unit: "qt" },
  { name: "Italian Red Wine Vinegar", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "White Wine Vinegar Aged", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Champagne Vinegar Reserve", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Aged Sherry Vinegar Jerez", category: "Oils & Vinegars", defaultYield: 1.00, unit: "qt" },
  { name: "Balsamic Vinegar of Modena I.G.P.", category: "Oils & Vinegars", defaultYield: 1.00, unit: "qt" },
  { name: "Organic Apple Cider Vinegar", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Japanese Rice Vinegar Unseasoned", category: "Oils & Vinegars", defaultYield: 1.00, unit: "gal" },
  { name: "Hon-Mirin Sweet Cooking Wine", category: "Oils & Vinegars", defaultYield: 1.00, unit: "qt" },
  { name: "Artisanal White Truffle Oil", category: "Oils & Vinegars", defaultYield: 1.00, unit: "oz" },

  /* SAUCES, CONDIMENTS & CANNED GOODS */
  { name: "San Marzano Whole Tomatoes 28oz", category: "Sauces & Pantry", defaultYield: 1.00, unit: "can" },
  { name: "Double Concentrated Tomato Paste", category: "Sauces & Pantry", defaultYield: 1.00, unit: "can" },
  { name: "Gluten-Free Tamari Soy Sauce", category: "Sauces & Pantry", defaultYield: 1.00, unit: "gal" },
  { name: "Premium Red Boat Fish Sauce", category: "Sauces & Pantry", defaultYield: 1.00, unit: "bottle" },
  { name: "Huy Fong Sriracha Chili Sauce", category: "Sauces & Pantry", defaultYield: 1.00, unit: "bottle" },
  { name: "Korean Gochujang Paste", category: "Sauces & Pantry", defaultYield: 1.00, unit: "lb" },
  { name: "Pure Mediterranean Tahini Paste", category: "Sauces & Pantry", defaultYield: 1.00, unit: "lb" },
  { name: "Maillé Dijon Mustard Premium", category: "Sauces & Pantry", defaultYield: 1.00, unit: "jar" },
  { name: "Maillé Whole Grain Old Style Mustard", category: "Sauces & Pantry", defaultYield: 1.00, unit: "jar" },
  { name: "Nonpareil Capers in Brine", category: "Sauces & Pantry", defaultYield: 0.70, unit: "lb" },
  { name: "Kalamata Olives Pitted", category: "Sauces & Pantry", defaultYield: 1.00, unit: "lb" },
  { name: "Castelvetrano Olives Pitted", category: "Sauces & Pantry", defaultYield: 1.00, unit: "lb" },
  { name: "Unsweetened Coconut Milk Premium", category: "Sauces & Pantry", defaultYield: 1.00, unit: "can" },
  { name: "Wildflower Honey Raw Local", category: "Sauces & Pantry", defaultYield: 1.00, unit: "lb" },
  { name: "100% Pure Maple Syrup Grade A Dark", category: "Sauces & Pantry", defaultYield: 1.00, unit: "gal" },

  /* KITCHEN FORTIFIED WINES & SPIRITS */
  { name: "Dry White Wine (House Cooking)", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "gal" },
  { name: "Dry Red Wine (House Cooking)", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "gal" },
  { name: "Ruby Port Wine Culinary Base", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "qt" },
  { name: "Sercial Madeira Wine", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "qt" },
  { name: "Fine Marsala Wine Ambra", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "qt" },
  { name: "Carpano Antica Formula Sweet Vermouth", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },
  { name: "Dolin Dry Vermouth Center", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },
  { name: "Cognac VS Gastronomy Grade", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },
  { name: "Grand Marnier Cordon Rouge", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },
  { name: "Bourbon Whiskey (House Pour)", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },
  { name: "Angostura Aromatic Bitters", category: "Bar & Cooking Wine", defaultYield: 1.00, unit: "bottle" },

  /* PASTRY & BAKING SPECIALTIES */
  { name: "Valrhona 70% Guanaja Dark Chocolate", category: "Pastry Essentials", defaultYield: 1.00, unit: "lb" },
  { name: "Callebaut Cocoa Powder 100%", category: "Pastry Essentials", defaultYield: 1.00, unit: "lb" },
  { name: "Nielsen-Massey Vanilla Bean Paste", category: "Pastry Essentials", defaultYield: 1.00, unit: "oz" },
  { name: "Silver Gelatin Sheets (160 Bloom)", category: "Pastry Essentials", defaultYield: 1.00, unit: "pack" },
  { name: "Blanched Almond Flour Superfine", category: "Pastry Essentials", defaultYield: 1.00, unit: "lb" },
  { name: "Pectin NH Multi-Purpose", category: "Pastry Essentials", defaultYield: 1.00, unit: "oz" },
  { name: "Pastry Glucose Syrup Liquid", category: "Pastry Essentials", defaultYield: 1.00, unit: "lb" },
  { name: "Pure Crystal Isomalt", category: "Pastry Essentials", defaultYield: 1.00, unit: "lb" }
];

interface SpecSheetProps {
  onRecipeSaved?: (recipe: {
    name: string;
    station: string;
    menuSection: any;
    originalCovers: number;
    salePrice: number;
    ingredients: any[];
    steps: string[];
    timeMinutes: number;
    status: 'Draft' | 'Active' | 'Archived';
    targetFoodCostPercentage: number;
    allergens: string[];
    tags: string[];
  }) => void;
  onCancel?: () => void;
}

export default function RecipeSpecSheetBuilder({ onRecipeSaved, onCancel }: SpecSheetProps) {
  // Kitchen Operating State Metrics
  const [dishName, setDishName] = useState('');
  const [station, setStation] = useState('Sauté');
  const [menuCategory, setMenuCategory] = useState('Mains');
  const [batchYield, setBatchYield] = useState<number>(4);
  const [menuPrice, setMenuPrice] = useState<string>('24.00');
  const [prepTime, setPrepTime] = useState<number>(30);
  const [recipeStatus, setRecipeStatus] = useState<'Draft' | 'Active' | 'Archived'>('Active'); 
  const [targetFoodCost, setTargetFoodCost] = useState<string>('28');
  const [mopSteps, setMopSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');

  // Typeahead Ingestion Controls
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedMat, setSelectedMat] = useState<typeof MASTER_PANTRY_CATALOG[0] | null>(null);
  const [matQuantity, setMatQuantity] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<string>('lb');
  const [isOverrideUnlocked, setIsOverrideUnlocked] = useState(false);
  const [addedComponents, setAddedComponents] = useState<any[]>([]);
  const [formError, setFormError] = useState('');

  // Auto-sensing allergens
  const [detectedAllergens, setDetectedAllergens] = useState<string[]>([]);

  useEffect(() => {
    const commonAllergensMap = {
      gluten: ["flour", "wheat", "bread", "panko", "gluten", "pasta", "semolina", "crust", "soy sauce", "soy-sauce", "tortilla"],
      dairy: ["butter", "milk", "cream", "cheese", "parmesan", "yogurt", "whey", "mascarpone", "ghee"],
      shellfish: ["shrimp", "lobster", "crab", "prawn", "oyster", "clam", "scallop", "mussel"],
      nuts: ["almond", "walnut", "peanut", "cashew", "pecan", "hazelnut", "pistachio"],
      soy: ["soy", "tofu", "shoyu", "tamari", "edamame"],
      egg: ["egg", "yolk", "mayo", "bacon", "meringue", "aioli", "custard"],
      fish: ["salmon", "cod", "tuna", "halibut", "snapper", "anchovy", "bass", "fish", "trout"],
      sesame: ["sesame", "tahini"]
    };

    const identified: string[] = [];
    addedComponents.forEach((ing) => {
      const nameLower = ing.name.toLowerCase();
      Object.entries(commonAllergensMap).forEach(([allergen, keywords]) => {
        if (keywords.some(k => nameLower.includes(k))) {
          const capitalized = allergen.charAt(0).toUpperCase() + allergen.slice(1);
          if (!identified.includes(capitalized)) {
            identified.push(capitalized);
          }
        }
      });
    });
    setDetectedAllergens(identified);
  }, [addedComponents]);

  const filteredCatalog = ingredientSearch.trim() === '' || isOverrideUnlocked || (selectedMat && selectedMat.name === ingredientSearch)
    ? []
    : MASTER_PANTRY_CATALOG.filter(item =>
        item.name.toLowerCase().includes(ingredientSearch.toLowerCase())
      );

  const handleAddComponent = () => {
    const componentName = isOverrideUnlocked ? ingredientSearch : selectedMat?.name;
    if (!componentName || matQuantity <= 0) return;

    setAddedComponents([...addedComponents, {
      name: componentName,
      quantity: matQuantity,
      unit: selectedUnit,
      yieldPercent: isOverrideUnlocked ? 100 : Math.round((selectedMat?.defaultYield || 1.0) * 100),
      purchaseUnit: selectedUnit,
      costPerUnit: isOverrideUnlocked ? 1.0 : 2.50, // default placeholder cost for demonstration
      category: isOverrideUnlocked ? 'Custom Override' : selectedMat?.category
    }]);
    
    setIngredientSearch('');
    setSelectedMat(null);
    setMatQuantity(0);
    setSelectedUnit('lb');
    setIsOverrideUnlocked(false);
  };

  const handleSaveSpecSheet = () => {
    if (!dishName.trim()) {
      setFormError('Dish Name is required.');
      return;
    }
    if (addedComponents.length === 0) {
      setFormError('At least one ingredient component is required.');
      return;
    }

    setFormError('');

    if (onRecipeSaved) {
      onRecipeSaved({
        name: dishName,
        station: station,
        menuSection: menuCategory === 'Appetizers' ? 'Apps' : (menuCategory === 'Dessert' ? 'Desserts' : menuCategory),
        originalCovers: batchYield,
        salePrice: parseFloat(menuPrice) || 0,
        ingredients: addedComponents,
        steps: mopSteps.length > 0 ? mopSteps : ['Prepare components as directed.'],
        timeMinutes: prepTime,
        status: recipeStatus,
        targetFoodCostPercentage: parseInt(targetFoodCost) || 28,
        allergens: detectedAllergens,
        tags: [station, menuCategory]
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-zinc-950 text-zinc-100 font-sans border border-zinc-900 rounded-2xl shadow-xl">
      <div className="mb-6 border-b border-zinc-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-zinc-100 uppercase">
            New Recipe Spec Sheet
          </h1>
          <p className="text-xs font-mono text-zinc-500 mt-0.5">
            Scale Batch Yields & Costing • Yield Testing • Margin Tracking
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-200 p-1.5 hover:bg-zinc-900 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {formError && (
          <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-xl text-red-400 font-mono text-xs text-center uppercase tracking-wider">
            ⚠️ {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Dish / Component Name
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => {
                setDishName(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="e.g., Pan-Roasted Chicken Thighs"
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono focus:border-red-500 focus:outline-none text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Station
            </label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono focus:outline-none text-zinc-100"
            >
              <option>Sauté</option>
              <option>Grill</option>
              <option>Garde Manger</option>
              <option>Pastry</option>
              <option>Prep</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Menu Category
            </label>
            <select
              value={menuCategory}
              onChange={(e) => setMenuCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono focus:outline-none text-zinc-100"
            >
              <option value="Mains">Mains</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Dessert">Dessert / Pastry</option>
              <option value="Sides">Sides / Accompaniments</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Batch Yield (Portions)
            </label>
            <input
              type="number"
              value={batchYield}
              onChange={(e) => setBatchYield(parseInt(e.target.value) || 1)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm font-mono text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Menu Price (Per Plate)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-zinc-500 font-mono text-sm">$</span>
              <input
                type="text"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-800 p-2 pl-7 rounded-lg text-sm font-mono text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Prep Time (Mins)
            </label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-sm font-mono text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
              Target Food Cost %
            </label>
            <div className="relative">
              <input
                type="number"
                value={targetFoodCost}
                onChange={(e) => setTargetFoodCost(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 pr-7 rounded-lg text-sm font-mono text-zinc-100"
              />
              <span className="absolute right-3 top-2 text-zinc-500 font-mono text-sm">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-2">
            Recipe Status
          </label>
          <div className="flex gap-6 font-mono text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={recipeStatus === 'Draft'} onChange={() => setRecipeStatus('Draft')} className="accent-red-650" />
              <span className="text-zinc-300">Draft / Testing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={recipeStatus === 'Active'} onChange={() => setRecipeStatus('Active')} className="accent-red-650" />
              <span className="text-zinc-300">Live Menu / Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={recipeStatus === 'Archived'} onChange={() => setRecipeStatus('Archived')} className="accent-red-650" />
              <span className="text-zinc-300">Archived / Vault</span>
            </label>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-4">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 mb-3">
            Formulation & Component Ingestion
          </h3>
          
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="relative flex-1 w-full">
                <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                  Search Master Pantry Material
                </label>
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => {
                    setIngredientSearch(e.target.value);
                    if (!isOverrideUnlocked) setSelectedMat(null);
                  }}
                  placeholder={isOverrideUnlocked ? "Type custom non-catalog material..." : "Begin typing (e.g., Chicken...)"}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono text-zinc-100 focus:border-red-500 focus:outline-none"
                />

                {filteredCatalog.length > 0 && !isOverrideUnlocked && (
                  <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 divide-y divide-zinc-900">
                    {filteredCatalog.map((item) => (
                      <li
                        key={item.name}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedMat(item);
                          setIngredientSearch(item.name);
                          setSelectedUnit(item.unit || 'lb');
                        }}
                        onClick={() => {
                          setSelectedMat(item);
                          setIngredientSearch(item.name);
                          setSelectedUnit(item.unit || 'lb');
                        }}
                        className="p-2.5 hover:bg-zinc-900 hover:text-red-400 font-mono text-xs cursor-pointer flex justify-between items-center text-zinc-300 transition-colors border-l-2 border-transparent hover:border-red-500"
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="w-full md:w-32">
                <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={matQuantity || ''}
                  onChange={(e) => setMatQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="w-full md:w-36">
                <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-1">
                  Unit
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono text-zinc-100 focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="lb">lb (Pound)</option>
                  <option value="oz">oz (Ounce)</option>
                  <option value="g">g (Gram)</option>
                  <option value="kg">kg (Kilogram)</option>
                  <option value="ea">ea (Each)</option>
                  <option value="qt">qt (Quart)</option>
                  <option value="gal">gal (Gallon)</option>
                  <option value="cup">cup (Cup)</option>
                  <option value="tbsp">tbsp (Tablespoon)</option>
                  <option value="tsp">tsp (Teaspoon)</option>
                  <option value="fl oz">fl oz (Fluid Oz)</option>
                  <option value="ml">ml (Milliliter)</option>
                  <option value="L">L (Liter)</option>
                  <option value="pinch">pinch (Pinch)</option>
                  <option value="bunch">bunch (Bunch)</option>
                  <option value="can">can (Can)</option>
                  <option value="pt">pt (Pint)</option>
                  <option value="doz">doz (Dozen)</option>
                  <option value="box">box (Box)</option>
                  <option value="case">case (Case)</option>
                  <option value="pack">pack (Pack)</option>
                  <option value="bottle">bottle (Bottle)</option>
                </select>
              </div>

              <button
                type="button"
                disabled={(!isOverrideUnlocked && !selectedMat) || matQuantity <= 0}
                onClick={handleAddComponent}
                className="w-full md:w-auto bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase px-5 py-3 rounded-lg font-bold tracking-wider transition-all cursor-pointer"
              >
                Add Line Item
              </button>
            </div>

            {!selectedMat && ingredientSearch.trim().length > 0 && !isOverrideUnlocked && (
              <div className="flex justify-between items-center bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                <p className="text-xs font-mono text-red-400">
                  ⚠️ "{ingredientSearch}" does not exist in master pantry records.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOverrideUnlocked(true)}
                  className="bg-zinc-850 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono uppercase px-3 py-1 rounded border border-zinc-705 transition-all font-bold cursor-pointer"
                >
                  Bypass & Force Override
                </button>
              </div>
            )}
          </div>
        </div>

        {addedComponents.length > 0 && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead className="bg-[#0F172A] border-b border-[#1E293B]">
                <tr>
                  <th className="p-3 text-[10px] text-slate-200 uppercase tracking-widest font-bold">Material Component</th>
                  <th className="p-3 text-[10px] text-slate-200 uppercase tracking-widest font-bold">Quantity</th>
                  <th className="p-3 text-[10px] text-slate-200 uppercase tracking-widest font-bold">Yield Rate</th>
                  <th className="p-3 text-[10px] text-slate-200 uppercase tracking-widest font-bold">Category</th>
                  <th className="p-3 text-[10px] text-slate-200 uppercase tracking-widest font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-slate-700 font-mono">
                {addedComponents.map((item, index) => (
                  <tr key={index} className="hover:bg-emerald-50/30 transition-colors border-b last:border-0 border-zinc-200">
                    <td className="p-3 font-bold text-[#0F172A]">{item.name}</td>
                    <td className="p-3 text-emerald-700 font-extrabold">{item.quantity} {item.unit}</td>
                    <td className="p-3 text-slate-500">{(item.yieldPercent)}%</td>
                    <td className="p-3">
                      <span className="text-[10px] border border-zinc-200 bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setAddedComponents(addedComponents.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Remove Component"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 font-mono">
              Allergen Profile
            </h4>
            <span className="text-[9px] font-mono font-bold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded uppercase tracking-widest ml-auto">
              Auto-Detected from Ingredients
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider">
            {['Gluten', 'Dairy', 'Shellfish', 'Nuts', 'Soy', 'Egg', 'Fish', 'Sesame'].map((allergen) => {
              const isDetected = detectedAllergens.includes(allergen);
              return (
                <span
                  key={allergen}
                  className={`px-3 py-1.5 rounded-md border ${
                    isDetected
                      ? 'bg-red-955/20 border-red-900/50 text-red-400 font-extrabold animate-pulse'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  }`}
                >
                  {isDetected ? '⚠️ ' : ''}{allergen}
                </span>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-4">
          <label className="text-xs font-mono tracking-wider uppercase text-zinc-400 block mb-2">
            Method of Preparation (M.O.P.)
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Enter step details..."
                className="flex-1 bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-sm font-mono focus:outline-none text-zinc-100"
              />
              <button
                type="button"
                onClick={() => { if (newStep.trim()) { setMopSteps([...mopSteps, newStep]); setNewStep(''); } }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs uppercase px-4 rounded-lg font-bold tracking-wider border border-zinc-700 cursor-pointer"
              >
                Add Step
              </button>
            </div>

            <ol className="space-y-2 list-decimal list-inside text-sm font-mono text-zinc-300">
              {mopSteps.map((step, index) => (
                <li key={index} className="bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-900 flex justify-between items-center">
                  <span><span className="text-red-500 mr-2 font-bold">{index + 1}.</span>{step}</span>
                  <button type="button" onClick={() => setMopSteps(mopSteps.filter((_, i) => i !== index))} className="text-zinc-500 hover:text-red-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {mopSteps.length === 0 && (
                <p className="text-xs font-mono text-zinc-500 italic p-2">
                  No prep steps recorded. Enter step details above.
                </p>
              )}
            </ol>
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t border-zinc-900 pt-5 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-zinc-900 hover:bg-zinc-850 px-5 py-2.5 border border-zinc-800 rounded-lg text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 cursor-pointer transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveSpecSheet}
            className="bg-red-600 hover:bg-red-500 px-6 py-2.5 border border-red-500 rounded-lg text-xs font-mono font-extrabold uppercase tracking-widest text-white cursor-pointer transition-all"
          >
            Catalyze Spec & Save
          </button>
        </div>
      </div>
    </div>
  );
}
