if (typeof video === 'undefined') {

    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const context = canvas.getContext('2d');
    const deselectButton = document.getElementById('deselectImage');
    const uploadButton = document.getElementById('uploadImage');
    let overlayStickers = [];

    // Capture stays disabled until a superposable image is selected
    uploadButton.disabled = true;

    // The editing page is reserved to connected users
    (async () => {
        const auth = await fetchWithAuth('/api/account/check/');
        if (!auth || auth.status !== 'connected') {
            alert('You must be logged in to access the editing page.');
            history.pushState(null, '', '/login');
            loadContent('login');
        }
    })();

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error('Webcam access error:', error);
        });

    // Deselect all overlaid stickers
    deselectButton.addEventListener('click', () => {
        overlayStickers = [];
        uploadButton.disabled = true;
    });

    // Overlay or remove a sticker on the preview
    function toggleImage(source, id) {
        const img = new Image();
        img.id = id;
        img.onload = () => {
            const index = overlayStickers.findIndex(image => image.src === img.src);
            if (index !== -1) {
                overlayStickers.splice(index, 1);
            } else {
                overlayStickers.push(img);
            }
            uploadButton.disabled = overlayStickers.length === 0;
        };
        img.src = source;
    }

    // Capture the current frame and send it to the server for merging
    async function uploadImage() {
        if (overlayStickers.length === 0) {
            alert('Please select a sticker first.');
            return;
        }

        const width = canvas.width || video.videoWidth;
        const height = canvas.height || video.videoHeight;
        if (!width || !height) {
            alert('Webcam is not ready yet. Please allow camera access and try again.');
            return;
        }

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.getContext('2d').drawImage(video, 0, 0, width, height);

            const imageData = tempCanvas.toDataURL('image/png');
            const selectedStickersIds = overlayStickers.map(img => img.id);

            const data = await fetchWithAuth('/api/image/upload/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData, stickersId: selectedStickersIds })
            });

            if (data && data.status === 'success') {
                alert('Image uploaded successfully!');
            } else {
                alert((data && data.message) ? data.message : 'Image upload error. Please try again.');
            }
        } catch (error) {
            alert('Image upload error. Please try again.');
        }
    }

    // Load the superposable stickers
    async function stickerInjector() {
        const divSticker = document.getElementById('sticker');

        try {
            const response = await fetch('/api/sticker/all/');
            const data = await response.json();

            if (data.status === 'success') {
                data.data.forEach(sticker => {
                    const img = document.createElement('img');
                    img.src = sticker.imagePath;
                    img.classList.add('sticker-image');
                    img.addEventListener('click', () => {
                        toggleImage(sticker.imagePath, sticker.id);
                    });
                    divSticker.appendChild(img);
                });
            }
        } catch (error) {
            console.error('Error loading stickers:', error);
        }
    }

    // Draw the webcam stream and overlaid stickers on the canvas
    video.addEventListener('play', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const draw = () => {
            if (video.paused || video.ended) return;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            overlayStickers.forEach(img => {
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
            });
            requestAnimationFrame(draw);
        };
        draw();
    });

    uploadButton.addEventListener('click', uploadImage);

    stickerInjector();
}
