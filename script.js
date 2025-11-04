// script.js
// All JS scripts from HTML files are combined here.

/* =====================
   LOGIN PAGE SCRIPT
   (from index.html)
====================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { signInWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ====== Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAYwzAJ45Lng5RvurB-LCqY0AUJLsmyvkM",
  authDomain: "f5-softdev.firebaseapp.com",
  projectId: "f5-softdev",
  storageBucket: "f5-softdev.firebasestorage.app",
  messagingSenderId: "160262184429",
  appId: "1:160262184429:web:be4a8c6165510892965be4",
  measurementId: "G-RDKKY98HWY"
};

// ====== Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =============================
// 2. Unique Custom Alert Function (no naming conflicts FOR BACKEND)
// =============================
function showBookingFormAlert(message, type = "success") {
  let alertBox = document.getElementById("bookingFormAlertBox");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "bookingFormAlertBox";
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.padding = "12px 20px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.fontWeight = "bold";
    alertBox.style.color = "#fff";
    alertBox.style.zIndex = "9999";
    alertBox.style.transition = "all 0.3s ease";
    document.body.appendChild(alertBox);
  }
  alertBox.style.backgroundColor = type === "success" ? "#28a745" : "#dc3545";
  alertBox.textContent = message;
  alertBox.style.display = "block";
  alertBox.style.opacity = "1";
  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => (alertBox.style.display = "none"), 300);
  }, 3000);
}

/* ================================
  BEGIN: Tents & Chairs - Appended JS block
  - Purpose field handling and quantity-zero validation
  (This section's logic was added/updated in the tents & chairs request handler above.)
  END: Tents & Chairs - Appended JS block
=================================== */

// =============================
// 3. Tents & Chairs Form Handler FOR BACKEND (LEGACY - COMMENTED OUT)
// NOTE: This handler is not currently used. The active handler is in the 
// tents-chairs-request.html section (around line 1774). Keeping this for reference.
// =============================

document.addEventListener("DOMContentLoaded", () => {
  const tentsChairsForm = document.getElementById("tentsChairsForm");

  async function handleTentsChairsSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById("fullName").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const completeAddress = document.getElementById("completeAddress").value.trim();
    const modeOfReceiving = document.getElementById("modeOfReceiving").value.trim();
    const quantityChairs = document.getElementById("quantityChairs").value.trim();
    const quantityTents = document.getElementById("quantityTents").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();

  

   // Validation flags
let hasError = false;

// Validate full name
if (!fullName) {
  document.getElementById("fullName").classList.add("error");
  hasError = true;
}

// Validate contact (must be numbers only and proper length)
if (!contactNumber || !/^\d{11}$/.test(contactNumber)) {
  document.getElementById("contactNumber").classList.add("error");
  hasError = true;
}

// Validate address
if (!completeAddress) {
  document.getElementById("completeAddress").classList.add("error");
  hasError = true;
}

// Validate chairs quantity (must be number between 20–600)
if (!quantityChairs || quantityChairs < 20 || quantityChairs > 600) {
  document.getElementById("quantityChairs").classList.add("error");
  hasError = true;
}

// Validate tents quantity (must be number between 1–24)
if (!quantityTents || quantityTents < 1 || quantityTents > 24) {
  document.getElementById("quantityTents").classList.add("error");
  hasError = true;
}

// Validate dates
if (!startDate || !endDate) {
  document.getElementById("startDate").classList.add("error");
  document.getElementById("endDate").classList.add("error");
  hasError = true;
} else if (endDate < startDate) {
  document.getElementById("endDate").classList.add("error");
  hasError = true;
}

// Validate receiving mode
if (!modeOfReceiving) {
  document.getElementById("modeOfReceiving").classList.add("error");
  hasError = true;
}

// If any validation failed, stop form submission
if (hasError) {
  return false;
}


    try {
      await addDoc(collection(db, "tentsChairsBookings"), {
        fullName,
        contactNumber,
        completeAddress,
        modeOfReceiving,
        quantityChairs: parseInt(quantityChairs),
        quantityTents: parseInt(quantityTents),
        startDate,
        endDate,
        status: "pending",
        createdAt: serverTimestamp(),
      });


      showAlert('Your tents & chairs request has been submitted successfully! You can check the status in your profile.', true, () => {
        window.location.href = 'UserProfile.html';
      });

    } catch (error) {
      console.error("Error submitting request:", error);
      showAlert("Error submitting your request. Please try again.", false);
    }
  }

  if (tentsChairsForm) {
    tentsChairsForm.addEventListener("submit", handleTentsChairsSubmit);
  }
});


// =============================

// Login Validation
const loginForm = document.getElementById("loginForm");
const errorLoginEmail = document.getElementById("error-login-email");
const errorLoginPassword = document.getElementById("error-login-password");

// Helper to clear sensitive form fields (used when signed-out or page restored from bfcache)
function clearSensitiveLoginFields() {
  try {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    if (emailEl) {
      // Prevent browser autofill hints where possible and clear value
      emailEl.setAttribute('autocomplete', 'off');
      emailEl.value = '';
    }
    if (passEl) {
      passEl.setAttribute('autocomplete', 'off');
      passEl.value = '';
    }
    if (loginForm) {
      loginForm.setAttribute('autocomplete', 'off');
    }
  } catch (e) {
    console.warn('Failed to clear login fields:', e);
  }
}

// Ensure login inputs are cleared on pageshow (handles back/forward cache restoring the page)
window.addEventListener('pageshow', (event) => {
  // If this page is the login page (index.html) and there is no authenticated user, clear fields
  const path = window.location.pathname || '';
  if (path.endsWith('index.html') || path === '/' || path === '') {
    // If auth.currentUser is falsy, clear fields to avoid restored values from previous sessions
    if (!auth.currentUser) clearSensitiveLoginFields();
  }
  // For protected pages, if the page was restored from bfcache and the user is no longer signed in, force redirect
  if (event.persisted) {
    const protectedPaths = ["/admin.html", "admin.html", "/UserProfile.html", "UserProfile.html"];
    if (protectedPaths.some(p => window.location.pathname.endsWith(p)) && !auth.currentUser) {
      // Force a redirect to login (replace so back doesn't loop)
      try { location.replace('index.html'); } catch (e) { window.location.href = 'index.html'; }
    }
  }
});

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

    try {
      // Get Firestore role
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Check if there's a redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        if (redirectTo) {
          // Decode and redirect to the original page
          window.location.href = decodeURIComponent(redirectTo);
        } else if (userData.role === "admin") {
          window.location.href = "admin.html";
        } else if (userData.role === "user") {
          window.location.href = "user.html";
        } else {
          console.error("Unknown role:", userData.role);
          alert("⚠️ Unknown role. Contact support.");
        }
      } else {
        console.error("No user document found for uid:", user.uid);
        alert("⚠️ No user profile found. Contact admin.");
      }
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      alert("⚠️ Error loading user profile. Please try again.");
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
   FORGOT PASSWORD FUNCTIONALITY
====================== */
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetEmailInput = document.getElementById('resetEmail');
  const errorResetEmail = document.getElementById('error-reset-email');
  const closeModalBtn = forgotPasswordModal?.querySelector('.close-modal');

  // Open forgot password modal
  forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (forgotPasswordModal) {
      forgotPasswordModal.style.display = 'block';
      resetEmailInput.value = '';
      if (errorResetEmail) errorResetEmail.textContent = '';
    }
  });

  // Close modal
  closeModalBtn?.addEventListener('click', () => {
    if (forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
    }
  });

  // Handle forgot password form submission
  forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = resetEmailInput.value.trim();
    console.log('[Forgot Password] Form submitted with email:', email);
    
    // Validate email
    if (!email) {
      if (errorResetEmail) {
        errorResetEmail.innerHTML = `<span style='color:#d32f2f;font-size:14px;'>Email cannot be blank</span>`;
      }
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('[Forgot Password] Email validation failed:', emailValidation.message);
      if (errorResetEmail) {
        errorResetEmail.innerHTML = `<span style='color:#d32f2f;font-size:14px;'>${emailValidation.message}</span>`;
      }
      return;
    }

    // Clear error
    if (errorResetEmail) errorResetEmail.textContent = '';

    // Show loading state on button
    const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    console.log('[Forgot Password] Showing spinner and sending reset email...');
    showButtonSpinner(submitBtn);

    try {
      // Send password reset email
      console.log('[Forgot Password] Calling sendPasswordResetEmail for:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('[Forgot Password] Password reset email sent successfully!');
      
      // Close modal
      if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
      }

      // Show success message
      showAlert(
        `Password reset email sent to ${email}. Please check your inbox (and spam folder) and follow the instructions to reset your password.`,
        true
      );
      
    } catch (error) {
      console.error('[Forgot Password] Error:', error);
      console.error('[Forgot Password] Error code:', error.code);
      console.error('[Forgot Password] Error message:', error.message);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      if (errorResetEmail) {
        errorResetEmail.innerHTML = `<span style='color:#d32f2f;font-size:14px;'>${errorMessage}</span>`;
      }
    } finally {
      // Restore button state
      console.log('[Forgot Password] Restoring button state');
      hideButtonSpinner(submitBtn, originalBtnText);
    }
  });
}

/* =====================
   SIGNUP PAGE SCRIPT
   (from signup.html)
====================== */
// ...signup imports consolidated at the top (createUserWithEmailAndPassword, updateProfile, setDoc)

