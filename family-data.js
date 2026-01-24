// Family Data Analytics and Visualization
// This script analyzes the family tree data and generates comprehensive statistics and charts

// Try to get data from script.js, otherwise fetch it
async function loadFamilyData() {
    if (typeof window.familyData !== 'undefined') {
        return window.familyData;
    }

    // If not available, we'll need to extract it from script.js
    try {
        const response = await fetch('script.js');
        const scriptContent = await response.text();

        // Extract familyData array from script content
        const match = scriptContent.match(/const familyData = \[([\s\S]*?)\];/);
        if (match) {
            // Use a local variable to avoid conflict
            const extractedData = eval('[' + match[1] + ']');
            return extractedData;
        }
    } catch (error) {
        console.error('Error loading family data:', error);
    }

    return [];
}

// Calculate Statistics
class FamilyAnalytics {
    constructor(data) {
        this.data = data;
        this.stats = {};
    }

    // Calculate total members
    getTotalMembers() {
        return this.data.length;
    }

    // Calculate total generations
    getTotalGenerations() {
        return Math.max(...this.data.map(p => p.generation));
    }

    // Find largest generation
    getLargestGeneration() {
        const genCounts = {};
        this.data.forEach(p => {
            genCounts[p.generation] = (genCounts[p.generation] || 0) + 1;
        });

        let maxGen = 1;
        let maxCount = 0;
        for (const [gen, count] of Object.entries(genCounts)) {
            if (count > maxCount) {
                maxCount = count;
                maxGen = gen;
            }
        }

        return { generation: maxGen, count: maxCount };
    }

    // Calculate average children per family
    getAverageChildren() {
        const parentsWithChildren = new Map();

        this.data.forEach(person => {
            if (person.parents && person.parents.length > 0) {
                // Create a unique key for the parent
                const parentKey = `${person.generation - 1}-${person.parents.join('-')}`;
                if (!parentsWithChildren.has(parentKey)) {
                    parentsWithChildren.set(parentKey, 0);
                }
                parentsWithChildren.set(parentKey, parentsWithChildren.get(parentKey) + 1);
            }
        });

        if (parentsWithChildren.size === 0) return 0;

        const totalChildren = Array.from(parentsWithChildren.values()).reduce((a, b) => a + b, 0);
        return (totalChildren / parentsWithChildren.size).toFixed(2);
    }

    // Get deepest lineage (same as total generations)
    getDeepestLineage() {
        return this.getTotalGenerations();
    }

    // Calculate total branches (families in generation 1-2)
    getTotalBranches() {
        return this.data.filter(p => p.generation <= 2).length;
    }

    // Get members per generation
    getMembersPerGeneration() {
        const genCounts = {};
        for (let i = 1; i <= this.getTotalGenerations(); i++) {
            genCounts[i] = 0;
        }

        this.data.forEach(p => {
            genCounts[p.generation] = (genCounts[p.generation] || 0) + 1;
        });

        return genCounts;
    }

