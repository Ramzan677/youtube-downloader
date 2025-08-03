const axios = require('axios');

module.exports = async (req, res) => {
    try {
        const { url } = req.query;
        const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)[1];
        
        // Use a public API
        const apiResponse = await axios.get(
            `https://api.ytbmp4.com/api/formats?videoId=${videoId}`
        );

        res.json({
            status: 'success',
            videoId,
            title: apiResponse.data.videoTitle,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            formats: apiResponse.data.formats
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to process video',
            details: error.message
        });
    }
};
