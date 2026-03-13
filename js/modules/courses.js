import { getAllCourses, getCourseById, getCoursesWithFilters, getTeacherById } from './api.js';
import { renderCourseList, showMessage, showLoading } from './ui.js';
import { getCurrentUser } from './auth.js';
import { formatDate } from './utils.js';

function formatCourseType(type) {
    const types = {
        'classroom': 'Classroom',
        'distance':  'Distance',
        'hybrid':    'Hybrid'
    };
    return types[type] || type;
}

// ==================== KURSVISNING ====================
export async function displayAllCourses(containerId = 'course-list') {
    showLoading(containerId, true);
    
    const courses = await getAllCourses();
    
    if (courses && courses.length > 0) {
        renderCourseList(courses, containerId);
    } else {
        showMessage('No courses available', 'info', containerId);
    }
    
    showLoading(containerId, false);
}

export async function displayFilteredCourses(filters, containerId = 'course-list') {
    showLoading(containerId, true);
    
    
    let queryString = '?';
    
    if (filters.category && filters.category !== 'all') {
        queryString += `category=${filters.category}&`;
    }
    
    if (filters.type && filters.type !== 'all') {
        queryString += `type=${filters.type}&`;
    }
    
    if (filters.search) {
        queryString += `q=${filters.search}&`;
    }
    
   
    queryString = queryString.replace(/&$/, '');
    
    const courses = queryString.length > 1 
        ? await getCoursesWithFilters(queryString)
        : await getAllCourses();
    
  
    if (filters.sortBy && courses) {
        courses.sort((a, b) => {
            if (filters.sortBy === 'price') {
                return a.price - b.price;
            } else if (filters.sortBy === 'rating') {
                return b.rating - a.rating;
            } else {
                return a.title.localeCompare(b.title);
            }
        });
    }
    
    if (courses && courses.length > 0) {
        renderCourseList(courses, containerId);
    } else {
        showMessage('No courses found matching your criteria', 'info', containerId);
    }
    
    showLoading(containerId, false);
}

export async function displayCourseDetails(courseId) {
    const container = document.getElementById('course-details');
    if (!container) return;
    
    showLoading('course-details', true);
    
    const course = await getCourseById(courseId);
    
    if (!course) {
        container.innerHTML = '<p class="error">Course not</p>';
        showLoading('course-details', false);
        return;
    }
    
   
    const teacher = course.teacherId ? await getTeacherById(course.teacherId) : null;
    
   
    container.innerHTML = `
        <div class="course-detail-card">
            <div class="course-header">
                <h1>${course.title}</h1>
                <p class="course-number">Course number: ${course.courseNumber}</p>
            </div>
            
            <div class="course-image">
                <img src="images/${course.image}" alt="${course.title}" onerror="this.src='images/placeholder.jpg'">
            </div>
            
            <div class="course-info">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Duration:</strong> ${course.days} days
                    </div>
                    <div class="info-item">
                        <strong>Price:</strong> ${course.price} SEK
                    </div>
                    <div class="info-item">
                        <strong>Rating:</strong> ⭐ ${course.rating}/5
                    </div>
                    <div class="info-item">
                        <strong>Type:</strong> ${formatCourseType(course.type)}
                    </div>
                    <div class="info-item">
                        <strong>Category:</strong> ${course.category || 'Unknown'}
                    </div>
                    <div class="info-item">
                        <strong>Level:</strong> ${course.level || 'All levels'}
                    </div>
                </div>
                
                ${teacher ? `
                <div class="teacher-info">
                    <h3>Teacher: ${teacher.name}</h3>
                    <p>${teacher.bio || ''}</p>
                </div>
                ` : ''}
                
                <div class="course-description">
                    <h3>Description</h3>
                    <p>${course.description}</p>
                </div>
                
                ${course.prerequisites ? `
                <div class="course-prerequisites">
                    <h3>Prerequisites</h3>
                    <p>${course.prerequisites}</p>
                </div>
                ` : ''}
                
                ${course.includes ? `
                <div class="course-includes">
                    <h3>Course includes</h3>
                    <ul>
                        ${course.includes.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    
    const dateContainer = document.getElementById('date-selection');
    if (dateContainer && course.dates && course.dates.length > 0) {
        dateContainer.innerHTML = `
            <label for="course-date">Choose date:</label>
            <select id="course-date" class="date-select">
                ${course.dates.map(date => `<option value="${date}">${formatDate(date)}</option>`).join('')}
            </select>
        `;
    }
    
   
    const bookBtn = document.getElementById('book-course-btn');
    if (bookBtn) {
        bookBtn.onclick = () => redirectToBooking(course);
    }
    
    showLoading('course-details', false);
}

function redirectToBooking(course) {
    const user = getCurrentUser();
    
    if (!user) {
        showMessage('Du måste vara inloggad för att boka kurser', 'info');
        
        
        sessionStorage.setItem('redirectAfterLogin', 'booking.html');
        sessionStorage.setItem('selectedCourse', JSON.stringify(course));
        
        window.location.href = 'login.html';
        return;
    }
    
    sessionStorage.setItem('selectedCourse', JSON.stringify(course));
    
   
    window.location.href = 'booking.html';
}
