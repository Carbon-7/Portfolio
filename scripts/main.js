// --- Efficient Custom Cursor Logic ---
(() => {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const supportsPointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (!dot || !outline || !supportsPointer) {
        // Hide if elements missing or on touch devices
        if (dot) dot.style.display = 'none';
        if (outline) outline.style.display = 'none';
        return;
    }

    // Enable custom cursor by flagging body; CSS handles native cursor hiding.
    document.body.classList.add('use-custom-cursor');

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let outlineX = mouseX, outlineY = mouseY;

    // Use requestAnimationFrame for a lightweight trailing effect
    const ease = 0.18; // lower = smoother trailing

    function rafLoop() {
        // update trailing outline position
        outlineX += (mouseX - outlineX) * ease;
        outlineY += (mouseY - outlineY) * ease;

        // apply positions using left/top while keeping CSS translate(-50%,-50%)
        // (this avoids overwriting the centering transform and is simpler)
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;

        requestAnimationFrame(rafLoop);
    }

    // Keep coordinates updated from mouse events
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // Hover interactions: hide custom cursor and allow native pointer on interactive elements
    const interactiveSelector = 'a, button, input, textarea, select, .cursor-pointer';
    document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', () => {
            // hide custom elements so native cursor shows; keep them ready to reappear
            dot.style.opacity = '0';
            outline.style.opacity = '0';
        });
        el.addEventListener('mouseleave', () => {
            dot.style.opacity = '1';
            outline.style.opacity = '1';
        });
    });

    // Start the loop
    requestAnimationFrame(rafLoop);
})();

// --- Set Current Year in Footer ---
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
}

// --- Lightweight reveal on scroll (IntersectionObserver) ---
(function() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // don't run animations

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // unobserve to keep work minimal
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// Small performance: only animate skill progress when visible
(function(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                const bar = en.target.querySelector('.skill-bar-progress');
                if (bar && bar.dataset && bar.dataset.width) {
                    bar.style.width = bar.dataset.width;
                }
                barObserver.unobserve(en.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-tile').forEach(tile => {
        const bar = tile.querySelector('.skill-bar-progress');
        if (bar) {
            // store intended width, then reset to 0 so animation can run when observed
            const w = bar.style.width || '0%';
            bar.dataset.width = w;
            bar.style.width = '0%';
        }
        barObserver.observe(tile);
    });
})();

// Project Filtering with multiple categories
const projectFilters = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project-card');

projectFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Remove active class from all filters
        projectFilters.forEach(f => f.classList.remove('active'));
        // Add active class to clicked filter
        filter.classList.add('active');
        
        const category = filter.dataset.filter;
        
        projects.forEach(project => {
            const categories = project.dataset.category.split(' ');
            if (category === 'all' || categories.includes(category)) {
                project.style.display = '';
                setTimeout(() => project.style.opacity = '1', 0);
            } else {
                project.style.opacity = '0';
                setTimeout(() => project.style.display = 'none', 300);
            }
        });
    });
});

// Interactive Python Code Editor
let editor;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('editor')) {
        editor = ace.edit('editor');
        editor.setTheme('ace/theme/monokai');
        editor.session.setMode('ace/mode/python');
        editor.setFontSize(14);
    }
});

function runCode() {
    const output = document.getElementById('output');
    output.classList.remove('hidden');
    output.innerHTML = 'Running code simulation...<br>';
    
    const code = editor.getValue();
    let result;
    
    try {
        // Simulate code execution (in reality, this would need a backend)
        if (code.includes('def find_max') && code.includes('return max(numbers)')) {
            result = 'Output: The maximum number is: 9\nTest passed! ✅';
        } else if (code.includes('def find_max')) {
            result = 'Output: Function implemented but might need revision. Try using max() or writing a loop!';
        } else {
            result = 'Output: Make sure to implement the find_max function!';
        }
    } catch (e) {
        result = `Error: ${e.message}`;
    }
    
    output.innerHTML = result.replace(/\\n/g, '<br>');
}

// Interactive Chart
let myChart = null;

function createChart(data, labels) {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sample Data',
                data: data,
                borderColor: '#a855f7',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { color: '#e0e0e0' }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

function updateChart(period) {
    const monthlyData = [65, 59, 80, 81, 56, 55, 40];
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    const yearlyData = [800, 1200, 900, 1600];
    const yearlyLabels = ['2022', '2023', '2024', '2025'];
    
    if (period === 'monthly') {
        createChart(monthlyData, monthlyLabels);
    } else {
        createChart(yearlyData, yearlyLabels);
    }
}

// Initialize chart on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('myChart')) {
        updateChart('monthly');
    }
});

// Achievements Counter Animation
function animateValue(obj, start, end, duration) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        obj.textContent = end;
        return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate achievement numbers when they come into view
const achievementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target, 10);
            animateValue(counter, 0, target, 2000);
            achievementObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.achievement-number').forEach(counter => {
    achievementObserver.observe(counter);
});