if (typeof video === 'undefined') {

    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const context = canvas.getContext('2d');
    const deselectButton = document.getElementById('deselectImage');
    const uploadButton = document.getElementById('uploadImage');
    const fileInput = document.getElementById('fileInput');
    const thumbnails = document.getElementById('thumbnails');
    let overlayStickers = [];

    // Capture stays disabled until a superposable image is selected
    uploadButton.disabled = true;

    // The editing page is reserved to connected users
    (async () => {
        const auth = await fetchWithAuth('/api/account/check/');
        if (!auth || auth.status !== 'connected') {
            await alertModal('You must be logged in to access the editing page.');
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

    // Send a base64 PNG to the server, which merges the selected stickers
    async function sendImage(imageData) {
        const selectedStickersIds = overlayStickers.map(img => img.id);

        const data = await fetchWithAuth('/api/image/upload/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData, stickersId: selectedStickersIds })
        });

        if (data && data.status === 'success') {
            // Jump to the gallery and highlight the freshly created post
            history.pushState(null, '', '/list?highlight=' + data.imageId);
            loadContent('list');
        } else {
            alertModal((data && data.message) ? data.message : 'Image upload error. Please try again.');
        }
    }

    // Capture the current frame and send it to the server for merging
    async function uploadImage() {
        if (overlayStickers.length === 0) {
            alertModal('Please select a sticker first.');
            return;
        }

        const width = canvas.width || video.videoWidth;
        const height = canvas.height || video.videoHeight;
        if (!width || !height) {
            alertModal('Webcam is not ready yet. Please allow camera access and try again.');
            return;
        }

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.getContext('2d').drawImage(video, 0, 0, width, height);

            await sendImage(tempCanvas.toDataURL('image/png'));
        } catch (error) {
            alertModal('Image upload error. Please try again.');
        }
    }

    // Upload an image file instead of the webcam (scaled down, converted to PNG)
    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = async () => {
                const maxWidth = 640;
                let width = img.naturalWidth;
                let height = img.naturalHeight;
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                tempCanvas.getContext('2d').drawImage(img, 0, 0, width, height);

                try {
                    await sendImage(tempCanvas.toDataURL('image/png'));
                } catch (error) {
                    alertModal('Image upload error. Please try again.');
                }
                fileInput.value = '';
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
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

    // Load the user's own images into the side panel
    async function loadThumbnails() {
        const data = await fetchWithAuth('/api/image/mine/');
        if (!data || data.status !== 'success') return;

        thumbnails.innerHTML = '';
        data.images.forEach(image => {
            const wrap = document.createElement('div');
            wrap.className = 'thumbnail';

            const img = document.createElement('img');
            img.src = image.imagePath;
            img.className = 'img-responsive';

            const remove = document.createElement('button');
            remove.className = 'btn btn-error btn-sm';
            remove.textContent = 'Delete';
            remove.addEventListener('click', () => deleteImage(image.id));

            wrap.appendChild(img);
            wrap.appendChild(remove);
            thumbnails.appendChild(wrap);
        });
    }

    // Delete one of the user's own images
    async function deleteImage(imageId) {
        if (!(await confirmAction('Delete this image?'))) return;

        const data = await fetchWithAuth('/api/image/delete/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            loadThumbnails();
        } else if (data && data.message) {
            alertModal(data.message);
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
    fileInput.addEventListener('change', uploadFile);

    stickerInjector();
    loadThumbnails();
}