const signupForm = document.getElementById("signupForm");
const errorFirstname = document.getElementById("error-firstname");
const errorLastname = document.getElementById("error-lastname");
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
  const firstName = document.getElementById("signup-firstname").value.trim();
  const lastName = document.getElementById("signup-lastname").value.trim();
  const contact = document.getElementById("signup-contact").value.trim();
  const address = document.getElementById("signup-address").value.trim();

  // Reset all previous errors
  [errorFirstname, errorLastname, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress]
    .forEach(clearErrorSignup);

  let valid = true;

  // First Name validation
  if (!firstName) {
    setErrorSignup(errorFirstname, "First Name can't be blank");
    valid = false;
  } else if (firstName.length < 2) {
    setErrorSignup(errorFirstname, "First Name must be at least 2 characters");
    valid = false;
  } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
    setErrorSignup(errorFirstname, "First Name can only contain letters, spaces, hyphens, and apostrophes");
    valid = false;
  } else {
    setSuccessSignup(errorFirstname);
  }

  // Last Name validation
  if (!lastName) {
    setErrorSignup(errorLastname, "Last Name can't be blank");
    valid = false;
  } else if (lastName.length < 2) {
    setErrorSignup(errorLastname, "Last Name must be at least 2 characters");
    valid = false;
  } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
    setErrorSignup(errorLastname, "Last Name can only contain letters, spaces, hyphens, and apostrophes");
    valid = false;
  } else {
    setSuccessSignup(errorLastname);
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
  [errorFirstname, errorLastname, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress].forEach(clearErrorSignup);

  try {
    // Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name with full name
    const fullName = `${firstName} ${lastName}`;
    await updateProfile(user, { displayName: fullName });

    // Save user data to Firestore
    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      contactNumber: contact,
      address: sanitizedAddress,
      role: "user", // Default role for new signups
      createdAt: serverTimestamp()
    };

    // Save to Firestore using setDoc with the user's UID as the document ID
    await setDoc(doc(db, "users", user.uid), userData);

    // Show success message and redirect to user landing page (already logged in)
    showAlert("Account created successfully! Welcome to Barangay Mapulang Lupa.", true, () => {
      window.location.href = "user.html"; // Redirect to landing page, user is already authenticated
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
  // Prefer existing box used in HTML so your styles stay intact
  let alertBox = document.getElementById('formAlertBox') || document.getElementById('customAlert');
  let overlay = document.getElementById('overlay');

  // Create overlay only if missing
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.35)',
      display: 'none',
      zIndex: '9998'
    });
    document.body.appendChild(overlay);
  }

  // If no alert container exists, create a minimal one (keeps UI unobtrusive)
  if (!alertBox) {
    const box = document.createElement('div');
    box.id = 'customAlert';
    box.className = 'form-alert';
    Object.assign(box.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      background: '#fff',
      padding: '14px 18px',
      borderRadius: '8px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      zIndex: '10000',
      display: 'none',
      textAlign: 'center'
    });
    document.body.appendChild(box);
    alertBox = box;
  }

  // Ensure alertBox appears above overlay and is centered if necessary
  try {
    const cs = window.getComputedStyle(alertBox);
    const overlayZi = parseInt(window.getComputedStyle(overlay).zIndex) || 9998;
    const boxZi = parseInt(cs.zIndex) || 0;

    if (cs.position === 'static' || cs.position === '' || cs.position === 'relative') {
      // Only set positioning properties if the element isn't already explicitly positioned
      alertBox.style.position = alertBox.style.position || 'fixed';
      if (!alertBox.style.left && !alertBox.style.right) alertBox.style.left = '50%';
      if (!alertBox.style.top && !alertBox.style.bottom) alertBox.style.top = '50%';
      if (!alertBox.style.transform) alertBox.style.transform = 'translate(-50%,-50%)';
    }

    if (boxZi <= overlayZi) {
      alertBox.style.zIndex = (overlayZi + 1).toString();
    }
  } catch (e) {
    // Fallback if computed style access fails
    alertBox.style.position = alertBox.style.position || 'fixed';
    alertBox.style.left = alertBox.style.left || '50%';
    alertBox.style.top = alertBox.style.top || '50%';
    alertBox.style.transform = alertBox.style.transform || 'translate(-50%,-50%)';
    alertBox.style.zIndex = alertBox.style.zIndex || '10000';
  }

  // Ensure there is a message container inside the alertBox (prefer existing IDs/classes)
  let alertMessage = alertBox.querySelector('.alert-message') || document.getElementById('alertMessage');
  if (!alertMessage) {
    alertMessage = document.createElement('div');
    alertMessage.className = 'alert-message';
    alertMessage.id = 'alertMessage';
    alertBox.insertBefore(alertMessage, alertBox.firstChild);
  }

  // Ensure there's an OK button for closing (preserve any existing classes/IDs)
  let okBtn = alertBox.querySelector('.alert-ok-btn') || 
              alertBox.querySelector('#alertOkButton') || 
              alertBox.querySelector('.alert-button') || 
              alertBox.querySelector('button');
  
  if (!okBtn) {
    okBtn = document.createElement('button');
    okBtn.className = 'alert-ok-btn';
    okBtn.id = 'alertOkButton';
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    // Minimal inline styles so your CSS can override them if present
    Object.assign(okBtn.style, {
      marginTop: '10px',
      cursor: 'pointer'
    });
    alertBox.appendChild(okBtn);
  }
  
  // Ensure click handler is bound (remove old handlers first to avoid duplicates)
  okBtn.onclick = null; // Clear inline onclick if exists
  okBtn.removeEventListener('click', closeAlert);
  okBtn.addEventListener('click', closeAlert);

  // Safely toggle success class without throwing
  if (isSuccess) {
    if (alertBox.classList) alertBox.classList.add('success');
  } else {
    if (alertBox.classList) alertBox.classList.remove('success');
  }

  // Set message text
  alertMessage.textContent = message;

  // Show overlay and alert
  overlay.style.display = 'block';
  alertBox.style.display = 'block';

  // Save callback if provided
  if (callback && typeof callback === 'function') {
    alertBox.setAttribute && alertBox.setAttribute('data-callback', 'true');
    window.alertCallback = callback;
  } else {
    alertBox.removeAttribute && alertBox.removeAttribute('data-callback');
    window.alertCallback = null;
  }

  // Focus OK button for accessibility
  if (okBtn && typeof okBtn.focus === 'function') okBtn.focus();
}

function closeAlert() {
  const alertBox = document.getElementById('formAlertBox') || document.getElementById('customAlert');
  const overlay = document.getElementById('overlay');

  if (alertBox) alertBox.style.display = 'none';
  if (overlay) overlay.style.display = 'none';

  try {
    if (alertBox && alertBox.hasAttribute && alertBox.hasAttribute('data-callback') && typeof window.alertCallback === 'function') {
      window.alertCallback();
    }
  } catch (err) {
    console.error('Alert callback error:', err);
  } finally {
    window.alertCallback = null;
    if (alertBox && alertBox.removeAttribute) alertBox.removeAttribute('data-callback');
  }
}

// Make closeAlert available globally
window.closeAlert = closeAlert;

