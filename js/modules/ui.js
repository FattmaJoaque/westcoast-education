// ==================== UI-FUNKTIONER ====================

export function showLoading(containerId, show) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (show) {
        container.innerHTML = '<p class="loading">Loading...</p>';
    }
}

export function showMessage(message, type = 'info', containerId = 'message-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<p class="message message-${type}">${message}</p>`;
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

export function renderCourseList(courses, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = courses.map(course => `
        <div class="course-card">
            <img src="images/${course.image}" alt="${course.title}" onerror="this.src='images/placeholder.jpg'">
            <div class="course-card-body">
                <h3>${course.title}</h3>
                <p class="course-number">Kursnr: ${course.courseNumber}</p>
                <p>${course.days} dagar &bull; ${course.type}</p>
                <p class="course-price">${course.price} kr</p>
                <a href="courses-details.html?id=${course.id}" class="btn btn-primary">Läs mer</a>
            </div>
        </div>
    `).join('');
}

export function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.nav-drawer');
    const overlay = document.querySelector('.nav-overlay');
    const closeBtn = document.querySelector('.drawer-close');

    if (!hamburger || !drawer) return;

   function openDrawer() {
   
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

  
    drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
}