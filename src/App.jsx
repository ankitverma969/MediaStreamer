import { useState, useEffect, useRef } from "react"
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom"

import { Home } from "./pages/home.jsx"
import { Watch } from "./pages/watch.jsx"
import { Search } from "./pages/search.jsx"
import { Sidebar } from "./components/Sidebar.jsx"

import "./App.css"

const STORAGE_KEY = "search_history"
const MAX_HISTORY = 10

function App() {

  const navigate = useNavigate()
  const location = useLocation()

  const wrapperRef = useRef(null)



  /* SEARCH STATE */

  const [searchQuery, setSearchQuery] = useState("")

  // FIXED: initialize directly from localStorage
  const [history, setHistory] = useState(() => {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(STORAGE_KEY)
        )

      return saved || []

    }
    catch {

      return []

    }

  })

  const [showSuggestions, setShowSuggestions] =
    useState(false)



  /* CLICK OUTSIDE TO CLOSE */

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {

        setShowSuggestions(false)

      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )

  }, [])



  /* SAVE HISTORY */

  function saveHistory(term) {

    if (!term.trim()) return

    let saved = [...history]

    // remove duplicate
    saved = saved.filter(item => item !== term)

    // add to front
    saved.unshift(term)

    // limit
    saved = saved.slice(0, MAX_HISTORY)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saved)
    )

    setHistory(saved)

  }



  /* SEARCH SUBMIT */

  function handleSearch(e) {

    e.preventDefault()

    const trimmed = searchQuery.trim()

    if (!trimmed) return

    saveHistory(trimmed)

    navigate(
      `/search?q=${encodeURIComponent(trimmed)}`
    )

    setSearchQuery("")

    setShowSuggestions(false)

  }



  /* CLICK SUGGESTION */

  function selectSuggestion(term) {

    saveHistory(term)

    navigate(
      `/search?q=${encodeURIComponent(term)}`
    )

    setSearchQuery("")

    setShowSuggestions(false)

  }



  const isWatchPage =
    location.pathname.startsWith("/watch")



  return (

    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <Link to="/" className="logo-link">

          <h1 className="logo-text">
            MediaStreamer
          </h1>

        </Link>



        {/* SEARCH */}

        <form
          className="search-bar"
          onSubmit={handleSearch}
        >

          <div
            className="search-wrapper"
            ref={wrapperRef}
          >

            <input

              type="text"

              className="search-input"

              placeholder="Search videos..."

              value={searchQuery}

              onChange={(e) =>
                setSearchQuery(e.target.value)
              }

              onFocus={() =>
                setShowSuggestions(true)
              }

            />



            {/* SUGGESTIONS */}

            {showSuggestions &&
              history.length > 0 && (

                <div className="suggestions-box">

                  {history.map((item, index) => (

                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() =>
                        selectSuggestion(item)
                      }
                    >

                      🔍 {item}

                    </div>

                  ))}

                </div>

              )}

          </div>



          <button
            type="submit"
            className="search-button"
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >

              <circle cx="11" cy="11" r="8" />

              <path d="m21 21-4.35-4.35" />

            </svg>

          </button>

        </form>



        <nav className="nav-links">

          <Link to="/" className="nav-link">
            Home
          </Link>

        </nav>

      </header>



      {/* SIDEBAR */}

      {!isWatchPage && <Sidebar />}



      {/* MAIN */}

      <main
        className={`main-content ${
          !isWatchPage
            ? "sidebar-space"
            : ""
        }`}
      >

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/watch/:id"
            element={<Watch />}
          />

          <Route
            path="/search"
            element={<Search />}
          />

        </Routes>

      </main>

    </div>

  )

}

export default App