    // Get top 10 largest families
    getTopLargestFamilies() {
        const familyMap = new Map();

        this.data.forEach(person => {
            if (person.parents && person.parents.length > 0 && person.generation > 1) {
                // Find parent in data
                const parentGen = person.generation - 1;
                const parentData = this.data.filter(p =>
                    p.generation === parentGen &&
                    JSON.stringify(p.parents) === JSON.stringify(person.parents.slice(0, -1))
                );

                if (parentData.length > 0) {
                    const parent = parentData[0];
                    const parentKey = `${parent.name} (Gen ${parent.generation})`;

                    if (!familyMap.has(parentKey)) {
                        familyMap.set(parentKey, 0);
                    }
                    familyMap.set(parentKey, familyMap.get(parentKey) + 1);
                }
            }
        });

        return Array.from(familyMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    // Get family size distribution
    getFamilySizeDistribution() {
        const familySizes = new Map();
        const parentsWithChildren = new Map();

        this.data.forEach(person => {
            if (person.parents && person.parents.length > 0) {
                // Remove the last element (birth order) to identify the parent couple
                const parentLineage = person.parents.slice(0, -1);
                const parentKey = `${person.generation - 1}-${parentLineage.join('-')}`;
                if (!parentsWithChildren.has(parentKey)) {
                    parentsWithChildren.set(parentKey, 0);
                }
                parentsWithChildren.set(parentKey, parentsWithChildren.get(parentKey) + 1);
            }
        });

        parentsWithChildren.forEach(count => {
            familySizes.set(count, (familySizes.get(count) || 0) + 1);
        });

        return familySizes;
    }

    // Get branch comparison (count unique family lineages per generation 10-23)
    getBranchComparison() {
        const lineagesPerGeneration = {};

        // Count unique lineages for generations 10-23
        for (let gen = 10; gen <= 23; gen++) {
            const peopleInGen = this.data.filter(p => p.generation === gen);

            if (peopleInGen.length > 0) {
                // Count unique parent paths (lineages)
                const uniqueLineages = new Set();
                peopleInGen.forEach(person => {
                    // Convert parent array to string for uniqueness check
                    const lineageKey = JSON.stringify(person.parents);
                    uniqueLineages.add(lineageKey);
                });

                lineagesPerGeneration[gen] = uniqueLineages.size;
            }
        }

        return lineagesPerGeneration;
    }

    // Count descendants for a person
    countDescendants(person) {
        let count = 0;
        const targetParents = person.parents;
        const targetGen = person.generation;

        this.data.forEach(p => {
            if (p.generation > targetGen) {
                const parentMatch = targetParents.every((val, idx) => p.parents[idx] === val);
                if (parentMatch) {
                    count++;
                }
            }
        });

        return count;
    }

    // Get most common names
    getMostCommonNames() {
        const nameCount = {};

        this.data.forEach(p => {
            const name = p.name.trim();
            nameCount[name] = (nameCount[name] || 0) + 1;
        });

        return Object.entries(nameCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
    }

    // Get unique vs repeated names
    getNameUniqueness() {
        const nameCount = {};

        this.data.forEach(p => {
            const name = p.name.trim();
            nameCount[name] = (nameCount[name] || 0) + 1;
        });

        const unique = Object.values(nameCount).filter(count => count === 1).length;
        const repeated = Object.keys(nameCount).length - unique;

        return { unique, repeated, total: Object.keys(nameCount).length };
    }

    // Get top ancestors by descendants
    getTopAncestorsByDescendants() {
        const ancestorMap = new Map();

        // Focus on generations 15-20 for meaningful ancestor analysis
        this.data.filter(p => p.generation >= 15 && p.generation <= 20).forEach(person => {
            const descendants = this.countDescendants(person);
            if (descendants > 0) {
                ancestorMap.set(`${person.name} (Gen ${person.generation})`, descendants);
            }
        });

        return Array.from(ancestorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    // NEW: Get family trivia
    getLongestName() {
        let longest = this.data[0];
        this.data.forEach(p => {
            if (p.name.length > longest.name.length) {
                longest = p;
            }
        });
        return { name: longest.name, length: longest.name.length, generation: longest.generation };
    }

    getShortestName() {
        let shortest = this.data[0];
        this.data.forEach(p => {
            if (p.name.length < shortest.name.length) {
                shortest = p;
            }
        });
        return { name: shortest.name, length: shortest.name.length, generation: shortest.generation };
    }

    getMostCommonFirstLetter() {
        const letterCount = {};
        this.data.forEach(p => {
            const firstLetter = p.name.charAt(0).toUpperCase();
            letterCount[firstLetter] = (letterCount[firstLetter] || 0) + 1;
        });

        let maxLetter = '';
        let maxCount = 0;
        for (const [letter, count] of Object.entries(letterCount)) {
            if (count > maxCount) {
                maxCount = count;
                maxLetter = letter;
            }
        }

        return { letter: maxLetter, count: maxCount };
    }

    getGenerationGrowthRates() {
        const genCounts = this.getMembersPerGeneration();
        const generations = Object.keys(genCounts).sort((a, b) => a - b);
        const growthRates = {};

        for (let i = 1; i < generations.length; i++) {
            const prevGen = generations[i - 1];
            const currGen = generations[i];
            const prevCount = genCounts[prevGen];
            const currCount = genCounts[currGen];

            if (prevCount > 0) {
                const growthRate = ((currCount - prevCount) / prevCount) * 100;
                growthRates[currGen] = growthRate.toFixed(1);
            }
        }

        return growthRates;
    }

    getFastestGrowingGeneration() {
        const growthRates = this.getGenerationGrowthRates();
        let maxGen = '';
        let maxRate = -Infinity;

        for (const [gen, rate] of Object.entries(growthRates)) {
            const numRate = parseFloat(rate);
            if (numRate > maxRate) {
                maxRate = numRate;
                maxGen = gen;
            }
        }

        return { generation: maxGen, rate: maxRate };
    }

    getNameLengthDistribution() {
        const lengthCount = {};
        this.data.forEach(p => {
            const length = p.name.length;
            lengthCount[length] = (lengthCount[length] || 0) + 1;
        });

        return lengthCount;
    }
}

// Configure Chart.js global animation settings for slower, smoother animations
// Force animations on all devices (including mobile)
Chart.defaults.animation.duration = 2000; // 2 seconds for more visible animation
Chart.defaults.animation.easing = 'easeInOutQuart'; // Smooth easing

// Ensure animations are always enabled (override any Chart.js defaults)
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = true;

// Initialize and render all charts
async function initializeDashboard() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');

    const familyData = await loadFamilyData();

    if (!familyData || familyData.length === 0) {
        console.error('No family data available');
        loadingOverlay.classList.add('hidden');
        return;
    }

    // Store globally for search/filter
    allFamilyData = familyData;
    analytics = new FamilyAnalytics(familyData);

    // Update statistics tiles with animation
    animateCounter(document.getElementById('total-members'), analytics.getTotalMembers());
    animateCounter(document.getElementById('total-generations'), analytics.getTotalGenerations());

    const largestGen = analytics.getLargestGeneration();
    document.getElementById('largest-generation').textContent = `Gen ${largestGen.generation} (${largestGen.count})`;

    document.getElementById('avg-children').textContent = analytics.getAverageChildren();
    animateCounter(document.getElementById('deepest-lineage'), analytics.getDeepestLineage());
    animateCounter(document.getElementById('total-branches'), analytics.getTotalBranches());

    // Name uniqueness
    const nameUniqueness = analytics.getNameUniqueness();
    animateCounter(document.getElementById('unique-names-count'), nameUniqueness.total);

    // Setup interactive features first
    setupDarkMode();
    setupSearch();
    setupFilters();
    setupPDFExport();

    // Setup scroll-triggered chart loading
    setupScrollAnimations(analytics, familyData, nameUniqueness);

    // Hide loading overlay
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 500);
}

// Chart rendering functions
function renderGenerationBarChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.generationBar) {
        chartInstances.generationBar.destroy();
    }

    const ctx = document.getElementById('generation-bar-chart').getContext('2d');
    chartInstances.generationBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Members',
                data: Object.values(data),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Members' }
                },
                x: { title: { display: true, text: 'Generation' } }
            }
        }
    });
}

function renderGenerationPieChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.generationPie) {
        chartInstances.generationPie.destroy();
    }

    const ctx = document.getElementById('generation-pie-chart').getContext('2d');

    // Group smaller generations for better visualization
    const grouped = {};
    Object.entries(data).forEach(([gen, count]) => {
        if (count > 5) {
            grouped[`Gen ${gen}`] = count;
        } else {
            grouped['Others'] = (grouped['Others'] || 0) + count;
        }
    });

    chartInstances.generationPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(grouped),
            datasets: [{
                data: Object.values(grouped),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
                    '#36A2EB', '#FFCE56'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

function renderGenerationLineChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.generationLine) {
        chartInstances.generationLine.destroy();
    }

    const ctx = document.getElementById('generation-line-chart').getContext('2d');

    // Calculate cumulative growth
    const cumulative = [];
    let sum = 0;
    Object.values(data).forEach(count => {
        sum += count;
        cumulative.push(sum);
    });

    chartInstances.generationLine = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Cumulative Family Members',
                data: cumulative,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Total Members' } },
                x: { title: { display: true, text: 'Generation' } }
            }
        }
    });
}

function renderLargestFamiliesChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.largestFamilies) {
        chartInstances.largestFamilies.destroy();
    }

    const ctx = document.getElementById('largest-families-chart').getContext('2d');
    chartInstances.largestFamilies = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d[0]),
            datasets: [{
                label: 'Number of Children',
                data: data.map(d => d[1]),
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true, title: { display: true, text: 'Number of Children' } }
            }
        }
    });
}

function renderFamilySizeHistogram(data) {
    // Destroy existing chart if it exists
    if (chartInstances.familySizeHistogram) {
        chartInstances.familySizeHistogram.destroy();
    }

    const ctx = document.getElementById('family-size-histogram').getContext('2d');
    const sortedData = Array.from(data.entries()).sort((a, b) => a[0] - b[0]);

    chartInstances.familySizeHistogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(d => `${d[0]} ${d[0] === 1 ? 'child' : 'children'}`),
            datasets: [{
                label: 'Number of Families',
                data: sortedData.map(d => d[1]),
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Families' } },
                x: { title: { display: true, text: 'Family Size' } }
            }
        }
    });
}

function renderBranchComparisonChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.branchComparison) {
        chartInstances.branchComparison.destroy();
    }

    const ctx = document.getElementById('branch-comparison-chart').getContext('2d');

    if (Object.keys(data).length === 0) {
        // If no data, show a placeholder
        ctx.canvas.parentElement.innerHTML = '<p style="text-align:center;padding:2rem;">No lineage data available for comparison</p>';
        return;
    }

    chartInstances.branchComparison = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data).map(k => `Generation ${k}`),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#E7E9ED', '#FF8A80',
                    '#8BC34A', '#FFC107', '#00BCD4', '#E91E63'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const branchText = value === 1 ? 'branch' : 'branches';
                            return `${label}: ${value} ${branchText}`;
                        }
                    }
                }
            }
        }
    });
}

function renderCommonNamesChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.commonNames) {
        chartInstances.commonNames.destroy();
    }

    const ctx = document.getElementById('common-names-chart').getContext('2d');
    chartInstances.commonNames = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d[0]),
            datasets: [{
                label: 'Frequency',
                data: data.map(d => d[1]),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
                x: { title: { display: true, text: 'Name' } }
            }
        }
    });
}

function renderNameUniquenessChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.nameUniqueness) {
        chartInstances.nameUniqueness.destroy();
    }

    const ctx = document.getElementById('name-uniqueness-chart').getContext('2d');
    chartInstances.nameUniqueness = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Unique Names', 'Repeated Names'],
            datasets: [{
                data: [data.unique, data.repeated],
                backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

function renderTopAncestorsList(data, familyData) {
    const listElement = document.getElementById('top-ancestors-list');
    const html = data.map((item, index) => {
        // item[0] is like "NAME (Gen X)", extract name and generation
        const match = item[0].match(/(.*?)\s+\(Gen\s+(\d+)\)/);
        const name = match ? match[1] : item[0];
        const gen = match ? match[2] : '';

        return `<div class="ancestor-item">
            <span class="rank">${index + 1}</span>
            <span class="ancestor-name">${item[0]}</span>
            <span class="descendant-count">${item[1]} descendants</span>
            <button class="ancestor-view-btn" onclick="viewInTree('${name}', ${gen})">View in Tree</button>
        </div>`;
    }).join('');

    listElement.innerHTML = html || '<p>No ancestor data available</p>';
}


function renderGenerationDetailsTable(data) {
    const tableElement = document.getElementById('generation-details-table');
    let html = '<table><thead><tr><th>Generation</th><th>Members</th><th>Percentage</th></tr></thead><tbody>';

    const total = Object.values(data).reduce((a, b) => a + b, 0);

    Object.entries(data).forEach(([gen, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        html += `<tr><td>Gen ${gen}</td><td>${count}</td><td>${percentage}%</td></tr>`;
    });

    html += '</tbody></table>';
    tableElement.innerHTML = html;
}

function renderKeyFacts(analytics) {
    const listElement = document.getElementById('key-facts-list');
    const facts = [
        `The family tree spans ${analytics.getTotalGenerations()} generations`,
        `There are ${analytics.getTotalMembers()} total family members recorded`,
        `Average of ${analytics.getAverageChildren()} children per family`,
        `The largest generation is Generation ${analytics.getLargestGeneration().generation} with ${analytics.getLargestGeneration().count} members`,
        `${analytics.getNameUniqueness().total} unique names appear in the family tree`,
        `${analytics.getNameUniqueness().repeated} names appear more than once`
    ];

    listElement.innerHTML = facts.map(fact => `<li>${fact}</li>`).join('');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Global variables for search and filter
let allFamilyData = [];
let analytics = null;

// Global chart instances for managing updates
let chartInstances = {
    generationBar: null,
    generationPie: null,
    generationLine: null,
    largestFamilies: null,
    familySizeHistogram: null,
    branchComparison: null,
    commonNames: null,
    nameUniqueness: null,
    growthRate: null,
    nameLength: null
};

// ANIMATED COUNTER FUNCTION
function animateCounter(element, finalValue) {
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = finalValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// DARK MODE TOGGLE
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeToggle.textContent = '🌙';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// SEARCH FUNCTIONALITY
function setupSearch() {
    const searchBox = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');
    const statsGrid = document.querySelector('.stats-grid');
    const controlBar = document.querySelector('.control-bar');

    // Set search results width to match control bar (search + filters)
    const updateSearchResultsWidth = () => {
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
            // Get the computed width of the entire control bar
            const controlBarWidth = controlBar.offsetWidth;
            searchResults.style.width = `${controlBarWidth}px`;
        });
    };

    // Update width on load and window resize with a small delay to ensure proper layout
    setTimeout(updateSearchResultsWidth, 100);
    window.addEventListener('resize', updateSearchResultsWidth);

    const updateStatsGridMargin = () => {
        // Add dynamic margin to stats-grid based on search results
        if (searchResults.style.display === 'block') {
            // Get the height of search results
            const searchResultsHeight = searchResults.offsetHeight;
            // Add appropriate spacing (20-30px) after search results
            statsGrid.style.marginTop = '30px';
        } else {
            // Reset to default margin when no search results
            statsGrid.style.marginTop = '0px';
        }
    };

    // Helper function to get parent names for context
    const getParentInfo = (person) => {
        if (!person.parents || person.parents.length === 0) {
            return 'Root ancestor';
        }

        // Get the parent's generation
        const parentGen = person.generation - 1;
        // Find parent by matching generation and parent array prefix
        const parent = allFamilyData.find(p =>
            p.generation === parentGen &&
            JSON.stringify(p.parents) === JSON.stringify(person.parents.slice(0, -1))
        );

        return parent ? `Child of ${parent.name}` : `Gen ${person.generation}`;
    };

    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            searchResults.style.display = 'none';
            updateStatsGridMargin();
            return;
        }

        const results = allFamilyData.filter(person =>
            person.name.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            searchResults.style.display = 'block';

            // Group results by name to detect duplicates
            const nameGroups = {};
            results.forEach(person => {
                if (!nameGroups[person.name]) {
                    nameGroups[person.name] = [];
                }
                nameGroups[person.name].push(person);
            });

            searchResults.innerHTML = `
                <h3>Found ${results.length} result${results.length > 1 ? 's' : ''}:</h3>
                ${results.slice(0, 10).map(person => {
                    const duplicateCount = nameGroups[person.name].length;
                    const duplicateIndex = nameGroups[person.name].indexOf(person) + 1;
                    const parentInfo = getParentInfo(person);

                    return `
                    <div class="search-result-item">
                        <div class="search-result-info">
                            <div class="search-result-name">
                                ${person.name}
                                ${duplicateCount > 1 ? `<span class="duplicate-badge">${duplicateIndex}/${duplicateCount}</span>` : ''}
                            </div>
                            <div class="search-result-gen">Generation ${person.generation} | ${parentInfo}</div>
                        </div>
                        <button class="view-in-tree-btn" onclick="viewInTree('${person.name}', ${person.generation})">View in Tree</button>
                    </div>
                `;
                }).join('')}
                ${results.length > 10 ? `<p style="text-align:center;color:var(--text-secondary);margin-top:10px;">...and ${results.length - 10} more</p>` : ''}
            `;
            // Update width and margin after content is rendered
            setTimeout(() => {
                updateSearchResultsWidth();
                updateStatsGridMargin();
            }, 0);
        } else {
            searchResults.style.display = 'block';
            searchResults.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No results found</p>';
            // Update width and margin after content is rendered
            setTimeout(() => {
                updateSearchResultsWidth();
                updateStatsGridMargin();
            }, 0);
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (searchResults.style.display === 'block') {
            // Check if click is outside search box and search results
            if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
                searchBox.value = '';
                updateStatsGridMargin();
            }
        }
    });
}

// GENERATION FILTER
function setupFilters() {
    const minInput = document.getElementById('gen-filter-min');
    const maxInput = document.getElementById('gen-filter-max');
    const resetBtn = document.getElementById('reset-filters');

    const applyFilter = () => {
        const min = parseInt(minInput.value) || 1;
        const max = parseInt(maxInput.value) || analytics.getTotalGenerations();

        // Filter the data and re-render charts
        const filteredData = allFamilyData.filter(p => p.generation >= min && p.generation <= max);
        const filteredAnalytics = new FamilyAnalytics(filteredData);

        // Update all stats and charts with filtered data
        updateDashboardWithData(filteredAnalytics);
    };

    minInput.addEventListener('change', applyFilter);
    maxInput.addEventListener('change', applyFilter);

    resetBtn.addEventListener('click', () => {
        minInput.value = '';
        maxInput.value = '';
        updateDashboardWithData(analytics);
    });
}

