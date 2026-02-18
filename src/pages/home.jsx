import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

export function Home() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchVideos() {
            try {
                const apiKey = import.meta.env.VITE_MEDIA_API
                if (!apiKey) {
                    // Use placeholder data when no API key is configured
                    setVideos(getPlaceholderVideos())
                    return
                }

                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=12&key=${apiKey}`
                )
                const data = await res.json()

                if (!data.items) {
                    throw new Error(data.error?.message || 'Failed to fetch videos')
                }

                const formattedVideos = data.items.map((video) => ({
                    id: video.id,
                    title: video.snippet.title,
                    channel: video.snippet.channelTitle,
                    thumbnail: video.snippet.thumbnails.medium.url,
                    views: formatViews(video.statistics?.viewCount),
                    publishedAt: timeAgo(video.snippet.publishedAt),
                }))
                setVideos(formattedVideos)
            } catch (err) {
                console.error('Error fetching videos:', err)
                setError(err.message)
                setVideos(getPlaceholderVideos())
            } finally {
                setLoading(false)
            }
        }

        fetchVideos()
    }, [])

    return (
        <div className="home">

            {error && (
                <div className="error-banner">
                    <p>Could not load live data — showing demo content.</p>
                </div>
            )}

            {loading ? (
                <div className="loading-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-thumb" />
                            <div className="skeleton-info">
                                <div className="skeleton-title" />
                                <div className="skeleton-channel" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.id}`} key={video.id} className="video-card">
                            <div className="thumb-wrapper">
                                <img src={video.thumbnail} alt={video.title} className="thumbnail" />
                                <div className="thumb-overlay">
                                    <span className="play-icon">&#9654;</span>
                                </div>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-channel">{video.channel}</p>
                                <div className="video-meta">
                                    <span>{video.views} views</span>
                                    <span className="dot">•</span>
                                    <span>{video.publishedAt}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function formatViews(count) {
    if (!count) return '0'
    const num = parseInt(count, 10)
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toString()
}

function timeAgo(dateString) {
    if (!dateString) return ''
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ]
    for (const { label, seconds: s } of intervals) {
        const count = Math.floor(seconds / s)
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
    }
    return 'just now'
}

function getPlaceholderVideos() {
    const titles = [
        'Building a Full-Stack App in 2026',
        'Top 10 JavaScript Tricks You Need',
        'React 19 Deep Dive Tutorial',
        'CSS Grid Mastery in 15 Minutes',
        'Node.js Performance Optimization',
        'TypeScript Tips for Professionals',
        'Web Dev Roadmap 2026',
        'AI-Powered Code Generation',
        'System Design Interview Prep',
        'Docker & Kubernetes Crash Course',
        'Next.js vs Remix Showdown',
        'The Future of Web Development',
    ]
    const channels = [
        'TechStream', 'CodeMaster', 'DevInsights', 'WebWizard',
        'ByteSize', 'ProDev', 'StackUp', 'CodeCraft',
        'DevJourney', 'CloudNative', 'FrameworkFun', 'FutureDev',
    ]
    return titles.map((title, i) => ({
        id: `demo-${i}`,
        title,
        channel: channels[i],
        thumbnail: `https://picsum.photos/seed/vid${i}/320/180`,
        views: `${Math.floor(Math.random() * 900 + 100)}K`,
        publishedAt: `${Math.floor(Math.random() * 11 + 1)} days ago`,
    }))
}