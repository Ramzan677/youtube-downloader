const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    try {
        const { url, format = 'mp4' } = req.query;
        
        // 1. Validate input
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // 2. Extract video ID (improved regex)
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // 3. Get video info from YouTube
        const infoResponse = await axios.get(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        // 4. Get download links from yt1s API
        const downloadResponse = await axios.post(
            'https://yt1s.com/api/ajaxSearch/index',
            new URLSearchParams({
                q: `https://www.youtube.com/watch?v=${videoId}`,
                vt: format
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // 5. Construct response
        res.json({
            status: 'success',
            videoId,
            title: infoResponse.data.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            formats: downloadResponse.data.links,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