// PDF EXPORT - Force render all content then export
function setupPDFExport() {
    const exportBtn = document.getElementById('export-pdf');

    exportBtn.addEventListener('click', async () => {
        exportBtn.textContent = '⏳ Generating PDF...';
        exportBtn.disabled = true;

        try {
            // Step 1: Force render ALL charts and content (even those not scrolled to)
            await forceRenderAllContent();

            // Wait additional time for Chart.js animations to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Get all content element positions before capturing
            const element = document.querySelector('.dashboard-container');
            const contentElements = [];
            const containerRect = element.getBoundingClientRect();

            // Collect all elements that shouldn't be broken across pages
            const elementsToProtect = [
                ...element.querySelectorAll('.stat-card'),
                ...element.querySelectorAll('.chart-card'),
                ...element.querySelectorAll('.trivia-card'),
                ...element.querySelectorAll('.info-card'),
                ...element.querySelectorAll('.descendant-card'),
                ...element.querySelectorAll('.charts-section h2')
            ];

            elementsToProtect.forEach(el => {
                const rect = el.getBoundingClientRect();
                contentElements.push({
                    offsetTop: rect.top - containerRect.top + element.scrollTop,
                    height: rect.height,
                    element: el.className
                });
            });

            // Step 4: Capture element as canvas using html2canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f5f7fa',
                logging: false,
                scrollY: -window.scrollY,
                scrollX: -window.scrollX,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                ignoreElements: function(element) {
                    // Don't ignore any elements
                    return false;
                },
                onclone: function(clonedDoc) {
                    // Hide navigation elements in the cloned document only
                    const navElements = [
                        clonedDoc.querySelector('.top-action-buttons'),
                        clonedDoc.querySelector('.nav-menu-toggle'),
                        clonedDoc.querySelector('.nav-menu'),
                        clonedDoc.querySelector('.nav-menu-overlay')
                    ];
                    navElements.forEach(el => {
                        if (el) el.style.display = 'none';
                    });

                    // Ensure all canvas elements are visible in the clone
                    const canvases = clonedDoc.querySelectorAll('canvas');
                    canvases.forEach(canvas => {
                        canvas.style.display = 'block';
                        canvas.style.visibility = 'visible';
                        canvas.style.opacity = '1';
                    });

                    // Ensure stat cards are visible
                    const statCards = clonedDoc.querySelectorAll('.stat-card, .chart-card, .trivia-card');
                    statCards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                    });

                    // Ensure descendant cards and info cards are visible
                    const descendantCards = clonedDoc.querySelectorAll('.descendant-card, .info-card');
                    descendantCards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                    });

                    // Ensure tables and lists are visible
                    const tables = clonedDoc.querySelectorAll('table');
                    tables.forEach(table => {
                        table.style.opacity = '1';
                        table.style.visibility = 'visible';
                    });

                    const lists = clonedDoc.querySelectorAll('#key-facts-list, #top-ancestors-list');
                    lists.forEach(list => {
                        list.style.opacity = '1';
                        list.style.visibility = 'visible';
                    });

                    // Fix lineage tracking (ancestor items) styling for proper boldness
                    const ancestorItems = clonedDoc.querySelectorAll('.ancestor-item');
                    ancestorItems.forEach(item => {
                        item.style.opacity = '1 !important';
                        item.style.visibility = 'visible !important';
                        item.style.backgroundColor = '#f8f9fa !important';
                        item.style.display = 'flex !important';
                        item.style.padding = '16px';

                        // Make text bold and fully opaque with !important
                        const ancestorName = item.querySelector('.ancestor-name');
                        if (ancestorName) {
                            ancestorName.style.color = '#000 !important';
                            ancestorName.style.fontWeight = '700 !important';
                            ancestorName.style.opacity = '1 !important';
                            ancestorName.style.fontSize = '1.1rem';
                        }

                        const rank = item.querySelector('.rank');
                        if (rank) {
                            rank.style.color = '#667eea !important';
                            rank.style.fontWeight = '800 !important';
                            rank.style.opacity = '1 !important';
                            rank.style.fontSize = '1.2rem';
                        }

                        const descendantCount = item.querySelector('.descendant-count');
                        if (descendantCount) {
                            descendantCount.style.color = '#333 !important';
                            descendantCount.style.backgroundColor = 'white !important';
                            descendantCount.style.opacity = '1 !important';
                            descendantCount.style.fontWeight = '600';
                            descendantCount.style.padding = '6px 14px';
                        }
                    });

                    // Also ensure the descendant card container is fully visible
                    const descendantCardContainer = clonedDoc.querySelector('.descendant-card');
                    if (descendantCardContainer) {
                        descendantCardContainer.style.opacity = '1 !important';
                        descendantCardContainer.style.visibility = 'visible !important';
                        descendantCardContainer.style.backgroundColor = 'white !important';
                    }

                    // Ensure the top ancestors list container is visible
                    const topAncestorsList = clonedDoc.querySelector('#top-ancestors-list');
                    if (topAncestorsList) {
                        topAncestorsList.style.opacity = '1 !important';
                        topAncestorsList.style.visibility = 'visible !important';
                    }
                }
            });

            // Step 5: Create PDF with smart page breaks
            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;
            const margin = 10;
            const contentHeight = pdfHeight - (margin * 2);

            // Calculate dimensions
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Convert element positions from pixels to PDF mm
            const scale = imgWidth / canvas.width;
            const protectedElementsPDF = contentElements.map(elem => ({
                start: elem.offsetTop * scale * 2, // *2 because html2canvas uses scale: 2
                end: (elem.offsetTop + elem.height) * scale * 2,
                height: elem.height * scale * 2,
                element: elem.element
            }));

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            let sourceY = 0; // Current position in source image (mm)
            let pageNumber = 1;

            // Create temporary canvas for slicing
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            while (sourceY < imgHeight) {
                // Calculate where the next page break would naturally fall
                let nextBreakPoint = sourceY + contentHeight;

                // Check if break point would cut through any protected element
                let adjustedBreakPoint = nextBreakPoint;
                for (const elem of protectedElementsPDF) {
                    // If break would fall within this element, move break to before the element
                    if (nextBreakPoint > elem.start && nextBreakPoint < elem.end) {
                        adjustedBreakPoint = elem.start;
                        break;
                    }
                }

                // Calculate slice height in mm and convert to pixels
                const sliceHeightMM = Math.min(adjustedBreakPoint - sourceY, imgHeight - sourceY);
                const sliceHeightPx = (sliceHeightMM / imgWidth) * canvas.width;
                const sourceYPx = (sourceY / imgWidth) * canvas.width;

                // Set temp canvas size to the slice we want
                tempCanvas.width = canvas.width;
                tempCanvas.height = sliceHeightPx;

                // Draw the slice from the source canvas
                tempCtx.drawImage(
                    canvas,
                    0, sourceYPx,           // Source x, y
                    canvas.width, sliceHeightPx,  // Source width, height
                    0, 0,                   // Dest x, y
                    canvas.width, sliceHeightPx   // Dest width, height
                );

                // Convert slice to data URL
                const sliceData = tempCanvas.toDataURL('image/jpeg', 0.98);

                // Add slice to PDF page
                pdf.addImage(
                    sliceData,
                    'JPEG',
                    margin,
                    margin,
                    imgWidth,
                    sliceHeightMM,
                    undefined,
                    'FAST'
                );

                sourceY = adjustedBreakPoint;

                // If there's more content, add new page
                if (sourceY < imgHeight) {
                    pdf.addPage();
                    pageNumber++;
                }
            }

            // Step 6: Save PDF
            pdf.save('bhalsod-family-data-dashboard.pdf');

            exportBtn.textContent = '✅ PDF Downloaded!';
            setTimeout(() => {
                exportBtn.textContent = '📥 Export PDF';
                exportBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('PDF export error:', error);
            exportBtn.textContent = '❌ Export Failed';
            setTimeout(() => {
                exportBtn.textContent = '📥 Export PDF';
                exportBtn.disabled = false;
            }, 2000);
        }
    });
}

