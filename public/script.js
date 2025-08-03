document.getElementById('download-btn').addEventListener('click', async () => {
    // ... existing code ...

    try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // New handling for the download URL
        if (data.downloadUrl) {
            // First call to get download links
            const dlResponse = await fetch(data.downloadUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const dlData = await dlResponse.json();
            
            if (dlData.links && dlData.links.mp4) {
                data.downloadLinks = dlData.links.mp4;
            }
        }

        displayResults(data);
    } catch (error) {
        showError(error.message || 'Failed to download video');
        console.error(error);
    }
    // ... rest of the code ...
});

function displayResults(data) {
    document.getElementById('title').textContent = data.title || 'Untitled';
    document.getElementById('thumbnail').src = data.thumbnail || '';
    
    const optionsContainer = document.getElementById('download-options');
    optionsContainer.innerHTML = '';
    
    if (data.downloadLinks) {
        Object.entries(data.downloadLinks).forEach(([quality, link]) => {
            const btn = document.createElement('a');
            btn.href = link;
            btn.className = 'download-btn';
            btn.textContent = `Download ${quality}p`;
            btn.target = '_blank';
            optionsContainer.appendChild(btn);
        });
    } else if (data.downloadUrl) {
        const btn = document.createElement('a');
        btn.href = data.downloadUrl;
        btn.className = 'download-btn';
        btn.textContent = 'Get Download Options';
        btn.target = '_blank';
        optionsContainer.appendChild(btn);
    }
}
