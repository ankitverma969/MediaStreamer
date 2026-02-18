import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './Search.css'

const STORAGE_KEY = "search_history"
const MAX_HISTORY = 10

export function Search() {

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    const query = searchParams.get('q') || ''

    const [videos, setVideos] = useState([])

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState(null)

    const [history, setHistory] = useState([])



    /* LOAD HISTORY */

    useEffect(() => {

        const saved =
            JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

        setHistory(saved)

    }, [])



    /* SAVE HISTORY */

    function saveSearchHistory(searchTerm) {

        if (!searchTerm.trim()) return

        let saved =
            JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

        // remove duplicate
        saved = saved.filter(item => item !== searchTerm)

        // add at start
        saved.unshift(searchTerm)

        // limit size
        saved = saved.slice(0, MAX_HISTORY)

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(saved)
        )

        setHistory(saved)

    }



    /* SEARCH API */

    useEffect(() => {

        if (!query.trim()) {

            setVideos([])
            return

        }

        saveSearchHistory(query)

        async function searchVideos() {

            setLoading(true)
            setError(null)

            try {

                const apiKey =
                    import.meta.env.VITE_MEDIA_API

                if (!apiKey) {

                    setVideos(
                        getPlaceholderSearchResults(query)
                    )

                    return
                }

                const res = await fetch(

                    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${apiKey}`

                )

                const data = await res.json()

                if (!data.items)
                    throw new Error("Search failed")

                const formatted =
                    data.items.map(item => ({

                        id: item.id.videoId,

                        title: item.snippet.title,

                        channel: item.snippet.channelTitle,

                        thumbnail:
                            item.snippet.thumbnails.medium.url,

                        publishedAt:
                            timeAgo(item.snippet.publishedAt),

                        description:
                            item.snippet.description,

                    }))

                setVideos(formatted)

            }
            catch (err) {

                setError(err.message)

                setVideos(
                    getPlaceholderSearchResults(query)
                )

            }
            finally {

                setLoading(false)

            }

        }

        searchVideos()

    }, [query])



    /* CLICK HISTORY */

    function selectHistory(term) {

        navigate(`/search?q=${term}`)

    }



    /* CLEAR HISTORY */

    function clearHistory() {

        localStorage.removeItem(STORAGE_KEY)

        setHistory([])

    }



    return (

        <div className="search-page">


            {/* HEADER */}

            <div className="search-header">

                <h2 className="search-title">

                    {query
                        ? `Search results for "${query}"`
                        : "Search videos"}

                </h2>

            </div>



            {/* SEARCH HISTORY */}

            {!query && history.length > 0 && (

                <div className="search-history">

                    <div className="history-header">

                        <span>Recent searches</span>

                        <button onClick={clearHistory}>
                            Clear
                        </button>

                    </div>


                    {history.map((item, index) => (

                        <div
                            key={index}
                            className="history-item"
                            onClick={() => selectHistory(item)}
                        >

                            🔍 {item}

                        </div>

                    ))}

                </div>

            )}



            {/* ERROR */}

            {error &&
                <div className="error-banner">
                    Showing demo content
                </div>
            }



            {/* LOADING */}

            {loading ?

                <div className="search-results">
                    Loading...
                </div>

                :

                query && videos.length > 0 ?

                <div className="search-results">

                    {videos.map(video => (

                        <Link
                            to={`/watch/${video.id}`}
                            key={video.id}
                            className="search-result"
                        >

                            <div className="result-thumb-wrapper">

                                <img
                                    src={video.thumbnail}
                                    className="result-thumbnail"
                                />

                            </div>

                            <div className="result-details">

                                <h3 className="result-title">
                                    {video.title}
                                </h3>

                                <p className="result-channel">
                                    {video.channel}
                                </p>

                                <p className="result-meta">
                                    {video.publishedAt}
                                </p>

                            </div>

                        </Link>

                    ))}

                </div>

                :

                query ?

                <div className="no-results">

                    No results found

                </div>

                :

                null

            }

        </div>

    )

}



/* TIME */

function timeAgo(dateString) {

    const seconds =
        Math.floor(
            (Date.now() - new Date(dateString)) / 1000
        )

    const intervals = {

        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,

    }

    for (const [unit, value] of Object.entries(intervals)) {

        const count =
            Math.floor(seconds / value)

        if (count >= 1)
            return `${count} ${unit}s ago`

    }

    return "just now"

}



/* DEMO */

function getPlaceholderSearchResults(query) {

    return [

        {
            id: "demo1",
            title: `${query} tutorial`,
            channel: "MediaStreamer",
            thumbnail:
                "https://picsum.photos/320/180",
            publishedAt: "2 days ago",
        }

    ]

}
