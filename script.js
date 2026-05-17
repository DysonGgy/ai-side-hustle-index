document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [hustles, tools, creators, news, stories] = await Promise.all([
            fetch('data/hustles.json').then(r => { if (!r.ok) throw new Error('hustles.json ' + r.status); return r.json(); }),
            fetch('data/tools.json').then(r => { if (!r.ok) throw new Error('tools.json ' + r.status); return r.json(); }),
            fetch('data/creators.json').then(r => { if (!r.ok) throw new Error('creators.json ' + r.status); return r.json(); }),
            fetch('data/news.json').then(r => { if (!r.ok) throw new Error('news.json ' + r.status); return r.json(); }),
            fetch('data/success-stories.json').then(r => { if (!r.ok) throw new Error('success-stories.json ' + r.status); return r.json(); })
        ]);

        renderTicker(news);
        setupQuiz(hustles);
        renderCompareTable(hustles);
        renderHustles(hustles, 'time');
        renderTools(tools, 'writing');
        renderCreators(creators);
        renderSuccessStories(stories);
        setupSortButtons(hustles);
        setupToolTabs(tools);
        setupSearch();
        setupScrollAnimations();
        setLastUpdated();
    } catch (e) {
        console.error('Failed to load data:', e);
        document.body.innerHTML += '<div style="text-align:center;padding:40px;color:#ff3b30;">Data loading error: ' + e.message + '</div>';
    }
});

function renderTicker(news) {
    const el = document.getElementById('newsTicker');
    const doubled = [...news, ...news];
    el.innerHTML = doubled.map(n => `<span>${n}</span>`).join('');
}

// --- Quiz / Interactive Recommendation ---
function setupQuiz(hustles) {
    const quizEl = document.getElementById('quizContainer');
    if (!quizEl) return;
    quizEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.quiz-option');
        if (!btn) return;
        const group = btn.closest('.quiz-group');
        group.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateQuizResults(hustles);
    });
}

