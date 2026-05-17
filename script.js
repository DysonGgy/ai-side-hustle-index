document.addEventListener('DOMContentLoaded', async () => {
    const [rankings, categories, creators, news] = await Promise.all([
        fetch('data/rankings.json').then(r => r.json()),
        fetch('data/categories.json').then(r => r.json()),
        fetch('data/creators.json').then(r => r.json()),
        fetch('data/news.json').then(r => r.json())
    ]);

    renderNewsTicker(news);
    renderRankings(rankings);
    renderCategories(categories, 'light');
    renderCreators(creators);
    setupTabs(categories);
    setupSearch();
    setLastUpdated();
});

function renderNewsTicker(news) {
    const ticker = document.getElementById('newsTicker');
    const items = [...news, ...news].map(n => `<span>${n}</span>`).join('');
    ticker.innerHTML = items;
}

function renderRankings(rankings) {
    const table = document.getElementById('rankingsTable');
    table.innerHTML = rankings.map(item => `
        <div class="rank-item" data-name="${item.name.toLowerCase()}">
            <div class="rank-number">${item.rank}</div>
            <div class="rank-info">
                <h3>${item.name}</h3>
                <p class="rank-meta">${item.crowd} &mdash; ${item.intro}</p>
            </div>
            <div class="rank-difficulty">${'&#9733;'.repeat(item.difficulty)}${'&#9734;'.repeat(5 - item.difficulty)}</div>
        </div>
    `).join('');
}

function renderCategories(categories, activeCategory) {
    const container = document.getElementById('categoryCards');
    const items = categories[activeCategory] || [];
    container.innerHTML = items.map(item => `
        <div class="hustle-card" data-name="${item.name.toLowerCase()}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="workflow"><strong>How it works:</strong> ${item.workflow}</div>
            <div class="risk"><strong>Risk Warning:</strong> ${item.risk}</div>
            <a href="${item.caseUrl}" target="_blank" rel="noopener noreferrer" class="case-link">
                &#9654; ${item.caseTitle} — ${item.caseAuthor}
            </a>
        </div>
    `).join('');
}

function renderCreators(creators) {
    const grid = document.getElementById('creatorGrid');
    grid.innerHTML = creators.map(c => `
        <div class="creator-card" data-name="${c.title.toLowerCase()} ${c.author.toLowerCase()}">
            <div class="creator-thumb">
                <img src="${c.thumbnail}" alt="${c.title}" loading="lazy" onerror="this.parentElement.textContent='Video Thumbnail'">
            </div>
            <div class="creator-info">
                <h3>${c.title}</h3>
                <p class="creator-meta">${c.author} &bull; ${c.platform}</p>
                <p class="creator-summary">${c.summary}</p>
                <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="view-btn">View Original Video</a>
            </div>
        </div>
    `).join('');
}

function setupTabs(categories) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCategories(categories, tab.dataset.category);
        });
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        document.querySelectorAll('[data-name]').forEach(el => {
            if (!query) {
                el.classList.remove('hidden');
            } else {
                el.classList.toggle('hidden', !el.dataset.name.includes(query));
            }
        });
    });
}

function setLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        el.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}