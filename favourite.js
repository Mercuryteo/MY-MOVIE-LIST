const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favouriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((movie) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + movie.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${movie.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite"  data-id="${movie.id}">x</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
  });

  dataPanel.innerHTML = rawHTML
}

function removeFavourite(id) {
  if (!movies || !movies.length) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  
  movies.splice(movieIndex, 1)

  localStorage.setItem('favouriteMovies', JSON.stringify(movies))
  
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavourite(Number(event.target.dataset.id))
  }
})

function showMovieModal(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  const movieImage = document.querySelector('#movie-modal-image')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      movieTitle.innerText = data.title
      movieDate.innerText = `Release date: ${data.release_date}`
      movieDescription.innerText = data.description
      movieImage.innerHTML = `<img src=${POSTER_URL + data.image}>`
    })
    .catch((err) => console.log(err))
}

renderMovieList(movies)