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
    window.location.href = `tents-chairs-request.html?date=${dateStr}`;
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
   TENTS & CHAIRS REQUEST FORM SCRIPT
   Add this section to your script.js file
===================================================== */

// Check if we're on the tents & chairs request form page
if (window.location.pathname.endsWith('tents-chairs-request.html') || window.location.pathname.endsWith('/tents-chairs-request')) {
  
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tentsChairsForm');
    
    // Get URL parameters (if redirected from calendar with a date)
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDate = urlParams.get('date');
    
    if (preselectedDate) {
      document.getElementById('startDate').value = preselectedDate;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;

    // Update end date minimum when start date changes
    document.getElementById('startDate').addEventListener('change', function() {
      const startDate = this.value;
      document.getElementById('endDate').min = startDate;
      
      // Clear end date if it's before the new start date
      const endDate = document.getElementById('endDate').value;
      if (endDate && endDate < startDate) {
        document.getElementById('endDate').value = '';
      }
    });

    // Clear error on input
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    });

    // Form submission
    form.addEventListener('submit', handleTentsChairsSubmit);
  });

  async function handleTentsChairsSubmit(e) {
    e.preventDefault();

    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const completeAddress = document.getElementById('completeAddress').value.trim();
    const quantityChairs = document.getElementById('quantityChairs').value.trim();
    const quantityTents = document.getElementById('quantityTents').value.trim();
    const modeOfReceiving = document.getElementById('modeOfReceiving').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Reset all errors
    clearAllErrors();

    let isValid = true;

    // Validate Full Name
  if (!fullName) {
    setFieldError('fullName', 'Please enter your full name');
    isValid = false;
  } else if (fullName.length < 5) {
    setFieldError('fullName', 'Full name must be at least 5 characters long');
    isValid = false;
  } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    setFieldError('fullName', 'Full name can only contain letters and spaces');
    isValid = false;
  }

    // Validate Contact Number
    if (!contactNumber) {
      setFieldError('contactNumber', 'Contact number is required');
      isValid = false;
    } else if (!/^09\d{9}$/.test(contactNumber)) {
      setFieldError('contactNumber', 'Contact must be 11 digits starting with 09');
      isValid = false;
    }

    // Validate Complete Address
    if (!completeAddress) {
      setFieldError('completeAddress', 'Complete address is required');
      isValid = false;
    } else if (completeAddress.length < 10) {
      setFieldError('completeAddress', 'Please provide a complete address');
      isValid = false;
    }

    // Validate Quantity of Chairs
    if (!quantityChairs) {
      setFieldError('quantityChairs', 'Quantity of chairs is required');
      isValid = false;
    } else if (parseInt(quantityChairs) < 20) {
      setFieldError('quantityChairs', 'Quantity must be at least 1');
      isValid = false;
    } else if (parseInt(quantityChairs) > 600) {
      setFieldError('quantityChairs', 'Quantity cannot exceed 600');
      isValid = false;
    }

    // Validate Quantity of Tents
    if (!quantityTents) {
      setFieldError('quantityTents', 'Quantity of tents is required');
      isValid = false;
    } else if (parseInt(quantityTents) < 1) {
      setFieldError('quantityTents', 'Quantity must be at least 1');
      isValid = false;
    } else if (parseInt(quantityTents) > 24) {
      setFieldError('quantityTents', 'Quantity cannot exceed 24');
      isValid = false;
    }

    // Validate Mode of Receiving
    if (!modeOfReceiving) {
      setFieldError('modeOfReceiving', 'Please select a mode of receiving');
      isValid = false;
    }

    // Validate Start Date
    if (!startDate) {
      setFieldError('startDate', 'Start date is required');
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedStart = new Date(startDate + 'T00:00:00');
      
      if (selectedStart < today) {
        setFieldError('startDate', 'Start date cannot be in the past');
        isValid = false;
      }
    }

    // Validate End Date
    if (!endDate) {
      setFieldError('endDate', 'End date is required');
      isValid = false;
    } else if (startDate && endDate < startDate) {
      setFieldError('endDate', 'End date must be after start date');
      isValid = false;
    }

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message:not(:empty)');
      if (firstError) {
        firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare form data
    const formData = {
      fullName: fullName,
      contactNumber: contactNumber,
      completeAddress: completeAddress,
      quantityChairs: parseInt(quantityChairs),
      quantityTents: parseInt(quantityTents),
      modeOfReceiving: modeOfReceiving,
      startDate: startDate,
      endDate: endDate,
      status: 'pending',
      requestDate: new Date().toISOString(),
      type: 'tents-chairs'
    };

    try {
      // TODO: In production, save to Firestore
      // const user = auth.currentUser;
      // if (!user) {
      //   showAlert('Please login to submit a request.');
      //   return;
      // }
      // await setDoc(doc(db, "requests", `request_${Date.now()}`), {
      //   ...formData,
      //   userId: user.uid,
      //   userEmail: user.email
      // });

      console.log('Tents & Chairs Request:', formData);

      // Show success message
      showAlert('Your tents & chairs request has been submitted successfully! You can check the status in your profile.', true, () => {
        window.location.href = 'user.html';
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('Failed to submit request. Please try again.');
    }
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    
    field.classList.add('error');
    errorElement.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    const fieldId = field.id;
    const errorElementId = `error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`;
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
  }
}

/* =====================================================
   END OF TENTS & CHAIRS REQUEST FORM SCRIPT
===================================================== */