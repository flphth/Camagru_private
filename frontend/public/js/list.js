if (typeof list === 'undefined') {

    const list = document.getElementById('list-element');
    let isConnected = false;
    let currentPage = 1;

    (async () => {
        const auth = await fetchWithAuth('/api/account/check/');
        isConnected = !!(auth && auth.status === 'connected');

        const params = new URLSearchParams(window.location.search);
        currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));
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
            data.images.forEach(image => {
                list.appendChild(buildCard(image));
                fetchComments(image.id);
                fetchLikes(image.id);
            });
            renderPagination(data.page, data.totalPages);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    function buildCard(image) {
        const card = document.createElement('div');
        card.className = 'card';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-image';
        const img = document.createElement('img');
        img.src = image.imagePath;
        img.className = 'img-responsive';
        imgWrap.appendChild(img);

        const header = document.createElement('div');
        header.className = 'card-header';
        const title = document.createElement('div');
        title.className = 'card-title h6';
        title.textContent = image.username;
        const subtitle = document.createElement('div');
        subtitle.className = 'card-subtitle text-gray';
        subtitle.textContent = image.createdAt;
        header.appendChild(title);
        header.appendChild(subtitle);

        const body = document.createElement('div');
        body.className = 'card-body';
        body.appendChild(buildCommentsPanel(image.id));
        body.appendChild(buildLikesPanel(image.id));

        card.appendChild(imgWrap);
        card.appendChild(header);
        card.appendChild(body);
        return card;
    }

    function buildCommentsPanel(imageId) {
        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.innerHTML = '<div class="panel-header"><div class="panel-title h6">Comments</div></div>';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'panel-body';
        commentsBody.id = 'comments-' + imageId;
        panel.appendChild(commentsBody);

        if (isConnected) {
            const footer = document.createElement('div');
            footer.className = 'panel-footer';
            const group = document.createElement('div');
            group.className = 'input-group';
            const input = document.createElement('input');
            input.className = 'form-input';
            input.type = 'text';
            input.placeholder = 'Add a comment';
            const send = document.createElement('button');
            send.className = 'btn btn-primary input-group-btn';
            send.textContent = 'Send';
            send.addEventListener('click', () => addComment(imageId, input));
            group.appendChild(input);
            group.appendChild(send);
            footer.appendChild(group);
            panel.appendChild(footer);
        }
        return panel;
    }

    function buildLikesPanel(imageId) {
        const panel = document.createElement('div');
        panel.className = 'panel mt-2';
        panel.innerHTML = '<div class="panel-header"><div class="panel-title h6">Likes</div></div>';

        const likesBody = document.createElement('div');
        likesBody.className = 'panel-body';
        const count = document.createElement('span');
        count.className = 'like-count';
        count.id = 'like-count-' + imageId;
        count.textContent = '0';
        likesBody.appendChild(count);

        if (isConnected) {
            const like = document.createElement('button');
            like.className = 'btn btn-success btn-sm ml-2';
            like.textContent = 'Like';
            like.addEventListener('click', () => likeImage(imageId));
            const unlike = document.createElement('button');
            unlike.className = 'btn btn-error btn-sm ml-2';
            unlike.textContent = 'Unlike';
            unlike.addEventListener('click', () => unlikeImage(imageId));
            likesBody.appendChild(like);
            likesBody.appendChild(unlike);
        }
        panel.appendChild(likesBody);
        return panel;
    }

    function appendComment(imageId, content, date) {
        const container = document.getElementById('comments-' + imageId);
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'comment';
        const c = document.createElement('div');
        c.className = 'comment-content';
        c.textContent = content;
        const d = document.createElement('div');
        d.className = 'comment-date text-gray';
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
