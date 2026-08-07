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
            // Gently send visitors back to the public gallery
            history.pushState(null, '', '/list');
            loadContent('list');
            return;
        }
        startWebcam();
        stickerInjector();
        loadThumbnails();
    })();

    // Request access to the webcam (only for connected users)
    function startWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                window.currentStream = stream;
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error('Webcam access error:', error);
            });
    }

    // Deselect all overlaid stickers
    deselectButton.addEventListener('click', () => {
        overlayStickers = [];
        uploadButton.disabled = true;
        document.querySelectorAll('.sticker-item.selected').forEach(el => el.classList.remove('selected'));
    });

    // Overlay or remove a sticker on the preview; `el` is the sticker thumbnail in the picker
    function toggleImage(source, id, el) {
        const overlay = new Image();
        overlay.id = id;
        overlay.onload = () => {
            const index = overlayStickers.findIndex(image => image.src === overlay.src);
            if (index !== -1) {
                overlayStickers.splice(index, 1);
                if (el) el.classList.remove('selected');
            } else {
                overlayStickers.push(overlay);
                if (el) el.classList.add('selected');
            }
            uploadButton.disabled = overlayStickers.length === 0;
        };
        overlay.src = source;
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
            alertModal((data && data.message) ? translateServerMessage(data.message) : t('edit.uploadError'));
        }
    }

    // Capture the current frame and send it to the server for merging
    async function uploadImage() {
        if (overlayStickers.length === 0) {
            alertModal(t('edit.selectSticker'));
            return;
        }

        const width = canvas.width || video.videoWidth;
        const height = canvas.height || video.videoHeight;
        if (!width || !height) {
            alertModal(t('edit.webcamNotReady'));
            return;
        }

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.getContext('2d').drawImage(video, 0, 0, width, height);

            await sendImage(tempCanvas.toDataURL('image/png'));
        } catch (error) {
            alertModal(t('edit.uploadError'));
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
                    alertModal(t('edit.uploadError'));
                }
                fileInput.value = '';
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    // Load the superposable stickers into the picker
    async function stickerInjector() {
        const divSticker = document.getElementById('sticker');

        try {
            const response = await fetch('/api/sticker/all/');
            const data = await response.json();

            if (data.status === 'success') {
                data.data.forEach(sticker => {
                    const item = document.createElement('div');
                    item.className = 'sticker-item';

                    const img = document.createElement('img');
                    img.src = sticker.imagePath;
                    img.className = 'sticker-image';

                    const check = document.createElement('span');
                    check.className = 'sticker-check';
                    check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

                    item.appendChild(img);
                    item.appendChild(check);
                    item.addEventListener('click', () => toggleImage(sticker.imagePath, sticker.id, item));
                    divSticker.appendChild(item);
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
            remove.className = 'thumbnail-delete';
            remove.setAttribute('aria-label', t('common.delete'));
            remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            remove.addEventListener('click', () => deleteImage(image.id));

            wrap.appendChild(img);
            wrap.appendChild(remove);
            thumbnails.appendChild(wrap);
        });
    }

    // Delete one of the user's own images
    async function deleteImage(imageId) {
        if (!(await confirmAction(t('common.deleteImage')))) return;

        const data = await fetchWithAuth('/api/image/delete/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            loadThumbnails();
        } else if (data && data.message) {
            alertModal(translateServerMessage(data.message));
        }
    }

    // Draw the webcam stream and overlaid stickers on the canvas (live preview)
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
}
