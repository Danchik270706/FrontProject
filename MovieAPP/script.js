const apiKey = 'e6af60ef3a5daccaa6df1939e78bb577';
const searchInput = document.getElementById('search-input');
const suggestionBox = document.getElementById('suggestion-box');
const movieGrid = document.getElementById('movie-grid');
const movieDetailsModal = document.getElementById('movie-details-modal');
const movieDetails = document.getElementById('movie-details');
const closeButton = document.getElementById('close-button');
const viewWishlistButton = document.getElementById('view-wishlist');
const wishlistContainer = document.getElementById('wishlist');
const sortSelect = document.getElementById('sort-select');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Fetch popular movies on initial load
fetchMovies();

// Search functionality
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length > 2) {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
        const data = await response.json();
        displayMovies(data.results); // Display the search results
        displaySuggestions(data.results); // Show suggestions based on search
    } else {
        suggestionBox.innerHTML = '';
        fetchMovies(); // Reload popular movies if search input is cleared
    }
});

// Fetch and display movies
async function fetchMovies(sortBy = 'popularity.desc') {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${sortBy}`);
    const data = await response.json();
    displayMovies(data.results);
}

// Display movies in the grid
function displayMovies(movies) {
    movieGrid.innerHTML = ''; // Clear previous movies
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>No movies found.</p>'; // Message if no results
    } else {
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <p>Release Date: ${movie.release_date}</p>
                <button onclick="addToWishlist(${movie.id}, '${movie.title}', '${movie.poster_path}')">Add to Wishlist</button>
                <button onclick="openMovieDetails(${movie.id})">More Info</button>
            `;
            movieGrid.appendChild(card);
        });
    }
}

// Sort movies based on user selection
sortSelect.addEventListener('change', (event) => {
    fetchMovies(event.target.value);
});

// Open movie details modal
async function openMovieDetails(movieId) {
    const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
    const movie = await movieResponse.json();
    
    // Fetch trailer data
    const videoResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
    const videoData = await videoResponse.json();
    const trailer = videoData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

    // Fetch reviews
    const reviewsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}`);
    const reviewsData = await reviewsResponse.json();

    // Display movie details along with trailer and reviews
    displayMovieDetails(movie, trailer, reviewsData.results);
}

// Display movie details in modal
function displayMovieDetails(movie, trailer, reviews) {
    // Display trailer section if available
    const trailerSection = trailer ? `
        <div class="trailer-section">
            <h3>Trailer</h3>
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    ` : '<p>No trailer available</p>';

    // Display reviews section
    let reviewsSection = '<div class="reviews-section"><h3>User Reviews</h3>';
    if (reviews.length > 0) {
        reviewsSection += reviews.slice(0, 3).map(review => `
            <div class="review">
                <p><strong>${review.author}:</strong> ${review.content.slice(0, 200)}${review.content.length > 200 ? '...' : ''}</p>
            </div>
        `).join('');
    } else {
        reviewsSection += '<p>No reviews available</p>';
    }
    reviewsSection += '</div>';

    // Fill the movie details modal
    movieDetails.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <p><strong>Overview:</strong> ${movie.overview}</p>
        <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
        <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
        ${trailerSection}
        ${reviewsSection}
    `;
    movieDetailsModal.style.display = 'block'; // Show modal
}

// Close movie details modal
closeButton.onclick = () => {
    movieDetailsModal.style.display = 'none';
};

// Add movie to wishlist
function addToWishlist(id, title, posterPath) {
    const movieExists = watchlist.some(movie => movie.id === id);
    if (!movieExists) {
        const movie = { id, title, poster_path: posterPath };
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${title} has been added to your wishlist!`);
    } else {
        alert(`${title} is already in your wishlist.`);
    }
}

// Open wishlist modal
viewWishlistButton.onclick = () => {
    displayWishlist();
    wishlistContainer.style.display = 'block';
};

// Display wishlist movies
function displayWishlist() {
    const wishlistContent = document.getElementById('wishlist-content');
    wishlistContent.innerHTML = '';
    if (watchlist.length === 0) {
        wishlistContent.innerText = 'Your wishlist is empty.';
    } else {
        watchlist.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('favorite-card');
            movieDiv.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <button onclick="removeFromWishlist(${movie.id})">Remove from Wishlist</button>
            `;
            wishlistContent.appendChild(movieDiv);
        });
    }
}

// Remove movie from wishlist
function removeFromWishlist(movieId) {
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWishlist();
}

// Close wishlist modal
document.getElementById('close-wishlist-button').onclick = () => {
    wishlistContainer.style.display = 'none';
};

// Close modals with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (movieDetailsModal.style.display === 'block') {
            movieDetailsModal.style.display = 'none';
        }
        if (wishlistContainer.style.display === 'block') {
            wishlistContainer.style.display = 'none';
        }
    }
});
