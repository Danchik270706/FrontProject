const apiKey = 'e91b797c1b1c4638b5a1bc216eeeae61';

// Function to display suggestions as user types
async function suggestRecipes() {
  const query = document.getElementById('searchInput').value;
  if (query.length < 2) {
    document.getElementById('suggestions').style.display = 'none';
    return;
  }

  const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=5&apiKey=${apiKey}`);
  const suggestions = await response.json();
  displaySuggestions(suggestions);
}

// Display the suggestions in the dropdown
function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';  // Clear current suggestions
  suggestionsDiv.style.display = 'block';  // Show suggestions box
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.innerText = suggestion.title;
    item.onclick = () => {
      document.getElementById('searchInput').value = suggestion.title;
      suggestionsDiv.style.display = 'none';
      searchRecipes();  // Trigger search with the selected suggestion
    };
    suggestionsDiv.appendChild(item);
  });
}

// Function to search for recipes based on input
async function searchRecipes() {
  const query = document.getElementById('searchInput').value;
  const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apiKey}`);
  const data = await response.json();
  displayRecipes(data.results);
}

// Display recipes in a grid format
function displayRecipes(recipes) {
  const recipeGrid = document.getElementById('recipeGrid');
  recipeGrid.innerHTML = '';  // Clear old recipes
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <button onclick="viewRecipe(${recipe.id})">View Recipe</button>
      <button onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Favorites</button>
    `;
    recipeGrid.appendChild(card);
  });
}

// Show recipe details in a modal
async function viewRecipe(id) {
  const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
  const recipe = await response.json();
  const recipeDetails = document.getElementById('recipeDetails');
  recipeDetails.innerHTML = `
    <h2>${recipe.title}</h2>
    <p><strong>Ingredients:</strong></p>
    <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
    <p><strong>Instructions:</strong> ${recipe.instructions || 'Instructions not available.'}</p>
    <p><strong>Nutritional Info:</strong> ${recipe.nutrition?.nutrients?.map(n => `${n.title}: ${n.amount}${n.unit}`).join(', ') || 'Nutrition data not available.'}</p>
  `;
  
  document.getElementById('recipeModal').style.display = 'flex';
}

// Close the recipe modal
function closeModal() {
  document.getElementById('recipeModal').style.display = 'none';
}

// Add recipe to favorites and save in local storage
function addToFavorites(id, title, image) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Check if the recipe is already in favorites
  if (!favorites.some(fav => fav.id === id)) {
    favorites.push({ id, title, image });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
  } else {
    alert("This recipe is already in your favorites!");
  }
}

// Load favorite recipes from local storage
function loadFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.forEach(fav => {
    const card = document.createElement('div');
    card.classList.add('favorite-card');
    card.innerHTML = `
      <img src="${fav.image}" alt="${fav.title}">
      <h3>${fav.title}</h3>
      <button onclick="removeFromFavorites(${fav.id})">Remove</button>
    `;
    favoritesList.appendChild(card);
  });
}

// Remove recipe from favorites
function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => fav.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
  const suggestionsDiv = document.getElementById('suggestions');
  if (!suggestionsDiv.contains(event.target) && event.target.id !== 'searchInput') {
    suggestionsDiv.style.display = 'none';
  }
});

// Initialize favorites on page load
document.addEventListener('DOMContentLoaded', loadFavorites);
