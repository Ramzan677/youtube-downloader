const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'YouTube URL is required' });

        // Extract video ID (supports all YouTube URL formats)
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Step 1: Get video metadata
        const metaResponse = await axios.get(
            `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            }
        );

        // Step 2: Use a working download API (no proxy needed)
        const downloadResponse = await axios.post(
            'https://co.wuk.sh/api/json',
            {
                url: `https://youtu.be/${videoId}`,
                vQuality: '720p',
                isAudioOnly: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        // Return results
        res.json({
            status: 'success',
            videoId,
            title: metaResponse.data.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            downloadUrl: downloadResponse.data.url,
            availableFormats: downloadResponse.data.formats
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.response?.data?.message || error.message,
            solution: "Refresh the page or try a different video"
        });
    }
};
