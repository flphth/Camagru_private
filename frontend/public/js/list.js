async function displayComment(imageId) {
    const contentElement = document.getElementById('imageId-' + imageId);
    const content = contentElement.value;

    try {
        const response = await fetchWithAuth('./api/comment/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageId, content })
        });

        const data = response;

        if (data.status === "success") {
            const commentsContainer = document.getElementById(`comments-${imageId}`);
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            const commentContent = document.createElement('div');
            commentContent.classList.add('comment-content');
            commentContent.textContent = content;

            const commentDate = document.createElement('div');
            commentDate.classList.add('comment-date', 'text-gray');
            commentDate.textContent = 'Just now';

            commentElement.appendChild(commentContent);
            commentElement.appendChild(commentDate);
            commentsContainer.appendChild(commentElement);
            contentElement.value = '';
        } else {
            alert('Failed to submit comment.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting your comment.');
    }
}

async function likeImage(imageId) {
    try {
        const response = await fetchWithAuth('./api/like/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageId })
        });

        const data = await response.json();

        if (data.status === "success") {
            updateLikeDisplay(imageId, 1);
        } else {
            alert('Failed to like image.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while liking the image.');
    }
}

async function unlikeImage(imageId) {
    try {
        const response = await fetchWithAuth('./api/like/remove/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageId })
        });

        const data = await response.json();

        if (data.status === "success") {
            updateLikeDisplay(imageId, -1);
        } else {
            alert('Failed to unlike image.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while unliking the image.');
    }
}

function updateLikeDisplay(imageId, increment) {
    const likeCountElement = document.getElementById(`like-count-${imageId}`);
    const currentCount = parseInt(likeCountElement.textContent, 10);
    likeCountElement.textContent = currentCount + increment;
}

if (typeof list === 'undefined') {
    const list = document.getElementById('list-element');

    async function fetchImages() {
        try {
            const response = await fetch('./api/image/getall/');
            const data = await response.json();

            if (!Array.isArray(data)) {
                console.error('Expected an array but got:', data);
                return;
            }

            data.forEach(image => {
                const itemElement = document.createElement('div');
                itemElement.innerHTML = `
                    <div class="card" image-id="${image.id}">
                        <div class="card-image">
                            <img src="${image.imagePath}" class="img-responsive">
                        </div>
                        <div class="card-header">
                            <div class="card-subtitle text-gray">${image.createdAt}</div>
                        </div>
                        <div class="card-body">
                            <div class="panel">
                                <div class="panel-header">
                                    <div class="panel-title h6">Comments</div>
                                </div>
                                <div class="panel-body" id="comments-${image.id}">
                                    <!-- Comments will be inserted here -->
                                </div>
                                <div class="panel-footer">
                                    <div class="input-group">
                                        <input id="imageId-${image.id}" class="form-input" type="text" placeholder="Do you like ?">
                                        <button class="btn btn-primary input-group-btn" onclick="displayComment(${image.id})">Send</button>
                                    </div>
                                </div>
                            </div>
                            <div class="panel mt-2">
                                <div class="panel-header">
                                    <div class="panel-title h6">Likes</div>
                                </div>
                                <div class="panel-body">
                                    <div id="like-count-${image.id}" class="like-count">0</div>
                                    <button class="btn btn-success btn-sm" onclick="likeImage(${image.id})">Like</button>
                                    <button class="btn btn-danger btn-sm" onclick="unlikeImage(${image.id})">Unlike</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                list.appendChild(itemElement);

                fetchComments(image.id);
                fetchLikes(image.id);
            });
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    async function fetchComments(imageId) {
        try {
            const response = await fetch(`./api/comment/get/${imageId}`);
            const data = await response.json();

            const commentsContainer = document.getElementById(`comments-${imageId}`);
            commentsContainer.innerHTML = '';

            if (data && Array.isArray(data.comments)) {
                data.comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment');

                    const commentContent = document.createElement('div');
                    commentContent.classList.add('comment-content');
                    commentContent.textContent = comment.content;

                    const commentDate = document.createElement('div');
                    commentDate.classList.add('comment-date', 'text-gray');
                    commentDate.textContent = comment.createdAt;

                    commentElement.appendChild(commentContent);
                    commentElement.appendChild(commentDate);
                    commentsContainer.appendChild(commentElement);
                });
            } else {
                console.error('Invalid response format for comments:', data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    async function fetchLikes(imageId) {
        try {
            const response = await fetch(`./api/like/get/${imageId}`);
            const data = await response.json();

            if (data.status === "success") {
                const likeCountElement = document.getElementById(`like-count-${imageId}`);
                likeCountElement.textContent = data.likeCount;
            } else {
                console.error('Error fetching likes:', data);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    }

    fetchImages();
}
