// script.js
// All JS scripts from HTML files are combined here.

/* =====================
   LOGIN PAGE SCRIPT
   (from index.html)
====================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAYwzAJ45Lng5RvurB-LCqY0AUJLsmyvkM",
  authDomain: "f5-softdev.firebaseapp.com",
  projectId: "f5-softdev",
  storageBucket: "f5-softdev.firebasestorage.app",
  messagingSenderId: "160262184429",
  appId: "1:160262184429:web:be4a8c6165510892965be4",
  measurementId: "G-RDKKY98HWY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login Validation
const loginForm = document.getElementById("loginForm");
const errorLoginEmail = document.getElementById("error-login-email");
const errorLoginPassword = document.getElementById("error-login-password");

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    return { isValid: false, message: "Email cannot be blank" };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true, message: "" };
}
function setError(element, message) {
  element.innerHTML = `<span style='color:#d32f2f;font-size:16px;'>${message}</span>`;
  element.previousElementSibling.style.border = "2px solid #d32f2f";
}
function clearError(element) {
  element.innerHTML = "";
  element.previousElementSibling.style.border = "";
}

// Function to check if email exists
async function checkEmailExists(email) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    // Don't return false on error, let the login attempt proceed
    return true;
  }
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // First validate email format
  let valid = true;
  if (!email) {
    setError(errorLoginEmail, "Email can't be blank");
    valid = false;
  } else if (!validateEmail(email).isValid) {
    setError(errorLoginEmail, "Invalid email format");
    valid = false;
  } else {
    clearError(errorLoginEmail);
  }
  if (!valid) return;

  try {
    // Validate password
    if (!password) {
      setError(errorLoginPassword, "Password can't be blank");
      return;
    } else {
      clearError(errorLoginPassword);
    }
    // Authenticate
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get Firestore role
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.role === "admin") {
        window.location.href = "admin.html";
      } else if (userData.role === "user") {
        window.location.href = "user.html";
      } else {
        alert("⚠️ Unknown role. Contact support.");
      }
    } else {
      alert("⚠️ No user profile found. Contact admin.");
    }
  } catch (error) {
    clearError(errorLoginEmail);
    clearError(errorLoginPassword);
    console.log('Firebase auth error:', error.code); // For debugging

    switch(error.code) {
      case "auth/user-not-found":
        setError(errorLoginEmail, "Account not found. Please check your email or sign up.");
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":  // Firebase 9+ uses this for wrong password
        setError(errorLoginPassword, "Incorrect password. Please try again.");
        break;
      case "auth/invalid-email":
        setError(errorLoginEmail, "Invalid email format.");
        break;
      case "auth/too-many-requests":
        setError(errorLoginPassword, "Too many failed attempts. Please try again later.");
        break;
      case "auth/network-request-failed":
        setError(errorLoginEmail, "Network error. Please check your connection.");
        break;
      case "auth/user-disabled":
        setError(errorLoginEmail, "This account has been disabled. Please contact support.");
        break;
      default:
        // Log the exact error for debugging
        console.error('Unhandled Firebase error:', error);
        setError(errorLoginEmail, "Login failed. Please try again.");
    }
  }
});

/* =====================
   SIGNUP PAGE SCRIPT
   (from signup.html)
====================== */
// ...signup imports consolidated at the top (createUserWithEmailAndPassword, updateProfile, setDoc)

const signupForm = document.getElementById("signupForm");
const errorUsername = document.getElementById("error-username");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
const errorConfirm = document.getElementById("error-confirm");
const errorContact = document.getElementById("error-contact");
const errorAddress = document.getElementById("error-address");

function validatePasswordSignup(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)
  };

  const messages = [];
  if (!requirements.length) messages.push("at least 8 characters");
  if (!requirements.uppercase) messages.push("an uppercase letter");
  if (!requirements.lowercase) messages.push("a lowercase letter");
  if (!requirements.number) messages.push("a number");
  if (!requirements.special) messages.push("a special character");

  return {
    isValid: Object.values(requirements).every(Boolean),
    requirements,
    message: messages.length ? `Password must contain ${messages.join(", ")}` : "",
    strength: Object.values(requirements).filter(Boolean).length
  };
}
function validateContactSignup(contact) {
  // Philippine mobile: must be 11 digits, start with '09', and all numbers
  return /^09\d{9}$/.test(contact);
}
function setErrorSignup(element, message) {
  element.innerHTML = `<span style='color:#d32f2f;font-size:16px;'>${message}</span>`;
  element.previousElementSibling.style.border = "2px solid #d32f2f";
}
function clearErrorSignup(element) {
  element.innerHTML = "";
  element.previousElementSibling.style.border = "";
}
function setSuccessSignup(element) {
  element.innerHTML = "";
  element.previousElementSibling.style.border = "2px solid #388e3c";
}

