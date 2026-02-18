import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Watch.css'

export function Watch() {
    const { id } = useParams()
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchVideo() {
            try {
                const apiKey = import.meta.env.VITE_MEDIA_API
                if (!apiKey || id.startsWith('demo-')) {
                    setVideo({
                        id,
                        title: 'Demo Video — Configure your API key to see real content',
                        channel: 'MediaStreamer',
                        description: 'Add VITE_MEDIA_API to your .env file with a valid YouTube Data API v3 key to load real videos.',
                        embedUrl: null,
                    })
                    return
                }

                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${apiKey}`
                )
                const data = await res.json()
                console.log(data)
                if (data.items && data.items.length > 0) {
                    const v = data.items[0]
                    setVideo({
                        id: v.id,
                        title: v.snippet.title,
                        channel: v.snippet.channelTitle,
                        description: v.snippet.description,
                        views: v.statistics?.viewCount,
                        likes: v.statistics?.likeCount,
                        publishedAt: new Date(v.snippet.publishedAt).toLocaleDateString(),
                        embedUrl: `https://www.youtube.com/embed/${v.id}`,
                    })
                }
            } catch (err) {
                console.error('Error loading video:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchVideo()
    }, [id])

    if (loading) {
        return (
            <div className="watch-loading">
                <div className="spinner" />
                <p>Loading video...</p>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="watch-error">
                <h2>Video not found</h2>
                <Link to="/" className="back-link">Back to Home</Link>
            </div>
        )
    }

    return (
        <div className="watch-page">
            <div className="player-section">
                {video.embedUrl ? (
                    <iframe
                        className="video-player"
                        src={video.embedUrl}
                        title={video.title}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="video-placeholder">
                        <span className="placeholder-icon">&#9654;</span>
                        <p>Video preview unavailable</p>
                    </div>
                )}
            </div>
            <div className="video-details">
                <h1 className="watch-title">{video.title}</h1>
                <div className="watch-meta">
                    <span className="watch-channel">{video.channel}</span>
                    {video.views && <span className="watch-views">{parseInt(video.views).toLocaleString()} views</span>}
                    {video.publishedAt && <span className="watch-date">{video.publishedAt}</span>}
                </div>
                {video.description && (
                    <div className="watch-description">
                        <p>{video.description}</p>
                    </div>
                )}
                <Link to="/" className="back-link">← Back to Home</Link>
            </div>
        </div>
    )
}