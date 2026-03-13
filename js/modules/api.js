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

// Hämta alla kurser
export async function getAllCourses() {
    return await fetchData(API_ENDPOINTS.COURSES);
}

// Hämta en specifik kurs med ID
export async function getCourseById(id) {
    return await fetchData(`${API_ENDPOINTS.COURSES}/${id}`);
}

// Hämta kurser med filter (t.ex. ?type=classroom&category=programming)
export async function getCoursesWithFilters(queryString) {
    return await fetchData(`${API_ENDPOINTS.COURSES}${queryString}`);
}

// Lägg till ny kurs (används av admin)
export async function addCourse(courseData) {
    return await sendData(API_ENDPOINTS.COURSES, 'POST', courseData);
}

// Uppdatera en kurs
export async function updateCourse(id, courseData) {
    return await sendData(`${API_ENDPOINTS.COURSES}/${id}`, 'PUT', courseData);
}

// Ta bort en kurs
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

// Hämta populära kurser (baserat på betyg)
export async function getPopularCourses(limit = 4) {
    const courses = await getAllCourses();
    if (!courses) return [];
    
    // Sortera efter rating (högst först) och begränsa antalet
    return courses
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// ==================== TEACHERS ====================

// Hämta alla lärare
export async function getAllTeachers() {
    return await fetchData(API_ENDPOINTS.TEACHERS);
}

// Hämta en lärare med ID
export async function getTeacherById(id) {
    return await fetchData(`${API_ENDPOINTS.TEACHERS}/${id}`);
}

// Hämta lärare med kurser (använder _embed för att få med relaterade kurser)
export async function getTeachersWithCourses() {
    return await fetchData(`${API_ENDPOINTS.TEACHERS}?_embed=courses`);
}

// ==================== USERS  ====================

// Hämta alla användare
export async function getAllUsers() {
    return await fetchData(API_ENDPOINTS.USERS);
}

// Hämta en användare med ID
export async function getUserById(id) {
    return await fetchData(`${API_ENDPOINTS.USERS}/${id}`);
}

// Hämta användare via e-post (för inloggning)
export async function getUserByEmail(email) {
    return await fetchData(`${API_ENDPOINTS.USERS}?email=${email}`);
}

// Skapa ny användare (registrering)
export async function createUser(userData) {
    return await sendData(API_ENDPOINTS.USERS, 'POST', userData);
}

// Uppdatera användare
export async function updateUser(id, userData) {
    return await sendData(`${API_ENDPOINTS.USERS}/${id}`, 'PATCH', userData);
}

// ==================== BOOKINGS ====================

// Hämta alla bokningar
export async function getAllBookings() {
    return await fetchData(API_ENDPOINTS.BOOKINGS);
}

// Hämta bokningar för en specifik användare
export async function getBookingsByUser(userId) {
    return await fetchData(`${API_ENDPOINTS.BOOKINGS}?userId=${userId}`);
}

// Hämta bokningar för en specifik kurs
export async function getBookingsByCourse(courseId) {
    return await fetchData(`${API_ENDPOINTS.BOOKINGS}?courseId=${courseId}`);
}

// Skapa ny bokning
export async function createBooking(bookingData) {
    // Lägg till datum för bokningen
    const fullBookingData = {
        ...bookingData,
        bookingDate: new Date().toISOString().split('T')[0], 
        status: 'confirmed'
    };
    
    return await sendData(API_ENDPOINTS.BOOKINGS, 'POST', fullBookingData);
}

// Uppdatera bokningsstatus (t.ex. vid avbokning)
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