// Clear error message when typing
document.getElementById("signup-email")?.addEventListener("input", function(e) {
  clearErrorSignup(errorEmail);
});

document.getElementById("signup-password")?.addEventListener("input", function(e) {
  // Clear any existing error message
  clearErrorSignup(errorPassword);
  
  const strengthIndicator = document.getElementById("password-strength-text");
  
  if (e.target.value.length > 0) {
    // Show and update the password strength indicator
    if (strengthIndicator) {
      strengthIndicator.style.display = "inline";
      const result = validatePasswordSignup(e.target.value);
      updatePasswordStrength(result.strength);
    }
  } else {
    // Hide the indicator when input is empty
    if (strengthIndicator) {
      strengthIndicator.style.display = "none";
    }
  }
});

function updatePasswordStrength(strength) {
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"][strength - 1] || "...";
  const strengthColor = ["#ff4444", "#ffbb33", "#00C851", "#33b5e5", "#2BBBAD"][strength - 1] || "#000";
  
  const strengthIndicator = document.getElementById("password-strength-text");
  if (strengthIndicator) {
    strengthIndicator.textContent = `(Password Strength: ${strengthText})`;
    strengthIndicator.style.color = strengthColor;
  }
}

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm").value;
  const username = document.getElementById("signup-username").value.trim();
  const contact = document.getElementById("signup-contact").value.trim();
  const address = document.getElementById("signup-address").value.trim();

  // Reset all previous errors
  [errorUsername, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress]
    .forEach(clearErrorSignup);

  let valid = true;

  // Username validation
  if (!username) {
    setErrorSignup(errorUsername, "Username can't be blank");
    valid = false;
  } else if (username.length < 3) {
    setErrorSignup(errorUsername, "Username must be at least 3 characters");
    valid = false;
  } else {
    setSuccessSignup(errorUsername);
  }

  // Email validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    setErrorSignup(errorEmail, emailValidation.message);
    valid = false;
  } else {
    setSuccessSignup(errorEmail);
  }

  // Password validation
  const passwordValidation = validatePasswordSignup(password);
  if (!passwordValidation.isValid) {
    setErrorSignup(errorPassword, passwordValidation.message);
    valid = false;
  } else {
    setSuccessSignup(errorPassword);
  }

  // Confirm Password
  if (!confirmPassword) {
    setErrorSignup(errorConfirm, "Please confirm your password");
    valid = false;
  } else if (password !== confirmPassword) {
    setErrorSignup(errorConfirm, "Passwords do not match");
    valid = false;
  } else {
    setSuccessSignup(errorConfirm);
  }

  // Contact validation
  if (!contact) {
    setErrorSignup(errorContact, "Contact can't be blank");
    valid = false;
  } else if (!/^\d+$/.test(contact)) {
    setErrorSignup(errorContact, "Contact number must contain only numbers");
    valid = false;
  } else if (!/^09\d{9}$/.test(contact)) {
    setErrorSignup(errorContact, "Contact number must be 11 digits and start with '09'");
    valid = false;
  } else {
    setSuccessSignup(errorContact);
  }

  // Address validation with sanitization
  const sanitizedAddress = address.replace(/<[^>]*>/g, ''); // Basic XSS prevention
  if (!sanitizedAddress) {
    setErrorSignup(errorAddress, "Address can't be blank");
    valid = false;
  } else if (sanitizedAddress !== address) {
    setErrorSignup(errorAddress, "Address contains invalid characters");
    valid = false;
  } else {
    setSuccessSignup(errorAddress);
  }

  if (!valid) return;

  // Clear all errors before Firebase
  [errorUsername, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress].forEach(clearErrorSignup);

  try {
    // Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: username });

    // Save extra info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      contact: contact,
      address: address,
      role: "user", // default role
      createdAt: new Date()
    });

    showAlert("Account created successfully!", true, () => {
      window.location.href = "user.html"; // back to login
    });
  } catch (error) {
    // Handle specific Firebase Auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        setErrorSignup(errorEmail, "This email is already registered. Please login or use a different email.");
        break;
      case 'auth/invalid-email':
        setErrorSignup(errorEmail, "Invalid email format. Please check your email.");
        break;
      case 'auth/operation-not-allowed':
        setErrorSignup(errorEmail, "Email/password accounts are not enabled. Please contact support.");
        break;
      case 'auth/weak-password':
        setErrorSignup(errorPassword, "Password is too weak. Please choose a stronger password.");
        break;
      case 'auth/network-request-failed':
        showAlert("Network error. Please check your internet connection and try again.");
        break;
      default:
        // Log error for debugging but show generic message to user
        console.error('Signup error:', error);
        showAlert("An error occurred during signup. Please try again later.");
    }
  }
});


