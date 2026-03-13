import { createBooking, getCourseById, updateUser } from './api.js';
import { showMessage } from './ui.js';
import { getCurrentUser } from './auth.js';
import { MESSAGES } from '../config/constants.js';
import { isValidEmail, formatDate } from './utils.js';

// ==================== BOKNINGSSYSTEM ====================


export async function initBookingPage() {
    const user = getCurrentUser();
    
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    
    const selectedCourseJson = sessionStorage.getItem('selectedCourse');
    if (!selectedCourseJson) {
        showMessage('Ingen kurs vald', 'error');
        window.location.href = 'courses.html';
        return;
    }
    
    const course = JSON.parse(selectedCourseJson);
    
   
    displayBookingSummary(course);
    
    
    fillUserData(user);
    
   
    populateDateSelect(course.dates);
    
   
    setupBookingForm(course);
}
function displayBookingSummary(course) {
    const container = document.getElementById('booking-course-summary');
    if (!container) return;
    
    container.innerHTML = `
        <div class="booking-summary-card">
            <h3>${course.title}</h3>
            <p><strong>Course number:</strong> ${course.courseNumber}</p>
            <p><strong>Duration:</strong> ${course.days} days</p>
            <p><strong>Price:</strong> ${course.price} SEK</p>
            <p><strong>Description:</strong> ${course.description}</p>
        </div>
    `;
}

function fillUserData(user) {
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const addressField = document.getElementById('address');
    const phoneField = document.getElementById('phone');
    
    if (nameField) nameField.value = user.name || '';
    if (emailField) emailField.value = user.email || '';
    if (addressField) addressField.value = user.address || '';
    if (phoneField) phoneField.value = user.phone || '';
}

function populateDateSelect(dates) {
    const dateSelect = document.getElementById('selected-date');
    if (!dateSelect || !dates) return;
    
    dateSelect.innerHTML = dates.map(date => 
        `<option value="${date}">${formatDate(date)}</option>`
    ).join('');
}

function setupBookingForm(course) {
    const form = document.getElementById('booking-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = getCurrentUser();
        if (!user) {
            showMessage('Du måste vara inloggad', 'error');
            return;
        }
        
        const formData = {
            userId: user.id,
            courseId: course.id,
            type: document.getElementById('booking-type').value,
            selectedDate: document.getElementById('selected-date').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            amount: course.price
        };
        
       
        const errors = validateBookingForm(formData);
        
        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return;
        }
        
        
        await processBooking(formData, course);
    });
}

function validateBookingForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.length < 2) {
        errors.push('Namn måste anges');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Ogiltig e-postadress');
    }
    
    if (!formData.address || formData.address.length < 5) {
        errors.push('Adress måste anges');
    }
    
    if (!formData.phone || formData.phone.length < 8) {
        errors.push('Telefonnummer måste anges');
    }
    
    return errors;
}

async function processBooking(bookingData, course) {
    showMessage('Bearbetar bokning...', 'info');
    
    try {
       
        const booking = await createBooking(bookingData);
        
        if (booking) {
         
            const user = getCurrentUser();
            const updatedUser = {
                ...user,
                bookedCourses: [...(user.bookedCourses || []), course.id]
            };
            
            await updateUser(user.id, { 
                bookedCourses: updatedUser.bookedCourses 
            });
            
            
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            showMessage(MESSAGES.BOOKING_SUCCESS, 'success');
            
            
            
            sessionStorage.removeItem('selectedCourse');
            
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage(MESSAGES.BOOKING_FAILED, 'error');
    }
}