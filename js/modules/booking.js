import { createBooking, getCourseById, updateUser } from './api.js';
import { showMessage } from './ui.js';
import { getCurrentUser } from './auth.js';
import { MESSAGES } from '../config/constants.js';
import { isValidEmail, formatDate } from './utils.js';

// ==================== BOKNINGSSYSTEM ====================


export async function initBookingPage() {
    const user = getCurrentUser();
    
    // Kontrollera om användaren är inloggad
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Hämta vald kurs från sessionStorage
    const selectedCourseJson = sessionStorage.getItem('selectedCourse');
    if (!selectedCourseJson) {
        showMessage('Ingen kurs vald', 'error');
        window.location.href = 'courses.html';
        return;
    }
    
    const course = JSON.parse(selectedCourseJson);
    
    // Visa kursinformation
    displayBookingSummary(course);
    
    // Fyll i användarens uppgifter i formuläret
    fillUserData(user);
    
    // Fyll i datumval
    populateDateSelect(course.dates);
    
    // Sätt upp formulärhantering
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
        
        // Hämta formulärdata
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
        
        // Validera formulär
        const errors = validateBookingForm(formData);
        
        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return;
        }
        
        // Skapa bokningen
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
        // Skapa bokningen i API:et
        const booking = await createBooking(bookingData);
        
        if (booking) {
            // Uppdatera användarens bokade kurser
            const user = getCurrentUser();
            const updatedUser = {
                ...user,
                bookedCourses: [...(user.bookedCourses || []), course.id]
            };
            
            await updateUser(user.id, { 
                bookedCourses: updatedUser.bookedCourses 
            });
            
            // Uppdatera currentUser
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Visa succémeddelande
            showMessage(MESSAGES.BOOKING_SUCCESS, 'success');
            
            
            // Rensa sessionStorage för kurs
            sessionStorage.removeItem('selectedCourse');
            
            // Omdirigera till profilsidan efter 3 sekunder
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage(MESSAGES.BOOKING_FAILED, 'error');
    }
}