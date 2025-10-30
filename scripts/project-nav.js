document.addEventListener('DOMContentLoaded', function() {
    const projectContainer = document.querySelector('.project-container');
    const projectGroups = document.querySelector('.project-groups');
    const projects = document.querySelectorAll('.project-group');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    const projectCounter = document.querySelector('.project-counter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentIndex = 0;
    let filteredProjects = [...projects];
    let isAnimating = false;

    function updateProjectsVisibility() {
        projects.forEach((group, index) => {
            if (index === currentIndex && !group.classList.contains('hidden')) {
                group.classList.remove('translate-x-full', '-translate-x-full', 'opacity-0');
                group.classList.add('translate-x-0', 'opacity-100', 'z-10');
                group.style.pointerEvents = 'auto';
            } else {
                if (index < currentIndex) {
                    group.classList.add('-translate-x-full', 'opacity-0');
                    group.classList.remove('translate-x-0', 'translate-x-full', 'z-10');
                } else if (index > currentIndex) {
                    group.classList.add('translate-x-full', 'opacity-0');
                    group.classList.remove('translate-x-0', '-translate-x-full', 'z-10');
                }
                group.style.pointerEvents = 'none';
            }
        });

        // Update counter
        const visibleCount = filteredProjects.length;
        projectCounter.textContent = `${currentIndex + 1} / ${visibleCount}`;

        // Update navigation buttons
        prevBtn.classList.toggle('opacity-50', currentIndex === 0);
        nextBtn.classList.toggle('opacity-50', currentIndex === visibleCount - 1);
    }

    function navigateProject(direction) {
        if (isAnimating) return;
        
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < filteredProjects.length) {
            isAnimating = true;
            currentIndex = newIndex;
            updateProjectsVisibility();
            
            setTimeout(() => {
                isAnimating = false;
            }, 600); // Match this with the CSS transition duration
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
            
            if (hasMatchingProject) {
                group.classList.remove('hidden');
                group.querySelectorAll('.project-card').forEach(project => {
                    if (category === 'all' || project.dataset.category === category) {
                        project.classList.remove('hidden');
                    } else {
                        project.classList.add('hidden');
                    }
                });
            } else {
                group.classList.add('hidden');
            }
        });

        // Reset to first group in filtered list
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

    // Initialize the first view
    updateProjectsVisibility();
});