// Custom Confirm Dialog (matches alert styling)
function showConfirm(message, onConfirm, onCancel = null) {
  let confirmBox = document.getElementById('customConfirm');
  let overlay = document.getElementById('overlay');

  // Create overlay if missing
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.35)',
      display: 'none',
      zIndex: '9998'
    });
    document.body.appendChild(overlay);
  }

  // Create confirm box if it doesn't exist
  if (!confirmBox) {
    confirmBox = document.createElement('div');
    confirmBox.id = 'customConfirm';
    confirmBox.className = 'custom-confirm-dialog';
    document.body.appendChild(confirmBox);
  }

  // Build the confirm dialog content
  confirmBox.innerHTML = `
    <div class="confirm-message">${message.replace(/\n/g, '<br>')}</div>
    <div class="confirm-buttons">
      <button class="confirm-cancel-btn" type="button">Cancel</button>
      <button class="confirm-ok-btn" type="button">OK</button>
    </div>
  `;

  // Show overlay and confirm box
  overlay.style.display = 'block';
  confirmBox.style.display = 'block';

  // Get buttons
  const okBtn = confirmBox.querySelector('.confirm-ok-btn');
  const cancelBtn = confirmBox.querySelector('.confirm-cancel-btn');

  // Close function
  const closeConfirm = () => {
    confirmBox.style.display = 'none';
    overlay.style.display = 'none';
  };

  // OK button handler
  okBtn.onclick = () => {
    closeConfirm();
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  // Cancel button handler
  cancelBtn.onclick = () => {
    closeConfirm();
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  };

  // Focus OK button for accessibility
  okBtn.focus();
}

  /* --------------------------------------------------
     Toast notifications (top-right) — lightweight
     Usage: showToast(message, isSuccess = true, duration = 3000)
  -------------------------------------------------- */
  const TOAST_DURATION = 1600;

  function ensureToastContainer() {
    let container = document.getElementById('top-right-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'top-right-toast-container';
      container.style.position = 'fixed';
      container.style.top = '16px';
      container.style.right = '16px';
      container.style.zIndex = '99999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, isSuccess = true, duration = TOAST_DURATION) {
    const container = ensureToastContainer();
    // Create toast with white background, blue/black text and check icon on left to match site design
    const toast = document.createElement('div');
    toast.className = 'tr-toast';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.minWidth = '240px';
    toast.style.maxWidth = '360px';
    toast.style.padding = '10px 14px';
    toast.style.color = '#0b3b8c';
    toast.style.background = '#ffffff';
    toast.style.border = '1px solid rgba(11,59,140,0.12)';
    toast.style.borderLeft = '4px solid #0b3b8c';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 240ms ease, transform 240ms ease';
    toast.style.transform = 'translateY(-6px)';

    // icon (check) - blue
    const icon = document.createElement('span');
    icon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="#0b3b8c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    icon.style.flex = '0 0 auto';
    toast.appendChild(icon);

    const text = document.createElement('div');
    text.textContent = message;
    text.style.color = '#0b3b8c';
    text.style.fontWeight = '600';
    toast.appendChild(text);

    container.appendChild(toast);

    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        try { container.removeChild(toast); } catch (e) {}
      }, 260);
    }, duration);
  }

  /* --------------------------------------------------
     Button spinner helpers (attach to Save buttons)
  -------------------------------------------------- */
  function createSpinnerElement(size = 16, color = '#0b3b8c') {
    const spinner = document.createElement('span');
    spinner.className = 'btn-spinner';
    spinner.style.display = 'inline-block';
    spinner.style.width = `${size}px`;
    spinner.style.height = `${size}px`;
    spinner.style.border = `${Math.max(2, Math.floor(size/8))}px solid rgba(11,59,140,0.18)`;
    spinner.style.borderTopColor = color;
    spinner.style.borderRadius = '50%';
    spinner.style.boxSizing = 'border-box';
    spinner.style.marginRight = '8px';
    spinner.style.animation = 'tr-spin 0.9s linear infinite';
    // add minimal keyframes if not present
    if (!document.getElementById('tr-spin-style')) {
      const style = document.createElement('style');
      style.id = 'tr-spin-style';
      style.textContent = `@keyframes tr-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
      document.head.appendChild(style);
    }
    return spinner;
  }

  function showButtonSpinner(button) {
    if (!button) return null;
    button.disabled = true;
    // avoid duplicating spinner
    if (button.querySelector('.btn-spinner')) return button.querySelector('.btn-spinner');
    const spinner = createSpinnerElement(16, '#0b3b8c');
    // insert at start of button
    button.insertBefore(spinner, button.firstChild);
    return spinner;
  }

  function hideButtonSpinner(button) {
    if (!button) return;
    const spinner = button.querySelector('.btn-spinner');
    if (spinner) spinner.remove();
    button.disabled = false;
  }

/* =====================
   PAGE PROTECTION & GLOBAL LOGOUT
   Used by: user.html, admin.html
   - onAuthStateChanged prevents access to protected pages when not authenticated
   - window.logout signs the current user out and redirects to login
====================== */
// Protect specific pages by pathname
// Only admin.html and UserProfile.html are protected (user.html is now public)
const protectedPaths = ["/admin.html", "admin.html", "/UserProfile.html", "UserProfile.html"];
if (protectedPaths.some(p => window.location.pathname.endsWith(p))) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Not signed in -> go to login
      window.location.href = "index.html";
    }
  });
}

// Make a global logout function available to all pages
window.logout = async function() {
  try {
    // Sign out from Firebase
    await signOut(auth);
  } catch (err) {
    console.error('Logout failed:', err);
    // proceed with cleanup and redirect even if signOut failed
  }

  try {
    // Clear per-tab session data (do not aggressively clear localStorage that may hold user preferences)
    sessionStorage.clear();
  } catch (e) {
    console.warn('Failed to clear sessionStorage', e);
  }

  // Replace history entry so Back button won't return to an authenticated page
  // This helps avoid browsers restoring an auth-backed UI from the bfcache.
  try {
    location.replace('index.html');
  } catch (e) {
    // fallback
    window.location.href = 'index.html';
  }
};

/* User Profile Page Scripts */
document.addEventListener('DOMContentLoaded', function() {
  // Only run this code on the UserProfile page
  if (!document.querySelector('.user-profile-layout')) return;

  const editProfileModal = document.getElementById('editProfileModal');
  const changePasswordModal = document.getElementById('changePasswordModal');
  // Select the buttons specifically inside the user-info card to avoid matching the logout button
  const editProfileBtn = document.querySelector('.user-info-card .edit-profile-btn');
  const changePasswordBtn = document.querySelector('.user-info-card .change-password-btn');
  const changePasswordMessage = document.getElementById('changePasswordMessage');
  // per-field error elements (Edit Profile)
  const errorEditFirstname = document.getElementById('error-edit-firstname');
  const errorEditLastname = document.getElementById('error-edit-lastname');
  const errorEditContact = document.getElementById('error-edit-contact');
  const errorEditEmail = document.getElementById('error-edit-email');
  const errorEditAddress = document.getElementById('error-edit-address');
  // per-field error elements (Change Password)
  const errorCurrentPassword = document.getElementById('error-current-password');
  const errorNewPassword = document.getElementById('error-new-password');
  const errorConfirmPassword = document.getElementById('error-confirm-password');
  const logoutBtn = document.querySelector('.logout-btn');
  const closeButtons = document.querySelectorAll('.close-modal');

  console.log('[UserProfile] Page initialized');
  console.log('[UserProfile] Logout button found:', !!logoutBtn);

  // Load user data after Firebase confirms auth state so auth.currentUser is available
  onAuthStateChanged(auth, (user) => {
    console.log('[UserProfile] Auth state changed. User:', user ? user.email : 'Not logged in');
    if (!user) {
      // Not signed in -> go to login
      console.log('[UserProfile] No user, redirecting to login');
      window.location.href = "index.html";
      return;
    }
    // User signed in -> populate profile and requests
    console.log('[UserProfile] Loading user data and requests');
    loadUserData();
    loadUserRequests();
  });

  // Status Filter Event Listener
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    console.log('[UserProfile] Status filter found, attaching event listener');
    statusFilter.addEventListener('change', (e) => {
      const selectedStatus = e.target.value;
      console.log('[Filter] Filter dropdown changed to:', selectedStatus);
      console.log('[Filter] Triggering loadUserRequests with filter:', selectedStatus);
      loadUserRequests(selectedStatus);
    });
  } else {
    console.warn('[UserProfile] Status filter element not found in DOM');
  }

  // Edit Profile Modal
  editProfileBtn?.addEventListener('click', async () => {
    // Clear previous inline errors
    [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(el => { if (el) clearErrorSignup(el); });

    // Reload latest user data from Firestore and populate edit form to discard unsaved edits.
    // We await here so the modal shows the current saved values (not any unsaved inputs).
    try {
      await loadUserData();
    } catch (err) {
      console.warn('Failed to reload user data before opening edit modal:', err);
    }

    // Ensure any transient form state is cleaned
    const editProfileFormEl = document.getElementById('editProfileForm');
    if (editProfileFormEl) {
      // remove any custom validation classes if present
      editProfileFormEl.classList.remove('was-validated');
    }

    editProfileModal.style.display = 'block';
  });

  // Change Password Modal
  changePasswordBtn?.addEventListener('click', () => {
    // Clear any previous messages and inputs when opening
    if (changePasswordMessage) {
      changePasswordMessage.style.display = 'none';
      changePasswordMessage.textContent = '';
    }
    // Clear any previous per-field errors and reset inputs so unsaved attempts are discarded
    [errorCurrentPassword, errorNewPassword, errorConfirmPassword].forEach(el => { if (el) clearErrorSignup(el); });
    changePasswordForm?.reset();
    changePasswordModal.style.display = 'block';
  });

  // Forgot Password Modal (UserProfile page)
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordFromProfile');
  const resetEmailInput = document.getElementById('resetEmail');
  const errorResetEmail = document.getElementById('error-reset-email');

  // Open forgot password modal from change password modal
  forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('[UserProfile] Forgot password link clicked');
    
    // Close the change password modal
    if (changePasswordModal) {
      changePasswordModal.style.display = 'none';
    }
    
    // Open the forgot password modal
    if (forgotPasswordModal) {
      forgotPasswordModal.style.display = 'block';
      if (resetEmailInput) resetEmailInput.value = '';
      if (errorResetEmail) errorResetEmail.textContent = '';
    }
  });

  // Handle forgot password form submission
  forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = resetEmailInput?.value.trim();

    console.log('[UserProfile - Forgot Password] Form submitted with email:', email);

    // Clear previous errors
    if (errorResetEmail) errorResetEmail.textContent = '';

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('[UserProfile - Forgot Password] Email validation failed:', emailValidation.message);
      if (errorResetEmail) {
        errorResetEmail.textContent = emailValidation.message;
        errorResetEmail.style.display = 'block';
      }
      return;
    }

    // Show spinner on button
    const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Send Reset Link';
    if (submitBtn) showButtonSpinner(submitBtn);

    try {
      console.log('[UserProfile - Forgot Password] Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      
      console.log('[UserProfile - Forgot Password] Password reset email sent successfully');
      
      // Show success alert
      showAlert(
        `Password reset link sent to ${email}. Please check your inbox and spam folder.`,
        true,
        () => {
          // Close modal after user acknowledges
          if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
          if (forgotPasswordForm) forgotPasswordForm.reset();
        }
      );
    } catch (error) {
      console.error('[UserProfile - Forgot Password] Error sending reset email:', error);
      
      // Show error message
      if (errorResetEmail) {
        if (error.code === 'auth/user-not-found') {
          errorResetEmail.textContent = 'No account found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
          errorResetEmail.textContent = 'Invalid email format.';
        } else {
          errorResetEmail.textContent = 'Failed to send reset link. Please try again.';
        }
        errorResetEmail.style.display = 'block';
      }
    } finally {
      // Restore button state
      console.log('[UserProfile - Forgot Password] Restoring button state');
      if (submitBtn) hideButtonSpinner(submitBtn, originalBtnText);
    }
  });

  // Close modals when clicking close button
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Hide modals
      editProfileModal.style.display = 'none';
      changePasswordModal.style.display = 'none';
      if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';

      // clear password modal message and reset fields
      if (changePasswordMessage) {
        changePasswordMessage.style.display = 'none';
        changePasswordMessage.textContent = '';
      }
  changePasswordForm?.reset();

      // Reset edit profile form inputs and clear inline errors so unsaved edits are discarded
      const editProfileFormEl = document.getElementById('editProfileForm');
      if (editProfileFormEl) {
        editProfileFormEl.reset();
        [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(el => { if (el) clearErrorSignup(el); });
      }

      // Reset change password form inputs and clear per-field errors
      const chFormEl = document.getElementById('changePasswordForm');
      if (chFormEl) {
        chFormEl.reset();
        [errorCurrentPassword, errorNewPassword, errorConfirmPassword].forEach(el => { if (el) clearErrorSignup(el); });
      }
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editProfileModal) {
      editProfileModal.style.display = 'none';
      // Reset edit profile form inputs & clear inline errors when modal closed by clicking outside
      const editProfileFormEl = document.getElementById('editProfileForm');
      if (editProfileFormEl) {
        editProfileFormEl.reset();
        [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(el => { if (el) clearErrorSignup(el); });
      }
    }
    if (e.target === changePasswordModal) {
      changePasswordModal.style.display = 'none';
      const chFormEl = document.getElementById('changePasswordForm');
      if (chFormEl) {
        chFormEl.reset();
        [errorCurrentPassword, errorNewPassword, errorConfirmPassword].forEach(el => { if (el) clearErrorSignup(el); });
      }
    }
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
      if (forgotPasswordForm) forgotPasswordForm.reset();
      if (errorResetEmail) errorResetEmail.textContent = '';
    }
  });

  // Logout functionality
  logoutBtn?.addEventListener('click', () => {
    console.log('[UserProfile] Logout button clicked');
    window.logout();
  });

  // Handle Edit Profile Form Submit
  const editProfileForm = document.getElementById('editProfileForm');
  editProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Clear previous errors
    [errorEditFirstname, errorEditLastname, errorEditContact, errorEditAddress].forEach(el => {
      if (el) clearErrorSignup(el);
    });

    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const contact = document.getElementById('editContactNumber').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    let valid = true;

    // First Name validation
    if (!firstName) {
      setErrorSignup(errorEditFirstname, "First Name can't be blank");
      valid = false;
    } else if (firstName.length < 2) {
      setErrorSignup(errorEditFirstname, "First Name must be at least 2 characters");
      valid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
      setErrorSignup(errorEditFirstname, "First Name can only contain letters, spaces, hyphens, and apostrophes");
      valid = false;
    }

    // Last Name validation
    if (!lastName) {
      setErrorSignup(errorEditLastname, "Last Name can't be blank");
      valid = false;
    } else if (lastName.length < 2) {
      setErrorSignup(errorEditLastname, "Last Name must be at least 2 characters");
      valid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
      setErrorSignup(errorEditLastname, "Last Name can only contain letters, spaces, hyphens, and apostrophes");
      valid = false;
    }

    // Contact validation
    if (!contact) {
      setErrorSignup(errorEditContact, "Contact number can't be blank");
      valid = false;
    } else if (!/^\d+$/.test(contact)) {
      setErrorSignup(errorEditContact, "Contact number must contain only numbers");
      valid = false;
    } else if (!/^09\d{9}$/.test(contact)) {
      setErrorSignup(errorEditContact, "Contact number must be 11 digits and start with '09'");
      valid = false;
    }

    // Address validation
    const sanitizedAddress = address.replace(/<[^>]*>/g, '');
    if (!sanitizedAddress) {
      setErrorSignup(errorEditAddress, "Address can't be blank");
      valid = false;
    } else if (sanitizedAddress !== address) {
      setErrorSignup(errorEditAddress, "Address contains invalid characters");
      valid = false;
    }

    if (!valid) return;

    const updates = {
      firstName: firstName,
      lastName: lastName,
      contactNumber: contact,
      address: address
    };

    // Show spinner on save button
    const editSaveButton = document.querySelector('#editProfileForm .save-changes');
    const editSpinner = showButtonSpinner(editSaveButton);

    try {
      // Update Firestore
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });

      // Also update the Auth displayName so Auth and Firestore stay in sync
      const fullName = `${firstName} ${lastName}`;
      try {
        await updateProfile(user, { displayName: fullName });
      } catch (err) {
        console.warn('Failed to update Auth displayName:', err);
      }

      // Visual confirmation + close modal + reload user data (use unified toast duration)
      try { showToast('Profile updated successfully!', true); } catch (e) {}
      // Close modal after toast duration so user sees the toast while modal is visible briefly
      setTimeout(async () => {
        editProfileModal.style.display = 'none';
        try { await loadUserData(); } catch (e) { console.warn('Failed to reload user data after update:', e); }
      }, TOAST_DURATION);
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert('Failed to update profile. Please try again.');
    } finally {
      // hide spinner and re-enable
      hideButtonSpinner(editSaveButton);
    }
  });

  // Handle Change Password Form Submit
  const changePasswordForm = document.getElementById('changePasswordForm');
  // helper to show inline message in change password modal (kept for success banner)
  function setChangePasswordMessage(msg, isSuccess = false) {
    if (!changePasswordMessage) return;
    changePasswordMessage.textContent = msg;
    changePasswordMessage.style.display = 'block';
    changePasswordMessage.style.color = isSuccess ? '#2e7d32' : '#d32f2f';
  }

  // Clear inline message and per-field errors when user types
  document.getElementById('currentPassword')?.addEventListener('input', () => {
    if (changePasswordMessage) changePasswordMessage.style.display = 'none';
    if (errorCurrentPassword) clearErrorSignup(errorCurrentPassword);
  });
  document.getElementById('newPassword')?.addEventListener('input', () => {
    if (changePasswordMessage) changePasswordMessage.style.display = 'none';
    if (errorNewPassword) clearErrorSignup(errorNewPassword);
  });
  document.getElementById('confirmPassword')?.addEventListener('input', () => {
    if (changePasswordMessage) changePasswordMessage.style.display = 'none';
    if (errorConfirmPassword) clearErrorSignup(errorConfirmPassword);
  });

  // Also clear edit-profile errors while typing
  document.getElementById('editFirstName')?.addEventListener('input', () => { if (errorEditFirstname) clearErrorSignup(errorEditFirstname); });
  document.getElementById('editLastName')?.addEventListener('input', () => { if (errorEditLastname) clearErrorSignup(errorEditLastname); });
  document.getElementById('editContactNumber')?.addEventListener('input', () => { if (errorEditContact) clearErrorSignup(errorEditContact); });
  document.getElementById('editAddress')?.addEventListener('input', () => { if (errorEditAddress) clearErrorSignup(errorEditAddress); });

  changePasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Clear previous per-field errors
    [errorCurrentPassword, errorNewPassword, errorConfirmPassword].forEach(el => { if (el) clearErrorSignup(el); });

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    let valid = true;

    if (!currentPassword) {
      if (errorCurrentPassword) setErrorSignup(errorCurrentPassword, 'Please enter your current password');
      valid = false;
    }

    if (!newPassword) {
      if (errorNewPassword) setErrorSignup(errorNewPassword, 'Please enter a new password');
      valid = false;
    } else {
      const passValidation = validatePasswordSignup(newPassword);
      if (!passValidation.isValid) {
        if (errorNewPassword) setErrorSignup(errorNewPassword, passValidation.message);
        valid = false;
      }
    }

    // Check if new password is the same as current password
    if (newPassword && currentPassword && newPassword === currentPassword) {
      if (errorNewPassword) setErrorSignup(errorNewPassword, 'New password must be different from your current password');
      valid = false;
    }

    if (!confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

  // Show spinner on save button while processing
  const saveButton = document.querySelector('#changePasswordForm .save-changes');
  if (saveButton) showButtonSpinner(saveButton);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      // Show success toast and close modal after unified duration
      try { showToast('Password changed successfully!', true); } catch (e) {}
      setTimeout(() => {
        changePasswordModal.style.display = 'none';
        changePasswordForm?.reset();
        // ensure inline change password message is cleared (we prefer toasts)
        if (changePasswordMessage) { changePasswordMessage.style.display = 'none'; changePasswordMessage.textContent = ''; }
        if (saveButton) hideButtonSpinner(saveButton);
      }, TOAST_DURATION);
    } catch (error) {
      console.error('Error updating password:', error);
  if (saveButton) hideButtonSpinner(saveButton);
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          if (errorCurrentPassword) setErrorSignup(errorCurrentPassword, 'Incorrect password. Please try again.');
          break;
        case 'auth/weak-password':
          if (errorNewPassword) setErrorSignup(errorNewPassword, 'New password is too weak. Choose a stronger password.');
          break;
        case 'auth/requires-recent-login':
          if (errorCurrentPassword) setErrorSignup(errorCurrentPassword, 'Please sign in again and retry changing your password.');
          break;
        default:
          if (errorCurrentPassword) setErrorSignup(errorCurrentPassword, 'Failed to update password. Try again later.');
      }
    }
  });
});

// Function to load user data
async function loadUserData() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      
      // Get firstName and lastName from Firestore
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.displayName || 'User';
      const contactNumber = userData.contactNumber || userData.contact || 'Not provided';
      const email = userData.email || user.email || 'Not provided';
      const address = userData.address || 'Not provided';

      // Update profile information (combined name in header)
      document.getElementById('profileFullName').textContent = fullName;
      document.getElementById('infoFirstName').textContent = firstName || 'Not provided';
      document.getElementById('infoLastName').textContent = lastName || 'Not provided';
      document.getElementById('infoContactNumber').textContent = contactNumber;
      document.getElementById('infoEmail').textContent = email;
      document.getElementById('infoAddress').textContent = address;

      // Pre-fill edit form with separate name fields
      document.getElementById('editFirstName').value = firstName;
      document.getElementById('editLastName').value = lastName;
      document.getElementById('editContactNumber').value = userData.contactNumber || userData.contact || '';
      document.getElementById('editEmail').value = userData.email || '';
      document.getElementById('editAddress').value = userData.address || '';
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

// Function to update filter dropdown with counts
function updateFilterCounts(allRequests) {
  const statusFilter = document.getElementById('statusFilter');
  if (!statusFilter) return;

  // Calculate counts for each status
  const counts = {
    all: allRequests.length,
    pending: allRequests.filter(r => r.status?.toLowerCase() === 'pending').length,
    approved: allRequests.filter(r => r.status?.toLowerCase() === 'approved').length,
    'in-progress': allRequests.filter(r => r.status?.toLowerCase() === 'in-progress').length,
    completed: allRequests.filter(r => r.status?.toLowerCase() === 'completed').length,
    rejected: allRequests.filter(r => r.status?.toLowerCase() === 'rejected').length,
    cancelled: allRequests.filter(r => r.status?.toLowerCase() === 'cancelled').length
  };

  console.log('[Filter Counts]', counts);

  // Update option text with counts
  const currentValue = statusFilter.value;
  statusFilter.options[0].text = `All Requests (${counts.all})`;
  statusFilter.options[1].text = `Pending (${counts.pending})`;
  statusFilter.options[2].text = `Approved (${counts.approved})`;
  statusFilter.options[3].text = `In Progress (${counts['in-progress']})`;
  statusFilter.options[4].text = `Completed (${counts.completed})`;
  statusFilter.options[5].text = `Rejected (${counts.rejected})`;
  statusFilter.options[6].text = `Cancelled (${counts.cancelled})`;
  
  // Restore selected value
  statusFilter.value = currentValue;
}

// Function to load user requests and display them
async function loadUserRequests(filterStatus = 'all') {
  console.log('[Filter] loadUserRequests called with filter:', filterStatus);
  
  const user = auth.currentUser;
  if (!user) {
    console.log('[Filter] No authenticated user found');
    return;
  }

  console.log('[Filter] Current user ID:', user.uid);

  const requestCardsContainer = document.querySelector('.request-cards');
  if (!requestCardsContainer) {
    console.log('[Filter] Request cards container not found');
    return;
  }

  try {
    console.log('[Filter] Fetching requests from Firestore...');
    
    // Query tents/chairs bookings (without orderBy to avoid index requirement)
    const tentsQuery = query(
      collection(db, "tentsChairsBookings"),
      where("userId", "==", user.uid)
    );
    const tentsSnapshot = await getDocs(tentsQuery);
    console.log('[Filter] Tents & Chairs requests found:', tentsSnapshot.size);

    // Query conference room bookings (without orderBy to avoid index requirement)
    const conferenceQuery = query(
      collection(db, "conferenceRoomBookings"),
      where("userId", "==", user.uid)
    );
    const conferenceSnapshot = await getDocs(conferenceQuery);
    console.log('[Filter] Conference Room requests found:', conferenceSnapshot.size);

    // Clear existing cards
    requestCardsContainer.innerHTML = '';

    // Combine and sort all requests
    const allRequests = [];

    tentsSnapshot.forEach(doc => {
      const data = doc.data();
      allRequests.push({
        id: doc.id,
        type: 'tents-chairs',
        ...data,
        timestamp: data.createdAt?.toMillis() || 0
      });
    });

    conferenceSnapshot.forEach(doc => {
      const data = doc.data();
      allRequests.push({
        id: doc.id,
        type: 'conference-room',
        ...data,
        timestamp: data.createdAt?.toMillis() || 0
      });
    });

    console.log('[Filter] Total requests before filtering:', allRequests.length);
    console.log('[Filter] All requests:', allRequests.map(r => ({ id: r.id, type: r.type, status: r.status })));

    // Update filter dropdown with counts
    updateFilterCounts(allRequests);

    // Filter by status if not "all"
    let filteredRequests = allRequests;
    if (filterStatus !== 'all') {
      filteredRequests = allRequests.filter(request => {
        const matches = request.status?.toLowerCase() === filterStatus.toLowerCase();
        console.log(`[Filter] Request ${request.id} (${request.status}) matches filter "${filterStatus}":`, matches);
        return matches;
      });
      console.log('[Filter] Requests after filtering by status:', filteredRequests.length);
    }

    // Sort by timestamp (newest first)
    filteredRequests.sort((a, b) => b.timestamp - a.timestamp);
    console.log('[Filter] Requests sorted by timestamp (newest first)');

    if (filteredRequests.length === 0) {
      console.log('[Filter] No requests to display. Showing enhanced empty state');
      
      // Enhanced empty state with CTAs
      const emptyStateHTML = filterStatus === 'all' 
        ? `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3 class="empty-state-title">No Requests Yet</h3>
            <p class="empty-state-text">You haven't made any equipment requests or room reservations yet.</p>
            <div class="empty-state-actions">
              <a href="tents-calendar.html" class="empty-state-btn"><span>🪑</span> Browse Tents & Chairs</a>
              <a href="conference-room.html" class="empty-state-btn"><span>🏢</span> Book Conference Room</a>
            </div>
          </div>
        `
        : `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">No ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Requests</h3>
            <p class="empty-state-text">You don't have any ${filterStatus} requests at the moment.</p>
            <div class="empty-state-actions">
              <button class="empty-state-btn" onclick="document.getElementById('statusFilter').value='all'; document.getElementById('statusFilter').dispatchEvent(new Event('change'));"><span>👁️</span> View All Requests</button>
            </div>
          </div>
        `;
      
      requestCardsContainer.innerHTML = emptyStateHTML;
      return;
    }

    console.log('[Filter] Rendering', filteredRequests.length, 'request cards...');
    // Render request cards
    filteredRequests.forEach((request, index) => {
      console.log(`[Filter] Rendering card ${index + 1}/${filteredRequests.length}:`, request.id, request.type, request.status);
      const card = createRequestCard(request);
      requestCardsContainer.appendChild(card);
    });
    console.log('[Filter] All cards rendered successfully');

  } catch (error) {
    console.error("Error loading user requests:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    requestCardsContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 20px;">Failed to load requests. Please refresh the page.</p>';
  }
}

// Helper function to format military time to 12-hour format
function formatTime12Hour(time24) {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
}

// Helper function to get relative time (e.g., "2 days ago")
function getRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
}

// Helper function to sanitize text input (prevent XSS)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and encode special characters
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Helper function to check if date ranges overlap
function dateRangesOverlap(start1, end1, start2, end2) {
  // Convert to Date objects for comparison
  const d1Start = new Date(start1);
  const d1End = new Date(end1);
  const d2Start = new Date(start2);
  const d2End = new Date(end2);
  
  // Check overlap: start1 <= end2 AND end1 >= start2
  return d1Start <= d2End && d1End >= d2Start;
}

// Helper function to check if time ranges overlap
function timeRangesOverlap(start1, end1, start2, end2) {
  // Convert times to minutes for easier comparison
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const t1Start = timeToMinutes(start1);
  const t1End = timeToMinutes(end1);
  const t2Start = timeToMinutes(start2);
  const t2End = timeToMinutes(end2);
  
  // Check overlap: start1 < end2 AND end1 > start2
  return t1Start < t2End && t1End > t2Start;
}

// Helper function to create a request card
function createRequestCard(request) {
  const card = document.createElement('div');
  card.className = 'request-card';

  // Determine status badge class
  const statusClass = `status-${request.status?.toLowerCase().replace(/\s+/g, '-') || 'pending'}`;
  
  // Format date (show words, e.g. "October 31, 2025")
  const rawDate = request.eventDate || request.startDate || '';
  const rawEndDate = request.endDate || '';
  const dateStr = rawDate ? formatDateToWords(rawDate) : 'N/A';
  const endDateStr = rawEndDate ? formatDateToWords(rawEndDate) : '';
  
  // Determine card title and subtitle based on type
  let cardTitle = '';
  let cardSubtitle = '';
  
  if (request.type === 'Conference Room') {
    cardTitle = 'Conference Room Reservation';
    const timeStr = request.startTime && request.endTime 
      ? ` • ${formatTime12Hour(request.startTime)} - ${formatTime12Hour(request.endTime)}` 
      : (request.eventTime ? ` • ${request.eventTime}` : '');
    cardSubtitle = `Date: ${dateStr}${timeStr}`;
    if (request.purpose) {
      cardSubtitle += `\nPurpose: ${request.purpose}`;
    } else if (request.eventTitle) {
      cardSubtitle += `\nPurpose: ${request.eventTitle}`;
    }
  } else if (request.type === 'conference-room' || request.eventDate) {
    // Handle conference-room type (from Firestore)
    cardTitle = 'Conference Room Reservation';
    const timeStr = request.startTime && request.endTime 
      ? ` • ${formatTime12Hour(request.startTime)} - ${formatTime12Hour(request.endTime)}` 
      : (request.eventTime ? ` • ${request.eventTime}` : '');
    cardSubtitle = `Date: ${dateStr}${timeStr}`;
    if (request.purpose) {
      cardSubtitle += `\nPurpose: ${request.purpose}`;
    } else if (request.eventTitle) {
      cardSubtitle += `\nPurpose: ${request.eventTitle}`;
    }
  } else {
    cardTitle = 'Tents & Chairs Borrowing';
    cardSubtitle = `Date: ${dateStr}${endDateStr && endDateStr !== dateStr ? ' - ' + endDateStr : ''}`;
    const items = [];
    if (request.quantityChairs) items.push(`${request.quantityChairs} chairs`);
    if (request.quantityTents) items.push(`${request.quantityTents} tents`);
    if (items.length > 0) {
      cardSubtitle += `\nQty: ${items.join(', ')}`;
    }
  }

  // Add relative timestamp
  const relativeTime = getRelativeTime(request.timestamp);

  card.innerHTML = `
    <div class="request-card-header">
      <h3>${cardTitle}</h3>
      <span class="status-badge ${statusClass}">${request.status || 'Pending'}</span>
    </div>
    <div class="request-card-body">
      <p>${cardSubtitle.replace(/\n/g, '<br>')}</p>
      <p class="request-timestamp">Submitted ${relativeTime}</p>
    </div>
    <div class="request-card-footer">
      <a href="#" class="view-details-link">View</a>
    </div>
  `;

  // Add click handler to view details
  card.querySelector('.view-details-link').addEventListener('click', (e) => {
    e.preventDefault();
    showRequestDetailsModal(request);
  });

  return card;
}

// Function to format date as "Month Day, Year" (e.g., "October 31, 2025")
function formatDateToWords(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Function to show request details modal
function showRequestDetailsModal(request) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('requestDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'requestDetailsModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content request-details-modal">
        <h2 id="modalRequestType">Request Details</h2>
        <div id="modalRequestContent" class="request-details-content"></div>
        <div class="modal-actions">
          <button type="button" class="close-details-btn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add close handlers
    const closeDetailsBtn = modal.querySelector('.close-details-btn');
    
    closeDetailsBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Populate modal with request details
  const modalTitle = modal.querySelector('#modalRequestType');
  const modalContent = modal.querySelector('#modalRequestContent');
  
  // Set proper modal title
  const modalTitleText = request.type === 'conference-room' || request.eventDate 
    ? 'Conference Room Reservation Request' 
    : 'Tents & Chairs Borrowing Request';
  modalTitle.textContent = modalTitleText;

  // Debug: Log request type and data
  console.log('Request type:', request.type);
  console.log('Request data:', request);

  // Determine status badge class
  const statusClass = `status-${request.status?.toLowerCase().replace(/\s+/g, '-') || 'pending'}`;
  
  let detailsHTML = `
    <div class="detail-row status-row">
      <span class="detail-label">Status:</span>
      <span class="status-badge ${statusClass}">${request.status || 'Pending'}</span>
    </div>
  `;

  // Check if this is a conference room request (check multiple possible values)
  const isConferenceRoom = request.type === 'Conference Room' || 
                           request.type === 'conference-room' || 
                           request.eventDate || 
                           request.purpose;

  if (isConferenceRoom) {
    const timeStr = request.startTime && request.endTime 
      ? `${formatTime12Hour(request.startTime)} - ${formatTime12Hour(request.endTime)}` 
      : (request.eventTime || 'N/A');
    const fullName = request.firstName && request.lastName 
      ? `${request.firstName} ${request.lastName}` 
      : (request.fullName || 'N/A');
    detailsHTML += `
      <div class="detail-row">
        <span class="detail-label">Full Name:</span>
        <span class="detail-value">${fullName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contact Number:</span>
        <span class="detail-value">${request.contactNumber || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Address:</span>
        <span class="detail-value">${request.address || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Date:</span>
        <span class="detail-value">${formatDateToWords(request.eventDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Time:</span>
        <span class="detail-value">${timeStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Purpose of Use:</span>
        <span class="detail-value">${request.purpose || request.eventPurpose || 'N/A'}</span>
      </div>
    `;
  } else {
    const fullName = request.firstName && request.lastName 
      ? `${request.firstName} ${request.lastName}` 
      : (request.fullName || 'N/A');
    detailsHTML += `
      <div class="detail-row">
        <span class="detail-label">Full Name:</span>
        <span class="detail-value">${fullName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contact Number:</span>
        <span class="detail-value">${request.contactNumber || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Complete Address:</span>
        <span class="detail-value">${request.completeAddress || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Start Date:</span>
        <span class="detail-value">${formatDateToWords(request.startDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">End Date:</span>
        <span class="detail-value">${formatDateToWords(request.endDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Quantity of Chairs:</span>
        <span class="detail-value">${request.quantityChairs || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Quantity of Tents:</span>
        <span class="detail-value">${request.quantityTents || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Mode of Receiving:</span>
        <span class="detail-value">${request.modeOfReceiving || 'N/A'}</span>
      </div>
    `;
  }

  detailsHTML += `
    <div class="detail-row">
      <span class="detail-label">Submitted On:</span>
      <span class="detail-value">${request.createdAt ? new Date(request.timestamp).toLocaleString() : 'N/A'}</span>
    </div>
  `;

  modalContent.innerHTML = detailsHTML;
  
  // Update modal actions to include cancel button for pending requests
  const modalActions = modal.querySelector('.modal-actions');
  
  if (request.status?.toLowerCase() === 'pending') {
    modalActions.innerHTML = `
      <button type="button" class="cancel-request-btn" data-request-id="${request.id}" data-request-type="${request.type}">Cancel Request</button>
      <button type="button" class="close-details-btn">Close</button>
    `;
    
    // Add cancel button handler
    const cancelBtn = modalActions.querySelector('.cancel-request-btn');
    cancelBtn.addEventListener('click', () => handleCancelRequest(request));
  } else {
    modalActions.innerHTML = `
      <button type="button" class="close-details-btn">Close</button>
    `;
  }
  
  // Re-attach close handler
  const closeBtn = modalActions.querySelector('.close-details-btn');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Show modal
  modal.style.display = 'block';
}

// Function to handle request cancellation
async function handleCancelRequest(request) {
  const confirmMessage = `Are you sure you want to cancel this ${request.type === 'conference-room' ? 'Conference Room Reservation' : 'Tents & Chairs Borrowing'} request?\n\nThis action cannot be undone, but you can submit a new request afterwards.`;
  
  showConfirm(confirmMessage, async () => {
    try {
      const collectionName = request.type === 'conference-room' ? 'conferenceRoomBookings' : 'tentsChairsBookings';
      
      // Update request status to 'cancelled'
      await updateDoc(doc(db, collectionName, request.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });

      // Close modal
      const modal = document.getElementById('requestDetailsModal');
      if (modal) {
        modal.style.display = 'none';
      }

      // Show success message and reload requests
      showAlert('Your request has been cancelled successfully. You can now submit a new request.', true, () => {
        // Reload the requests list
        loadUserRequests();
      });

    } catch (error) {
      console.error('Error cancelling request:', error);
      showAlert('Failed to cancel request. Please try again.', false);
    }
  });
}

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
  // Use the IDs used in `UserProfile.html` so the function works there.
  const profileNameEl = document.getElementById('profileFullName');
  const infoFirstNameEl = document.getElementById('infoFirstName');
  const infoLastNameEl = document.getElementById('infoLastName');
  const infoContactNumberEl = document.getElementById('infoContactNumber');
  const infoEmailEl = document.getElementById('infoEmail');
  const infoAddressEl = document.getElementById('infoAddress');

  // If required elements are not on the page, skip silently.
  if (!profileNameEl && !infoFirstNameEl && !infoLastNameEl) {
    console.log("Profile elements not found on this page, skipping data population.");
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Get firstName and lastName, construct full name
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.displayName || 'User';

      if (profileNameEl) profileNameEl.textContent = fullName;
      if (infoFirstNameEl) infoFirstNameEl.textContent = firstName || "Not provided";
      if (infoLastNameEl) infoLastNameEl.textContent = lastName || "Not provided";
      if (infoContactNumberEl) infoContactNumberEl.textContent = userData.contactNumber || "Not provided";
      if (infoEmailEl) infoEmailEl.textContent = userData.email || user.email || "Not provided";
      if (infoAddressEl) infoAddressEl.textContent = userData.address || "Not provided";
    } else {
      console.warn("No user profile document found in Firestore, using Auth fallback.");
      if (profileNameEl) profileNameEl.textContent = user.displayName || "User";
      if (infoFirstNameEl) infoFirstNameEl.textContent = "Not provided";
      if (infoLastNameEl) infoLastNameEl.textContent = "Not provided";
      if (infoEmailEl) infoEmailEl.textContent = user.email || "Not provided";
      if (infoContactNumberEl) infoContactNumberEl.textContent = "Not provided";
      if (infoAddressEl) infoAddressEl.textContent = "Not provided";
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
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
    // Handle navigation visibility based on auth state
    onAuthStateChanged(auth, (user) => {
        const userIconNav = document.getElementById('userIconNav');
        const loginButtonNav = document.getElementById('loginButtonNav');
        
        if (user) {
            // User is logged in - show profile icon, hide login button
            if (userIconNav) userIconNav.style.display = 'block';
            if (loginButtonNav) loginButtonNav.style.display = 'none';
        } else {
            // User is logged out - hide profile icon, show login button
            if (userIconNav) userIconNav.style.display = 'none';
            if (loginButtonNav) loginButtonNav.style.display = 'block';
        }
    });

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

// Initialize scroll-triggered keyframe animations on user.html
if (window.location.pathname.endsWith('user.html') || window.location.pathname.endsWith('/user')) {
  // Handle navigation visibility based on auth state
  onAuthStateChanged(auth, (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - show profile icon, hide login button
      if (userIconNav) userIconNav.style.display = 'block';
      if (loginButtonNav) loginButtonNav.style.display = 'none';
    } else {
      // User is logged out - hide profile icon, show login button
      if (userIconNav) userIconNav.style.display = 'none';
      if (loginButtonNav) loginButtonNav.style.display = 'block';
    }
  });

  const animElements = document.querySelectorAll('.animate-on-scroll');

  // Ensure elements start hidden (CSS class handles this, but keep as a safeguard)
  animElements.forEach(el => {
    el.classList.remove('animated');
  });

  function handleUserAnimations() {
    animElements.forEach(el => {
      if (isInViewport(el) && !el.classList.contains('animated')) {
        el.classList.add('animated');
      }
    });
  }

  // Throttled scroll listener
  window.addEventListener('scroll', throttle(handleUserAnimations, 100));
  // Run once on load
  setTimeout(handleUserAnimations, 120);
}

// Initialize ContactPage.html navigation visibility
if (window.location.pathname.endsWith('ContactPage.html') || window.location.pathname.endsWith('/ContactPage')) {
    onAuthStateChanged(auth, (user) => {
        const userIconNav = document.getElementById('userIconNav');
        const loginButtonNav = document.getElementById('loginButtonNav');
        
        if (user) {
            // User is logged in - show profile icon, hide login button
            if (userIconNav) userIconNav.style.display = 'block';
            if (loginButtonNav) loginButtonNav.style.display = 'none';
        } else {
            // User is logged out - hide profile icon, show login button
            if (userIconNav) userIconNav.style.display = 'none';
            if (loginButtonNav) loginButtonNav.style.display = 'block';
        }
    });
}


/* =====================================================
   CONFERENCE ROOM CALENDAR SCRIPT
   Add this section to your script.js file
   NOTE: This must be added AFTER your Firebase imports
===================================================== */

// Check if we're on the conference room calendar page
if (window.location.pathname.endsWith('conference-room.html') || window.location.pathname.endsWith('/conference-room')) {
  
  // Handle navigation visibility based on auth state
  onAuthStateChanged(auth, (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - show profile icon, hide login button
      if (userIconNav) userIconNav.style.display = 'block';
      if (loginButtonNav) loginButtonNav.style.display = 'none';
    } else {
      // User is logged out - hide profile icon, show login button
      if (userIconNav) userIconNav.style.display = 'none';
      if (loginButtonNav) loginButtonNav.style.display = 'block';
    }
  });

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
    // Check if user is logged in before allowing booking
    const user = auth.currentUser;
    if (!user) {
      showAlert('Please log in to book a date. You must be logged in to make a reservation.', false);
      return;
    }
    // Redirect to request form page with date parameter
    window.location.href = `conference-request.html?date=${dateStr}`;
  }

  function closeBookingModal() {
    // No longer needed - keeping for compatibility
  }

  async function handleFormSubmit(e) {
    // Form submission now handled on conference-request.html page
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
  
  // Handle navigation visibility based on auth state
  onAuthStateChanged(auth, (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - show profile icon, hide login button
      if (userIconNav) userIconNav.style.display = 'block';
      if (loginButtonNav) loginButtonNav.style.display = 'none';
    } else {
      // User is logged out - hide profile icon, show login button
      if (userIconNav) userIconNav.style.display = 'none';
      if (loginButtonNav) loginButtonNav.style.display = 'block';
    }
  });

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
    // Check if user is logged in before allowing booking
    const user = auth.currentUser;
    if (!user) {
      showAlert('Please log in to book a date. You must be logged in to make a reservation.', false);
      return;
    }
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

    // Autofill user data when auth state is ready
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Autofill name, contact, and complete address fields
        autofillUserData({
          'firstName': 'firstName',
          'lastName': 'lastName',
          'contactNumber': 'contactNumber',
          'completeAddress': 'address'
        });
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
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const completeAddress = document.getElementById('completeAddress').value.trim();
    const purposeOfUse = document.getElementById('purposeOfUse')?.value.trim() || '';
    const quantityChairsRaw = document.getElementById('quantityChairs').value;
    const quantityTentsRaw = document.getElementById('quantityTents').value;
    const quantityChairs = quantityChairsRaw === '' ? 0 : parseInt(quantityChairsRaw, 10);
    const quantityTents = quantityTentsRaw === '' ? 0 : parseInt(quantityTentsRaw, 10);
    const modeOfReceiving = document.getElementById('modeOfReceiving').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Reset all errors
    clearAllErrors();

    let isValid = true;

    // Validate First Name
    if (!firstName) {
      setFieldError('firstName', 'Please enter your first name');
      isValid = false;
    } else if (firstName.length < 2) {
      setFieldError('firstName', 'First name must be at least 2 characters long');
      isValid = false;
    } else if (!/^[a-zA-Z\s'\-]+$/.test(firstName)) {
      setFieldError('firstName', 'First name can only contain letters, spaces, hyphens, and apostrophes');
      isValid = false;
    }

    // Validate Last Name
    if (!lastName) {
      setFieldError('lastName', 'Please enter your last name');
      isValid = false;
    } else if (lastName.length < 2) {
      setFieldError('lastName', 'Last name must be at least 2 characters long');
      isValid = false;
    } else if (!/^[a-zA-Z\s'\-]+$/.test(lastName)) {
      setFieldError('lastName', 'Last name can only contain letters, spaces, hyphens, and apostrophes');
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

    // Validate Purpose of Use
    if (!purposeOfUse) {
      setFieldError('purposeOfUse', 'Please enter the purpose of use');
      isValid = false;
    } else if (purposeOfUse.length < 3) {
      setFieldError('purposeOfUse', 'Purpose must be at least 3 characters');
      isValid = false;
    }


    // Validate Quantity of Chairs (only when > 0)
    if (quantityChairs > 0) {
      if (quantityChairs < 20) {
        setFieldError('quantityChairs', 'Quantity must be at least 20');
        isValid = false;
      } else if (quantityChairs > 600) {
        setFieldError('quantityChairs', 'Quantity cannot exceed 600');
        isValid = false;
      }
    }

    // Validate Quantity of Tents (only when > 0)
    if (quantityTents > 0) {
      if (quantityTents < 1) {
        setFieldError('quantityTents', 'Quantity must be at least 1');
        isValid = false;
      } else if (quantityTents > 24) {
        setFieldError('quantityTents', 'Quantity cannot exceed 24');
        isValid = false;
      }
    }

    // Ensure user borrows at least one item (either chairs or tents)
    if ((quantityChairs === 0 || isNaN(quantityChairs)) && (quantityTents === 0 || isNaN(quantityTents))) {
      const qtyMessage = 'Please borrow at least one item: set tents or chairs to more than 0';

      // Visual error on the fields (red box via class)
      const chairsField = document.getElementById('quantityChairs');
      const tentsField = document.getElementById('quantityTents');
      if (chairsField) {
        chairsField.classList.add('error');
        const fg = chairsField.closest('.form-group'); if (fg) fg.classList.add('error');
      }
      if (tentsField) {
        tentsField.classList.add('error');
        const fg2 = tentsField.closest('.form-group'); if (fg2) fg2.classList.add('error');
      }

      // Show explicit message under BOTH quantity inputs (bypass setFieldError which suppresses quantity messages)
      const errCh = document.getElementById('errorQuantityChairs');
      const errTe = document.getElementById('errorQuantityTents');
      if (errCh) errCh.textContent = qtyMessage;
      if (errTe) errTe.textContent = qtyMessage;

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
      // Scroll to first field with a visual error (covers cases where quantity messages are suppressed)
      const firstVisual = document.querySelector('.form-group.error, .error');
      if (firstVisual) {
        firstVisual.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare form data
    const formData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      contactNumber: contactNumber, // Phone numbers don't need sanitization
      completeAddress: sanitizeInput(completeAddress),
      purposeOfUse: sanitizeInput(purposeOfUse),
      quantityChairs: quantityChairs,
      quantityTents: quantityTents,
      modeOfReceiving: modeOfReceiving,
      startDate: startDate,
      endDate: endDate,
      status: 'pending',
      requestDate: new Date().toISOString(),
      type: 'tents-chairs'
    };

    // Show loading spinner on submit button
    const submitBtn = document.querySelector('#tentsChairsForm button[type="submit"]');
    const originalBtnText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Checking...';
    }

    try {
      // Check if user is logged in
      const user = auth.currentUser;
      if (!user) {
        showAlert('Please login to submit a request.', false, () => {
          window.location.href = `index.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        });
        return;
      }

      // Verify userId matches authenticated user (security check)
      if (!user.uid) {
        showAlert('Authentication error. Please log out and log in again.', false);
        return;
      }

      // Check for identical duplicate requests (same dates AND quantities)
      console.log('[Tents Duplicate Check] Checking for identical requests...');
      console.log('[Tents Duplicate Check] userId:', user.uid);
      console.log('[Tents Duplicate Check] Requested dates:', startDate, 'to', endDate);
      console.log('[Tents Duplicate Check] Quantities - Chairs:', quantityChairs, 'Tents:', quantityTents);
      
      const duplicateQuery = query(
        collection(db, "tentsChairsBookings"),
        where("userId", "==", user.uid),
        where("startDate", "==", startDate),
        where("endDate", "==", endDate)
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      console.log('[Tents Duplicate Check] Found', duplicateSnapshot.size, 'requests with same dates');
      
      // Filter for identical quantities with pending/approved status (exclude cancelled)
      const identicalRequests = duplicateSnapshot.docs.filter(doc => {
        const data = doc.data();
        const isPendingOrApproved = data.status === 'pending' || data.status === 'approved';
        
        // Exclude cancelled requests
        if (!isPendingOrApproved || data.status === 'cancelled') return false;
        
        // Check if quantities are identical
        const sameChairs = parseInt(data.quantityChairs) === parseInt(quantityChairs);
        const sameTents = parseInt(data.quantityTents) === parseInt(quantityTents);
        
        return sameChairs && sameTents;
      });
      
      if (identicalRequests.length > 0) {
        const existingRequest = identicalRequests[0].data();
        console.log('[Tents Duplicate Check] Identical request found:', existingRequest);
        showAlert(
          `You already have a ${existingRequest.status} request for the same dates (${existingRequest.startDate} to ${existingRequest.endDate}) with the same quantities (${existingRequest.quantityChairs} chairs, ${existingRequest.quantityTents} tents). Please wait for approval, modify your existing request, or cancel it before submitting a new one.`,
          false
        );
        return;
      }
      
      console.log('[Tents Duplicate Check] No identical requests found, proceeding with submission...');

      // Update button to show submitting state
      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
      }

      // Save to Firestore with user information
      await addDoc(collection(db, "tentsChairsBookings"), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp()
      });

      console.log('Tents & Chairs Request:', formData);

      // Show success message
      showAlert('Your tents & chairs request has been submitted successfully! You can check the status in your profile.', true, () => {
        window.location.href = 'UserProfile.html';
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('Failed to submit request. Please try again.');
    } finally {
      // Restore button state
      if (submitBtn && originalBtnText) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);

    // Add visual error state to the field and its parent .form-group (if present)
    if (field) {
      field.classList.add('error');
      const formGroup = field.closest('.form-group');
      if (formGroup) formGroup.classList.add('error');
    }

    // For quantity fields we only want the red visual box — do not show the popup/text message.
    if (errorElement) {
      if (fieldId === 'quantityChairs' || fieldId === 'quantityTents') {
        errorElement.textContent = '';
      } else {
        errorElement.textContent = message;
      }
    }
  }

  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    if (formGroup) formGroup.classList.remove('error');
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
    
    // Remove error class from any elements (inputs/selects and .form-group wrappers)
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(el => el.classList.remove('error'));
  }
}

/* =====================================================
   END OF TENTS & CHAIRS REQUEST FORM SCRIPT
===================================================== */

/* =====================================================
   AUTOFILL USER DATA HELPER FUNCTION
   - Fetches user profile data from Firestore
   - Autofills name, contact, and address fields
   - Adds subtle visual indicator (light background)
   - Fails silently if profile is incomplete
   - All fields remain editable
===================================================== */
async function autofillUserData(fieldMappings) {
  try {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      console.log('[Autofill] User not logged in, skipping autofill');
      return;
    }

    console.log('[Autofill] Fetching user data for:', user.uid);

    // Fetch user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log('[Autofill] User document not found, skipping autofill');
      return;
    }

    const userData = userDocSnap.data();
    console.log('[Autofill] User data retrieved successfully');

    // Autofill each field based on mappings
    Object.keys(fieldMappings).forEach(fieldId => {
      const dataKey = fieldMappings[fieldId];
      const fieldElement = document.getElementById(fieldId);
      const value = userData[dataKey];

      if (fieldElement && value) {
        fieldElement.value = value;
        // Add autofill class for visual indicator
        fieldElement.classList.add('autofilled');
        console.log(`[Autofill] Filled ${fieldId} with ${dataKey}:`, value);
      } else if (fieldElement && !value) {
        console.log(`[Autofill] No data for ${fieldId} (${dataKey}), skipping`);
      } else if (!fieldElement) {
        console.warn(`[Autofill] Field element not found: ${fieldId}`);
      }
    });

    console.log('[Autofill] Autofill completed successfully');
  } catch (error) {
    // Fail silently - don't show error to user
    console.error('[Autofill] Error autofilling user data:', error);
  }
}
/* =====================================================
   END OF AUTOFILL USER DATA HELPER FUNCTION
===================================================== */


/* =====================================================
   START OF CONFERENCE ROOM REQUEST FORM SCRIPT
===================================================== */

// Check if we're on the conference room request form page
if (window.location.pathname.endsWith('conference-request.html') || window.location.pathname.endsWith('/conference-request')) {
  
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('conferenceRoomForm');
    
    // Get URL parameters (if redirected from calendar with a date)
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDate = urlParams.get('date');
    
    if (preselectedDate) {
      document.getElementById('eventDate').value = preselectedDate;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;

    // Populate time dropdowns
    populateTimeDropdowns();

    // Autofill user data when auth state is ready
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Autofill name, contact, and address fields
        autofillUserData({
          'firstName': 'firstName',
          'lastName': 'lastName',
          'contactNumber': 'contactNumber',
          'address': 'address'
        });
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
    form.addEventListener('submit', handleConferenceRoomSubmit);
  });

  function populateTimeDropdowns() {
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');

    // Clear existing options
    startTimeSelect.innerHTML = '<option value="">Start Time</option>';
    endTimeSelect.innerHTML = '<option value="">End Time</option>';

    // Generate time options from 8:00 AM to 5:00 PM
    for (let hour = 8; hour <= 17; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      const displayTime = hour < 12 ? timeString + ' AM' : 
                         (hour === 12 ? timeString + ' PM' : 
                         (hour - 12).toString().padStart(2, '0') + ':00 PM');
      
      startTimeSelect.add(new Option(displayTime, timeString));
      endTimeSelect.add(new Option(displayTime, timeString));
    }
  }

  async function handleConferenceRoomSubmit(e) {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const purpose = document.getElementById('purpose').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const address = document.getElementById('address').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    // Reset all errors
    clearAllErrors();

    let isValid = true;

    // Validate First Name
    if (!firstName) {
      setFieldError('firstName', 'Please enter your first name');
      isValid = false;
    } else if (firstName.length < 2) {
      setFieldError('firstName', 'First name must be at least 2 characters long');
      isValid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
      setFieldError('firstName', 'First name can only contain letters, spaces, hyphens, and apostrophes');
      isValid = false;
    }

    // Validate Last Name
    if (!lastName) {
      setFieldError('lastName', 'Please enter your last name');
      isValid = false;
    } else if (lastName.length < 2) {
      setFieldError('lastName', 'Last name must be at least 2 characters long');
      isValid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
      setFieldError('lastName', 'Last name can only contain letters, spaces, hyphens, and apostrophes');
      isValid = false;
    }

    // Validate Purpose
    if (!purpose) {
      setFieldError('purpose', 'Purpose of use is required');
      isValid = false;
    } else if (purpose.length < 5) {
      setFieldError('purpose', 'Please provide a more detailed purpose');
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

    // Validate Event Date
    if (!eventDate) {
      setFieldError('eventDate', 'Event date is required');
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(eventDate + 'T00:00:00');
      
      if (selectedDate < today) {
        setFieldError('eventDate', 'Event date cannot be in the past');
        isValid = false;
      }
    }

    // Validate Address
    if (!address) {
      setFieldError('address', 'Address is required');
      isValid = false;
    } else if (address.length < 10) {
      setFieldError('address', 'Please provide a complete address');
      isValid = false;
    }

    // Validate Time
    if (!startTime) {
      setFieldError('startTime', 'Start time is required');
      isValid = false;
    }
    
    if (!endTime) {
      setFieldError('endTime', 'End time is required');
      isValid = false;
    } else if (startTime && endTime <= startTime) {
      setFieldError('endTime', 'End time must be after start time');
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
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      purpose: sanitizeInput(purpose),
      contactNumber: contactNumber, // Phone numbers don't need sanitization
      eventDate: eventDate,
      address: sanitizeInput(address),
      startTime: startTime,
      endTime: endTime,
      status: 'pending',
      requestDate: new Date().toISOString(),
      type: 'conference-room'
    };

    // Show loading spinner on submit button
    const submitBtn = document.querySelector('#conferenceRoomForm button[type="submit"]');
    const originalBtnText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Checking...';
    }

    try {
      // Check if user is logged in
      const user = auth.currentUser;
      if (!user) {
        showAlert('Please login to submit a request.', false, () => {
          window.location.href = `index.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        });
        return;
      }

      // Verify userId matches authenticated user (security check)
      if (!user.uid) {
        showAlert('Authentication error. Please log out and log in again.', false);
        return;
      }

      // Check for overlapping time requests on the same date
      console.log('[Duplicate Check] Checking for overlapping time requests...');
      console.log('[Duplicate Check] userId:', user.uid);
      console.log('[Duplicate Check] eventDate:', eventDate);
      console.log('[Duplicate Check] time range:', startTime, '-', endTime);
      
      const duplicateQuery = query(
        collection(db, "conferenceRoomBookings"),
        where("userId", "==", user.uid),
        where("eventDate", "==", eventDate)
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      console.log('[Duplicate Check] Found', duplicateSnapshot.size, 'requests on same date');
      
      // Filter for overlapping times with pending/approved status (exclude cancelled)
      const overlappingRequests = duplicateSnapshot.docs.filter(doc => {
        const data = doc.data();
        const isPendingOrApproved = data.status === 'pending' || data.status === 'approved';
        
        // Exclude cancelled requests
        if (!isPendingOrApproved || data.status === 'cancelled') return false;
        
        // Check if time ranges overlap
        const hasOverlap = timeRangesOverlap(startTime, endTime, data.startTime, data.endTime);
        
        return hasOverlap;
      });
      
      if (overlappingRequests.length > 0) {
        const existingRequest = overlappingRequests[0].data();
        console.log('[Duplicate Check] Overlapping request found:', existingRequest);
        showAlert(
          `You already have a ${existingRequest.status} reservation for ${eventDate} from ${formatTime12Hour(existingRequest.startTime)} to ${formatTime12Hour(existingRequest.endTime)} which overlaps with your requested time. Please choose a different time slot or cancel your existing request.`,
          false
        );
        return;
      }
      
      console.log('[Duplicate Check] No overlapping requests found, proceeding with submission...');

      // Update button to show submitting state
      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
      }

      // Save to Firestore with user information
      await addDoc(collection(db, "conferenceRoomBookings"), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp()
      });

      console.log('Conference Room Request:', formData);

      // Show success message
      showAlert('Your conference room reservation request has been submitted successfully! You can check the status in your profile.', true, () => {
        window.location.href = 'UserProfile.html';
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('Failed to submit request. Please try again.');
    } finally {
      // Restore button state
      if (submitBtn && originalBtnText) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
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
   END OF CONFERENCE ROOM REQUEST FORM SCRIPT
===================================================== */

// === CONFERENCE REQUEST PAGE AUTH NAVIGATION ===
if (window.location.pathname.endsWith('conference-request.html')) {
  onAuthStateChanged(auth, (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - show profile icon, hide LOGIN button
      if (userIconNav) userIconNav.style.display = 'block';
      if (loginButtonNav) loginButtonNav.style.display = 'none';
    } else {
      // User is logged out - hide profile icon, show LOGIN button
      if (userIconNav) userIconNav.style.display = 'none';
      if (loginButtonNav) loginButtonNav.style.display = 'block';
    }
  });
}

// === TENTS & CHAIRS REQUEST PAGE AUTH NAVIGATION ===
if (window.location.pathname.endsWith('tents-chairs-request.html')) {
  onAuthStateChanged(auth, (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - show profile icon, hide LOGIN button
      if (userIconNav) userIconNav.style.display = 'block';
      if (loginButtonNav) loginButtonNav.style.display = 'none';
    } else {
      // User is logged out - hide profile icon, show LOGIN button
      if (userIconNav) userIconNav.style.display = 'none';
      if (loginButtonNav) loginButtonNav.style.display = 'block';
    }
  });
}

// === ADMIN PAGE AUTH NAVIGATION & PROTECTION ===
if (window.location.pathname.endsWith('admin.html')) {
  onAuthStateChanged(auth, async (user) => {
    const userIconNav = document.getElementById('userIconNav');
    const loginButtonNav = document.getElementById('loginButtonNav');
    
    if (user) {
      // User is logged in - verify admin role
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;
          
          if (userRole === 'admin') {
            // Admin confirmed - show profile icon, hide LOGIN button
            if (userIconNav) userIconNav.style.display = 'block';
            if (loginButtonNav) loginButtonNav.style.display = 'none';
          } else {
            // Not an admin - redirect to user page
            console.warn('Non-admin user attempted to access admin.html');
            showAlert('Access denied. This page is for administrators only.', false, () => {
              window.location.href = 'user.html';
            });
          }
        } else {
          // User document doesn't exist - redirect to login
          window.location.href = 'index.html';
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        window.location.href = 'index.html';
      }
    } else {
      // User is logged out - redirect to login
      window.location.href = 'index.html';
    }
  });
}

// ===============================
// MODAL CONFIRMATION HANDLER
// ===============================
if (window.location.pathname.endsWith('tents-chairs-request.html') || window.location.pathname.endsWith('/tents-chairs-request')) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById("tentsChairsForm");
    const modal = document.getElementById("confirmationModal");
    const cancelModal = document.getElementById("cancelModal");
    const confirmModal = document.getElementById("confirmModal");

    if (!form || !modal || !cancelModal || !confirmModal) {
      console.warn('[Modal] Required elements not found');
      return;
    }

    // Flag to track if user has confirmed via modal
    let isConfirmedSubmission = false;

    // Intercept the form submit event that's added in the main handler
    form.addEventListener("submit", function(e) {
      // If already confirmed, let it proceed to handleTentsChairsSubmit
      if (isConfirmedSubmission) {
        isConfirmedSubmission = false; // Reset for next time
        console.log('[Modal] Confirmed submission, proceeding to validation');
        return; // Let handleTentsChairsSubmit handle it
      }

      // Otherwise, prevent default and show confirmation modal first
      e.preventDefault();
      e.stopImmediatePropagation(); // Stop other listeners from firing
      
      console.log('[Modal] Showing confirmation modal');

      // Get form field values for summary
      const purpose = document.getElementById("purposeOfUse")?.value || "—";
      const tents = document.getElementById("quantityTents")?.value || "0";
      const chairs = document.getElementById("quantityChairs")?.value || "0";
      const start = document.getElementById("startDate")?.value || "—";
      const end = document.getElementById("endDate")?.value || "—";
      const mode = document.getElementById("modeOfReceiving")?.value || "—";

      // Fill modal summary
      const summaryPurpose = document.getElementById("summaryPurpose");
      const summaryTents = document.getElementById("summaryTents");
      const summaryChairs = document.getElementById("summaryChairs");
      const summaryStart = document.getElementById("summaryStart");
      const summaryEnd = document.getElementById("summaryEnd");
      const summaryMode = document.getElementById("summaryMode");

      if (summaryPurpose) summaryPurpose.textContent = purpose;
      if (summaryTents) summaryTents.textContent = tents;
      if (summaryChairs) summaryChairs.textContent = chairs;
      if (summaryStart) summaryStart.textContent = start;
      if (summaryEnd) summaryEnd.textContent = end;
      if (summaryMode) summaryMode.textContent = mode;

      // Show modal
      modal.style.display = "flex";
    }, true); // Use capture phase to intercept before handleTentsChairsSubmit

    // Cancel button - close modal without submitting
    cancelModal.addEventListener("click", () => {
      console.log('[Modal] Cancelled');
      modal.style.display = "none";
    });

    // Confirm button - proceed with actual submission
    confirmModal.addEventListener("click", () => {
      console.log('[Modal] Confirmed, triggering form submission');
      modal.style.display = "none";
      
      // Set flag so next submit proceeds
      isConfirmedSubmission = true;
      
      // Manually trigger the submit event which will now proceed to handleTentsChairsSubmit
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        console.log('[Modal] Clicked outside, closing');
        modal.style.display = "none";
      }
    });
  });
}

/* =====================================================
   END OF MODAL CONFIRMATION HANDLER
===================================================== */

