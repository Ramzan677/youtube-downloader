const axios = require('axios');
const tunnel = require('tunnel');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // Extract video ID (improved regex)
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Use a working API (yt5s.io) with rotating user agents
        const agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
        ];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];

        // Configure proxy tunnel (bypasses blocking)
        const httpsAgent = tunnel.httpsOverHttp({
            proxy: { 
                host: 'your-proxy-server.com', // Replace with a paid proxy
                port: 8080
            }
        });

        const response = await axios.post(
            'https://yt5s.io/api/ajaxSearch',
            new URLSearchParams({ q: `https://youtu.be/${videoId}` }),
            {
                headers: {
                    'User-Agent': randomAgent,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                httpsAgent // Uses proxy tunnel
            }
        );

        if (!response.data.links) throw new Error('No download links found');

        res.json({
            status: 'success',
            videoId,
            title: response.data.title || "YouTube Video",
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            formats: response.data.links
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message,
            solution: "Try again later or use a VPN"
        });
    }
};