// Force render all charts and content that haven't loaded yet
async function forceRenderAllContent() {
    // Temporarily disable Chart.js animations for instant rendering
    const originalAnimationDuration = Chart.defaults.animation.duration;
    Chart.defaults.animation.duration = 0;

    // Render all charts that exist
    const chartIds = [
        'generation-bar-chart',
        'generation-pie-chart',
        'generation-line-chart',
        'largest-families-chart',
        'family-size-histogram',
        'branch-comparison-chart',
        'common-names-chart',
        'name-uniqueness-chart',
        'growth-rate-chart',
        'name-length-chart'
    ];

    const nameUniqueness = analytics.getNameUniqueness();

    // Render each chart if its canvas exists
    chartIds.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        // Render based on chart type
        switch(chartId) {
            case 'generation-bar-chart':
                renderGenerationBarChart(analytics.getMembersPerGeneration());
                break;
            case 'generation-pie-chart':
                renderGenerationPieChart(analytics.getMembersPerGeneration());
                break;
            case 'generation-line-chart':
                renderGenerationLineChart(analytics.getMembersPerGeneration());
                break;
            case 'largest-families-chart':
                renderLargestFamiliesChart(analytics.getTopLargestFamilies());
                break;
            case 'family-size-histogram':
                renderFamilySizeHistogram(analytics.getFamilySizeDistribution());
                break;
            case 'branch-comparison-chart':
                renderBranchComparisonChart(analytics.getBranchComparison());
                break;
            case 'common-names-chart':
                renderCommonNamesChart(analytics.getMostCommonNames());
                break;
            case 'name-uniqueness-chart':
                renderNameUniquenessChart(nameUniqueness);
                break;
            case 'growth-rate-chart':
                renderGrowthRateChart(analytics.getGenerationGrowthRates());
                break;
            case 'name-length-chart':
                renderNameLengthChart(analytics.getNameLengthDistribution());
                break;
        }
    });

    // Render other content sections
    renderTrivia(analytics);
    renderTopAncestorsList(analytics.getTopAncestorsByDescendants(), allFamilyData);
    renderGenerationDetailsTable(analytics.getMembersPerGeneration());
    renderKeyFacts(analytics);

    // Wait for all charts to finish rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Restore original animation duration
    Chart.defaults.animation.duration = originalAnimationDuration;
}

// VIEW IN TREE FUNCTION
function viewInTree(name, generation) {
    // Create URL with query parameters for deep linking
    const url = `tree.html?highlight=${encodeURIComponent(name)}&gen=${generation}`;
    window.location.href = url;
}

// Make viewInTree globally accessible
window.viewInTree = viewInTree;