// --- JS from user.html & admin.html ---
// Logout logic for both user and admin pages
// Custom Alert Functions
function showAlert(message, isSuccess = false, callback = null) {
  const alertBox = document.getElementById('customAlert');
  const overlay = document.getElementById('overlay');
  const alertMessage = document.getElementById('alertMessage');

  if (isSuccess) {
    alertBox.classList.add('success');
  } else {
    alertBox.classList.remove('success');
  }

  alertMessage.textContent = message;
  overlay.style.display = 'block';
  alertBox.style.display = 'block';

  // Store callback if provided
  if (callback) {
    alertBox.setAttribute('data-callback', 'true');
    window.alertCallback = callback;
  } else {
    alertBox.removeAttribute('data-callback');
    window.alertCallback = null;
  }
}

function closeAlert() {
  const alertBox = document.getElementById('customAlert');
  const overlay = document.getElementById('overlay');
  
  alertBox.style.display = 'none';
  overlay.style.display = 'none';

  // Execute callback if exists
  if (alertBox.hasAttribute('data-callback') && window.alertCallback) {
    window.alertCallback();
    window.alertCallback = null;
  }
}

// Make closeAlert available globally
window.closeAlert = closeAlert;

/* =====================
   PAGE PROTECTION & GLOBAL LOGOUT
   Used by: user.html, admin.html
   - onAuthStateChanged prevents access to protected pages when not authenticated
   - window.logout signs the current user out and redirects to login
====================== */
// Protect specific pages by pathname
const protectedPaths = ["/user.html", "/admin.html", "user.html", "admin.html"];
if (protectedPaths.some(p => window.location.pathname.endsWith(p))) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Not signed in -> go to login
      window.location.href = "index.html";
    }
  });
}

// Make a global logout function available to all pages
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  }).catch((err) => {
    console.error('Logout failed:', err);
    // Fallback: still redirect to login
    window.location.href = "index.html";
  });
};

/* ==========================================================================
   USER PROFILE PAGE SCRIPT (for user.html)
   - This block will run only on the user profile page.
   - It waits for Firebase to confirm a user is logged in.
   - It then fetches the user's details from the Firestore 'users' collection.
   - Finally, it populates the HTML elements with that data.
========================================================================== */

// This function fetches data and updates the profile page elements
async function fetchAndDisplayUserData(user) {
    // Get references to the HTML elements that will display the user's info.
    // Make sure your HTML has these IDs.
    const profileNameEl = document.querySelector('.profile-name');
    const infoFullNameEl = document.getElementById('infoFullName');
    const infoContactNumberEl = document.getElementById('infoContactNumber');
    const infoEmailEl = document.getElementById('infoEmail');
    const infoAddressEl = document.getElementById('infoAddress');

    // A quick check to make sure the elements exist on the page before we try to use them.
    if (!profileNameEl || !infoFullNameEl) {
        console.log("Profile elements not found on this page, skipping data population.");
        return;
    }

    try {
        // Create a reference to the user's specific document in Firestore using their UID
        const docRef = doc(db, "users", user.uid);
        // Fetch the document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();

            // Populate the HTML elements with the data from Firestore
            profileNameEl.textContent = userData.username || "User Profile";
            infoFullNameEl.textContent = userData.username || "Not Available";
            infoContactNumberEl.textContent = userData.contact || "Not Available";
            infoEmailEl.textContent = userData.email || "Not Available";
            infoAddressEl.textContent = userData.address || "Not Available";
            
        } else {
            // This case is unlikely if your signup process is working correctly
            console.warn("No user profile document found in Firestore!");
            // Fallback to display info from the Auth object itself
            profileNameEl.textContent = user.displayName || "User Profile";
            infoFullNameEl.textContent = user.displayName || "Not Available";
            infoEmailEl.textContent = user.email || "Not Available";
            infoContactNumberEl.textContent = "Data Not Found";
            infoAddressEl.textContent = "Data Not Found";
        }
    } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        // Use your existing showAlert function to notify the user of the error
        showAlert("Failed to load your profile information. Please refresh the page.");
    }
}

