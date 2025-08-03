const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Extract video ID
        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info
        const info = await getVideoInfo(videoId);
        
        res.json({
            status: 'success',
            videoId,
            title: info.title,
            thumbnail: info.thumbnail,
            downloadUrl: `https://yt1s.com/api/ajaxSearch?q=https://www.youtube.com/watch?v=${videoId}`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Failed to process video',
            details: error.message 
        });
    }
};

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function getVideoInfo(videoId) {
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
    const $ = cheerio.load(response.data);
    
    return {
        title: $('meta[name="title"]').attr('content'),
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
}