// SETUP SCROLL ANIMATIONS
function setupScrollAnimations(analytics, familyData, nameUniqueness) {
    // Create an Intersection Observer for canvas elements (charts)
    const canvasObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
        threshold: 0.1 // Trigger when 10% of canvas is visible (earlier trigger)
    };

    // Map of chart IDs to their render functions
    const chartRenderers = {
        'generation-bar-chart': () => renderGenerationBarChart(analytics.getMembersPerGeneration()),
        'generation-pie-chart': () => renderGenerationPieChart(analytics.getMembersPerGeneration()),
        'generation-line-chart': () => renderGenerationLineChart(analytics.getMembersPerGeneration()),
        'largest-families-chart': () => renderLargestFamiliesChart(analytics.getTopLargestFamilies()),
        'family-size-histogram': () => renderFamilySizeHistogram(analytics.getFamilySizeDistribution()),
        'branch-comparison-chart': () => renderBranchComparisonChart(analytics.getBranchComparison()),
        'common-names-chart': () => renderCommonNamesChart(analytics.getMostCommonNames()),
        'name-uniqueness-chart': () => renderNameUniquenessChart(nameUniqueness),
        'growth-rate-chart': () => renderGrowthRateChart(analytics.getGenerationGrowthRates()),
        'name-length-chart': () => renderNameLengthChart(analytics.getNameLengthDistribution())
    };

    // Track which charts have been rendered
    const renderedCharts = new Set();

    // Observer for canvas elements (charts)
    const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const canvas = entry.target;

                // Render the chart if it hasn't been rendered yet
                if (chartRenderers[canvas.id] && !renderedCharts.has(canvas.id)) {
                    // Render chart immediately for instant animation
                    chartRenderers[canvas.id]();
                    renderedCharts.add(canvas.id);

                    // Add animation to parent chart-card
                    const chartCard = canvas.closest('.chart-card');
                    if (chartCard) {
                        chartCard.classList.add('animate-in');
                    }
                }

                // Unobserve after rendering for performance
                canvasObserver.unobserve(canvas);
            }
        });
    }, canvasObserverOptions);

    // Observer for other content (trivia, info cards, etc.)
    const contentObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // Add animation class
                element.classList.add('animate-in');

                // If it's the trivia section, render trivia
                if (element.classList.contains('trivia-card') && !renderedCharts.has('trivia')) {
                    setTimeout(() => {
                        renderTrivia(analytics);
                        renderedCharts.add('trivia');
                    }, 100);
                }

                // If it's the descendant card, render ancestors list
                if (element.classList.contains('descendant-card') && !renderedCharts.has('ancestors')) {
                    setTimeout(() => {
                        renderTopAncestorsList(analytics.getTopAncestorsByDescendants(), familyData);
                        renderedCharts.add('ancestors');
                    }, 200);
                }

                // If it's an info card, render tables
                if (element.classList.contains('info-card')) {
                    const tableDiv = element.querySelector('#generation-details-table');
                    const listDiv = element.querySelector('#key-facts-list');

                    if (tableDiv && !renderedCharts.has('gen-table')) {
                        setTimeout(() => {
                            renderGenerationDetailsTable(analytics.getMembersPerGeneration());
                            renderedCharts.add('gen-table');
                        }, 200);
                    }

                    if (listDiv && !renderedCharts.has('key-facts')) {
                        setTimeout(() => {
                            renderKeyFacts(analytics);
                            renderedCharts.add('key-facts');
                        }, 200);
                    }
                }

                // Unobserve after animation
                contentObserver.unobserve(element);
            }
        });
    }, contentObserverOptions);

    // Observe all canvas elements (charts) directly
    document.querySelectorAll('canvas').forEach(canvas => {
        canvasObserver.observe(canvas);
    });

    // Observe other content elements
    document.querySelectorAll('.trivia-card, .info-card, .descendant-card, .charts-section h2').forEach(element => {
        contentObserver.observe(element);
    });
}


// RENDER NEW TRIVIA SECTION
function renderTrivia(analyticsObj) {
    const longest = analyticsObj.getLongestName();
    document.getElementById('longest-name').textContent = longest.name;
    document.getElementById('longest-name-detail').textContent = `${longest.length} characters | Gen ${longest.generation}`;

    const shortest = analyticsObj.getShortestName();
    document.getElementById('shortest-name').textContent = shortest.name;
    document.getElementById('shortest-name-detail').textContent = `${shortest.length} characters | Gen ${shortest.generation}`;

    const letter = analyticsObj.getMostCommonFirstLetter();
    document.getElementById('common-letter').textContent = letter.letter;
    document.getElementById('common-letter-detail').textContent = `${letter.count} names start with ${letter.letter}`;

    const fastest = analyticsObj.getFastestGrowingGeneration();
    document.getElementById('fastest-gen').textContent = `Gen ${fastest.generation}`;
    document.getElementById('fastest-gen-detail').textContent = `${fastest.rate}% growth from previous generation`;
}

// RENDER GROWTH RATE CHART
function renderGrowthRateChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.growthRate) {
        chartInstances.growthRate.destroy();
    }

    const ctx = document.getElementById('growth-rate-chart').getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data).map(v => parseFloat(v));

    chartInstances.growthRate = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Growth Rate (%)',
                data: values,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Growth Rate (%)' },
                    beginAtZero: false
                },
                x: { title: { display: true, text: 'Generation' } }
            }
        }
    });
}

// RENDER NAME LENGTH CHART
function renderNameLengthChart(data) {
    // Destroy existing chart if it exists
    if (chartInstances.nameLength) {
        chartInstances.nameLength.destroy();
    }

    const ctx = document.getElementById('name-length-chart').getContext('2d');
    const sortedData = Object.entries(data).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    chartInstances.nameLength = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(d => `${d[0]} chars`),
            datasets: [{
                label: 'Number of Names',
                data: sortedData.map(d => d[1]),
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                x: { title: { display: true, text: 'Name Length' } }
            }
        }
    });
}