// Check if the current page is 'user.html' before running the profile logic.
// This prevents errors on other pages like index.html or signup.html.
if (window.location.pathname.endsWith('user.html') || window.location.pathname.endsWith('/user')) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // If a user is logged in, call the function to fetch and display their data.
            fetchAndDisplayUserData(user);
        }
        // If no user is logged in, your existing 'PAGE PROTECTION' script will
        // automatically handle redirecting them to the login page.
    });
}

/* --- ABOUT PAGE SCRIPT --- */
// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const offset = 100; // Show elements slightly before they enter viewport
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= 0 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth
    );
}

// Function to add fade-in animation to elements when they become visible
function handleScrollAnimation() {
    const sections = document.querySelectorAll('.history-section, .mission-vision-section, .officials-section');
    const missionVisionBoxes = document.querySelectorAll('.mission-box, .vision-box');
    
    sections.forEach(section => {
        if (isInViewport(section) && !section.classList.contains('animate')) {
            section.classList.add('animate');
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });

    // Special animation for mission and vision boxes
    missionVisionBoxes.forEach(box => {
        if (isInViewport(box) && !box.classList.contains('animate')) {
            box.classList.add('animate');
            box.style.opacity = '1';
            box.style.transform = 'scale(1)';
        }
    });
}

// Throttle function to limit how often the scroll handler fires
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize the animations if we're on the about page
if (window.location.pathname.endsWith('about.html') || window.location.pathname.endsWith('/about')) {
    // Set initial styles
    const sections = document.querySelectorAll('.history-section, .mission-vision-section, .officials-section');
    const missionVisionBoxes = document.querySelectorAll('.mission-box, .vision-box');

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    });

    missionVisionBoxes.forEach(box => {
        box.style.opacity = '0';
        box.style.transform = 'scale(0.95)';
        box.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    });

    // Add scroll event listener with throttling
    window.addEventListener('scroll', throttle(handleScrollAnimation, 100));
    // Run once on page load
    setTimeout(handleScrollAnimation, 100);
}


/* =====================================================
   CONFERENCE ROOM CALENDAR SCRIPT
   Add this section to your script.js file
   NOTE: This must be added AFTER your Firebase imports
===================================================== */

// Check if we're on the conference room calendar page
if (window.location.pathname.endsWith('conference-room.html') || window.location.pathname.endsWith('/conference-room')) {
  
  // TODO: In production, fetch booked dates from Firebase
  // Example of how to fetch booked dates:
  /*
  async function getBookedDates() {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("type", "==", "conference-room"),
      where("status", "in", ["pending", "approved"])
    );
    const querySnapshot = await getDocs(q);
    const booked = {};
    querySnapshot.forEach(doc => {
      const data = doc.data();
      booked[data.date] = data.status;
    });
    return booked;
  }
  */
  const bookedDates = {};  // Empty for now, will be populated from Firebase

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize calendar on page load
  document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);
    setupEventListeners();
  });

  function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Update month/year display
    document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('calendar-date', 'empty');
      calendarDates.appendChild(emptyCell);
    }

    // Add date cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = document.createElement('div');
      dateCell.classList.add('calendar-date');
      
      const dateNumber = document.createElement('div');
      dateNumber.classList.add('date-number');
      dateNumber.textContent = day;
      dateCell.appendChild(dateNumber);

      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellDate = new Date(year, month, day);
      
      // Check if date is in the past
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Check if it's today
      if (cellDate.toDateString() === today.toDateString()) {
        dateCell.classList.add('today');
      }
      
      // Check if date is booked
      if (bookedDates[currentDateStr]) {
        dateCell.classList.add('booked');
        const label = document.createElement('div');
        label.classList.add('booking-label');
        label.textContent = 'Booked';
        dateCell.appendChild(label);
      } else if (isPast) {
        dateCell.classList.add('past');
      } else {
        dateCell.classList.add('available');
        dateCell.addEventListener('click', () => openBookingModal(currentDateStr));
      }

      calendarDates.appendChild(dateCell);
    }
  }

  function setupEventListeners() {
    // Previous month button (now in Today controls)
    document.getElementById('prevMonth').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });

    // Next month button (now in Today controls)
    document.getElementById('nextMonth').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });

    // Form submission - now redirects to conference-room-request.html
    // (Modal functionality removed)
  }

  function openBookingModal(dateStr) {
    // Redirect to request form page with date parameter
    window.location.href = `conference-room-request.html?date=${dateStr}`;
  }

  function closeBookingModal() {
    // No longer needed - keeping for compatibility
  }

  async function handleFormSubmit(e) {
    // Form submission now handled on conference-room-request.html page
  }

  // Helper function to check if a date is booked (for integration with Firestore)
  async function checkDateAvailability(dateStr) {
    // TODO: Implement Firebase integration
    /*
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("date", "==", dateStr),
      where("type", "==", "conference-room"),
      where("status", "in", ["pending", "approved"])
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
    */
    return true; // Always return available until Firebase is integrated
  }
}

