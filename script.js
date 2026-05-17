document.addEventListener('DOMContentLoaded', async () => {
    const [rankings, categories, creators, news] = await Promise.all([
        fetch('data/rankings.json').then(r => r.json()),
        fetch('data/categories.json').then(r => r.json()),
        fetch('data/creators.json').then(r => r.json()),
        fetch('data/news.json').then(r => r.json())
    ]);

    renderTicker(news);
    renderRankings(rankings);
    renderCategories(categories, 'light');
    renderCreators(creators);
    setupTabs(categories);
    setupSearch();
    setupScrollAnimations();
    setLastUpdated();
});

function renderTicker(news) {
    const el = document.getElementById('newsTicker');
    const doubled = [...news, ...news];
    el.innerHTML = doubled.map(n => `<span>${n}</span>`).join('');
}

function renderRankings(rankings) {
    const el = document.getElementById('rankingsTable');
    el.innerHTML = rankings.map(item => `
        <div class="rank-card fade-in" data-name="${item.name.toLowerCase()}">
            <div class="rank-num ${item.rank <= 3 ? 'top3' : 'normal'}">${item.rank}</div>
            <div class="rank-body">
                <div class="rank-name">${item.name}</div>
                <div class="rank-meta">${item.crowd}</div>
            </div>
            <div class="rank-stars">${'★'.repeat(item.difficulty)}${'☆'.repeat(5 - item.difficulty)}</div>
        </div>
    `).join('');
    setupScrollAnimations();
}

function renderCategories(categories, key) {
    const el = document.getElementById('categoryCards');
    const items = categories[key] || [];
    el.innerHTML = items.map(item => `
        <div class="hustle-card fade-in" data-name="${item.name.toLowerCase()}">
            <h3>${item.name}</h3>
            <p class="card-desc">${item.description}</p>
            <div class="card-workflow">${item.workflow}</div>
            <div class="card-risk">${item.risk}</div>
            <a href="${item.caseUrl}" target="_blank" rel="noopener noreferrer" class="card-link">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="4,2 12,7 4,12" fill="currentColor"/></svg>
                ${item.caseAuthor}
            </a>
        </div>
    `).join('');
    setupScrollAnimations();
}

function renderCreators(creators) {
    const el = document.getElementById('creatorGrid');
    el.innerHTML = creators.map(c => `
        <div class="creator-card fade-in" data-name="${c.title.toLowerCase()} ${c.author.toLowerCase()}">
            <div class="creator-thumb">
                <img src="${c.thumbnail}" alt="${c.title}" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src=this.src.replace('hqdefault','default')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
                <div class="thumb-placeholder" style="display:none">Video Thumbnail</div>
            </div>
            <div class="creator-body">
                <h3>${c.title}</h3>
                <p class="creator-meta">${c.author} · ${c.platform}</p>
                <p class="creator-summary">${c.summary}</p>
                <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="creator-btn">
                    Watch Original →
                </a>
            </div>
        </div>
    `).join('');
    setupScrollAnimations();
}

function setupTabs(categories) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCategories(categories, tab.dataset.category);
        });
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        document.querySelectorAll('[data-name]').forEach(el => {
            el.classList.toggle('hidden', q && !el.dataset.name.includes(q));
        });
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

function setLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        el.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}