const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // Extract video ID
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Use a working API (savevid.works)
        const apiUrl = `https://backend.savethevideo.com/info?url=https://youtu.be/${videoId}`;
        const response = await axios.get(apiUrl);

        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to fetch download links");
        }

        // Return download links
        res.json({
            status: 'success',
            videoId,
            title: response.data.meta.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            formats: response.data.links
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message 
        });
    }
};
