async function fetchDownloadLinks(videoId, format) {
    try {
        const response = await fetch(`/api/download?url=https://youtu.be/${videoId}&format=${format}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!data.formats) throw new Error('No download formats available');
        
        return data;
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
}

function displayDownloadOptions(formats) {
    const container = document.getElementById('download-options');
    container.innerHTML = '';
    
    Object.entries(formats).forEach(([quality, info]) => {
        const btn = document.createElement('a');
        btn.href = info.url;
        btn.className = 'download-btn';
        btn.textContent = `${quality} (${info.size})`;
        btn.target = '_blank';
        btn.download = true;
        container.appendChild(btn);
    });
}