// UPDATE DASHBOARD WITH DATA (for filtering)
function updateDashboardWithData(analyticsObj) {
    // Update stat values with animation
    animateCounter(document.getElementById('total-members'), analyticsObj.getTotalMembers());
    animateCounter(document.getElementById('total-generations'), analyticsObj.getTotalGenerations());

    const largestGen = analyticsObj.getLargestGeneration();
    document.getElementById('largest-generation').textContent = `Gen ${largestGen.generation} (${largestGen.count})`;

    document.getElementById('avg-children').textContent = analyticsObj.getAverageChildren();
    animateCounter(document.getElementById('deepest-lineage'), analyticsObj.getDeepestLineage());
    animateCounter(document.getElementById('total-branches'), analyticsObj.getTotalBranches());

    const nameUniqueness = analyticsObj.getNameUniqueness();
    animateCounter(document.getElementById('unique-names-count'), nameUniqueness.total);

    // Update all charts with new data (no animation)
    updateChartData(analyticsObj, nameUniqueness);

    // Update other sections
    renderTrivia(analyticsObj);
    renderTopAncestorsList(analyticsObj.getTopAncestorsByDescendants(), allFamilyData);
    renderGenerationDetailsTable(analyticsObj.getMembersPerGeneration());
    renderKeyFacts(analyticsObj);
}

// UPDATE CHART DATA WITHOUT ANIMATION (for filtering)
function updateChartData(analyticsObj, nameUniqueness) {
    const membersPerGen = analyticsObj.getMembersPerGeneration();

    // Update generation bar chart
    if (chartInstances.generationBar) {
        chartInstances.generationBar.data.labels = Object.keys(membersPerGen);
        chartInstances.generationBar.data.datasets[0].data = Object.values(membersPerGen);
        chartInstances.generationBar.update('none');
    }

    // Update generation pie chart
    if (chartInstances.generationPie) {
        const grouped = {};
        Object.entries(membersPerGen).forEach(([gen, count]) => {
            if (count > 5) {
                grouped[`Gen ${gen}`] = count;
            } else {
                grouped['Others'] = (grouped['Others'] || 0) + count;
            }
        });
        chartInstances.generationPie.data.labels = Object.keys(grouped);
        chartInstances.generationPie.data.datasets[0].data = Object.values(grouped);
        chartInstances.generationPie.update('none');
    }

    // Update generation line chart
    if (chartInstances.generationLine) {
        const cumulative = [];
        let sum = 0;
        Object.values(membersPerGen).forEach(count => {
            sum += count;
            cumulative.push(sum);
        });
        chartInstances.generationLine.data.labels = Object.keys(membersPerGen);
        chartInstances.generationLine.data.datasets[0].data = cumulative;
        chartInstances.generationLine.update('none');
    }

    // Update largest families chart
    if (chartInstances.largestFamilies) {
        const topFamilies = analyticsObj.getTopLargestFamilies();
        chartInstances.largestFamilies.data.labels = topFamilies.map(d => d[0]);
        chartInstances.largestFamilies.data.datasets[0].data = topFamilies.map(d => d[1]);
        chartInstances.largestFamilies.update('none');
    }

    // Update family size histogram
    if (chartInstances.familySizeHistogram) {
        const familySizes = analyticsObj.getFamilySizeDistribution();
        const sortedData = Array.from(familySizes.entries()).sort((a, b) => a[0] - b[0]);
        chartInstances.familySizeHistogram.data.labels = sortedData.map(d => `${d[0]} ${d[0] === 1 ? 'child' : 'children'}`);
        chartInstances.familySizeHistogram.data.datasets[0].data = sortedData.map(d => d[1]);
        chartInstances.familySizeHistogram.update('none');
    }

    // Update branch comparison chart
    if (chartInstances.branchComparison) {
        const branchData = analyticsObj.getBranchComparison();
        if (Object.keys(branchData).length > 0) {
            chartInstances.branchComparison.data.labels = Object.keys(branchData).map(k => `Generation ${k}`);
            chartInstances.branchComparison.data.datasets[0].data = Object.values(branchData);
            chartInstances.branchComparison.update('none');
        }
    }

    // Update common names chart
    if (chartInstances.commonNames) {
        const commonNames = analyticsObj.getMostCommonNames();
        chartInstances.commonNames.data.labels = commonNames.map(d => d[0]);
        chartInstances.commonNames.data.datasets[0].data = commonNames.map(d => d[1]);
        chartInstances.commonNames.update('none');
    }

    // Update name uniqueness chart
    if (chartInstances.nameUniqueness) {
        chartInstances.nameUniqueness.data.datasets[0].data = [nameUniqueness.unique, nameUniqueness.repeated];
        chartInstances.nameUniqueness.update('none');
    }

    // Update growth rate chart
    if (chartInstances.growthRate) {
        const growthRates = analyticsObj.getGenerationGrowthRates();
        chartInstances.growthRate.data.labels = Object.keys(growthRates);
        chartInstances.growthRate.data.datasets[0].data = Object.values(growthRates).map(v => parseFloat(v));
        chartInstances.growthRate.update('none');
    }

    // Update name length chart
    if (chartInstances.nameLength) {
        const nameLengths = analyticsObj.getNameLengthDistribution();
        const sortedData = Object.entries(nameLengths).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        chartInstances.nameLength.data.labels = sortedData.map(d => `${d[0]} chars`);
        chartInstances.nameLength.data.datasets[0].data = sortedData.map(d => d[1]);
        chartInstances.nameLength.update('none');
    }
}