/* =====================================================
   TENTS AND CHAIRS CALENDAR SCRIPT
   Add this section to your script.js file
   NOTE: This must be added AFTER your Firebase imports
===================================================== */

// Check if we're on the tents calendar page
if (window.location.pathname.endsWith('tents-calendar.html') || window.location.pathname.endsWith('/tents-calendar')) {
  
  // TODO: In production, fetch booked dates from Firebase
  // Example of how to fetch booked dates:
  /*
  async function getBookedDates() {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("type", "==", "tents-and-chairs"),
      where("status", "in", ["pending", "approved"])
    );
    const querySnapshot = await getDocs(q);
    const booked = {};
    querySnapshot.forEach(doc => {
      const data = doc.data();
      booked[data.date] = data.status;
    });
    return booked;
  }
  */
  const bookedDates = {};  // Empty for now, will be populated from Firebase

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize calendar on page load
  document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);
    setupEventListeners();
  });

  function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Update month/year display
    document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('calendar-date', 'empty');
      calendarDates.appendChild(emptyCell);
    }

    // Add date cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = document.createElement('div');
      dateCell.classList.add('calendar-date');
      
      const dateNumber = document.createElement('div');
      dateNumber.classList.add('date-number');
      dateNumber.textContent = day;
      dateCell.appendChild(dateNumber);

      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellDate = new Date(year, month, day);
      
      // Check if date is in the past
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Check if it's today
      if (cellDate.toDateString() === today.toDateString()) {
        dateCell.classList.add('today');
      }
      
      // Check if date is booked
      if (bookedDates[currentDateStr]) {
        dateCell.classList.add('booked');
        const label = document.createElement('div');
        label.classList.add('booking-label');
        label.textContent = 'Booked';
        dateCell.appendChild(label);
      } else if (isPast) {
        dateCell.classList.add('past');
      } else {
        dateCell.classList.add('available');
        dateCell.addEventListener('click', () => openBookingModal(currentDateStr));
      }

      calendarDates.appendChild(dateCell);
    }
  }

  function setupEventListeners() {
    // Previous month button
    document.getElementById('prevMonth').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });

    // Next month button
    document.getElementById('nextMonth').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }

  function openBookingModal(dateStr) {
    // Redirect to request form page with date parameter
    window.location.href = `tents-request.html?date=${dateStr}`;
  }

  async function checkDateAvailability(dateStr) {
    // TODO: Implement Firebase integration
    /*
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("date", "==", dateStr),
      where("type", "==", "tents-and-chairs"),
      where("status", "in", ["pending", "approved"])
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
    */
    return true; // Always return available until Firebase is integrated
  }
}

/* =====================================================
   END OF TENTS AND CHAIRS CALENDAR SCRIPT
===================================================== */
/* =====================================================
   END OF CONFERENCE ROOM CALENDAR SCRIPT
===================================================== */


/* =====================================================
   ADMIN DASHBOARD SCRIPT
   Add this section to your script.js file
===================================================== */

