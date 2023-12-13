const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')
const viewFormat = document.querySelector('#change-view-btn')
const searchInput = document.querySelector('#search-input')

const model = {    //宣告model，將資料存在這裏面
  movies: [],      //將存入所有電影
  filterMovieList: [],    //將存入所有搜索的電影
  currentPage: 1      //記錄現在處於第幾頁
}

const controller = {      //宣告controller，主要由controller控制view裏的函式的呼叫
  initialRender() {     //初始渲染畫面
    axios
      .get(INDEX_URL)
      .then((response) => {
        model.movies.push(...response.data.results)
        view.renderPaginator(model.movies.length)
        view.renderByCard(view.getMoviesByPage(1))
      })
      .catch((err) => console.log(err))
  },
  
  searchMovie() {         //搜索相關函式
    const input = searchInput.value.trim().toLowerCase()      //宣告搜索關鍵字

    if (!input.length) {
      return alert('請輸入有效字串！')
    }

    model.filterMovieList = model.movies.filter((movie) =>    //根據關鍵字找出所有符合的電影
      movie.title.toLowerCase().includes(input)
    )

    if (model.filterMovieList.length === 0) {
      return alert(`您輸入的關鍵字：${input} 沒有符合條件的電影`)
    }

    model.currentPage = 1

    view.renderPaginator(model.filterMovieList.length)    //根據電影數顯示分頁

    this.renderOption(model.currentPage)      //用符合的電影渲染畫面
  },

  renderByPageNumber(pageNumber) {    //根據分頁數字，渲染畫面的函式
    model.currentPage = pageNumber    //記錄現在的頁數為點擊的分頁的數字

    this.renderOption(pageNumber)     //根據分頁數字，渲染畫面的韓式
  },

  buttonClicked(target) {       //按鈕點擊相關函式
    if (target.matches('.btn-show-movie')) {      //如果符合，呼叫modal的函式
      view.showMovieModal(Number(target.dataset.id))
    } else if (target.matches('.btn-add-favorite')) {     //如果符合，呼叫“加到喜歡”的函式
      view.addToFavourite(Number(target.dataset.id))
    }
  },

  changeView(pageNumber, target) {        //根據按鈕，改變畫面渲染方式的函式
    if (target.classList.contains('fa-th')) {
      view.renderByCard(view.getMoviesByPage(pageNumber))
    } else if (target.classList.contains('fa-bars')) {
      view.renderByList(view.getMoviesByPage(pageNumber))
    }
  },

    renderOption(pageNumber) {      //根據情況，選擇適當的畫面渲染方式的函式
      if (dataPanel.children[0].classList.contains('card-container')) {
        view.renderByCard(view.getMoviesByPage(pageNumber))
      } else {
        view.renderByList(view.getMoviesByPage(pageNumber))
      }
    }
}

const view = {      //宣告view，將畫面渲染相關函式存在這裏，以便controller呼叫
  renderByCard(data) {      //使電影以card的方式，渲染畫面
    let rawHTML = ''

    data.forEach((movie) => {
      rawHTML += `<div class="card-container col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + movie.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${movie.id}">More</button>
                <button class="btn btn-info btn-add-favorite"  data-id="${movie.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    });

    dataPanel.innerHTML = rawHTML
  },

  renderByList(data) {        //使電影以list的方式，渲染畫面
    let rawHTML = "<div class='mb-2'><ul class='list-group'>"

    data.forEach((movie) => {
      rawHTML += `<li class="list-group-item d-flex justify-content-between">
            <h4 class="list-title">${movie.title}</h3>
            <div class="list-function">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${movie.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${movie.id}">+</button>
            </div>
          </li>`
    });

    rawHTML += "</ul></div>"

    dataPanel.innerHTML = rawHTML
  },

  showMovieModal(id) {        //以所輸入的id，來渲染modal的畫面
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
  },

  addToFavourite(id) {        //以所輸入的id，將電影加到雲端，以便favourite.js能取得
    const list = JSON.parse(localStorage.getItem('favouriteMovies')) || []
    const movie = model.movies.find((movie) => movie.id === id)
  
    if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
    }

    list.push(movie)
    localStorage.setItem('favouriteMovies', JSON.stringify(list))
  },

  getMoviesByPage(page) {       //根據頁碼，取得該頁需顯示的所有電影
    const data = model.filterMovieList.length ? model.filterMovieList : model.movies    //搜索關鍵字時，以符合的電影爲主；反之，以所有電影爲主。
    const startIndex = (page - 1) * MOVIES_PER_PAGE

    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  },

  renderPaginator(amount) {     //利用電影數，來取得頁碼和分頁的html
    //計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    //製作 template
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    //放回 HTML
    paginator.innerHTML = rawHTML
  }
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {     //搜索事件觸發
  event.preventDefault()
  controller.searchMovie()
})

paginator.addEventListener('click', function onPaginatorClicked(event) {      //分頁點擊事件觸發
  //如果被點擊的不是 a 標籤，結束

  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const pageNumber = Number(event.target.dataset.page)
  //更新畫面
  controller.renderByPageNumber(pageNumber)
})
 
dataPanel.addEventListener('click', function onPanelClicked(event) {      //modal和addFavourite點擊事件觸發
  const target = event.target
  controller.buttonClicked(target)
})

viewFormat.addEventListener('click', function (event) {      //改變畫面渲染方式點擊事件觸發
  const target = event.target
  controller.changeView(model.currentPage, target)
})

controller.initialRender()
