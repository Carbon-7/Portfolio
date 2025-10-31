document.addEventListener('DOMContentLoaded', function() {
    // Header interactions: mobile menu and shadow on scroll
    const header = document.getElementById('site-header');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu && header) {
        const closeMenu = () => {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        };
        const openMenu = () => {
            mobileMenu.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
        };
        menuBtn.addEventListener('click', () => {
            const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
            expanded ? closeMenu() : openMenu();
        });
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
        // Shadow and background adjustment on scroll
        const onScroll = () => {
            const scrolled = window.scrollY > 8;
            header.classList.toggle('shadow-lg', scrolled);
            header.classList.toggle('bg-black/50', scrolled);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    const projectContainer = document.querySelector('.project-container');
    const projectGroups = document.querySelector('.project-groups');
    const projects = document.querySelectorAll('.project-group');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    const projectCounter = document.querySelector('.project-counter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentIndex = 0;
    let filteredProjects = [...projects];
    let isMobile = window.matchMedia('(max-width: 767px)').matches;
    let lastMobileCard = null;

    function getVisibleCardsByCategory(category) {
        const allCards = Array.from(document.querySelectorAll('.project-card'));
        return allCards.filter(card => {
            const match = category === 'all' || card.dataset.category === category;
            const groupHidden = card.closest('.project-group')?.classList.contains('hidden');
            return match && !groupHidden;
        });
    }
    let isAnimating = false;
    let lastIndex = 0;

    function updateProjectsVisibility() {
        if (!isMobile) {
            // Desktop: navigate only filtered groups (hard-hide others to prevent overlap)
            const filteredSet = new Set(filteredProjects);
            projects.forEach((group) => {
                // Hide groups not in filtered set
                if (!filteredSet.has(group)) {
                    group.classList.add('opacity-0', 'hidden');
                    group.classList.remove('translate-x-0');
                    group.classList.add('translate-x-full');
                    group.classList.remove('z-10');
                    group.style.pointerEvents = 'none';
                    return;
                }

                const fIndex = filteredProjects.indexOf(group);
                // Only keep current and last visible during transition to avoid any overlap
                const shouldBeVisible = (fIndex === currentIndex || fIndex === lastIndex);
                if (shouldBeVisible) group.classList.remove('hidden'); else group.classList.add('hidden');

                if (fIndex === currentIndex) {
                    group.classList.remove('translate-x-full', '-translate-x-full', 'opacity-0', 'hidden');
                    group.classList.add('translate-x-0', 'opacity-100', 'z-10');
                    group.style.pointerEvents = 'auto';
                    // trigger cards enter animation
                    group.classList.remove('cards-enter');
                    // force reflow to restart animation
                    void group.offsetWidth;
                    group.classList.add('cards-enter', 'group-active');
                    group.classList.remove('group-inactive-left', 'group-inactive-right');
                } else if (fIndex < currentIndex) {
                    group.classList.add('-translate-x-full', 'opacity-0', 'group-inactive-left');
                    group.classList.remove('translate-x-0', 'translate-x-full', 'z-10');
                    group.style.pointerEvents = 'none';
                    group.classList.remove('group-active');
                } else {
                    group.classList.add('translate-x-full', 'opacity-0', 'group-inactive-right');
                    group.classList.remove('translate-x-0', '-translate-x-full', 'z-10');
                    group.style.pointerEvents = 'none';
                    group.classList.remove('group-active');
                }
            });

            const visibleCount = filteredProjects.length;
            projectCounter.textContent = `${Math.min(currentIndex + 1, Math.max(visibleCount, 1))} / ${visibleCount}`;
            prevBtn.classList.toggle('opacity-50', currentIndex === 0);
            nextBtn.classList.toggle('opacity-50', currentIndex === visibleCount - 1);

            // After the fade completes, hard-hide the previous group to keep DOM lean
            setTimeout(() => {
                const prev = filteredProjects[lastIndex];
                if (prev && prev !== filteredProjects[currentIndex]) prev.classList.add('hidden');
                lastIndex = currentIndex;
            }, 380);
        } else {
            // Mobile: show one project card at a time
            const activeFilterBtn = document.querySelector('.filter-btn.active');
            const currentCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
            const visibleCards = getVisibleCardsByCategory(currentCategory);

            // Clamp index
            if (currentIndex >= visibleCards.length) currentIndex = Math.max(visibleCards.length - 1, 0);

            // Hide all cards (lightweight) and fade-in the active card
            document.querySelectorAll('.project-card').forEach(card => {
                if (card !== lastMobileCard) {
                    card.style.opacity = '0';
                    card.style.display = 'none';
                }
            });

            const currentCard = visibleCards[currentIndex];
            if (currentCard) {
                // Prepare and fade in
                currentCard.style.display = '';
                currentCard.style.opacity = '0';
                requestAnimationFrame(() => {
                    currentCard.style.opacity = '1';
                });
            }
            // Fade out previous card gently
            if (lastMobileCard && lastMobileCard !== currentCard) {
                lastMobileCard.style.opacity = '0';
                setTimeout(() => { if (lastMobileCard !== currentCard) lastMobileCard.style.display = 'none'; }, 200);
            }
            lastMobileCard = currentCard || null;

            // Ensure groups remain in flow height-wise
            projects.forEach(group => group.classList.remove('translate-x-full', '-translate-x-full')); // remove transforms for mobile

            projectCounter.textContent = `${visibleCards.length ? currentIndex + 1 : 0} / ${visibleCards.length}`;
            prevBtn.classList.toggle('opacity-50', currentIndex === 0);
            nextBtn.classList.toggle('opacity-50', currentIndex >= visibleCards.length - 1);
        }
    }

    function navigateProject(direction) {
        if (isAnimating) return;
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const currentCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const isMobileNow = isMobile;
        const poolLength = isMobileNow ? getVisibleCardsByCategory(currentCategory).length : filteredProjects.length;
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < poolLength) {
            isAnimating = true;
            const goingRight = direction > 0;
            // Pre-stage groups for smoother direction-aware transition
            if (!isMobileNow) {
                filteredProjects.forEach((group, idx) => {
                    if (idx === currentIndex) {
                        group.classList.remove('hidden');
                        group.classList.add(goingRight ? 'group-inactive-left' : 'group-inactive-right');
                        group.classList.remove('group-active');
                    }
                    if (idx === newIndex) {
                        group.classList.remove('hidden', 'group-inactive-left', 'group-inactive-right');
                        group.classList.add('group-active');
                    }
                });
            }
            currentIndex = newIndex;
            updateProjectsVisibility();
            setTimeout(() => { isAnimating = false; }, 560);
        }
    }

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    function filterProjects(category) {
        filteredProjects = [...projects].filter(group => {
            const hasMatchingProject = Array.from(group.querySelectorAll('.project-card')).some(project => 
                category === 'all' || project.dataset.category === category
            );
            return hasMatchingProject;
        });

        projects.forEach(group => {
            const hasMatchingProject = Array.from(group.querySelectorAll('.project-card')).some(project => 
                category === 'all' || project.dataset.category === category
            );
            if (hasMatchingProject) { group.classList.remove('hidden'); } else { group.classList.add('hidden'); }
        });

        // Reset to first item in filtered list
        currentIndex = 0;
        updateProjectsVisibility();
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-purple-500/30');
                btn.classList.add('bg-purple-500/20');
            });
            button.classList.add('active', 'bg-purple-500/30');
            button.classList.remove('bg-purple-500/20');
            
            const category = button.getAttribute('data-filter');
            filterProjects(category);
        });
    });

    // Initialize navigation buttons
    prevBtn.addEventListener('click', () => navigateProject(-1));
    nextBtn.addEventListener('click', () => navigateProject(1));

    // Handle responsive switch
    const mq = window.matchMedia('(max-width: 767px)');
    const handleChange = () => {
        isMobile = mq.matches;
        document.body.classList.toggle('mobile-projects-single', isMobile);
        currentIndex = 0;
        lastMobileCard = null;
        updateProjectsVisibility();
    };
    mq.addEventListener ? mq.addEventListener('change', handleChange) : mq.addListener(handleChange);

    // Initialize the first view
    document.body.classList.toggle('mobile-projects-single', isMobile);
    updateProjectsVisibility();
});
