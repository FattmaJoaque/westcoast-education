import { API_ENDPOINTS } from '../config/constants.js';

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function sendData(url, method, data) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`${method} error:`, error);
        return null;
    }
}

// ==================== COURSES ====================


export async function getAllCourses() {
    return await fetchData(API_ENDPOINTS.COURSES);
}


export async function getCourseById(id) {
    return await fetchData(`${API_ENDPOINTS.COURSES}/${id}`);
}


export async function getCoursesWithFilters(queryString) {
    return await fetchData(`${API_ENDPOINTS.COURSES}${queryString}`);
}


export async function addCourse(courseData) {
    return await sendData(API_ENDPOINTS.COURSES, 'POST', courseData);
}

export async function updateCourse(id, courseData) {
    return await sendData(`${API_ENDPOINTS.COURSES}/${id}`, 'PUT', courseData);
}


export async function deleteCourse(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.COURSES}/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
}


export async function getPopularCourses(limit = 4) {
    const courses = await getAllCourses();
    if (!courses) return [];

    return courses
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// ==================== TEACHERS ====================

export async function getAllTeachers() {
    return await fetchData(API_ENDPOINTS.TEACHERS);
}

export async function getTeacherById(id) {
    return await fetchData(`${API_ENDPOINTS.TEACHERS}/${id}`);
}


export async function getTeachersWithCourses() {
    return await fetchData(`${API_ENDPOINTS.TEACHERS}?_embed=courses`);
}

// ==================== USERS  ====================

export async function getAllUsers() {
    return await fetchData(API_ENDPOINTS.USERS);
}


export async function getUserById(id) {
    return await fetchData(`${API_ENDPOINTS.USERS}/${id}`);
}


export async function getUserByEmail(email) {
    return await fetchData(`${API_ENDPOINTS.USERS}?email=${email}`);
}

export async function createUser(userData) {
    return await sendData(API_ENDPOINTS.USERS, 'POST', userData);
}

export async function updateUser(id, userData) {
    return await sendData(`${API_ENDPOINTS.USERS}/${id}`, 'PATCH', userData);
}

// ==================== BOOKINGS ====================

export async function getAllBookings() {
    return await fetchData(API_ENDPOINTS.BOOKINGS);
}

export async function getBookingsByUser(userId) {
    return await fetchData(`${API_ENDPOINTS.BOOKINGS}?userId=${userId}`);
}

export async function getBookingsByCourse(courseId) {
    return await fetchData(`${API_ENDPOINTS.BOOKINGS}?courseId=${courseId}`);
}

export async function createBooking(bookingData) {
   
    const fullBookingData = {
        ...bookingData,
        bookingDate: new Date().toISOString().split('T')[0], 
        status: 'confirmed'
    };
    
    return await sendData(API_ENDPOINTS.BOOKINGS, 'POST', fullBookingData);
}


export async function updateBookingStatus(id, status) {
    return await sendData(`${API_ENDPOINTS.BOOKINGS}/${id}`, 'PATCH', { status });
}

// ==================== REVIEWS ====================


export async function getReviewsByCourse(courseId) {
    return await fetchData(`${API_ENDPOINTS.REVIEWS}?courseId=${courseId}`);
}


export async function addReview(reviewData) {
    const fullReviewData = {
        ...reviewData,
        date: new Date().toISOString().split('T')[0]
    };
    return await sendData(API_ENDPOINTS.REVIEWS, 'POST', fullReviewData);
}