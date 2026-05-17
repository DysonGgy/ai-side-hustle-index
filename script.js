document.addEventListener('DOMContentLoaded', async () => {
    const [hustles, tools, creators, news, stories] = await Promise.all([
        fetch('data/hustles.json').then(r => r.json()),
        fetch('data/tools.json').then(r => r.json()),
        fetch('data/creators.json').then(r => r.json()),
        fetch('data/news.json').then(r => r.json()),
        fetch('data/success-stories.json').then(r => r.json())
    ]);

    renderTicker(news);
    renderHustles(hustles, 'time');
    renderTools(tools, 'writing');
    renderCreators(creators);
    renderSuccessStories(stories);
    setupSortButtons(hustles);
    setupToolTabs(tools);
    setupSearch();
    setupScrollAnimations();
    setLastUpdated();
});

function renderTicker(news) {
    const el = document.getElementById('newsTicker');
    const doubled = [...news, ...news];
    el.innerHTML = doubled.map(n => `<span>${n}</span>`).join('');
}

function parseCost(cost) {
    const match = cost.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function parseIncome(income) {
    const match = income.match(/\$([\d,]+)/g);
    if (match && match.length >= 2) return parseInt(match[1].replace(/[$,]/g, ''));
    if (match) return parseInt(match[0].replace(/[$,]/g, ''));
    return 0;
}

function parseTime(time) {
    const match = time.match(/(\d+)/);
    if (!match) return 99;
    const num = parseInt(match[1]);
    if (time.includes('month')) return num * 30;
    if (time.includes('week')) return num * 7;
    return num;
}

function sortHustles(hustles, sortBy) {
    const sorted = [...hustles];
    switch (sortBy) {
        case 'time': sorted.sort((a, b) => parseTime(a.timeToFirstDollar) - parseTime(b.timeToFirstDollar)); break;
        case 'income': sorted.sort((a, b) => parseIncome(b.incomeRange) - parseIncome(a.incomeRange)); break;
        case 'cost': sorted.sort((a, b) => parseCost(a.startupCost) - parseCost(b.startupCost)); break;
        case 'difficulty': sorted.sort((a, b) => a.difficulty - b.difficulty); break;
    }
    return sorted;
}

function renderHustles(hustles, sortBy) {
    const el = document.getElementById('hustlesGrid');
    const sorted = sortHustles(hustles, sortBy);
    el.innerHTML = sorted.map(h => `
        <div class="hustle-detail-card fade-in" data-name="${h.name.toLowerCase()}">
            <div class="hustle-header">
                <h3>${h.name}</h3>
                <p class="hustle-tagline">${h.tagline}</p>
            </div>
            <div class="hustle-metrics">
                <div class="metric-badge metric-time">
                    <span class="metric-icon">&#9200;</span>
                    <span>${h.timeToFirstDollar}</span>
                </div>
                <div class="metric-badge metric-cost">
                    <span class="metric-icon">&#128176;</span>
                    <span>${h.startupCost}</span>
                </div>
                <div class="metric-badge metric-income">
                    <span class="metric-icon">&#128200;</span>
                    <span>${h.incomeRange}</span>
                </div>
                <div class="metric-badge metric-diff">
                    <span class="metric-icon">&#9733;</span>
                    <span>${'&#9733;'.repeat(h.difficulty)}${'&#9734;'.repeat(5 - h.difficulty)}</span>
                </div>
            </div>
            <div class="hustle-tools">
                <h4>Tools You Need</h4>
                <div class="tool-chips">
                    ${h.tools.map(t => `<a href="${t.url}" target="_blank" rel="noopener" class="tool-chip">${t.name} <span class="tool-price">${t.price}</span></a>`).join('')}
                </div>
            </div>
            <div class="hustle-steps">
                <h4>How to Start</h4>
                <ol>${h.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
            <div class="hustle-risk">${h.risk}</div>
            <div class="hustle-case">
                <div class="case-result">${h.caseStudy.who} — ${h.caseStudy.result}</div>
                <p class="case-detail">${h.caseStudy.detail}</p>
                <a href="${h.caseStudy.source}" target="_blank" rel="noopener" class="case-source">Source &rarr;</a>
            </div>
            <div class="hustle-video">
                <a href="${h.videoUrl}" target="_blank" rel="noopener" class="video-link">
                    <span class="video-play">&#9654;</span> Watch: ${h.videoAuthor} (${h.videoViews} views)
                </a>
            </div>
        </div>
    `).join('');
    setupScrollAnimations();
}

function renderTools(tools, category) {
    const el = document.getElementById('toolsGrid');
    const items = tools[category] || [];
    el.innerHTML = items.map(t => `
        <a href="${t.url}" target="_blank" rel="noopener" class="tool-card fade-in">
            <div class="tool-card-name">${t.name}</div>
            <div class="tool-card-price">${t.price}</div>
            <div class="tool-card-use">${t.useCase}</div>
        </a>
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
                <p class="creator-meta">${c.author} · ${c.views} views</p>
                <p class="creator-summary">${c.summary}</p>
                <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="creator-btn">Watch &rarr;</a>
            </div>
        </div>
    `).join('');
    setupScrollAnimations();
}

function renderSuccessStories(stories) {
    const el = document.getElementById('successGrid');
    el.innerHTML = stories.map(s => `
        <div class="success-card fade-in">
            <div class="company-name">${s.company}</div>
            <div class="founders">${s.founders}</div>
            <p class="story">${s.story}</p>
            <div class="metrics">
                <div class="metric"><div class="metric-label">Revenue</div><div class="metric-value">${s.revenue}</div></div>
                <div class="metric"><div class="metric-label">Team Size</div><div class="metric-value">${s.team}</div></div>
            </div>
            <div class="highlight">${s.highlight}</div>
            <a href="${s.source}" target="_blank" rel="noopener noreferrer" class="source-link">Read full story &rarr;</a>
        </div>
    `).join('');
    setupScrollAnimations();
}

function setupSortButtons(hustles) {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHustles(hustles, btn.dataset.sort);
        });
    });
}

function setupToolTabs(tools) {
    document.querySelectorAll('[data-tool-cat]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-tool-cat]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTools(tools, tab.dataset.toolCat);
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
    if (el) el.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}