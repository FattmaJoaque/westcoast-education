export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
    COURSES: `${API_BASE_URL}/courses`,
    TEACHERS: `${API_BASE_URL}/teachers`,
    USERS: `${API_BASE_URL}/users`,
    BOOKINGS: `${API_BASE_URL}/bookings`,
    REVIEWS: `${API_BASE_URL}/reviews`,
    CATEGORIES: `${API_BASE_URL}/categories`
};


export const MESSAGES = {
    LOGIN_SUCCESS: 'Login successful! Welcome back.',
    LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
    REGISTER_SUCCESS: 'Registration successful! You can now log in.',
    REGISTER_FAILED: 'Registration failed. Please try again.',
    BOOKING_SUCCESS: 'Booking successful! Confirmation sent via email.',
    BOOKING_FAILED: 'Booking failed. Please try again.',
    COURSE_ADDED: 'Course added!',
    COURSE_UPDATED: 'Course updated!',
    COURSE_DELETED: 'Course deleted!'
};