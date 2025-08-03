const { exec } = require('youtube-dl-exec');

module.exports = async (req, res) => {
    try {
        const { url, format } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const info = await exec(url, {
            dumpSingleJson: true,
            format: format || 'best',
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });

        res.json({
            title: info.title,
            author: info.uploader,
            thumbnail: info.thumbnail,
            downloadUrl: info.url,
            format: info.ext
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to process video' });
    }
};
