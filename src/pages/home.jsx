import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import "./Home.css"

export function Home() {

    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [searchParams, setSearchParams] = useSearchParams()

    // current page number from URL
    const currentPage = parseInt(searchParams.get("currentPage")) || 1

    // store tokens for each page
    const pageTokens = useRef({ 1: "" })



    useEffect(() => {

        loadPage(currentPage)

    }, [currentPage])



    async function loadPage(pageNumber) {

        try {

            setLoading(true)

            const apiKey = import.meta.env.VITE_MEDIA_API

            // console.log("Using API Key:", apiKey);
            if (!apiKey) {


                setVideos(getPlaceholderVideos())
                setLoading(false)
                return;

            }

            const token = pageTokens.current[pageNumber] || ""

            const res = await fetch(

                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=technology&pageToken=${token}&key=${apiKey}`

            )

            const data = await res.json()

            if (!data.items)
                throw new Error("API Error")


            // Save next page token
            if (data.nextPageToken)
                pageTokens.current[pageNumber + 1] = data.nextPageToken


            const formatted = data.items.map(video => ({

                id: video.id.videoId,

                title: video.snippet.title,

                channel: video.snippet.channelTitle,

                thumbnail: video.snippet.thumbnails.medium.url,

                publishedAt: timeAgo(video.snippet.publishedAt),

            }))

            setVideos(formatted)

        }
        catch (err) {

            setError(err.message)
            setVideos(getPlaceholderVideos())

        }
        finally {

            setLoading(false)

        }

    }



    function goToNextPage() {

        const nextPage = currentPage + 1

        setSearchParams({ currentPage: nextPage })

        window.scrollTo(0, 0)

    }



    function goToPrevPage() {

        if (currentPage === 1) return

        const prevPage = currentPage - 1

        setSearchParams({ currentPage: prevPage })

        window.scrollTo(0, 0)

    }



    return (

        <div className="home">

            {error &&
                <div className="error-banner">
                    Showing demo content
                </div>
            }


            {loading ?

                <div className="loading-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-thumb"></div>
                        </div>
                    ))}
                </div>

                :

                <>
                    <div className="video-grid">

                        {videos.map(video => (

                            <Link
                                key={video.id}
                                to={`/watch/${video.id}`}
                                className="video-card"
                            >

                                <div className="thumb-wrapper">

                                    <img
                                        src={video.thumbnail}
                                        className="thumbnail"
                                    />

                                </div>

                                <div className="video-info">

                                    <h3 className="video-title">
                                        {video.title}
                                    </h3>

                                    <p className="video-channel">
                                        {video.channel}
                                    </p>

                                    <p className="video-meta">
                                        {video.publishedAt}
                                    </p>

                                </div>

                            </Link>

                        ))}

                    </div>



                    {/* PAGINATION */}

                    <div className="pagination">

                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={goToPrevPage}
                        >
                            ← Previous
                        </button>


                        <span style={{ padding: "10px", color: "white" }}>
                            Page {currentPage}
                        </span>


                        <button
                            className="page-btn"
                            onClick={goToNextPage}
                        >
                            Next →
                        </button>

                    </div>

                </>
            }

        </div>

    )

}



/* TIME AGO FUNCTION */

function timeAgo(dateString) {

    const seconds =
        Math.floor((Date.now() - new Date(dateString)) / 1000)

    const intervals = [

        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },

    ]

    for (const interval of intervals) {

        const count =
            Math.floor(seconds / interval.seconds)

        if (count >= 1)
            return `${count} ${interval.label}s ago`

    }

    return "Just now"

}



/* DEMO */

function getPlaceholderVideos() {

    return Array.from({ length: 12 }).map((_, i) => ({

        id: "demo" + i,

        title: "Demo Video " + (i + 1),

        channel: "MediaStreamer",

        thumbnail:
            `https://picsum.photos/seed/${i}/320/180`,

        publishedAt: "2 days ago"

    }))

}