function updateQuizResults(hustles) {
    const skill = document.querySelector('[data-quiz="skill"] .quiz-option.selected');
    const time = document.querySelector('[data-quiz="time"] .quiz-option.selected');
    const goal = document.querySelector('[data-quiz="goal"] .quiz-option.selected');
    const resultEl = document.getElementById('quizResults');

    if (!skill || !time || !goal) {
        resultEl.innerHTML = '';
        return;
    }

    const skillVal = skill.dataset.value;
    const timeVal = time.dataset.value;
    const goalVal = goal.dataset.value;

    const scored = hustles.map(h => {
        let score = 0;
        if (skillVal === 'none' && h.tags.includes('no-code')) score += 3;
        if (skillVal === 'creative' && h.tags.includes('creative')) score += 3;
        if (skillVal === 'technical' && h.tags.includes('technical')) score += 3;
        if (skillVal === 'writing' && h.tags.includes('writing')) score += 3;
        if (timeVal === 'minimal' && h.difficulty <= 1) score += 2;
        if (timeVal === 'moderate' && h.difficulty <= 2) score += 2;
        if (timeVal === 'full' && h.difficulty >= 2) score += 1;
        if (goalVal === 'fast' && h.tags.includes('fast-start')) score += 3;
        if (goalVal === 'high' && h.tags.includes('high-income')) score += 3;
        if (goalVal === 'passive' && h.tags.includes('passive-income')) score += 3;
        return { ...h, score };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    resultEl.innerHTML = `
        <h4>Your Top Matches</h4>
        <div class="quiz-matches">
            ${scored.map((h, i) => `
                <a href="#hustles" class="quiz-match">
                    <span class="match-rank">#${i + 1}</span>
                    <span class="match-name">${h.name}</span>
                    <span class="match-meta">${h.incomeRange} · ${h.timeToFirstDollar}</span>
                </a>
            `).join('')}
        </div>
    `;
}

// --- Compare Table ---
function renderCompareTable(hustles) {
    const tbody = document.querySelector('#compareTable tbody');
    if (!tbody) return;
    const sorted = [...hustles].sort((a, b) => parseTime(a.timeToFirstDollar) - parseTime(b.timeToFirstDollar));
    const riskColors = { low: '#34c759', medium: '#ff9500', high: '#ff3b30' };
    const trendLabels = { hot: '&#128293; Hot', rising: '&#8593; Rising', stable: '— Stable' };
    tbody.innerHTML = sorted.map(h => `
        <tr>
            <td><strong>${h.name}</strong> <span class="table-trend">${trendLabels[h.trend] || ''}</span></td>
            <td>${h.startupCost}</td>
            <td>${h.timeToFirstDollar}</td>
            <td>${h.incomeRange}</td>
            <td><span class="risk-dot" style="background:${riskColors[h.riskLevel]}"></span> ${h.riskLevel}</td>
        </tr>
    `).join('');
}

// --- Parse helpers ---
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

// --- Hustle Cards (collapsible) ---
function renderHustles(hustles, sortBy) {
    const el = document.getElementById('hustlesGrid');
    const sorted = sortHustles(hustles, sortBy);
    const riskLabels = { low: 'Low Risk', medium: 'Med Risk', high: 'High Risk' };
    const riskClasses = { low: 'risk-low', medium: 'risk-med', high: 'risk-high' };
    const trendIcons = { hot: '&#128293;', rising: '&#8599;', stable: '' };

    el.innerHTML = sorted.map(h => `
        <div class="hustle-detail-card fade-in" data-name="${h.name.toLowerCase()}" data-tags="${h.tags.join(' ')}">
            <div class="hustle-summary" onclick="this.parentElement.classList.toggle('expanded')">
                <div class="hustle-header">
                    <h3>${h.name} ${trendIcons[h.trend] ? '<span class="trend-badge trend-' + h.trend + '">' + trendIcons[h.trend] + ' ' + h.trend + '</span>' : ''}</h3>
                    <p class="hustle-tagline">${h.tagline}</p>
                </div>
                <div class="hustle-metrics">
                    <div class="metric-badge metric-time"><span class="metric-icon">&#9200;</span><span>${h.timeToFirstDollar}</span></div>
                    <div class="metric-badge metric-cost"><span class="metric-icon">&#128176;</span><span>${h.startupCost}</span></div>
                    <div class="metric-badge metric-income"><span class="metric-icon">&#128200;</span><span>${h.incomeRange}</span></div>
                    <div class="metric-badge ${riskClasses[h.riskLevel]}"><span class="metric-icon">&#9888;</span><span>${riskLabels[h.riskLevel]}</span></div>
                </div>
                <div class="expand-hint">&#9662; Click for full details</div>
            </div>
            <div class="hustle-details">
                <div class="income-source">&#128202; Data: ${h.incomeSource}</div>
                <div class="hustle-day-one">
                    <h4>&#127937; Day 1: What to Do Right Now</h4>
                    <p>${h.dayOne}</p>
                </div>
                <div class="hustle-tools">
                    <h4>Tools You Need</h4>
                    <div class="tool-chips">${h.tools.map(t => `<a href="${t.url}" target="_blank" rel="noopener" class="tool-chip">${t.name} <span class="tool-price">${t.price}</span></a>`).join('')}</div>
                </div>
                <div class="hustle-steps">
                    <h4>Step-by-Step Timeline</h4>
                    <ol>${h.steps.map(s => `<li>${s}</li>`).join('')}</ol>
                </div>
                <div class="hustle-risk"><h4>&#9888; Risks</h4><p>${h.risk}</p></div>
                <div class="hustle-mitigation"><h4>&#128161; How to Mitigate</h4><p>${h.riskMitigation}</p></div>
                <div class="hustle-case">
                    <div class="case-result">&#128100; ${h.caseStudy.who} — ${h.caseStudy.result}</div>
                    <p class="case-detail">${h.caseStudy.detail}</p>
                    <a href="${h.caseStudy.source}" target="_blank" rel="noopener" class="case-source">&#128279; Verified Source &rarr;</a>
                </div>
                <div class="hustle-video">
                    <a href="${h.videoUrl}" target="_blank" rel="noopener" class="video-link"><span class="video-play">&#9654;</span> Watch: ${h.videoAuthor} (${h.videoViews} views)</a>
                </div>
            </div>
        </div>
    `).join('');
    setupScrollAnimations();
}

// --- Tools ---
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

// --- Creators ---
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

// --- Success Stories ---
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

// --- Setup ---
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
    if (!input) return;
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