// Check if we're on the admin dashboard page
if (window.location.pathname.endsWith('adminDashboard.html') || window.location.pathname.endsWith('/adminDashboard')) {
  
  // Sample reservations data (will be replaced with Firestore data)
  const sampleReservations = [
    {
      date: 'September 25, 2025',
      purpose: 'Community Meeting',
      type: 'Conference Room',
      address: 'bone A, Mapulang Lupa',
      status: 'approved'
    },
    {
      date: 'September 25, 2025',
      purpose: 'Birthday Party',
      type: 'Tents & Chairs',
      address: 'bone B, Mapulang Lupa',
      status: 'pending'
    }
  ];

  document.addEventListener('DOMContentLoaded', function() {
    // Initialize week calendar
    renderWeekCalendar();
    
    // Load reservations
    loadReservations();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup sidebar dropdowns
    setupSidebarDropdowns();
  });

  function renderWeekCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Update calendar title
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    document.getElementById('weekCalendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Get the current week (Sunday to Saturday)
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weekDays = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT'];
    const weekCalendarGrid = document.getElementById('weekCalendarGrid');
    weekCalendarGrid.innerHTML = '';

    // TODO: In production, fetch booked dates from Firestore
    // For now, no sample booked dates - will be populated from Firebase
    const bookedDates = []; // Empty array - will be filled from Firestore

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const dayCard = document.createElement('div');
      dayCard.classList.add('week-day-card');

      // Check if it's today
      if (currentDay.toDateString() === today.toDateString()) {
        dayCard.classList.add('today');
      }

      // Check if date has bookings (will be implemented with Firestore)
      const dateStr = currentDay.toISOString().split('T')[0];
      if (bookedDates.includes(dateStr)) {
        dayCard.classList.add('booked');
      }

      dayCard.innerHTML = `
        <div class="week-day-name">${weekDays[i]}</div>
        <div class="week-day-number">${currentDay.getDate()}</div>
      `;

      weekCalendarGrid.appendChild(dayCard);
    }
  }

  function loadReservations() {
    const reservationsList = document.getElementById('reservationsList');
    
    if (sampleReservations.length === 0) {
      reservationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No reservations for today.</p>';
      return;
    }

    reservationsList.innerHTML = '';

    sampleReservations.forEach(reservation => {
      const item = document.createElement('div');
      item.classList.add('reservation-item');

      const statusClass = reservation.status === 'approved' ? 'approved' : 'pending';
      const statusText = reservation.status === 'approved' ? 'Approved' : 'Pending';

      item.innerHTML = `
        <div class="reservation-header">
          <h4 class="reservation-date">${reservation.date}</h4>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="reservation-details">
          <strong>Purpose:</strong> ${reservation.purpose}<br>
          <strong>Type:</strong> ${reservation.type}<br>
          <strong>Address:</strong> ${reservation.address}
        </p>
      `;

      reservationsList.appendChild(item);
    });
  }

  function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.admin-sidebar');

    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        }
      });
    }
  }

  function setupSidebarDropdowns() {
    // Review Requests Dropdown
    const reviewToggle = document.getElementById('reviewRequestsToggle');
    const reviewDropdown = document.getElementById('reviewRequestsDropdown');

    if (reviewToggle) {
      reviewToggle.addEventListener('click', function(e) {
        e.preventDefault();
        reviewToggle.classList.toggle('open');
        reviewDropdown.classList.toggle('open');
      });
    }

    // Manage Calendar Dropdown
    const calendarToggle = document.getElementById('manageCalendarToggle');
    const calendarDropdown = document.getElementById('manageCalendarDropdown');

    if (calendarToggle) {
      calendarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        calendarToggle.classList.toggle('open');
        calendarDropdown.classList.toggle('open');
      });
    }
  }

  // Function to fetch reservations from Firestore (to be implemented)
  async function fetchTodaysReservations() {
    // TODO: Implement Firestore query
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const todayStr = today.toISOString().split('T')[0];
    
    // const requestsRef = collection(db, "requests");
    // const q = query(requestsRef, 
    //   where("startDate", "==", todayStr),
    //   where("status", "in", ["approved", "pending"])
    // );
    // const querySnapshot = await getDocs(q);
    // 
    // const reservations = [];
    // querySnapshot.forEach((doc) => {
    //   reservations.push({ id: doc.id, ...doc.data() });
    // });
    // 
    // return reservations;
  }

  // Function to fetch booked dates for week calendar (to be implemented)
  async function fetchBookedDatesForWeek() {
    // TODO: Query Firestore for all bookings in the current week
    // const startOfWeek = new Date();
    // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    // const endOfWeek = new Date(startOfWeek);
    // endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // const startStr = startOfWeek.toISOString().split('T')[0];
    // const endStr = endOfWeek.toISOString().split('T')[0];
    
    // const requestsRef = collection(db, "requests");
    // const q = query(requestsRef,
    //   where("startDate", ">=", startStr),
    //   where("startDate", "<=", endStr),
    //   where("status", "==", "approved")
    // );
    // const querySnapshot = await getDocs(q);
    // 
    // const bookedDates = [];
    // querySnapshot.forEach((doc) => {
    //   const data = doc.data();
    //   bookedDates.push(data.startDate);
    // });
    // 
    // return bookedDates;
  }
}

