const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Use a proxy server
        const proxyUrl = `https://cors-anywhere.herokuapp.com/https://yt1s.com/api/ajaxSearch/index`;
        const response = await axios.post(
            proxyUrl,
            new URLSearchParams({ q: `https://youtu.be/${videoId}` }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        res.json({
            status: 'success',
            videoId,
            title: "Video Title", // (You can fetch this separately)
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            formats: response.data.links
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message 
        });
    }
};
