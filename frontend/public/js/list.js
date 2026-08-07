if (typeof list === 'undefined') {

    const list = document.getElementById('list-element');
    let isConnected = false;
    let currentUserId = 0;
    let currentPage = 1;
    let pendingHighlight = null;

    const THUMB_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
    const THUMB_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';

    (async () => {
        const auth = await fetchWithAuth('/api/account/check/');
        isConnected = !!(auth && auth.status === 'connected');
        currentUserId = (auth && auth.userId) ? Number(auth.userId) : 0;

        const params = new URLSearchParams(window.location.search);
        currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));
        pendingHighlight = params.get('highlight');
        fetchImages(currentPage);
    })();

    async function fetchImages(page) {
        try {
            const response = await fetch('/api/image/getall/' + page);
            const data = await response.json();

            if (!data || data.status !== 'success') {
                console.error('Error loading images:', data);
                return;
            }

            list.innerHTML = '';

            if (!data.images || data.images.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'empty-gallery';
                empty.textContent = 'The gallery is empty for now.';
                list.appendChild(empty);
                renderPagination(data.page, data.totalPages);
                return;
            }

            data.images.forEach(image => {
                list.appendChild(buildPost(image));
                fetchComments(image.id);
                fetchLikes(image.id);
            });
            renderPagination(data.page, data.totalPages);

            if (pendingHighlight) {
                highlightPost(pendingHighlight);
                pendingHighlight = null;
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    function buildPost(image) {
        const post = document.createElement('div');
        post.className = 'post';
        post.dataset.imageId = image.id;

        // Header: avatar monogram + username + date
        const head = document.createElement('div');
        head.className = 'post-head';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = (image.username || '?').charAt(0).toUpperCase();

        const meta = document.createElement('div');
        meta.className = 'post-meta';
        const name = document.createElement('span');
        name.className = 'post-user';
        name.textContent = image.username;
        const date = document.createElement('span');
        date.className = 'post-date';
        date.textContent = image.createdAt;
        meta.appendChild(name);
        meta.appendChild(date);

        head.appendChild(avatar);
        head.appendChild(meta);

        // Owners can delete their own images straight from the gallery
        if (isConnected && Number(image.userId) === currentUserId) {
            const remove = document.createElement('button');
            remove.className = 'btn btn-error btn-sm post-delete';
            remove.textContent = 'Delete';
            remove.addEventListener('click', () => deleteImage(image.id));
            head.appendChild(remove);
        }

        const imgWrap = document.createElement('div');
        imgWrap.className = 'post-image';
        const img = document.createElement('img');
        img.src = image.imagePath;
        imgWrap.appendChild(img);

        post.appendChild(head);
        post.appendChild(imgWrap);
        post.appendChild(buildActions(image.id));
        post.appendChild(buildComments(image.id));
        return post;
    }

    function buildActions(imageId) {
        const actions = document.createElement('div');
        actions.className = 'post-actions';

        if (isConnected) {
            const like = document.createElement('button');
            like.className = 'btn btn-success btn-sm';
            like.innerHTML = THUMB_UP + '<span>Like</span>';
            like.addEventListener('click', () => likeImage(imageId));
            const unlike = document.createElement('button');
            unlike.className = 'btn btn-sm';
            unlike.innerHTML = THUMB_DOWN + '<span>Unlike</span>';
            unlike.addEventListener('click', () => unlikeImage(imageId));
            actions.appendChild(like);
            actions.appendChild(unlike);
        }

        const countWrap = document.createElement('span');
        countWrap.className = 'like-count-wrap';
        const count = document.createElement('span');
        count.className = 'like-count';
        count.id = 'like-count-' + imageId;
        count.textContent = '0';
        const label = document.createElement('span');
        label.className = 'like-label';
        label.textContent = ' likes';
        countWrap.appendChild(count);
        countWrap.appendChild(label);
        actions.appendChild(countWrap);

        return actions;
    }

    function buildComments(imageId) {
        const wrap = document.createElement('div');
        wrap.className = 'post-comments';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'comments';
        commentsBody.id = 'comments-' + imageId;
        wrap.appendChild(commentsBody);

        if (isConnected) {
            const group = document.createElement('div');
            group.className = 'comment-form';
            const input = document.createElement('input');
            input.className = 'form-input';
            input.type = 'text';
            input.placeholder = 'Add a comment…';
            const send = document.createElement('button');
            send.className = 'btn btn-primary btn-sm';
            send.textContent = 'Post';
            send.addEventListener('click', () => addComment(imageId, input));
            group.appendChild(input);
            group.appendChild(send);
            wrap.appendChild(group);
        }
        return wrap;
    }

    function appendComment(imageId, content, date) {
        const container = document.getElementById('comments-' + imageId);
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'comment';
        const c = document.createElement('span');
        c.className = 'comment-content';
        c.textContent = content;
        const d = document.createElement('span');
        d.className = 'comment-date';
        d.textContent = date;
        el.appendChild(c);
        el.appendChild(d);
        container.appendChild(el);
    }

    async function fetchComments(imageId) {
        try {
            const response = await fetch('/api/comment/get/' + imageId);
            const data = await response.json();
            const container = document.getElementById('comments-' + imageId);
            if (!container) return;
            container.innerHTML = '';
            if (data && Array.isArray(data.comments)) {
                data.comments.forEach(comment => appendComment(imageId, comment.content, comment.createdAt));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    async function fetchLikes(imageId) {
        try {
            const response = await fetch('/api/like/get/' + imageId);
            const data = await response.json();
            if (data && data.status === 'success') {
                const el = document.getElementById('like-count-' + imageId);
                if (el) el.textContent = data.likeCount;
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    }

    async function addComment(imageId, inputEl) {
        const content = inputEl.value;
        if (content.trim() === '') return;
        try {
            const data = await fetchWithAuth('/api/comment/add/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, content })
            });
            if (data && data.status === 'success') {
                appendComment(imageId, content, 'Just now');
                inputEl.value = '';
            } else {
                alert((data && data.message) ? data.message : 'Failed to submit comment.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function likeImage(imageId) {
        const data = await fetchWithAuth('/api/like/add/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            fetchLikes(imageId);
        } else if (data && data.message) {
            alert(data.message);
        }
    }

    async function unlikeImage(imageId) {
        const data = await fetchWithAuth('/api/like/remove/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            fetchLikes(imageId);
        } else if (data && data.message) {
            alert(data.message);
        }
    }

    async function deleteImage(imageId) {
        if (!(await confirmAction('Delete this image?'))) return;

        const data = await fetchWithAuth('/api/image/delete/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            fetchImages(currentPage);
        } else if (data && data.message) {
            alert(data.message);
        }
    }

    function highlightPost(imageId) {
        const el = list.querySelector('.post[data-image-id="' + imageId + '"]');
        if (!el) return;
        el.classList.add('is-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('is-highlight'), 2500);
    }

    function renderPagination(page, totalPages) {
        let pager = document.getElementById('pagination');
        if (!pager) {
            pager = document.createElement('div');
            pager.id = 'pagination';
            pager.className = 'pagination-controls';
            list.parentNode.appendChild(pager);
        }
        pager.innerHTML = '';
        if (totalPages <= 1) return;

        const prev = document.createElement('button');
        prev.className = 'btn btn-sm';
        prev.textContent = 'Previous';
        prev.disabled = page <= 1;
        prev.addEventListener('click', () => gotoPage(page - 1));

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = 'Page ' + page + ' / ' + totalPages;

        const next = document.createElement('button');
        next.className = 'btn btn-sm';
        next.textContent = 'Next';
        next.disabled = page >= totalPages;
        next.addEventListener('click', () => gotoPage(page + 1));

        pager.appendChild(prev);
        pager.appendChild(info);
        pager.appendChild(next);
    }

    function gotoPage(page) {
        currentPage = page;
        history.pushState(null, '', '/list?page=' + page);
        fetchImages(page);
        window.scrollTo(0, 0);
    }
}