/* =====================================================
   END OF ADMIN DASHBOARD SCRIPT
===================================================== *//* =====================================================
   ADMIN DASHBOARD SCRIPT
   Add this section to your script.js file
===================================================== */

// Check if we're on the admin dashboard page
if (window.location.pathname.endsWith('adminDashboard.html') || window.location.pathname.endsWith('/adminDashboard')) {
  
  // Sample reservations data (replace with Firestore data in production)
  const sampleReservations = [
    {
      date: 'September 25, 2025',
      purpose: 'Community Meeting',
      type: 'Conference Room',
      address: 'bone A, Mapulang Lupa',
      status: 'approved'
    },
    {
      date: 'September 25, 2025',
      purpose: 'Birthday Party',
      type: 'Tents & Chairs',
      address: 'bone B, Mapulang Lupa',
      status: 'pending'
    }
  ];

  document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar
    renderMiniCalendar();
    
    // Load reservations
    loadReservations();
    
    // Mobile menu toggle
    setupMobileMenu();
  });

  function renderMiniCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Update calendar title
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Get first day of month and days in month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Sample dates with reservations (replace with real data from Firestore)
    const datesWithReservations = [7, 8, 14, 15, 16, 20, 21, 22, 25, 30, 31];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.classList.add('calendar-day', 'empty');
      calendarDays.appendChild(emptyDay);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('calendar-day');
      dayCell.textContent = day;

      // Highlight today
      if (day === currentDay) {
        dayCell.classList.add('today');
      }

      // Mark dates with reservations
      if (datesWithReservations.includes(day)) {
        dayCell.classList.add('has-reservation');
      }

      calendarDays.appendChild(dayCell);
    }
  }

  function loadReservations() {
    const reservationsList = document.getElementById('reservationsList');
    
    if (sampleReservations.length === 0) {
      reservationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No reservations for today.</p>';
      return;
    }

    reservationsList.innerHTML = '';

    sampleReservations.forEach(reservation => {
      const item = document.createElement('div');
      item.classList.add('reservation-item');

      const statusClass = reservation.status === 'approved' ? 'approved' : 'pending';
      const statusText = reservation.status === 'approved' ? 'Approved' : 'Pending';

      item.innerHTML = `
        <div class="reservation-header">
          <h4 class="reservation-date">${reservation.date}</h4>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="reservation-details">
          <strong>Purpose:</strong> ${reservation.purpose}<br>
          <strong>Type:</strong> ${reservation.type}<br>
          <strong>Address:</strong> ${reservation.address}
        </p>
      `;

      reservationsList.appendChild(item);
    });
  }

  function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.admin-sidebar');

    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        }
      });
    }
  }

  // Function to fetch reservations from Firestore (to be implemented)
  async function fetchReservationsFromFirestore() {
    // TODO: Implement Firestore query
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const todayStr = today.toISOString().split('T')[0];
    
    // const requestsRef = collection(db, "requests");
    // const q = query(requestsRef, 
    //   where("startDate", "==", todayStr),
    //   where("status", "in", ["approved", "pending"])
    // );
    // const querySnapshot = await getDocs(q);
    // 
    // const reservations = [];
    // querySnapshot.forEach((doc) => {
    //   reservations.push({ id: doc.id, ...doc.data() });
    // });
    // 
    // return reservations;
  }

  // Function to update calendar with reservation dates (to be implemented)
  async function updateCalendarWithReservations() {
    // TODO: Query Firestore for all reservations in current month
    // Mark those dates on the calendar
  }
}

/* =====================================================
   END OF ADMIN DASHBOARD SCRIPT
===================================================== */