import { updateAuthUI, getCurrentUser } from './modules/auth.js';
import { displayAllCourses, displayFilteredCourses, displayCourseDetails } from './modules/courses.js';
import { initBookingPage } from './modules/booking.js';
import { initAdminPage } from './modules/admin.js';
import { showMessage, setupMobileMenu } from './modules/ui.js';
import { debounce, getUrlParameter, formatDate } from './modules/utils.js';

// ==================== INITIERING ====================

document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    setupMobileMenu();

    const pages = {
        'index':          initHomePage,
        'courses':        initCoursesPage,
        'course-details': initCourseDetailsPage,
        'booking':        initBookingPage,
        'admin':          initAdminPage,
        'profile':        initProfilePage,
        'login':          initLoginPage,
        'register':       initRegisterPage,
    };

    const currentPage = getCurrentPage();
    if (pages[currentPage]) await pages[currentPage]();
});

// ==================== SIDIDENTIFIERING ====================

function getCurrentPage() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';

    const pageMap = {
        'index.html':           'index',
        '':                     'index',
        'courses.html':         'courses',
        'courses-details.html': 'course-details',
        'booking.html':         'booking',
        'admin.html':           'admin',
        'profile.html':         'profile',
        'login.html':           'login',
        'register.html':        'register',
    };

    return pageMap[filename] || 'index';
}

// ==================== STARTSIDA ====================

async function initHomePage() {
    const { getPopularCourses, getAllCourses, getCoursesWithFilters, getAllTeachers } = await import('./modules/api.js');
    const { renderCourseList } = await import('./modules/ui.js');

    renderCourseList(await getAllCourses(), 'popular-courses');

   
    const teachersContainer = document.getElementById('teachers-list');
    if (teachersContainer) {
        const teachers = await getAllTeachers();
        if (teachers?.length > 0) {
            teachersContainer.innerHTML = teachers.map(teacher => `
                <div class="teacher-card">
                    <img src="images/${teacher.image}" alt="${teacher.name}" onerror="this.style.display='none'">
                    <h3>${teacher.name}</h3>
                    <p class="teacher-title">${teacher.title || ''}</p>
                    <p class="teacher-bio">${teacher.bio || ''}</p>
                </div>
            `).join('');
        }
    }

 
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-tab');
            const courseLoaders = {
                'all':     () => getAllCourses(),
                'popular': () => getPopularCourses(6),
            };

            const courses = courseLoaders[filter]
                ? await courseLoaders[filter]()
                : await getCoursesWithFilters(`?type=${filter}`);

            renderCourseList(courses || [], 'popular-courses');
        });
    });
}

// ==================== KURSSIDA ====================

async function initCoursesPage() {
    await displayAllCourses();
    setupCourseFilters();
}

function setupCourseFilters() {
    const searchInput    = document.getElementById('search-courses');
    const categorySelect = document.getElementById('filter-category');
    const typeSelect     = document.getElementById('filter-type');
    const sortSelect     = document.getElementById('sort-by');

    if (!searchInput && !categorySelect && !typeSelect) return;

    const applyFilters = async () => {
        await displayFilteredCourses({
            search:   searchInput?.value    || '',
            category: categorySelect?.value || 'all',
            type:     typeSelect?.value     || 'all',
            sortBy:   sortSelect?.value     || 'title',
        });
    };

    searchInput?.addEventListener('input', debounce(applyFilters, 500));
    categorySelect?.addEventListener('change', applyFilters);
    typeSelect?.addEventListener('change', applyFilters);
    sortSelect?.addEventListener('change', applyFilters);
}

// ==================== KURSDETALJSIDA ====================

async function initCourseDetailsPage() {
    const courseId = getUrlParameter('id');

    if (courseId) {
        await displayCourseDetails(parseInt(courseId));
    } else {
        showMessage('No course selected', 'error');
        setTimeout(() => { window.location.href = 'courses.html'; }, 2000);
    }
}

// ==================== PROFILSIDA ====================

async function initProfilePage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { getUserById, getAllCourses } = await import('./modules/api.js');
    const { renderCourseList } = await import('./modules/ui.js');

    const fullUser = await getUserById(user.id);
    if (!fullUser) return;

    displayProfileInfo(fullUser);

    if (fullUser.bookedCourses?.length > 0) {
        const allCourses = await getAllCourses();
        const bookedCourses = allCourses.filter(c => fullUser.bookedCourses.includes(c.id));
        renderCourseList(bookedCourses, 'booked-courses');
    }
}

function displayProfileInfo(user) {
    const container = document.getElementById('profile-info');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-card">
            <h2>${user.name}</h2>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Address:</strong> ${user.address}</p>
            <p><strong>Member since:</strong> ${formatDate(user.createdAt)}</p>
        </div>
    `;
}

// ==================== INLOGGNINGSSIDA ====================

function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { login } = await import('./modules/auth.js');
        const success = await login(
            document.getElementById('email').value,
            document.getElementById('password').value
        );

        if (success) {
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl || 'profile.html';
        }
    });
}

// ==================== REGISTRERINGSSIDA ====================

function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password        = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        const { register } = await import('./modules/auth.js');
        await register({
            name:     document.getElementById('name').value,
            email:    document.getElementById('email').value,
            password,
            address:  document.getElementById('address').value,
            phone:    document.getElementById('phone').value,
        });
    });
}