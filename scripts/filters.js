document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('[data-category]');

    // Function to show active filter
    function setActiveFilter(activeButton) {
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-purple-500/30');
            btn.classList.add('bg-purple-500/20');
        });
        activeButton.classList.add('active', 'bg-purple-500/30');
        activeButton.classList.remove('bg-purple-500/20');
    }

    // Function to filter projects
    function filterProjects(category) {
        projectCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                card.classList.remove('scale-0', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            } else {
                card.classList.add('scale-0', 'opacity-0');
                card.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-filter');
            setActiveFilter(button);
            filterProjects(category);
        });
    });
});
