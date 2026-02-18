import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Search.css'

export function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!query.trim()) {
            setVideos([])
            return
        }

        async function searchVideos() {
            setLoading(true)
            setError(null)
            try {
                const apiKey = import.meta.env.VITE_MEDIA_API
                if (!apiKey) {
                    // Use placeholder search results when no API key is configured
                    setVideos(getPlaceholderSearchResults(query))
                    return
                }

                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${apiKey}`
                )
                const data = await res.json()

                if (!data.items) {
                    throw new Error(data.error?.message || 'Failed to search videos')
                }

                const formattedVideos = data.items.map((item) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    publishedAt: timeAgo(item.snippet.publishedAt),
                    description: item.snippet.description,
                }))
                setVideos(formattedVideos)
            } catch (err) {
                console.error('Error searching videos:', err)
                setError(err.message)
                setVideos(getPlaceholderSearchResults(query))
            } finally {
                setLoading(false)
            }
        }

        searchVideos()
    }, [query])

    return (
        <div className="search-page">
            <div className="search-header">
                <h2 className="search-title">
                    {query ? `Search results for "${query}"` : 'Enter a search query'}
                </h2>
                {videos.length > 0 && !loading && (
                    <p className="search-count">{videos.length} results found</p>
                )}
            </div>

            {error && (
                <div className="error-banner">
                    <p>Could not load live data — showing demo content.</p>
                </div>
            )}

            {loading ? (
                <div className="search-results">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton-result">
                            <div className="skeleton-thumb" />
                            <div className="skeleton-details">
                                <div className="skeleton-title" />
                                <div className="skeleton-channel" />
                                <div className="skeleton-description" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : query && videos.length > 0 ? (
                <div className="search-results">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.id}`} key={video.id} className="search-result">
                            <div className="result-thumb-wrapper">
                                <img src={video.thumbnail} alt={video.title} className="result-thumbnail" />
                                <div className="result-overlay">
                                    <span className="play-icon">&#9654;</span>
                                </div>
                            </div>
                            <div className="result-details">
                                <h3 className="result-title">{video.title}</h3>
                                <p className="result-channel">{video.channel}</p>
                                <p className="result-meta">{video.publishedAt}</p>
                                <p className="result-description">{video.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : query ? (
                <div className="no-results">
                    <p>No results found for "{query}"</p>
                    <p className="no-results-sub">Try different keywords or check your spelling</p>
                </div>
            ) : null}
        </div>
    )
}

function timeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit)
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`
        }
    }
    return 'just now'
}

function getPlaceholderSearchResults(query) {
    const baseResults = [
        {
            id: 'demo-1',
            title: `Demo: ${query} Tutorial for Beginners`,
            channel: 'Tech Academy',
            thumbnail: 'https://via.placeholder.com/320x180/ff4d4d/ffffff?text=Demo+Video+1',
            publishedAt: '2 weeks ago',
            description: 'Learn the basics of ' + query + ' in this comprehensive tutorial for beginners. Perfect for getting started!',
        },
        {
            id: 'demo-2',
            title: `Advanced ${query} Techniques`,
            channel: 'Pro Developer',
            thumbnail: 'https://via.placeholder.com/320x180/4d94ff/ffffff?text=Demo+Video+2',
            publishedAt: '1 month ago',
            description: 'Take your ' + query + ' skills to the next level with these advanced techniques and best practices.',
        },
        {
            id: 'demo-3',
            title: `${query} in 10 Minutes`,
            channel: 'Quick Learn',
            thumbnail: 'https://via.placeholder.com/320x180/4dff88/ffffff?text=Demo+Video+3',
            publishedAt: '3 days ago',
            description: 'Quick and easy introduction to ' + query + '. Everything you need to know in just 10 minutes!',
        },
        {
            id: 'demo-4',
            title: `Complete ${query} Guide 2026`,
            channel: 'Code Masters',
            thumbnail: 'https://via.placeholder.com/320x180/ff8c42/ffffff?text=Demo+Video+4',
            publishedAt: '5 days ago',
            description: 'The ultimate guide to ' + query + ' updated for 2026. Includes all the latest features and updates.',
        },
    ]
    return baseResults
}