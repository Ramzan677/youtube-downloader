const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'YouTube URL is required' });

        // Extract video ID (supports all URL formats)
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)?.[1];
        if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

        // Try multiple APIs in sequence
        const apis = [
            {
                name: 'youtube-dl',
                url: `https://yt5s.io/api/ajaxSearch`,
                method: 'POST',
                data: new URLSearchParams({ q: `https://youtu.be/${videoId}` }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            },
            {
                name: 'savefrom',
                url: `https://backend.savethevideo.com/info?url=https://youtu.be/${videoId}`,
                method: 'GET'
            },
            {
                name: 'loader.to',
                url: `https://loader.to/ajax/download.php`,
                method: 'POST',
                data: new URLSearchParams({ 
                    url: `https://youtu.be/${videoId}`,
                    format: 'mp4' 
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        ];

        let lastError;
        for (const api of apis) {
            try {
                const response = api.method === 'POST' 
                    ? await axios.post(api.url, api.data, { headers: api.headers })
                    : await axios.get(api.url);

                // Process successful response
                if (response.data) {
                    let downloadUrl;
                    let title = "YouTube Video";
                    
                    // Parse different API responses
                    if (api.name === 'youtube-dl' && response.data.links) {
                        downloadUrl = response.data.links.mp4['720p'].url;
                        title = response.data.title || title;
                    } 
                    else if (api.name === 'savefrom' && response.data.links) {
                        downloadUrl = response.data.links.download;
                        title = response.data.meta.title || title;
                    }
                    else if (api.name === 'loader.to' && response.data.download_url) {
                        downloadUrl = response.data.download_url;
                    }

                    if (downloadUrl) {
                        return res.json({
                            status: 'success',
                            videoId,
                            title,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                            downloadUrl,
                            apiUsed: api.name
                        });
                    }
                }
            } catch (err) {
                lastError = err;
                console.log(`API ${api.name} failed, trying next...`);
            }
        }

        throw new Error(lastError?.message || 'All download APIs failed');

    } catch (error) {
        console.error("Final Error:", error.message);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message,
            solution: "Try again later or use a VPN",
            alternative: `https://en.savefrom.net/#url=https://youtube.com/watch?v=${videoId}`
        });
    }
};
