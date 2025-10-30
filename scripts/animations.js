// Animate roadmap items on scroll
const animateRoadmapItems = () => {
    const roadmapItems = document.querySelectorAll('.roadmap-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.2 });

    roadmapItems.forEach(item => observer.observe(item));
};

// Add floating background elements
const addFloatingElements = () => {
    const shapes = ['⬡', '⬢', '◆', '⬗'];
    const container = document.querySelector('main');
    
    for (let i = 0; i < 8; i++) {
        const element = document.createElement('div');
        element.className = 'float-element';
        element.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        element.style.fontSize = `${Math.random() * 40 + 20}px`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(element);
    }
};

// Optimized mouse movement handler for stack cards
const handleStackCardHover = () => {
    const cards = document.querySelectorAll('.stack-card');
    let isThrottled = false;
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (isThrottled) return;
            isThrottled = true;

            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
                const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
                isThrottled = false;
            });
        });

        // Clear variables when mouse leaves
        card.addEventListener('mouseleave', () => {
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        });
    });
};

// Animate progress rings
const animateProgressRings = () => {
    const rings = document.querySelectorAll('.progress-ring');
    
    rings.forEach(ring => {
        const circle = ring.querySelector('.progress');
        const percent = ring.dataset.progress || 0;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    });
};

// Animate skill bars
const animateSkillBars = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillItems = entry.target.querySelectorAll('.reveal-skill');
                skillItems.forEach(item => {
                    const bar = item.querySelector('.skill-bar-progress');
                    const targetWidth = bar.getAttribute('data-width');
                    const delay = item.getAttribute('data-delay') || 0;
                    
                    // Reset width to 0
                    bar.style.width = '0%';
                    
                    // Animate to target width with delay
                    setTimeout(() => {
                        bar.style.transition = 'width 1s ease-in-out';
                        bar.style.width = targetWidth;
                    }, parseInt(delay));
                });
                
                // Only animate once
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    // Observe each skill section
    document.querySelectorAll('.stack-card').forEach(card => observer.observe(card));
};

// Optimized decorative circle animations using CSS transforms
const animateDecoCircles = () => {
    const circles = document.querySelectorAll('.deco-circle');
    circles.forEach(circle => {
        const randomDelay = Math.random() * 5;
        const randomDuration = 15 + Math.random() * 10;
        
        circle.style.animation = `float-circle ${randomDuration}s ease-in-out ${randomDelay}s infinite`;
    });
};

// Add the float-circle animation to the CSS
const addDecoStyles = () => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float-circle {
            0% { transform: translate(0, 0); }
            25% { transform: translate(20px, -15px); }
            50% { transform: translate(-10px, 20px); }
            75% { transform: translate(-15px, -10px); }
            100% { transform: translate(0, 0); }
        }
    `;
    document.head.appendChild(styleSheet);
};

// Initialize all animations with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Add decoration styles first
    addDecoStyles();

    // Use requestIdleCallback for non-critical initializations
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            addFloatingElements();
            animateDecoCircles();
        });
    } else {
        setTimeout(() => {
            addFloatingElements();
            animateDecoCircles();
        }, 100);
    }

    // Initialize critical animations
    handleStackCardHover();
    
    // Use a single IntersectionObserver for all animated elements
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    
                    // Handle specific animations based on element type
                    if (entry.target.classList.contains('roadmap-item')) {
                        entry.target.classList.add('animate');
                    }
                    if (entry.target.classList.contains('progress-ring')) {
                        animateProgressRings([entry.target]);
                    }
                    if (entry.target.classList.contains('stack-card')) {
                        const bars = entry.target.querySelectorAll('.skill-bar-progress');
                        if (bars.length) animateSkillBars([entry.target]);
                    }
                }
            });
        },
        { 
            threshold: 0.1,
            rootMargin: '50px'
        }
    );
    
    // Observe all animated elements
    document.querySelectorAll('.reveal, .roadmap-item, .progress-ring, .stack-card').forEach(el => {
        observer.observe(el);
    });
});