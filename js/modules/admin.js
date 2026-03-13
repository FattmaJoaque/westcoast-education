import { getAllCourses, addCourse, deleteCourse, getAllTeachers, getAllBookings } from './api.js';
import { showMessage } from './ui.js';
import { getCurrentUser } from './auth.js';

// ==================== ADMIN-FUNKTIONER ====================

function isAdmin() {
    const user = getCurrentUser();
    return user && (user.id === 1 || user.id === "1");
}

export async function initAdminPage() {
    if (!isAdmin()) {
        showMessage('You do not have permission to access the admin page', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    await loadTeachersForSelect();
    await loadAdminCourseList();
    await loadBookingsOverview();
    await loadTeachersList();

    setupTabs();
    setupAddCourseForm();
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

async function loadTeachersForSelect() {
    const teacherSelect = document.getElementById('teacherId');
    if (!teacherSelect) return;

    const teachers = await getAllTeachers();

    if (teachers && teachers.length > 0) {
        teacherSelect.innerHTML = teachers.map(teacher =>
            `<option value="${teacher.id}">${teacher.name}</option>`
        ).join('');
    }
}

async function loadAdminCourseList() {
    const container = document.getElementById('admin-course-list');
    if (!container) return;

    const courses = await getAllCourses();

    if (!courses || courses.length === 0) {
        container.innerHTML = '<p>No courses found</p>';
        return;
    }

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Course Number</th>
                    <th>Days</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${courses.map(course => `
                    <tr>
                        <td>${course.id}</td>
                        <td>${course.title}</td>
                        <td>${course.courseNumber}</td>
                        <td>${course.days}</td>
                        <td>${course.price} SEK</td>
                        <td>${course.type}</td>
                        <td>
                            <button class="btn-delete" onclick="deleteCourseHandler(${course.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    window.deleteCourseHandler = async (id) => {
        if (confirm('Are you sure you want to delete this course?')) {
            const success = await deleteCourse(id);
            if (success) {
                showMessage('Course deleted!', 'success');
                await loadAdminCourseList();
            } else {
                showMessage('Could not delete course', 'error');
            }
        }
    };
}

function setupAddCourseForm() {
    const form = document.getElementById('add-course-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datesValue = document.getElementById('dates').value;
        const dates = datesValue
            ? datesValue.split(',').map(d => d.trim()).filter(d => d)
            : [];

        const courseData = {
            title: document.getElementById('title').value,
            courseNumber: document.getElementById('courseNumber').value,
            days: parseInt(document.getElementById('days').value),
            price: parseInt(document.getElementById('price').value),
            type: document.getElementById('type').value,
            teacherId: parseInt(document.getElementById('teacherId').value),
            category: document.getElementById('category').value,
            level: document.getElementById('level').value,
            description: document.getElementById('description').value,
            dates: dates,
            rating: 0,
            image: 'placeholder.jpg'
        };

        const newCourse = await addCourse(courseData);

        if (newCourse) {
            showMessage('Course added!', 'success');
            form.reset();
            await loadAdminCourseList();
        } else {
            showMessage('Could not add course', 'error');
        }
    });
}


async function loadBookingsOverview() {
    const container = document.getElementById('bookings-per-course');
    if (!container) return;

    const bookings = await getAllBookings();
    const courses = await getAllCourses();

    if (!bookings || !courses) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }

    const bookingsPerCourse = courses.map(course => {
        const courseBookings = bookings.filter(b => b.courseId === course.id);
        return { course, bookings: courseBookings };
    }).filter(item => item.bookings.length > 0);

    if (bookingsPerCourse.length === 0) {
        container.innerHTML = '<p>No bookings yet</p>';
        return;
    }

    container.innerHTML = bookingsPerCourse.map(item => `
        <div class="booking-overview-card">
            <h3>${item.course.title}</h3>
            <p><strong>Course number:</strong> ${item.course.courseNumber}</p>
            <p><strong>Total bookings:</strong> ${item.bookings.length}</p>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${item.bookings.map(b => `
                        <tr>
                            <td>${b.name}</td>
                            <td>${b.email}</td>
                            <td>${b.selectedDate || b.bookingDate}</td>
                            <td>${b.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('');
}


async function loadTeachersList() {
    const container = document.getElementById('teachers-list');
    if (!container) return;

    const teachers = await getAllTeachers();

    if (!teachers || teachers.length === 0) {
        container.innerHTML = '<p>No teachers found</p>';
        return;
    }

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialty</th>
                </tr>
            </thead>
            <tbody>
                ${teachers.map(teacher => `
                    <tr>
                        <td>${teacher.id}</td>
                        <td>${teacher.name}</td>
                        <td>${teacher.email}</td>
                        <td>${teacher.specialty || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}