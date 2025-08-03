document.getElementById('download-btn').addEventListener('click', async () => {
    const url = document.getElementById('youtube-url').value.trim();
    const format = document.getElementById('format').value;
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        showError('Invalid YouTube URL');
        return;
    }

    showLoading();
    hideError();
    hideResults();

    try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        displayResults(data);
    } catch (error) {
        showError(error.message || 'Failed to download video');
    } finally {
        hideLoading();
    }
});

function isValidYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function hideResults() {
    document.getElementById('results').style.display = 'none';
}

function displayResults(data) {
    document.getElementById('title').textContent = data.title || 'Untitled';
    document.getElementById('author').textContent = data.author || 'Unknown author';
    document.getElementById('thumbnail').src = data.thumbnail || '';
    
    const optionsContainer = document.getElementById('download-options');
    optionsContainer.innerHTML = '';
    
    if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.className = 'download-btn';
        link.textContent = `Download ${data.format || ''}`;
        link.target = '_blank';
        optionsContainer.appendChild(link);
    }
    
    document.getElementById('results').style.display = 'block';
}
