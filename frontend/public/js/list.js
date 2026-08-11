if (typeof list === 'undefined') {

    const list = document.getElementById('list-element');
    let isConnected = false;
    let currentUserId = 0;
    let currentPage = 1;
    let pendingHighlight = null;

    const THUMB_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
    const THUMB_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';

    const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
    const TRASH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

    // Close any open share menu when clicking outside (bound once for the whole app)
    if (!window.__shareOutsideBound) {
        window.__shareOutsideBound = true;
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.share-wrap.open').forEach(w => {
                if (!w.contains(e.target)) w.classList.remove('open');
            });
        });
    }

    (async () => {
        const auth = await fetchWithAuth('/api/account/check/');
        isConnected = !!(auth && auth.status === 'connected');
        currentUserId = (auth && auth.userId) ? Number(auth.userId) : 0;

        // Single shared-post page: /post/<id>
        const pathParts = window.location.pathname.split('/');
        if (pathParts[1] === 'post' && pathParts[2]) {
            fetchSinglePost(pathParts[2]);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));
        pendingHighlight = params.get('highlight');
        fetchImages(currentPage);
    })();

    async function fetchSinglePost(id) {
        try {
            const response = await fetch('/api/image/one/' + id);
            const data = await response.json();

            list.innerHTML = '';

            if (!data || data.status !== 'success' || !data.image) {
                const empty = document.createElement('div');
                empty.className = 'empty-gallery';
                const msg = document.createElement('p');
                msg.className = 'auth-subtitle';
                msg.textContent = t('feed.postNotFound');
                empty.appendChild(msg);
                list.appendChild(empty);
                return;
            }

            const image = data.image;
            list.appendChild(buildPost(image));
            fetchComments(image.id);
            fetchLikes(image.id);
        } catch (error) {
        }
    }

    async function fetchImages(page) {
        try {
            const response = await fetch('/api/image/getall/' + page);
            const data = await response.json();

            if (!data || data.status !== 'success') {
                return;
            }

            list.innerHTML = '';

            if (!data.images || data.images.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'empty-gallery';

                const emptyImg = document.createElement('img');
                emptyImg.src = '/img/no-message.png';
                emptyImg.alt = '';
                emptyImg.className = 'empty-gallery-img';

                const emptyTitle = document.createElement('h2');
                emptyTitle.className = 'auth-title';
                emptyTitle.textContent = t('feed.emptyTitle');

                const emptyText = document.createElement('p');
                emptyText.className = 'auth-subtitle';
                emptyText.textContent = t('feed.empty');

                empty.appendChild(emptyImg);
                empty.appendChild(emptyTitle);
                empty.appendChild(emptyText);
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
            remove.className = 'btn btn-sm post-delete';
            remove.setAttribute('aria-label', t('common.delete'));
            remove.innerHTML = TRASH_ICON;
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
        post.appendChild(buildActions(image));
        post.appendChild(buildComments(image.id));
        return post;
    }

    function buildActions(image) {
        const imageId = image.id;
        const actions = document.createElement('div');
        actions.className = 'post-actions';

        if (isConnected) {
            const like = document.createElement('button');
            like.className = 'btn btn-success btn-sm';
            like.innerHTML = THUMB_UP + '<span>' + t('feed.like') + '</span>';
            like.addEventListener('click', () => likeImage(imageId));
            const unlike = document.createElement('button');
            unlike.className = 'btn btn-sm';
            unlike.innerHTML = THUMB_DOWN + '<span>' + t('feed.unlike') + '</span>';
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
        label.textContent = t('feed.likes');
        countWrap.appendChild(count);
        countWrap.appendChild(label);
        actions.appendChild(countWrap);
        actions.appendChild(buildShare(image));

        return actions;
    }

    function buildShare(image) {
        const wrap = document.createElement('div');
        wrap.className = 'share-wrap';

        const url = window.location.origin + '/post/' + image.id;
        const enc = encodeURIComponent;

        const btn = document.createElement('button');
        btn.className = 'btn btn-sm share-btn';
        btn.setAttribute('aria-label', t('feed.share'));
        btn.innerHTML = SHARE_ICON + '<span>' + t('feed.share') + '</span>';

        const menu = document.createElement('div');
        menu.className = 'share-menu';

        [
            { label: 'X', href: 'https://twitter.com/intent/tweet?url=' + enc(url) },
            { label: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url) },
            { label: 'WhatsApp', href: 'https://api.whatsapp.com/send?text=' + enc(url) }
        ].forEach(n => {
            const a = document.createElement('a');
            a.href = n.href;
            a.target = '_blank';
            a.rel = 'noopener';
            a.className = 'share-link';
            a.textContent = n.label;
            menu.appendChild(a);
        });

        const copy = document.createElement('button');
        copy.className = 'share-link';
        copy.textContent = t('feed.copyLink');
        copy.addEventListener('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).catch(() => {});
            }
            copy.textContent = t('feed.copied');
            setTimeout(() => { copy.textContent = t('feed.copyLink'); }, 1500);
        });
        menu.appendChild(copy);

        btn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: 'Camagru', url: url }).catch(() => {});
            } else {
                wrap.classList.toggle('open');
            }
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        return wrap;
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
            input.maxLength = 500;
            input.placeholder = t('feed.addComment');
            const send = document.createElement('button');
            send.className = 'btn btn-primary btn-sm comment-send';
            send.setAttribute('aria-label', 'Post comment');
            send.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
            send.addEventListener('click', () => addComment(imageId, input));
            group.appendChild(input);
            group.appendChild(send);
            wrap.appendChild(group);
        }
        return wrap;
    }

    function appendComment(imageId, username, content, date) {
        const container = document.getElementById('comments-' + imageId);
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'comment';
        const u = document.createElement('span');
        u.className = 'comment-user';
        u.textContent = username;
        const c = document.createElement('span');
        c.className = 'comment-content';
        c.textContent = content;
        const d = document.createElement('span');
        d.className = 'comment-date';
        d.textContent = date;
        el.appendChild(u);
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
                data.comments.forEach(comment => appendComment(imageId, comment.username, comment.content, comment.createdAt));
            }
        } catch (error) {
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
                inputEl.value = '';
                fetchComments(imageId);
            } else {
                alertModal((data && data.message) ? translateServerMessage(data.message) : t('feed.commentFailed'));
            }
        } catch (error) {
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
            alertModal(translateServerMessage(data.message));
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
            alertModal(translateServerMessage(data.message));
        }
    }

    async function deleteImage(imageId) {
        if (!(await confirmAction(t('common.deleteImage')))) return;

        const data = await fetchWithAuth('/api/image/delete/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId })
        });
        if (data && data.status === 'success') {
            if (window.location.pathname.split('/')[1] === 'post') {
                // Deleted from the single-post page → back to the gallery
                history.pushState(null, '', '/list');
                loadContent('list');
            } else {
                fetchImages(currentPage);
            }
        } else if (data && data.message) {
            alertModal(translateServerMessage(data.message));
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
        prev.textContent = t('feed.prev');
        prev.disabled = page <= 1;
        prev.addEventListener('click', () => gotoPage(page - 1));

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = t('feed.page') + ' ' + page + ' / ' + totalPages;

        const next = document.createElement('button');
        next.className = 'btn btn-sm';
        next.textContent = t('feed.next');
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
