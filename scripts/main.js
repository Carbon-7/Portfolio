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

// Project filters are handled in project navigation script to keep behavior consistent

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

// Toggle past highlights (not emphasized)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-highlights');
    const content = document.getElementById('highlights-content');
    if (!btn || !content) return;
    btn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        content.classList.toggle('hidden');
        btn.textContent = isOpen ? 'View details' : 'Hide details';
    });
});

// Copy email helper
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copy-email');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('hi.kavanraval@gmail.com');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy Email', 1500);
        } catch (e) {
            alert('Copy failed');
        }
    });
});

// Contact form: construct a mailto link with subject and body
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const subject = document.getElementById('subject')?.value || 'New message from portfolio';
        const platform = document.getElementById('platform')?.value || 'Email';
        const message = document.getElementById('message')?.value || '';

        const body = `Name: ${name}\nEmail: ${email}\nPreferred Platform: ${platform}\n\n${message}`;
        const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=hi.kavanraval@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const mailto = `mailto:hi.kavanraval@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Try opening Gmail in a new tab; fallback to mailto if blocked
        const win = window.open(gmailCompose, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = mailto;
        }
    });
});

// Email card: open Gmail compose directly
document.addEventListener('DOMContentLoaded', () => {
    const gmailLink = document.querySelector('a[href^="mailto:hi.kavanraval@gmail.com"], a#open-gmail');
    if (!gmailLink) return;
    gmailLink.addEventListener('click', (e) => {
        e.preventDefault();
        const subject = 'Hello from your portfolio';
        const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=hi.kavanraval@gmail.com&su=${encodeURIComponent(subject)}`;
        const win = window.open(gmailCompose, '_blank');
        if (!win) window.location.href = `mailto:hi.kavanraval@gmail.com?subject=${encodeURIComponent(subject)}`;
    });
});