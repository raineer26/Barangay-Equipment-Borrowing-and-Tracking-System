// script.js
// All JS scripts from HTML files are combined here.

/* =====================
   LOGIN PAGE SCRIPT
   (from index.html)
====================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { signInWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc ,onSnapshot, } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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
const inventoryRef = collection(db, "inventory");

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
/*
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
*/

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
    } else {
      setSuccessSignup(errorEditFirstname);
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
    } else {
      setSuccessSignup(errorEditLastname);
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
    } else {
      setSuccessSignup(errorEditContact);
    }

    // Address validation with sanitization
    const sanitizedAddress = address.replace(/<[^>]*>/g, ''); // Basic XSS prevention
    if (!sanitizedAddress) {
      setErrorSignup(errorEditAddress, "Address can't be blank");
      valid = false;
    } else if (sanitizedAddress !== address) {
      setErrorSignup(errorEditAddress, "Address contains invalid characters");
      valid = false;
    } else {
      setSuccessSignup(errorEditAddress);
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
   FINAL FIXED: TENTS & CHAIRS REQUEST FORM SCRIPT
   Flow: Validation → Summary Modal → Firebase Submit
===================================================== */

if (window.location.pathname.endsWith('tents-chairs-request.html') || window.location.pathname.endsWith('/tents-chairs-request')) {

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tentsChairsForm');
    const summaryModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelModal');
    if (!form) return;

    // Preselect date (from calendar)
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDate = urlParams.get('date');
    if (preselectedDate) document.getElementById('startDate').value = preselectedDate;

    // Setup date limits
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;

    document.getElementById('startDate').addEventListener('change', function() {
      const start = this.value;
      document.getElementById('endDate').min = start;
      if (document.getElementById('endDate').value < start)
        document.getElementById('endDate').value = '';
    });

    // Autofill user data when logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        autofillUserData({
          'firstName': 'firstName',
          'lastName': 'lastName',
          'contactNumber': 'contactNumber',
          'completeAddress': 'address'
        });
      }
    });

    // Remove errors on input
    form.querySelectorAll('input, select').forEach(input =>
      input.addEventListener('input', () => clearFieldError(input))
    );

    // Submit form
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearAllErrors();
      const data = getFormValues();
      if (!validateForm(data)) return;

      // Populate modal data and show confirmation
      populateSummaryModal(data);
      summaryModal.style.display = 'flex';

      cancelBtn.onclick = () => (summaryModal.style.display = 'none');
      confirmBtn.onclick = async () => {
        summaryModal.style.display = 'none';
        await submitTentsChairsRequest(data);
      };
    });
  });

  // ========== HELPERS ==========

  function getFormValues() {
    return {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      contactNumber: document.getElementById('contactNumber').value.trim(),
      completeAddress: document.getElementById('completeAddress').value.trim(),
      purposeOfUse: document.getElementById('purposeOfUse').value.trim(),
      quantityChairs: parseInt(document.getElementById('quantityChairs').value || 0),
      quantityTents: parseInt(document.getElementById('quantityTents').value || 0),
      modeOfReceiving: document.getElementById('modeOfReceiving').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value
    };
  }

  function validateForm(d) {
    let valid = true;
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(d.startDate + 'T00:00:00');
    const end = new Date(d.endDate + 'T00:00:00');

    if (!d.firstName) setFieldError('firstName', 'Enter your first name'), valid = false;
    if (!d.lastName) setFieldError('lastName', 'Enter your last name'), valid = false;
    if (!/^09\d{9}$/.test(d.contactNumber)) setFieldError('contactNumber', 'Must start with 09 and be 11 digits'), valid = false;
    if (!d.completeAddress) setFieldError('completeAddress', 'Complete address required'), valid = false;
    if (!d.purposeOfUse) setFieldError('purposeOfUse', 'Purpose required'), valid = false;

    if ((d.quantityChairs === 0 || isNaN(d.quantityChairs)) && (d.quantityTents === 0 || isNaN(d.quantityTents))) {
      const msg = 'Please borrow at least one item (set tents or chairs above 0)';
      document.getElementById('errorQuantityChairs').textContent = msg;
      document.getElementById('errorQuantityTents').textContent = msg;
      valid = false;
    }

    if (d.quantityChairs > 0 && (d.quantityChairs < 20 || d.quantityChairs > 600)) {
      setFieldError('quantityChairs', 'Chairs must be between 20–600'), valid = false;
    }

    if (d.quantityTents > 0 && (d.quantityTents < 1 || d.quantityTents > 24)) {
      setFieldError('quantityTents', 'Tents must be between 1–24'), valid = false;
    }

    if (!d.modeOfReceiving) setFieldError('modeOfReceiving', 'Select a mode of receiving'), valid = false;
    if (!d.startDate) setFieldError('startDate', 'Start date required'), valid = false;
    else if (start < today) setFieldError('startDate', 'Cannot be in the past'), valid = false;
    if (!d.endDate) setFieldError('endDate', 'End date required'), valid = false;
    else if (end < start) setFieldError('endDate', 'End date must be after start'), valid = false;

    return valid;
  }

  function populateSummaryModal(data) {
    document.getElementById('summaryPurpose').textContent = data.purposeOfUse;
    document.getElementById('summaryTents').textContent = data.quantityTents;
    document.getElementById('summaryChairs').textContent = data.quantityChairs;
    document.getElementById('summaryStart').textContent = data.startDate;
    document.getElementById('summaryEnd').textContent = data.endDate;
    document.getElementById('summaryMode').textContent = data.modeOfReceiving;
  }

  async function submitTentsChairsRequest(data) {
    const submitBtn = document.querySelector('#tentsChairsForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert('Please login first.', false, () => window.location.href = 'index.html');
        return;
      }

      // ✅ Save to Firebase (correct collection)
      await addDoc(collection(db, 'tentsChairsBookings'), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      showAlert('Your tents & chairs request has been submitted successfully!', true, () => {
        window.location.href = 'UserProfile.html';
      });

    } catch (err) {
      console.error('Error submitting tents & chairs request:', err);
      showAlert('Failed to submit request. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  function setFieldError(id, msg) {
    const field = document.getElementById(id);
    const err = document.getElementById(`error${id.charAt(0).toUpperCase() + id.slice(1)}`);
    if (field) field.classList.add('error');
    if (err) err.textContent = msg;
  }

  function clearFieldError(f) {
    const err = document.getElementById(`error${f.id.charAt(0).toUpperCase() + f.id.slice(1)}`);
    if (err) err.textContent = '';
    f.classList.remove('error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
  }
}

/* =====================================================
   END OF FINAL TENTS & CHAIRS REQUEST FORM SCRIPT
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
   FIXED CONFERENCE ROOM REQUEST FORM SCRIPT
===================================================== */

if (window.location.pathname.endsWith('conference-request.html') || window.location.pathname.endsWith('/conference-request')) {

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('conferenceRoomForm');
    if (!form) return;

    // Prefill date if redirected from calendar
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDate = urlParams.get('date');
    if (preselectedDate) document.getElementById('eventDate').value = preselectedDate;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;

    // Populate time dropdowns
    populateTimeDropdowns();

    // Auto-fill user data
    onAuthStateChanged(auth, (user) => {
      if (user) {
        autofillUserData({
          'firstName': 'firstName',
          'lastName': 'lastName',
          'contactNumber': 'contactNumber',
          'address': 'address'
        });
      }
    });

    // Remove error messages while typing
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => clearFieldError(input));
    });

    // Handle form submission
    form.addEventListener('submit', handleConferenceRoomSubmit);
  });

  function populateTimeDropdowns() {
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    if (!startTimeSelect || !endTimeSelect) return;

    startTimeSelect.innerHTML = '<option value="">Start Time</option>';
    endTimeSelect.innerHTML = '<option value="">End Time</option>';

    for (let hour = 8; hour <= 17; hour++) {
      const value = `${hour.toString().padStart(2, '0')}:00`;
      const display = hour < 12 ? `${hour}:00 AM` : hour === 12 ? `12:00 PM` : `${hour - 12}:00 PM`;
      startTimeSelect.add(new Option(display, value));
      endTimeSelect.add(new Option(display, value));
    }
  }

  async function handleConferenceRoomSubmit(e) {
    e.preventDefault();

    const form = e.target;
    clearAllErrors();

    // Gather inputs
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const contactNumber = form.contactNumber.value.trim();
    const purpose = form.purpose.value.trim();
    const address = form.address?.value?.trim() || ''; // Optional, depending on form
    const eventDate = form.eventDate.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    let isValid = true;

    // ========== VALIDATIONS ==========
    if (!firstName) setFieldError('firstName', 'Please enter your first name'), isValid = false;
    else if (firstName.length < 2) setFieldError('firstName', 'First name must be at least 2 characters long'), isValid = false;
    else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) setFieldError('firstName', 'First name can only contain letters'), isValid = false;

    if (!lastName) setFieldError('lastName', 'Please enter your last name'), isValid = false;
    else if (lastName.length < 2) setFieldError('lastName', 'Last name must be at least 2 characters long'), isValid = false;
    else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) setFieldError('lastName', 'Last name can only contain letters'), isValid = false;

    if (!contactNumber) setFieldError('contactNumber', 'Contact number is required'), isValid = false;
    else if (!/^09\d{9}$/.test(contactNumber)) setFieldError('contactNumber', 'Contact number must start with 09 and have 11 digits'), isValid = false;

    if (!purpose) setFieldError('purpose', 'Purpose of use is required'), isValid = false;
    else if (purpose.length < 5) setFieldError('purpose', 'Please provide a more detailed purpose'), isValid = false;

    if (!eventDate) setFieldError('eventDate', 'Please select a date'), isValid = false;
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(eventDate + 'T00:00:00');
      if (selectedDate < today) setFieldError('eventDate', 'Event date cannot be in the past'), isValid = false;
    }

    if (!startTime) setFieldError('startTime', 'Start time is required'), isValid = false;
    if (!endTime) setFieldError('endTime', 'End time is required'), isValid = false;
    else if (startTime && endTime <= startTime) setFieldError('endTime', 'End time must be after start time'), isValid = false;

    if (!isValid) {
      const firstError = document.querySelector('.error-message:not(:empty)');
      if (firstError) firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ✅ FORM VALIDATION PASSED
    console.log('[Conference Room] Validation passed, preparing modal...');

    // === REQUEST SUMMARY MODAL ===
    const modal = document.getElementById('conferenceConfirmationModal');
    if (modal) {
      document.getElementById('confSummaryPurpose').textContent = purpose;
      document.getElementById('confSummaryDate').textContent = eventDate;
      document.getElementById('confSummaryStart').textContent = startTime;
      document.getElementById('confSummaryEnd').textContent = endTime;
      document.getElementById('confSummaryContact').textContent = contactNumber;
      modal.style.display = 'flex';

      // Cancel modal
      document.getElementById('confCancelModal').onclick = () => (modal.style.display = 'none');

      // Confirm modal → proceed to Firebase
      document.getElementById('confConfirmModal').onclick = async () => {
        modal.style.display = 'none';
        await submitToFirestore({ firstName, lastName, contactNumber, purpose, address, eventDate, startTime, endTime });
      };
    } else {
      // If modal missing, directly submit
      await submitToFirestore({ firstName, lastName, contactNumber, purpose, address, eventDate, startTime, endTime });
    }
  }

  async function submitToFirestore(formData) {
    const submitBtn = document.querySelector('#conferenceRoomForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert('Please login to submit a request.', false, () => (window.location.href = 'index.html'));
        return;
      }

      await addDoc(collection(db, 'conferenceRoomBookings'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      showAlert('Your conference room reservation has been submitted successfully!', true, () => {
        window.location.href = 'UserProfile.html';
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('Something went wrong while submitting your request.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    if (field && errorElement) {
      field.classList.add('error');
      errorElement.textContent = message;
    }
  }

  function clearFieldError(field) {
    const errorId = `error${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
    const errorElement = document.getElementById(errorId);
    if (errorElement) errorElement.textContent = '';
    field.classList.remove('error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
  }
}

/* =====================================================
   END OF FIXED CONFERENCE ROOM REQUEST FORM SCRIPT
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


//===================================================== ADMIN DASHBOARD SCRIPT Add this section to your script.js file*/

// Check if we're on the admin dashboard page
if (window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('/admin')) {
  
  // Store all reservations data loaded from Firestore
  let allReservationsData = [];
  
  // Store dates that have reservations (for calendar marking)
  let datesWithReservations = new Set();
  
  // Map of ISO date -> count of reservations for that date
  let dateCounts = {};

  document.addEventListener('DOMContentLoaded', async function() {
    // Load all reservations data first
    await loadAllReservationsData();
    
    // Initialize week calendar (will use loaded data)
    renderWeekCalendar();
    
    // Load reservations for selected date (default: today)
    await loadReservations();
    
    // Load pending request counts
    loadPendingCounts();
    
    // Load inventory counts
    loadInventoryCounts();
    
    // Setup sidebar dropdown toggles
    setupSidebarDropdowns();
    
    // Mobile menu toggle
    setupMobileMenu();
  });

  // Sidebar dropdown toggle functionality
  function setupSidebarDropdowns() {
    const reviewRequestsToggle = document.getElementById('reviewRequestsToggle');
    const manageCalendarToggle = document.getElementById('manageCalendarToggle');

    if (reviewRequestsToggle) {
      reviewRequestsToggle.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = this.nextElementSibling;
        dropdown.classList.toggle('open');
        this.classList.toggle('open');
      });
    }

    if (manageCalendarToggle) {
      manageCalendarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = this.nextElementSibling;
        dropdown.classList.toggle('open');
        this.classList.toggle('open');
      });
    }
  }

  // Store selected date globally
  let selectedDate = new Date();

  /**
   * Load all reservations data from Firestore
   * Fetches both conference room and tents/chairs bookings
   * Stores data for calendar marking and reservation display
   */
  async function loadAllReservationsData() {
    console.log('🔄 Loading all reservations data from Firestore...');
    
    try {
  allReservationsData = [];
  datesWithReservations.clear();
  dateCounts = {};

      // Load conference room bookings
      const conferenceQuery = query(
        collection(db, 'conferenceRoomBookings'),
        where('status', 'in', ['pending', 'approved', 'in-progress'])
      );
      const conferenceSnapshot = await getDocs(conferenceQuery);
      
      conferenceSnapshot.forEach(doc => {
        const data = doc.data();
        const eventDate = data.eventDate; // Format: "YYYY-MM-DD"
        
        if (eventDate) {
          // Add to reservations array
          allReservationsData.push({
            id: doc.id,
            date: formatDateToLongString(eventDate), // "November 3, 2025"
            dateRaw: eventDate, // Keep raw format for filtering
            purpose: data.purpose || 'Conference Room Reservation',
            type: 'Conference Room',
            address: data.address || 'N/A',
            status: data.status || 'pending',
            time: data.startTime && data.endTime ? `${data.startTime} - ${data.endTime}` : null
          });
          
          // Mark date (ISO string) as having reservation and count
          datesWithReservations.add(eventDate);
          dateCounts[eventDate] = (dateCounts[eventDate] || 0) + 1;
        }
      });

      // Load tents & chairs bookings
      const tentsQuery = query(
        collection(db, 'tentsChairsBookings'),
        where('status', 'in', ['pending', 'approved', 'in-progress'])
      );
      const tentsSnapshot = await getDocs(tentsQuery);
      
      tentsSnapshot.forEach(doc => {
        const data = doc.data();
        const startDate = data.startDate; // Format: "YYYY-MM-DD"
        const endDate = data.endDate;
        
        if (startDate) {
          // Add to reservations array
          // For multi-day bookings, compute covered dates
          const coveredDates = [];
          const start = new Date(startDate + 'T00:00:00');
          const end = endDate ? new Date(endDate + 'T00:00:00') : start;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().split('T')[0];
            coveredDates.push(iso);
            datesWithReservations.add(iso);
            dateCounts[iso] = (dateCounts[iso] || 0) + 1;
          }

          allReservationsData.push({
            id: doc.id,
            date: formatDateToLongString(startDate),
            dateRaw: startDate,
            dateRange: endDate && endDate !== startDate ? `${formatDateToLongString(startDate)} - ${formatDateToLongString(endDate)}` : null,
            purpose: `Tents: ${data.quantityTents || 0}, Chairs: ${data.quantityChairs || 0}`,
            type: 'Tents & Chairs',
            address: data.completeAddress || 'N/A',
            status: data.status || 'pending',
            time: null,
            datesCovered: coveredDates
          });
        }
      });

  console.log(`✅ Loaded ${allReservationsData.length} reservations`);
  console.log(`✅ Dates with reservations:`, Array.from(datesWithReservations).sort());
      
    } catch (error) {
      console.error('❌ Error loading reservations data:', error);
      allReservationsData = [];
      datesWithReservations.clear();
    }
  }

  /**
   * Format date string from "YYYY-MM-DD" to "Month Day, Year"
   * Example: "2025-11-03" -> "November 3, 2025"
   */
  function formatDateToLongString(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  }

  // Ensure a single tooltip element exists for calendar date counts
  function ensureCalendarTooltip() {
    let tooltip = document.getElementById('calendarDateTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'calendarDateTooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.padding = '6px 10px';
      tooltip.style.background = 'rgba(11,59,140,0.95)';
      tooltip.style.color = '#fff';
      tooltip.style.borderRadius = '6px';
      tooltip.style.fontSize = '13px';
      tooltip.style.zIndex = '10030';
      tooltip.style.display = 'none';
      tooltip.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }

  function renderWeekCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Update calendar title
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    
    const weekCalendarMonth = document.getElementById('weekCalendarMonth');
    if (weekCalendarMonth) {
      weekCalendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekCalendarGrid = document.getElementById('weekCalendarGrid');
    if (!weekCalendarGrid) return;
    
    weekCalendarGrid.innerHTML = '';

    // Day names
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate 7 days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
  const dayCell = document.createElement('div');
  dayCell.classList.add('week-day-card');
  // Make focusable for keyboard accessibility
  dayCell.setAttribute('tabindex', '0');
      
  const dayNumber = date.getDate();
  const dateKey = date.toISOString().split('T')[0];
      const isToday = (
        date.getDate() === currentDay &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );

      const isSelected = (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );

      // Highlight today
      if (isToday) {
        dayCell.classList.add('today');
      }

      // Highlight selected date
      if (isSelected) {
        dayCell.classList.add('selected');
      }

      // Mark dates with reservations (compare ISO date strings)
      if (datesWithReservations.has(dateKey)) {
        dayCell.classList.add('has-reservation');
      }

      dayCell.innerHTML = `
        <div class="week-day-name">${dayNames[i]}</div>
        <div class="week-day-number">${dayNumber}</div>
      `;

      // Add click handler
      dayCell.addEventListener('click', function() {
        selectedDate = new Date(date);
        updateReservationsTitle();
        renderWeekCalendar(); // Re-render to show selected state
        loadReservations(); // Load reservations for selected date
      });

      // Add hover tooltip to show number of reservations for that ISO date
      (function(dayEl, key) {
        const tooltip = ensureCalendarTooltip();
        const show = () => {
          const count = dateCounts[key] || 0;
          if (!count) return;
          tooltip.textContent = count === 1 ? '1 reservation' : `${count} reservations`;
          const rect = dayEl.getBoundingClientRect();
          // Position above the day cell, centered
          const top = rect.top - 8 - tooltip.offsetHeight;
          const left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
          tooltip.style.left = Math.max(8, left) + 'px';
          tooltip.style.top = (top < 8 ? rect.bottom + 8 : top) + 'px';
          tooltip.style.display = 'block';
        };
        const hide = () => {
          const tooltip = document.getElementById('calendarDateTooltip');
          if (tooltip) tooltip.style.display = 'none';
        };

        dayEl.addEventListener('mouseenter', show);
        dayEl.addEventListener('focus', show);
        dayEl.addEventListener('mouseleave', hide);
        dayEl.addEventListener('blur', hide);
        // For touch devices, show tooltip briefly on long press / touchstart
        let touchTimer = null;
        dayEl.addEventListener('touchstart', (e) => {
          touchTimer = setTimeout(() => show(), 400);
        }, { passive: true });
        dayEl.addEventListener('touchend', () => {
          if (touchTimer) clearTimeout(touchTimer);
          hide();
        });
      })(dayCell, dateKey);

      weekCalendarGrid.appendChild(dayCell);
    }

    // Update reservations title on initial load
    updateReservationsTitle();
  }

  function updateReservationsTitle() {
    const reservationsTitle = document.getElementById('reservationsTitle');
    if (!reservationsTitle) return;

    const today = new Date();
    const isToday = (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (isToday) {
      reservationsTitle.textContent = 'Reservations for Today';
    } else {
      const dateStr = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
      reservationsTitle.textContent = `Reservations for ${dateStr}`;
    }
  }

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
    
    const calendarMonthEl = document.getElementById('calendarMonth');
    if (calendarMonthEl) {
      calendarMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Get first day of month and days in month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';

  // Use loaded reservation dates (datesWithReservations is a Set of ISO strings)

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

      // Mark dates with reservations (compare ISO date strings)
      const thisDate = new Date(currentYear, currentMonth, day);
      const thisKey = thisDate.toISOString().split('T')[0];
      if (datesWithReservations.has(thisKey)) {
        dayCell.classList.add('has-reservation');
      }

      // Tooltip handlers for mini calendar
      (function(el, key) {
        const tooltip = ensureCalendarTooltip();
        const showMini = () => {
          const count = dateCounts[key] || 0;
          if (!count) return;
          tooltip.textContent = count === 1 ? '1 reservation' : `${count} reservations`;
          const rect = el.getBoundingClientRect();
          const top = rect.top - 8 - tooltip.offsetHeight;
          const left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
          tooltip.style.left = Math.max(8, left) + 'px';
          tooltip.style.top = (top < 8 ? rect.bottom + 8 : top) + 'px';
          tooltip.style.display = 'block';
        };
        const hideMini = () => { tooltip.style.display = 'none'; };
        el.addEventListener('mouseenter', showMini);
        el.addEventListener('mouseleave', hideMini);
        el.addEventListener('focus', showMini);
        el.addEventListener('blur', hideMini);
      })(dayCell, thisKey);

      calendarDays.appendChild(dayCell);
    }
  }

  /**
   * Load and display reservations for the selected date
   * Filters allReservationsData by selected date
   */
  async function loadReservations() {
    console.log('🔄 Loading reservations for selected date:', selectedDate.toDateString());
    
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) return;
    
    // Format selected date to "YYYY-MM-DD" for comparison
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    // Filter reservations for selected date
    const todaysReservations = allReservationsData.filter(reservation => {
      return reservation.dateRaw === selectedDateString;
    });
    
    console.log(`✅ Found ${todaysReservations.length} reservations for ${selectedDateString}`);
    
    if (todaysReservations.length === 0) {
      reservationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No reservations for this day.</p>';
      return;
    }

    reservationsList.innerHTML = '';

    todaysReservations.forEach(reservation => {
      const item = document.createElement('div');
      item.classList.add('reservation-item');

      const statusClass = reservation.status === 'approved' ? 'approved' : 
                         reservation.status === 'in-progress' ? 'in-progress' : 'pending';
      const statusText = reservation.status === 'approved' ? 'Approved' : 
                        reservation.status === 'in-progress' ? 'In Progress' :
                        reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);

      const dateDisplay = reservation.dateRange || reservation.date;
      const timeDisplay = reservation.time ? `<br><strong>Time:</strong> ${reservation.time}` : '';

      item.innerHTML = `
        <div class="reservation-header">
          <h4 class="reservation-date">${dateDisplay}</h4>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="reservation-details">
          <strong>Purpose:</strong> ${sanitizeInput(reservation.purpose)}<br>
          <strong>Type:</strong> ${reservation.type}${timeDisplay}<br>
          <strong>Address:</strong> ${sanitizeInput(reservation.address)}
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

  // Load pending request counts from Firestore
  async function loadPendingCounts() {
    console.log('🔄 Loading pending counts from Firestore...');
    
    const conferenceRoomBadge = document.getElementById('conferenceRoomBadge');
    const tentsChairsBadge = document.getElementById('tentsChairsBadge');
    
    // Show loading state
    if (conferenceRoomBadge) conferenceRoomBadge.textContent = 'Loading...';
    if (tentsChairsBadge) tentsChairsBadge.textContent = 'Loading...';
    
    try {
      // Count pending conference room requests
      const conferenceQuery = query(
        collection(db, 'conferenceRoomBookings'),
        where('status', '==', 'pending')
      );
      const conferenceSnapshot = await getDocs(conferenceQuery);
      const conferenceCount = conferenceSnapshot.size;

      // Count pending tents & chairs requests
      const tentsQuery = query(
        collection(db, 'tentsChairsBookings'),
        where('status', '==', 'pending')
      );
      const tentsSnapshot = await getDocs(tentsQuery);
      const tentsCount = tentsSnapshot.size;

      // Update badges with actual counts
      if (conferenceRoomBadge) {
        conferenceRoomBadge.textContent = conferenceCount === 1 ? '1 Pending' : `${conferenceCount} Pending`;
        conferenceRoomBadge.style.backgroundColor = conferenceCount > 0 ? '#ef4444' : '#9ca3af';
      }

      if (tentsChairsBadge) {
        tentsChairsBadge.textContent = tentsCount === 1 ? '1 Pending' : `${tentsCount} Pending`;
        tentsChairsBadge.style.backgroundColor = tentsCount > 0 ? '#ef4444' : '#9ca3af';
      }

      console.log(`✅ Pending Conference Room Requests: ${conferenceCount}`);
      console.log(`✅ Pending Tents & Chairs Requests: ${tentsCount}`);

    } catch (error) {
      console.error('❌ Error loading pending counts:', error);
      // Show error state but with graceful fallback
      if (conferenceRoomBadge) conferenceRoomBadge.textContent = '-- Pending';
      if (tentsChairsBadge) tentsChairsBadge.textContent = '-- Pending';
    }
  }

  // Load inventory counts from Firestore
  async function loadInventoryCounts() {
    try {
      // Fetch inventory document (assuming there's an 'inventory' collection with a single doc)
      const inventoryDoc = await getDoc(doc(db, 'inventory', 'equipment'));
      
      if (inventoryDoc.exists()) {
        const data = inventoryDoc.data();
        const availableTents = data.availableTents || 24;
        const availableChairs = data.availableChairs || 600;

        // Update inventory displays
        const tentsElement = document.getElementById('availableTents');
        const chairsElement = document.getElementById('availableChairs');

        if (tentsElement) {
          tentsElement.textContent = availableTents;
        }

        if (chairsElement) {
          chairsElement.textContent = availableChairs;
        }

        console.log(`Available Tents: ${availableTents}`);
        console.log(`Available Chairs: ${availableChairs}`);

      } else {
        console.log('Inventory document does not exist, using default values');
        // Default values already set in HTML
      }

    } catch (error) {
      console.error('Error loading inventory counts:', error);
      // Keep default values on error
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

  // ========================================
  // INTERNAL BOOKING MODAL FUNCTIONALITY
  // ========================================

  // Modal elements
  const internalBookingModal = document.getElementById('internalBookingModal');
  const addInternalBookingBtn = document.getElementById('addInternalBookingBtn');
  const closeInternalBookingModal = document.getElementById('closeInternalBookingModal');
  const cancelInternalBooking = document.getElementById('cancelInternalBooking');
  const internalBookingForm = document.getElementById('internalBookingForm');

  // Open modal
  if (addInternalBookingBtn) {
    addInternalBookingBtn.addEventListener('click', () => {
      internalBookingModal.classList.add('active');
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('internalStartDate').setAttribute('min', today);
      document.getElementById('internalEndDate').setAttribute('min', today);
    });
  }

  // Close modal function
  function closeModal() {
    internalBookingModal.classList.remove('active');
    internalBookingForm.reset();
    clearAllInternalErrors();
  }

  // Close modal on X button
  if (closeInternalBookingModal) {
    closeInternalBookingModal.addEventListener('click', closeModal);
  }

  // Close modal on Cancel button
  if (cancelInternalBooking) {
    cancelInternalBooking.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside
  internalBookingModal.addEventListener('click', (e) => {
    if (e.target === internalBookingModal) {
      closeModal();
    }
  });

  // Form validation helpers
  function setInternalError(elementId, message) {
    const errorElement = document.getElementById(`error-${elementId}`);
    const inputElement = document.getElementById(elementId);
    
    if (errorElement) {
      errorElement.textContent = message;
    }
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  function clearInternalError(elementId) {
    const errorElement = document.getElementById(`error-${elementId}`);
    const inputElement = document.getElementById(elementId);
    
    if (errorElement) {
      errorElement.textContent = '';
    }
    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  function clearAllInternalErrors() {
    const errorIds = [
      'internal-start-date',
      'internal-end-date',
      'internal-tents',
      'internal-chairs',
      'internal-purpose',
      'internal-location',
      'internal-contact-person',
      'internal-contact-number'
    ];
    
    errorIds.forEach(clearInternalError);
  }

  // Validate Philippine mobile number
  function validateInternalContact(number) {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(number);
  }

  // Real-time validation for end date
  document.getElementById('internalStartDate')?.addEventListener('change', function() {
    const endDateInput = document.getElementById('internalEndDate');
    if (endDateInput) {
      endDateInput.setAttribute('min', this.value);
      // Clear end date if it's before start date
      if (endDateInput.value && endDateInput.value < this.value) {
        endDateInput.value = '';
      }
    }
    clearInternalError('internal-start-date');
  });

  document.getElementById('internalEndDate')?.addEventListener('change', function() {
    clearInternalError('internal-end-date');
  });

  // Real-time validation for inputs
  ['internalTents', 'internalChairs', 'internalPurpose', 'internalLocation', 'internalContactPerson', 'internalContactNumber'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function() {
      const errorId = id.replace(/([A-Z])/g, '-$1').toLowerCase();
      clearInternalError(errorId);
    });
  });

  // Form submission
  if (internalBookingForm) {
    internalBookingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      clearAllInternalErrors();
      
      // Get form values
      const startDate = document.getElementById('internalStartDate').value.trim();
      const endDate = document.getElementById('internalEndDate').value.trim();
      const tents = parseInt(document.getElementById('internalTents').value) || 0;
      const chairs = parseInt(document.getElementById('internalChairs').value) || 0;
      const purpose = document.getElementById('internalPurpose').value.trim();
      const location = document.getElementById('internalLocation').value.trim();
      const contactPerson = document.getElementById('internalContactPerson').value.trim();
      const contactNumber = document.getElementById('internalContactNumber').value.trim();
      
      let hasError = false;
      
      // Validate dates
      if (!startDate) {
        setInternalError('internal-start-date', 'Event start date is required');
        hasError = true;
      }
      
      if (!endDate) {
        setInternalError('internal-end-date', 'Event end date is required');
        hasError = true;
      }
      
      if (startDate && endDate && endDate < startDate) {
        setInternalError('internal-end-date', 'End date cannot be before start date');
        hasError = true;
      }
      
      // Validate quantities
      if (tents < 0) {
        setInternalError('internal-tents', 'Quantity cannot be negative');
        hasError = true;
      }
      
      if (chairs < 0) {
        setInternalError('internal-chairs', 'Quantity cannot be negative');
        hasError = true;
      }
      
      // At least one item must be requested
      if (tents === 0 && chairs === 0) {
        setInternalError('internal-tents', 'Must request at least 1 tent or chair');
        setInternalError('internal-chairs', 'Must request at least 1 tent or chair');
        hasError = true;
      }
      
      // Check inventory availability
      try {
        const inventoryDoc = await getDoc(doc(db, 'inventory', 'equipment'));
        if (inventoryDoc.exists()) {
          const inventory = inventoryDoc.data();
          const availableTents = inventory.availableTents || 0;
          const availableChairs = inventory.availableChairs || 0;
          
          if (tents > availableTents) {
            setInternalError('internal-tents', `Only ${availableTents} tents available`);
            hasError = true;
          }
          
          if (chairs > availableChairs) {
            setInternalError('internal-chairs', `Only ${availableChairs} chairs available`);
            hasError = true;
          }
        }
      } catch (error) {
        console.error('Error checking inventory:', error);
      }
      
      // Validate purpose
      if (!purpose) {
        setInternalError('internal-purpose', 'Purpose is required');
        hasError = true;
      } else if (purpose.length < 10) {
        setInternalError('internal-purpose', 'Purpose must be at least 10 characters');
        hasError = true;
      }
      
      // Validate location
      if (!location) {
        setInternalError('internal-location', 'Location is required');
        hasError = true;
      }
      
      // Validate contact person
      if (!contactPerson) {
        setInternalError('internal-contact-person', 'Contact person is required');
        hasError = true;
      }
      
      // Validate contact number
      if (!contactNumber) {
        setInternalError('internal-contact-number', 'Contact number is required');
        hasError = true;
      } else if (!validateInternalContact(contactNumber)) {
        setInternalError('internal-contact-number', 'Invalid format. Use: 09XXXXXXXXX (11 digits)');
        hasError = true;
      }
      
      if (hasError) {
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('.internal-booking-submit-btn');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      try {
        // Get current admin user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
        
        // Create booking document
        const bookingData = {
          startDate: startDate,
          endDate: endDate,
          quantityTents: tents,
          quantityChairs: chairs,
          purpose: sanitizeInput(purpose),
          completeAddress: sanitizeInput(location),
          fullName: sanitizeInput(contactPerson),
          contactNumber: contactNumber,
          modeOfReceiving: 'Internal',
          status: 'approved', // Auto-approved for internal bookings
          userId: currentUser.uid,
          userEmail: currentUser.email,
          createdAt: new Date(),
          approvedAt: new Date(),
          isInternalBooking: true
        };
        
        // Add to Firestore
        await addDoc(collection(db, 'tentsChairsBookings'), bookingData);
        
        // Update inventory
        const inventoryRef = doc(db, 'inventory', 'equipment');
        const inventorySnap = await getDoc(inventoryRef);
        
        if (inventorySnap.exists()) {
          const currentInventory = inventorySnap.data();
          await updateDoc(inventoryRef, {
            availableTents: (currentInventory.availableTents || 0) - tents,
            availableChairs: (currentInventory.availableChairs || 0) - chairs,
            tentsInUse: (currentInventory.tentsInUse || 0) + tents,
            chairsInUse: (currentInventory.chairsInUse || 0) + chairs,
            lastUpdated: new Date()
          });
        }
        
        // Success!
        showAlert('Internal booking added successfully!', true, () => {
          closeModal();
          // Reload data
          loadInventoryCounts();
          loadAllReservationsData().then(() => {
            renderWeekCalendar();
            loadReservations();
          });
        });
        
      } catch (error) {
        console.error('Error creating internal booking:', error);
        showAlert('Failed to create internal booking. Please try again.', false);
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }
}

/* =====================================================
   END OF ADMIN DASHBOARD SCRIPT
===================================================== *//* =====================================================
   ADMIN TENTS & CHAIRS REQUEST MANAGEMENT
   - Table and calendar views
   - Filter and search functionality  
   - Approve/deny/complete/archive/delete actions
   - CSV export
   - Manual booking creation
   
   TEMP FILE - TO BE APPENDED TO script.js
===================================================== */

// ========================================================================================================
// 🎪 TENTS & CHAIRS ADMIN MANAGEMENT SYSTEM
// ========================================================================================================
/**
 * FILE: admin-tents-requests.html
 * LOCATION: script.js (lines 3900-5600+)
 * 
 * PURPOSE:
 * Complete admin interface for reviewing, approving, and managing tents & chairs booking requests.
 * Includes real-time inventory tracking, status management, and comprehensive filtering.
 * 
 * ARCHITECTURE:
 * - Dual-tab system: "All Requests" (active) and "History" (completed/rejected/cancelled)
 * - Dual-view system: "Table View" (default) and "Calendar View" (future implementation)
 * - 5-column filter system: Name search, Status, Date, Delivery Mode, Sort (6 options)
 * - 13-column responsive table with horizontal scroll
 * - Professional confirmation modals for all critical actions
 * - Real-time inventory validation (prevents negative stock)
 * 
 * FIRESTORE COLLECTIONS USED:
 * - `tentsChairsBookings` - All tents/chairs requests (read/update)
 * - `inventory/equipment` - Central inventory document (read for validation)
 * 
 * KEY FEATURES:
 * 1. Dashboard Statistics - Total, Pending, Approved, Completed counts
 * 2. Advanced Filtering - Search, status, date, delivery mode, sort
 * 3. Inventory Validation - Blocks approvals that would result in negative stock
 * 4. Confirmation Modals - All actions require confirmation with context
 * 5. Status Management - Approve, Deny, Mark as Completed, Archive, Delete
 * 6. Notification System - Time's Up and Collect reminders (placeholder for email/SMS)
 * 
 * CRITICAL DOM IDS (DO NOT RENAME):
 * - tentsContentArea - Main content rendering area
 * - allTab, historyTab - Tab switching buttons
 * - tableViewBtn, calendarViewBtn - View toggle buttons
 * - searchNameFilter, statusFilter, dateFilter, deliveryModeFilter, sortByFilter - Filter inputs
 * - tentsConfirmModal - Confirmation modal container
 * - tentsConfirmTitle, tentsConfirmMessage, tentsConfirmInventory - Modal content elements
 * - tentsConfirmYes, tentsConfirmNo - Modal action buttons
 * 
 * GLOBAL STATE VARIABLES:
 * - allRequests: Array of all request objects from Firestore
 * - filteredRequests: Array of requests after applying filters
 * - currentView: 'table' | 'calendar'
 * - currentTab: 'all' | 'history'
 * - currentMonth, currentYear: For calendar navigation (future use)
 * 
 * FUNCTION OVERVIEW:
 * 
 * Data Loading & Management:
 * - loadAllRequests() - Fetches all tentsChairsBookings from Firestore
 * - updateStatistics() - Recalculates dashboard stat cards
 * - updateInventoryInUse() - Recalculates inventory.tentsInUse and chairsInUse
 * 
 * Filtering & Sorting:
 * - getFilteredRequests() - Applies all filters and returns filtered array
 * - updateStatusFilterOptions() - Updates status dropdown based on current tab
 * 
 * Rendering:
 * - renderContent() - Main render dispatcher (calls renderTableView or renderCalendarView)
 * - renderTableView() - Renders 13-column table with all requests
 * - renderStatusBadge() - Returns HTML for color-coded status badge
 * - renderActionButtons() - Returns HTML for context-aware action buttons
 * - renderNotifyButtons() - Returns HTML for notification buttons (approved/in-progress only)
 * - renderCalendarView() - Placeholder for future calendar implementation
 * 
 * Action Handlers (All async, all validated):
 * - handleApprove() - CRITICAL: Validates inventory, shows preview, updates status
 * - handleDeny() - Shows confirmation, prompts for reason, updates status
 * - handleComplete() - Shows confirmation, updates status, triggers inventory recalc
 * - handleArchive() - Hides request from history view (sets archived: true)
 * - handleDelete() - Permanently deletes request (double confirmation required)
 * - handleTimesUp() - Sends reminder notification (placeholder)
 * - handleCollect() - Sends collection reminder (placeholder)
 * 
 * Modal System:
 * - showConfirmModal() - Unified confirmation modal with inventory preview support
 *   Parameters:
 *     - title: Modal header text
 *     - message: Confirmation message (supports \n for line breaks)
 *     - inventoryChanges: {tents: {old, new}, chairs: {old, new}} | null
 *     - isAlert: true = Only OK button (for errors), false = Yes/No buttons
 *   Returns: Promise<boolean> - true if confirmed, false if cancelled
 * 
 * Tab & View Management:
 * - switchTab() - Switches between All Requests and History
 * - switchView() - Switches between Table and Calendar (calendar = placeholder)
 * 
 * INVENTORY VALIDATION LOGIC:
 * When admin clicks "Approve":
 * 1. Fetch current inventory from inventory/equipment document
 * 2. Calculate: newStock = currentStock - requestedQuantity
 * 3. If newStock < 0 for ANY item (tents or chairs):
 *    - Show error modal with shortage details
 *    - Block approval (return early)
 * 4. If stock is sufficient:
 *    - Show confirmation modal with before/after inventory preview
 *    - If admin confirms, update request status to "approved"
 *    - Trigger updateInventoryInUse() to recalculate inventory
 * 
 * STATUS WORKFLOW:
 * pending → approved → in-progress → completed
 *         ↘ rejected
 *         ↘ cancelled (user action only)
 * 
 * FUTURE IMPLEMENTATIONS:
 * 
 * 1. CALENDAR VIEW (renderCalendarView function):
 *    - Create monthly grid similar to user-facing calendars
 *    - Mark dates with active bookings
 *    - Show count of tents/chairs in use per date
 *    - Click date to show modal with all bookings for that date
 *    - Reference: See conference-room.html calendar implementation
 * 
 * 2. EMAIL/SMS NOTIFICATIONS (handleTimesUp, handleCollect):
 *    - Set up Firebase Cloud Functions
 *    - Integrate SendGrid (email) or Twilio (SMS)
 *    - Call function endpoint when admin clicks notification buttons
 *    - Send template-based messages to user's email/contact
 * 
 * 3. EXPORT FUNCTIONALITY (History tab dropdown):
 *    - Implement CSV export: Convert filteredRequests to CSV format
 *    - Implement PDF export: Use jsPDF library to generate report
 *    - Implement Excel export: Use SheetJS library
 * 
 * 4. MANAGE INVENTORY PAGE:
 *    - Create admin-manage-inventory.html
 *    - Display current stock (total, available, in-use)
 *    - Allow admin to update total stock
 *    - Allow manual adjustments (e.g., damaged items)
 *    - Log all inventory changes with timestamps
 * 
 * CONFERENCE ROOM ADMIN (For next developer):
 * To create admin-conference-requests.html:
 * 1. Clone this entire section (lines 3900-5600)
 * 2. Replace collection: tentsChairsBookings → conferenceRoomBookings
 * 3. Update table columns:
 *    - Remove: Chairs, Tents, Delivery Mode, Start Date, End Date
 *    - Add: Purpose, Event Date, Start Time, End Time
 * 4. Remove inventory validation (no inventory tracking for conference room)
 * 5. Keep same patterns: tabs, filters, modals, status management
 * 6. Update CSS class prefixes: .tents-* → .conference-*
 * 7. Update DOM IDs: tents* → conference*
 * 
 * COMMON PITFALLS TO AVOID:
 * - DON'T rename DOM IDs without updating all references
 * - DON'T modify inventory document directly (use updateInventoryInUse)
 * - DON'T skip inventory validation when approving requests
 * - DON'T forget to call renderContent() after state changes
 * - DON'T forget to add .active class when showing modals
 * - DON'T forget to remove event listeners in modal cleanup
 * 
 * DEBUGGING TIPS:
 * - Check browser console for 🎪 emoji logs (tents admin specific)
 * - All functions log their actions: ✅ success, ❌ error, ⚠️ warning
 * - Use Chrome DevTools Network tab to monitor Firestore queries
 * - Check Firestore console if data not loading
 * - Verify inventory/equipment document exists in Firestore
 * 
 * PERFORMANCE NOTES:
 * - Currently loads ALL requests on page load (fine for < 1000 requests)
 * - For larger datasets, implement Firestore pagination
 * - Consider adding real-time listeners for live updates
 * - Table renders efficiently with virtualization for 100+ rows
 */

// This code should be added at the end of script.js after line 3895

if (window.location.pathname.endsWith('admin-tents-requests.html')) {
  console.log('🎪 Admin Tents & Chairs Request Management page loaded');

  // ========================================
  // GLOBAL STATE
  // ========================================
  /**
   * allRequests: Master array of all tentsChairsBookings documents
   * filteredRequests: Subset after applying search/filter/sort
   * currentView: 'table' (default) or 'calendar' (future)
   * currentTab: 'all' (pending/approved/in-progress) or 'history' (completed/rejected/cancelled)
   * currentMonth/Year: For calendar navigation (future use)
   */
  let allRequests = [];
  let filteredRequests = [];
  let currentView = 'table'; // 'table' or 'calendar'
  let currentTab = 'all'; // 'all' or 'history'
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // ========================================
  // INVENTORY INITIALIZATION
  // ========================================
  /**
   * Initialize inventory document in Firestore if it doesn't exist
   * Called once on page load
   * Default values: 24 tents, 600 chairs
   * 
   * IMPORTANT: This should be moved to admin-manage-inventory.html in the future
   * Admins should set initial inventory through UI, not hardcoded values
   */
  async function initializeInventory() {
    try {
      const inventoryDocRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryDocRef);

      if (!inventorySnap.exists()) {
        console.log('📦 Creating initial inventory document...');
        await setDoc(inventoryDocRef, {
          availableTents: 24,
          availableChairs: 600,
          tentsInUse: 0,
          chairsInUse: 0,
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Inventory document created');
      } else {
        console.log('📦 Inventory document already exists');
      }
    } catch (error) {
      console.error('❌ Error initializing inventory:', error);
    }
  }

  // Load all tents & chairs requests from Firestore
  async function loadTentsRequests() {
    try {
      console.log('🔄 Loading tents & chairs requests from Firestore...');
      
      const requestsRef = collection(db, 'tentsChairsBookings');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      allRequests = [];
      querySnapshot.forEach((docSnap) => {
        // Filter out archived requests
        const data = docSnap.data();
        if (!data.archived) {
          allRequests.push({
            id: docSnap.id,
            ...data
          });
        }
      });

      console.log(`✅ Loaded ${allRequests.length} requests`);
      
      // Apply filters and render
      applyFilters();
      
    } catch (error) {
      console.error('❌ Error loading requests:', error);
    }
  }

  // Apply filters based on tab, search, status, date, mode
  function applyFilters() {
    console.log('🔍 Applying filters...');
    
    // Support both the old 'tents*' IDs and the page's actual IDs (fallbacks) so filters work reliably
    const searchTerm = (
      document.getElementById('tentsSearchInput')?.value || document.getElementById('searchInput')?.value || ''
    ).toLowerCase();
    const statusFilter = document.getElementById('tentsStatusFilter')?.value || document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('tentsDateFilter')?.value || document.getElementById('dateFilter')?.value || '';
    // Final decision: use "Pick-up" as canonical pickup value. Read from either tentsModeFilter or deliveryFilter.
    const modeFilter = document.getElementById('tentsModeFilter')?.value || document.getElementById('deliveryFilter')?.value || 'all';

    filteredRequests = allRequests.filter(req => {
      // Tab filter (all vs history)
      if (currentTab === 'history') {
        if (!['completed', 'rejected', 'cancelled'].includes(req.status)) {
          return false;
        }
      } else {
        if (['completed', 'rejected', 'cancelled'].includes(req.status)) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const fullName = (req.fullName || '').toLowerCase();
        const address = (req.completeAddress || '').toLowerCase();
        if (!fullName.includes(searchTerm) && !address.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter) {
        const reqStartDate = req.startDate;
        if (reqStartDate !== dateFilter) {
          return false;
        }
      }

      // Mode filter (use normalized comparison so 'Self-Pickup', 'Pick up', 'Pick-up' are treated consistently)
      if (modeFilter !== 'all') {
        if (normalizeMode(req.modeOfReceiving) !== normalizeMode(modeFilter)) {
          return false;
        }
      }

      return true;
    });

    console.log(`✅ Filtered to ${filteredRequests.length} requests`);
    
    // Render based on current view
    if (currentView === 'table') {
      renderTableView();
    } else {
      renderCalendarView();
    }

    // Update stats
    updateStats();
  }

  // Render table view
  function renderTableView() {
    console.log('📊 Rendering table view...');
    
    const container = document.getElementById('tentsContentArea');
    if (!container) return;

    if (filteredRequests.length === 0) {
      container.innerHTML = `
        <div class="tents-no-bookings">
          <p>No requests found matching your filters.</p>
        </div>
      `;
      return;
    }

    let tableHTML = `
      <div class="tents-table-container">
        <table class="tents-table">
          <thead>
            <tr>
              <th>Submitted On</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Chairs</th>
              <th>Tents</th>
              <th>Delivery</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredRequests.forEach(req => {
      const submittedDate = req.createdAt ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const startDate = req.startDate || 'N/A';
      const endDate = req.endDate || 'N/A';
      const chairs = req.quantityChairs || 0;
      const tents = req.quantityTents || 0;
      const mode = req.modeOfReceiving || 'N/A';
      const address = req.completeAddress || 'N/A';
      const status = req.status || 'pending';
      const fullName = req.fullName || 'Unknown';

      tableHTML += `
        <tr>
          <td>${submittedDate}</td>
          <td>${fullName}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
          <td>${chairs}</td>
          <td>${tents}</td>
          <td>${mode}</td>
          <td>${address}</td>
          <td><span class="tents-status-badge tents-status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
          <td>${getActionButtons(req)}</td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  }

  // Get action buttons based on request status
  function getActionButtons(req) {
    const status = req.status;
    const id = req.id;

    if (currentTab === 'history') {
      // History tab: show archive/delete
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-archive" onclick="window.archiveRequest('${id}')">Archive</button>
          <button class="tents-btn tents-btn-delete" onclick="window.deleteRequest('${id}')">Delete</button>
        </div>
      `;
    }

    // Active requests tab
    if (status === 'pending') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-approve" onclick="window.approveRequest('${id}')">Approve</button>
          <button class="tents-btn tents-btn-deny" onclick="window.denyRequest('${id}')">Deny</button>
        </div>
      `;
    } else if (status === 'approved') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        </div>
      `;
    } else if (status === 'in-progress') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        </div>
      `;
    }

    return '<span style="color: #6b7280;">No actions</span>';
  }

  // Approve request
  window.approveRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Approve Request',
      'Are you sure you want to approve this request?'
    );
    if (!confirmed) return;

    try {
      console.log(`✅ Approving request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'approved'
      });

      console.log('✅ Request approved');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  // Deny request
  window.denyRequest = async function(requestId) {
    // Use unified modal to collect optional rejection reason
    const reasonInput = await showConfirmModal(
      'Deny Request',
      'Please provide a reason for denying this request (optional):',
      null,
      false,
      { placeholder: 'Enter reason (optional)...', defaultValue: '', multiline: true }
    );
    if (reasonInput === false) return;

    const reason = typeof reasonInput === 'string' ? reasonInput : '';

    try {
      console.log(`❌ Denying request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      });

      console.log('✅ Request denied');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error denying request:', error);
      await showConfirmModal('Error', 'Failed to deny request. Please try again.', null, true);
    }
  };

  // Complete request
  window.completeRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Mark as Completed',
      'Mark this request as completed?'
    );
    if (!confirmed) return;

    try {
      console.log(`✓ Completing request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedAt: new Date()
      });

      console.log('✅ Request marked as completed');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error completing request:', error);
      await showConfirmModal('Error', 'Failed to complete request. Please try again.', null, true);
    }
  };

  // Archive request (soft delete)
  window.archiveRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Archive Request',
      'Archive this request? It will be hidden from history.'
    );
    if (!confirmed) return;

    try {
      console.log(`📦 Archiving request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });

      console.log('✅ Request archived');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error archiving request:', error);
      await showConfirmModal('Error', 'Failed to archive request. Please try again.', null, true);
    }
  };

  // Delete request (permanent)
  window.deleteRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Delete Request',
      '⚠️ PERMANENTLY DELETE this request? This cannot be undone!'
    );
    if (!confirmed) return;

    try {
      console.log(`🗑️ Deleting request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await deleteDoc(requestRef);

      console.log('✅ Request deleted');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      await showConfirmModal('Error', 'Failed to delete request. Please try again.', null, true);
    }
  };

  // Render calendar view
  function renderCalendarView() {
    console.log('📅 Rendering calendar view...');
    
    const container = document.getElementById('tentsContentArea');
    if (!container) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let calendarHTML = `
      <div class="tents-calendar-container">
        <div class="tents-calendar-header">
          <button class="tents-calendar-nav-btn" id="prevMonthBtn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>${monthNames[currentMonth]} ${currentYear}</h2>
          <button class="tents-calendar-nav-btn" id="nextMonthBtn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="tents-calendar-grid">
          <div class="tents-calendar-day-header">Sun</div>
          <div class="tents-calendar-day-header">Mon</div>
          <div class="tents-calendar-day-header">Tue</div>
          <div class="tents-calendar-day-header">Wed</div>
          <div class="tents-calendar-day-header">Thu</div>
          <div class="tents-calendar-day-header">Fri</div>
          <div class="tents-calendar-day-header">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="tents-calendar-date empty"></div>';
    }

    // Days with bookings - only show APPROVED requests
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Find all approved bookings that cover this date (startDate <= dateStr <= endDate)
      const dayBookings = filteredRequests.filter(req => {
        // Only show approved requests in calendar
        if (req.status !== 'approved') return false;
        
        const reqStartDate = req.startDate;
        const reqEndDate = req.endDate || req.startDate;
        
        // Check if this date falls within the booking range
        return dateStr >= reqStartDate && dateStr <= reqEndDate;
      });

      const hasBookings = dayBookings.length > 0;
      const isToday = dateStr === todayDateStr;
      
      calendarHTML += `
        <div class="tents-calendar-date ${hasBookings ? 'has-bookings' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">
          <div class="tents-date-number">${day}</div>
      `;

      if (hasBookings) {
        // Show indicator for number of bookings
        calendarHTML += `<div class="tents-booking-indicator">${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}</div>`;
      }

      calendarHTML += '</div>';
    }

    calendarHTML += `
        </div>
      </div>
    `;

    container.innerHTML = calendarHTML;

    // Add event listeners for month navigation
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendarView();
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendarView();
    });

    // Click on ALL dates (not just those with bookings) to show modal
    document.querySelectorAll('.tents-calendar-date:not(.empty)').forEach(dateEl => {
      dateEl.style.cursor = 'pointer';
      dateEl.addEventListener('click', () => {
        const date = dateEl.getAttribute('data-date');
        showDateBookingsModal(date);
      });
    });
  }

  // Show modal with bookings for a specific date
  function showDateBookingsModal(date) {
    console.log(`📅 Showing bookings for ${date}`);
    
    // Find all approved bookings that cover this date (startDate <= date <= endDate)
    const dateBookings = filteredRequests.filter(req => {
      // Only show approved requests
      if (req.status !== 'approved') return false;
      
      const reqStartDate = req.startDate;
      const reqEndDate = req.endDate || req.startDate;
      
      // Check if this date falls within the booking range
      return date >= reqStartDate && date <= reqEndDate;
    });

    const modal = document.getElementById('tentsModalOverlay');
    const modalTitle = document.getElementById('tentsModalTitle');
    const modalBody = document.getElementById('tentsModalBody');

    if (!modal || !modalTitle || !modalBody) {
      console.error('❌ Modal elements not found');
      return;
    }

    // Format date nicely
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    modalTitle.textContent = `Approved Bookings for ${formattedDate}`;

    let bodyHTML = '';
    
    if (dateBookings.length === 0) {
      bodyHTML = `
        <div class="tents-no-bookings">
          <svg style="width: 64px; height: 64px; margin: 0 auto 16px; color: #9ca3af;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p style="text-align: center; color: #6b7280; font-size: 15px;">No approved bookings on this date.</p>
        </div>
      `;
    } else {
      bodyHTML = '<div class="tents-modal-bookings-list">';
      
      dateBookings.forEach((booking, index) => {
        const firstName = booking.firstName || '';
        const lastName = booking.lastName || '';
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : (booking.fullName || 'Unknown');
        
        // Format date range
        const startDate = new Date(booking.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = booking.endDate ? new Date(booking.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : startDate;
        const dateRange = booking.startDate === booking.endDate ? startDate : `${startDate} - ${endDate}`;
        
        bodyHTML += `
          <div class="tents-booking-item ${index > 0 ? 'with-divider' : ''}">
            <div class="tents-booking-item-header">
              <div class="tents-booking-name">
                <svg style="width: 18px; height: 18px; margin-right: 8px; color: #0b3b8c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <strong>${sanitizeInput(fullName)}</strong>
              </div>
              <span class="tents-status-badge-approved">Approved</span>
            </div>
            <div class="tents-booking-item-details">
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span><strong>Period:</strong> ${dateRange}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span><strong>Tents:</strong> ${booking.quantityTents || 0} | <strong>Chairs:</strong> ${booking.quantityChairs || 0}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <span><strong>Mode:</strong> ${booking.modeOfReceiving || 'N/A'}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span><strong>Address:</strong> ${sanitizeInput(booking.completeAddress || 'N/A')}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span><strong>Contact:</strong> ${booking.contactNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      bodyHTML += '</div>';
    }

    modalBody.innerHTML = bodyHTML;
    modal.style.display = 'flex';
  }

  // Update stats cards
  async function updateStats() {
    try {
      const inventoryDocRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryDocRef);

      let availableTents = 24;
      let availableChairs = 600;
      let tentsInUse = 0;
      let chairsInUse = 0;

      if (inventorySnap.exists()) {
        const data = inventorySnap.data();
        availableTents = data.availableTents || 24;
        availableChairs = data.availableChairs || 600;
        tentsInUse = data.tentsInUse || 0;
        chairsInUse = data.chairsInUse || 0;
      }

      // Update DOM
      document.getElementById('availableTentsCount').textContent = availableTents;
      document.getElementById('availableChairsCount').textContent = availableChairs;
      document.getElementById('tentsInUseCount').textContent = tentsInUse;
      document.getElementById('chairsInUseCount').textContent = chairsInUse;

      console.log(`📊 Stats updated - Tents: ${availableTents} avail, ${tentsInUse} in use | Chairs: ${availableChairs} avail, ${chairsInUse} in use`);
      
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  }

  // Export to CSV
  window.exportToCSV = function() {
    console.log('📥 Exporting to CSV...');

    if (filteredRequests.length === 0) {
      alert('No requests to export.');
      return;
    }

    // CSV headers
    let csvContent = 'Submitted On,Name,Start Date,End Date,Chairs,Tents,Delivery,Address,Status\n';

    // CSV rows
    filteredRequests.forEach(req => {
      const submittedDate = req.createdAt ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const name = (req.fullName || 'Unknown').replace(/,/g, ';'); // Escape commas
      const startDate = req.startDate || 'N/A';
      const endDate = req.endDate || 'N/A';
      const chairs = req.quantityChairs || 0;
      const tents = req.quantityTents || 0;
      const mode = req.modeOfReceiving || 'N/A';
      const address = (req.completeAddress || 'N/A').replace(/,/g, ';'); // Escape commas
      const status = req.status || 'pending';

      csvContent += `${submittedDate},${name},${startDate},${endDate},${chairs},${tents},${mode},${address},${status}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tents-chairs-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV export complete');
  };

  // Event listeners for tabs
  document.querySelectorAll('.tents-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tents-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const label = tab.textContent.toLowerCase();
      if (label.includes('archives')) currentTab = 'archives';
      else if (label.includes('history')) currentTab = 'history';
      else currentTab = 'all';
      console.log(`🔄 Switched to ${currentTab} tab`);
      applyFilters();
    });
  });

  // Event listeners for view toggle
  document.querySelectorAll('.tents-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tents-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentView = btn.id === 'tableViewBtn' ? 'table' : 'calendar';
      console.log(`🔄 Switched to ${currentView} view`);
      applyFilters();
    });
  });

  // Event listeners for filters
  // Attach listeners to both the legacy 'tents*' IDs and the actual page IDs to ensure filters always work
  document.getElementById('tentsSearchInput')?.addEventListener('input', applyFilters);
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);

  document.getElementById('tentsStatusFilter')?.addEventListener('change', applyFilters);
  document.getElementById('statusFilter')?.addEventListener('change', applyFilters);

  document.getElementById('tentsDateFilter')?.addEventListener('change', applyFilters);
  document.getElementById('dateFilter')?.addEventListener('change', applyFilters);

  document.getElementById('tentsModeFilter')?.addEventListener('change', applyFilters);
  document.getElementById('deliveryFilter')?.addEventListener('change', applyFilters);

  // Export dropdown toggle
  document.getElementById('exportBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('exportDropdown');
    dropdown?.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    document.getElementById('exportDropdown')?.classList.remove('active');
  });

  // Modal close
  document.getElementById('tentsModalClose')?.addEventListener('click', () => {
    document.getElementById('tentsModal')?.classList.remove('active');
  });

  // Close modal when clicking overlay
  document.getElementById('tentsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'tentsModal') {
      e.target.classList.remove('active');
    }
  });

  // Initialize on page load
  initializeInventory().then(() => {
    loadTentsRequests();
    updateStats();
  });
}

/* ========================================
   TENTS & CHAIRS ADMIN PAGE - admin-tents-requests.html
   ======================================== */

if (window.location.pathname.endsWith('admin-tents-requests.html') || 
    window.location.pathname.endsWith('/admin-tents-requests')) {
  
  console.log('🎪 Tents & Chairs Admin Page loaded');

  // ========================================
  // STATE VARIABLES
  // ========================================
  let allRequests = []; // Store all requests from Firestore
  let currentTab = 'all'; // 'all' or 'history'
  let currentView = 'table'; // 'table' or 'calendar'
  let currentMonth = new Date().getMonth(); // Current month for calendar
  let currentYear = new Date().getFullYear(); // Current year for calendar

  // Normalize delivery/mode strings to canonical values for comparison
  function normalizeMode(str) {
    if (!str) return '';
    const s = String(str).toLowerCase();
    if (s.includes('pick')) return 'pick-up';
    if (s.includes('deliver')) return 'delivery';
    if (s.includes('internal')) return 'internal';
    return s.replace(/[^a-z]/g, '');
  }

  // ========================================
  // FIRESTORE FUNCTIONS
  // ========================================

  /**
   * Load inventory stats from Firestore
   */
  async function loadInventoryStats() {
    console.log('📊 Loading inventory stats...');
    try {
      const inventoryRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryRef);

      if (inventorySnap.exists()) {
        const data = inventorySnap.data();
        console.log('✅ Inventory data loaded:', data);

        // Update stat cards
        document.getElementById('availableTentsCount').textContent = data.availableTents || 0;
        document.getElementById('availableChairsCount').textContent = data.availableChairs || 0;
        document.getElementById('tentsInUseCount').textContent = data.tentsInUse || 0;
        document.getElementById('chairsInUseCount').textContent = data.chairsInUse || 0;
      } else {
        console.warn('⚠️ No inventory document found. Creating default...');
        await createDefaultInventory();
      }
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      showToast('Failed to load inventory stats', false);
    }
  }

  /**
   * Create default inventory document
   */
  async function createDefaultInventory() {
    console.log('🔧 Creating default inventory document...');
    try {
      const inventoryRef = doc(db, 'inventory', 'equipment');
      const defaultData = {
        availableTents: 24,
        availableChairs: 600,
        tentsInUse: 0,
        chairsInUse: 0,
        totalTents: 24,
        totalChairs: 600,
        lastUpdated: new Date()
      };

      await setDoc(inventoryRef, defaultData);
      console.log('✅ Default inventory created');
      
      // Update UI
      document.getElementById('availableTentsCount').textContent = defaultData.availableTents;
      document.getElementById('availableChairsCount').textContent = defaultData.availableChairs;
      document.getElementById('tentsInUseCount').textContent = defaultData.tentsInUse;
      document.getElementById('chairsInUseCount').textContent = defaultData.chairsInUse;
    } catch (error) {
      console.error('❌ Error creating default inventory:', error);
    }
  }

  /**
   * Load all tents & chairs requests from Firestore
   */
  async function loadAllRequests() {
    console.log('📦 Loading all tents & chairs requests...');
    try {
      const bookingsRef = collection(db, 'tentsChairsBookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      allRequests = [];
      querySnapshot.forEach((docSnapshot) => {
        allRequests.push({
          id: docSnapshot.id,
          ...docSnapshot.data()
        });
      });

      console.log(`✅ Loaded ${allRequests.length} requests`);
      renderContent();
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      showToast('Failed to load requests', false);
    }
  }

  /**
   * Update inventory "In Use" counts based on approved requests
   */
  async function updateInventoryInUse() {
    console.log('🔄 Updating inventory "In Use" counts...');
    try {
      // Get all approved requests
      const approvedRequests = allRequests.filter(req => req.status === 'approved');
      
      let tentsInUse = 0;
      let chairsInUse = 0;

      // Calculate total in use
      approvedRequests.forEach(req => {
        tentsInUse += parseInt(req.quantityTents || 0);
        chairsInUse += parseInt(req.quantityChairs || 0);
      });

      console.log(`📊 In Use - Tents: ${tentsInUse}, Chairs: ${chairsInUse}`);

      // Update Firestore
      const inventoryRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryRef);
      
      if (inventorySnap.exists()) {
        const data = inventorySnap.data();
        const totalTents = data.totalTents || 24;
        const totalChairs = data.totalChairs || 600;

        await updateDoc(inventoryRef, {
          tentsInUse: tentsInUse,
          chairsInUse: chairsInUse,
          availableTents: totalTents - tentsInUse,
          availableChairs: totalChairs - chairsInUse,
          lastUpdated: new Date()
        });

        console.log('✅ Inventory updated successfully');
        
        // Reload stats to update UI
        await loadInventoryStats();
      }
    } catch (error) {
      console.error('❌ Error updating inventory:', error);
    }
  }

  // ========================================
  // FILTERING & SORTING FUNCTIONS
  // ========================================

  /**
   * Get filtered and sorted requests based on current tab and filters
   */
  function getFilteredRequests() {
    console.log('🔍 Filtering requests...');
    
    let filtered = [...allRequests];

    // Filter by tab
    if (currentTab === 'all') {
      // All Requests: pending, approved, in-progress only
      filtered = filtered.filter(req => 
        ['pending', 'approved', 'in-progress'].includes(req.status)
      );
    } else if (currentTab === 'history') {
      // History: completed, rejected, cancelled only (not archived)
      filtered = filtered.filter(req => 
        ['completed', 'rejected', 'cancelled'].includes(req.status) && !req.archived
      );
    } else if (currentTab === 'archives') {
      // Archives: archived requests (from history)
      filtered = filtered.filter(req => req.archived === true && ['completed', 'rejected', 'cancelled'].includes(req.status));
    }

    // Filter by status (from dropdown)
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by search (name)
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(req => 
        (req.fullName || '').toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date
    const dateFilter = document.getElementById('dateFilter')?.value;
    if (dateFilter) {
      filtered = filtered.filter(req => 
        req.startDate === dateFilter || req.endDate === dateFilter
      );
    }

    // Filter by delivery mode (use normalization to match variations like "Self-Pickup"/"Pick-up")
    const deliveryFilter = document.getElementById('deliveryFilter')?.value;
    if (deliveryFilter && deliveryFilter !== 'all') {
      filtered = filtered.filter(req => normalizeMode(req.modeOfReceiving) === normalizeMode(deliveryFilter));
    }

    // Sort
    const sortBy = document.getElementById('sortByFilter')?.value || 'submitted-desc';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'submitted-asc':
          // Date Submitted (Oldest First)
          return (a.createdAt?.toDate() || new Date(0)) - (b.createdAt?.toDate() || new Date(0));
        case 'submitted-desc':
          // Date Submitted (Newest First)
          return (b.createdAt?.toDate() || new Date(0)) - (a.createdAt?.toDate() || new Date(0));
        case 'event-asc':
          // Event Date (Oldest First)
          return new Date(a.startDate) - new Date(b.startDate);
        case 'event-desc':
          // Event Date (Newest First)
          return new Date(b.startDate) - new Date(a.startDate);
        case 'name-asc':
          // Last Name (A-Z)
          const lastNameA = getLastName(a.fullName);
          const lastNameB = getLastName(b.fullName);
          return lastNameA.localeCompare(lastNameB);
        case 'name-desc':
          // Last Name (Z-A)
          const lastNameA2 = getLastName(a.fullName);
          const lastNameB2 = getLastName(b.fullName);
          return lastNameB2.localeCompare(lastNameA2);
        default:
          return 0;
      }
    });

    console.log(`✅ Filtered to ${filtered.length} requests`);
    return filtered;
  }

  /**
   * Extract last name from full name
   */
  function getLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1] || '';
  }

  /**
   * Extract first name from full name
   */
  function getFirstName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(' '); // Everything except last name
  }

  // ========================================
  // DATE FORMATTING FUNCTIONS
  // ========================================

  /**
   * Format date to text format (e.g., "Nov 2, 2025")
   */
  function formatDateText(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  // ========================================
  // RENDERING FUNCTIONS
  // ========================================

  /**
   * Main content rendering function
   */
  function renderContent() {
    console.log(`🎨 Rendering ${currentView} view for ${currentTab} tab`);
    
    if (currentView === 'table') {
      renderTableView();
    } else {
      renderCalendarView();
    }
  }

  /**
   * Render table view
   */
  function renderTableView() {
    const contentArea = document.getElementById('tentsContentArea');
    const requests = getFilteredRequests();

    if (requests.length === 0) {
      contentArea.innerHTML = `
        <div class="tents-empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3>No requests found</h3>
          <p>There are no requests matching your current filters.</p>
        </div>
      `;
      return;
    }

    let tableHTML = `
      <div class="tents-table-container">
        <table class="tents-requests-table">
          <thead>
            <tr>
              <th>Submitted On</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Chairs</th>
              <th>Tents</th>
              <th>Delivery Mode</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
              ${currentTab === 'history' || currentTab === 'archives' ? '<th>Remarks</th>' : ''}
              ${currentTab === 'history' ? '<th>Completed on</th>' : (currentTab === 'archives' ? '<th>Archived on</th>' : '<th>Notify User</th>')}
            </tr>
          </thead>
          <tbody>
    `;

    requests.forEach(req => {
      // Format submitted date and time
      let submittedDateTime = 'N/A';
      if (req.createdAt) {
        const createdDate = req.createdAt.toDate();
        const dateStr = formatDateText(createdDate.toISOString().split('T')[0]);
        const timeStr = createdDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        submittedDateTime = `${dateStr}<br><em style="font-size: 11px; color: #6b7280;">${timeStr}</em>`;
      }

      // Use stored firstName/lastName when available; otherwise fall back to fullName
      const firstName = (req.firstName && req.firstName.trim())
        ? req.firstName.trim()
        : (req.fullName ? getFirstName(req.fullName) : (req.userEmail ? req.userEmail.split('@')[0] : ''));
      const lastName = (req.lastName && req.lastName.trim())
        ? req.lastName.trim()
        : (req.fullName ? getLastName(req.fullName) : '');
      const startDate = formatDateText(req.startDate);
      const endDate = formatDateText(req.endDate);

      tableHTML += `
        <tr>
          <td>${submittedDateTime}</td>
          <td>${sanitizeInput(firstName)}</td>
          <td>${sanitizeInput(lastName)}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
          <td>${req.quantityChairs || 0}</td>
          <td>${req.quantityTents || 0}</td>
          <td>${sanitizeInput(req.modeOfReceiving || 'N/A')}</td>
          <td>${sanitizeInput(req.completeAddress || 'N/A')}</td>
          <td>${renderStatusBadge(req.status)}</td>
          <td>${renderActionButtons(req)}</td>
          ${currentTab === 'history' || currentTab === 'archives' ? `<td>${renderRemarks(req)}</td>` : ''}
          <td>${currentTab === 'history' ? renderCompletedOn(req) : (currentTab === 'archives' ? renderArchivedOn(req) : renderNotifyButtons(req))}</td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    contentArea.innerHTML = tableHTML;
  }

  /**
   * Render completion/cancellation/rejection timestamp for history rows
   */
  function renderCompletedOn(req) {
    // Prefer fields depending on status
    let ts = null;
    if (req.status === 'completed' && req.completedAt) ts = req.completedAt;
    else if (req.status === 'rejected' && req.rejectedAt) ts = req.rejectedAt;
    else if (req.status === 'cancelled' && req.cancelledAt) ts = req.cancelledAt;

    if (!ts) return '<span class="text-muted">—</span>';

    const d = formatTimestamp(ts);
    return `${d.date}<br><em style="font-size:11px;color:#6b7280;">${d.time}</em>`;
  }

  /**
   * Render archived timestamp for archived rows
   */
  function renderArchivedOn(req) {
    if (!req.archivedAt) return '<span class="text-muted">—</span>';
    const d = formatTimestamp(req.archivedAt);
    return `${d.date}<br><em style="font-size:11px;color:#6b7280;">${d.time}</em>`;
  }

  /**
   * Render remarks column (rejection reason or other admin notes)
   */
  function renderRemarks(req) {
    const reason = req.rejectionReason || req.remarks || '';
    if (!reason) return '<span class="text-muted">—</span>';
    // Prepare display and encoded payloads for safe attributes
    const displayRaw = (reason || '').replace(/\n/g, ' ');
    const displayShort = displayRaw.length > 140 ? displayRaw.slice(0, 140) + '…' : displayRaw;
    const encFull = encodeURIComponent(reason);
    const encTrunc = encodeURIComponent(displayShort);
    // Use data attributes and an inline click handler that calls toggleRemark(this)
    return `<span class="remarks-text collapsed" data-full="${encFull}" data-trunc="${encTrunc}" onclick="toggleRemark(this)">${sanitizeInput(displayShort)}</span>`;
  }

  // Toggle inline remark expand/collapse (attached to window for onclick usage)
  function toggleRemark(el) {
    if (!el) return;
    try {
      const isExpanded = el.classList.toggle('expanded');
      el.classList.toggle('collapsed', !isExpanded);
      if (isExpanded) {
        const full = decodeURIComponent(el.getAttribute('data-full') || '');
        el.textContent = full;
      } else {
        const trunc = decodeURIComponent(el.getAttribute('data-trunc') || '');
        el.textContent = trunc;
      }
    } catch (err) {
      console.error('toggleRemark error', err);
    }
  }
  window.toggleRemark = toggleRemark;

  // Show full remark in modal (reuses existing tents modal)
  function showFullRemark(text) {
    try {
      const overlay = document.getElementById('tentsModalOverlay');
      const titleEl = document.getElementById('tentsModalTitle');
      const bodyEl = document.getElementById('tentsModalBody');
      if (!overlay || !titleEl || !bodyEl) {
        // fallback: alert
        alert(text);
        return;
      }
      titleEl.textContent = 'Remark';
      bodyEl.innerHTML = `<div style="white-space:pre-wrap; font-family: 'Poppins', sans-serif;">${sanitizeInput(text)}</div>`;
      overlay.style.display = 'block';
      overlay.classList.add('active');
    } catch (err) {
      console.error('showFullRemark error', err);
      alert(text);
    }
  }
  // expose globally
  window.showFullRemark = showFullRemark;

  /**
   * Robust timestamp formatter. Accepts Firestore Timestamp, Date, or ISO string.
   * Returns {date: 'Nov 3, 2025', time: '2:34 PM'}
   */
  function formatTimestamp(ts) {
    try {
      let dateObj = null;
      if (!ts) return { date: 'N/A', time: '' };
      if (typeof ts.toDate === 'function') {
        dateObj = ts.toDate();
      } else if (typeof ts === 'string') {
        dateObj = new Date(ts);
      } else if (ts instanceof Date) {
        dateObj = ts;
      } else {
        // Fallback: attempt to construct
        dateObj = new Date(ts);
      }

      const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date: dateStr, time: timeStr };
    } catch (err) {
      console.error('Error formatting timestamp', err);
      return { date: 'N/A', time: '' };
    }
  }

  /**
   * Render status badge
   */
  function renderStatusBadge(status) {
    const statusClass = `tents-status-badge-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    return `<span class="${statusClass}">${statusText}</span>`;
  }

  /**
   * Render action buttons based on status and tab
   */
  function renderActionButtons(req) {
    if (currentTab === 'all') {
      // All Requests tab
      if (req.status === 'pending') {
        return `
          <button class="tents-btn-approve" onclick="window.tentsAdmin.handleApprove('${req.id}')">Approve</button>
          <button class="tents-btn-deny" onclick="window.tentsAdmin.handleDeny('${req.id}')">Deny</button>
        `;
      } else if (req.status === 'approved') {
        return `
          <button class="tents-btn-complete" onclick="window.tentsAdmin.handleComplete('${req.id}')">Mark as Completed</button>
        `;
      } else if (req.status === 'in-progress') {
        return `
          <button class="tents-btn-complete" onclick="window.tentsAdmin.handleComplete('${req.id}')">Mark as Completed</button>
        `;
      }
    } else if (currentTab === 'history') {
      // History tab: allow archiving for completed, rejected, cancelled
      if (['completed', 'rejected', 'cancelled'].includes(req.status)) {
        return `
          <button class="tents-btn-archive" onclick="window.tentsAdmin.handleArchive('${req.id}')">Archive</button>
        `;
      }
      // Other history rows have no actions
    }
    else if (currentTab === 'archives') {
      // Archives tab: allow unarchive (restore to history)
      return `
        <button class="tents-btn-unarchive" onclick="window.tentsAdmin.handleUnarchive('${req.id}')">Unarchive</button>
      `;
    }
    return '<span class="text-muted">—</span>';
  }

  /**
   * Render notify buttons
   */
  function renderNotifyButtons(req) {
    // Only show for approved or in-progress requests
    if (['approved', 'in-progress'].includes(req.status)) {
      return `
        <button class="tents-btn-times-up" onclick="window.tentsAdmin.handleTimesUp('${req.id}')">Time's Up</button>
        <button class="tents-btn-collect" onclick="window.tentsAdmin.handleCollect('${req.id}')">Collect</button>
      `;
    }
    return '<span class="text-muted">—</span>';
  }

  /**
   * Render calendar view with approved bookings
   */
  function renderCalendarView() {
    console.log('📅 Rendering calendar view...');
    
    const container = document.getElementById('tentsContentArea');
    if (!container) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Use current month/year from state or default to now
    const now = new Date();
    if (typeof currentMonth === 'undefined') window.currentMonth = now.getMonth();
    if (typeof currentYear === 'undefined') window.currentYear = now.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let calendarHTML = `
      <div class="tents-calendar-container">
        <div class="tents-calendar-header">
          <button class="tents-calendar-nav-btn" id="prevMonthBtn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>${monthNames[currentMonth]} ${currentYear}</h2>
          <button class="tents-calendar-nav-btn" id="nextMonthBtn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <!-- Calendar Legend -->
        <div class="tents-calendar-legend">
          <div class="tents-legend-item">
            <div class="tents-legend-box tents-legend-today"></div>
            <span>Today</span>
          </div>
          <div class="tents-legend-item">
            <div class="tents-legend-box tents-legend-has-bookings"></div>
            <span>Has Approved Bookings</span>
          </div>
          <div class="tents-legend-item">
            <div class="tents-legend-box tents-legend-empty"></div>
            <span>No Bookings</span>
          </div>
          <div class="tents-legend-item">
            <div class="tents-legend-event"></div>
            <span>Booking Event (Click date for details)</span>
          </div>
        </div>
        
        <div class="tents-calendar-grid">
          <div class="tents-calendar-day-header">Sun</div>
          <div class="tents-calendar-day-header">Mon</div>
          <div class="tents-calendar-day-header">Tue</div>
          <div class="tents-calendar-day-header">Wed</div>
          <div class="tents-calendar-day-header">Thu</div>
          <div class="tents-calendar-day-header">Fri</div>
          <div class="tents-calendar-day-header">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="tents-calendar-date empty"></div>';
    }

    // Days with bookings - only show APPROVED requests
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Find all approved bookings that cover this date (startDate <= dateStr <= endDate)
      const dayBookings = allRequests.filter(req => {
        // Only show approved requests in calendar
        if (req.status !== 'approved') return false;
        
        const reqStartDate = req.startDate;
        const reqEndDate = req.endDate || req.startDate;
        
        // Check if this date falls within the booking range
        return dateStr >= reqStartDate && dateStr <= reqEndDate;
      });

      const hasBookings = dayBookings.length > 0;
      const isToday = dateStr === todayDateStr;
      
      calendarHTML += `
        <div class="tents-calendar-date ${hasBookings ? 'has-bookings' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">
          <div class="tents-date-number">${day}</div>
      `;

      if (hasBookings) {
        // Show up to 2 booking previews with details
        dayBookings.slice(0, 2).forEach(booking => {
          const firstName = booking.firstName || '';
          const lastName = booking.lastName || '';
          const fullName = firstName && lastName ? `${firstName} ${lastName}` : (booking.fullName || 'Unknown');
          
          // Create booking preview showing name and items
          const tentsCount = booking.quantityTents || 0;
          const chairsCount = booking.quantityChairs || 0;
          const itemsText = `${tentsCount}T / ${chairsCount}C`;
          
          calendarHTML += `
            <div class="tents-calendar-event">
              <div class="tents-event-name">${sanitizeInput(fullName)}</div>
              <div class="tents-event-items">${itemsText}</div>
            </div>
          `;
        });
        
        // If more than 2 bookings, show count
        if (dayBookings.length > 2) {
          calendarHTML += `<div class="tents-more-bookings">+${dayBookings.length - 2} more</div>`;
        }
      }

      calendarHTML += '</div>';
    }

    calendarHTML += `
        </div>
      </div>
    `;

    container.innerHTML = calendarHTML;

    // Add event listeners for month navigation
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendarView();
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendarView();
    });

    // Click on ALL dates (not just those with bookings) to show modal
    document.querySelectorAll('.tents-calendar-date:not(.empty)').forEach(dateEl => {
      dateEl.style.cursor = 'pointer';
      dateEl.addEventListener('click', () => {
        const date = dateEl.getAttribute('data-date');
        showDateBookingsModal(date);
      });
    });
  }

  /**
   * Show modal with bookings for a specific date
   */
  function showDateBookingsModal(date) {
    console.log(`📅 Showing bookings for ${date}`);
    
    // Find all approved bookings that cover this date (startDate <= date <= endDate)
    const dateBookings = allRequests.filter(req => {
      // Only show approved requests
      if (req.status !== 'approved') return false;
      
      const reqStartDate = req.startDate;
      const reqEndDate = req.endDate || req.startDate;
      
      // Check if this date falls within the booking range
      return date >= reqStartDate && date <= reqEndDate;
    });

    const modal = document.getElementById('tentsModalOverlay');
    const modalTitle = document.getElementById('tentsModalTitle');
    const modalBody = document.getElementById('tentsModalBody');

    if (!modal || !modalTitle || !modalBody) {
      console.error('❌ Modal elements not found');
      return;
    }

    // Format date nicely
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    modalTitle.textContent = `Approved Bookings for ${formattedDate}`;

    let bodyHTML = '';
    
    if (dateBookings.length === 0) {
      bodyHTML = `
        <div class="tents-no-bookings">
          <svg style="width: 64px; height: 64px; margin: 0 auto 16px; color: #9ca3af;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p style="text-align: center; color: #6b7280; font-size: 15px;">No approved bookings on this date.</p>
        </div>
      `;
    } else {
      bodyHTML = '<div class="tents-modal-bookings-list">';
      
      dateBookings.forEach((booking, index) => {
        const firstName = booking.firstName || '';
        const lastName = booking.lastName || '';
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : (booking.fullName || 'Unknown');
        
        // Format date range
        const startDate = new Date(booking.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = booking.endDate ? new Date(booking.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : startDate;
        const dateRange = booking.startDate === booking.endDate ? startDate : `${startDate} - ${endDate}`;
        
        bodyHTML += `
          <div class="tents-booking-item ${index > 0 ? 'with-divider' : ''}">
            <div class="tents-booking-item-header">
              <div class="tents-booking-name">
                <svg style="width: 18px; height: 18px; margin-right: 8px; color: #0b3b8c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <strong>${sanitizeInput(fullName)}</strong>
              </div>
              <span class="tents-status-badge-approved">Approved</span>
            </div>
            <div class="tents-booking-item-details">
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span><strong>Period:</strong> ${dateRange}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span><strong>Tents:</strong> ${booking.quantityTents || 0} | <strong>Chairs:</strong> ${booking.quantityChairs || 0}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <span><strong>Mode:</strong> ${booking.modeOfReceiving || 'N/A'}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span><strong>Address:</strong> ${sanitizeInput(booking.completeAddress || 'N/A')}</span>
              </div>
              <div class="tents-booking-detail-row">
                <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span><strong>Contact:</strong> ${booking.contactNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      bodyHTML += '</div>';
    }

    modalBody.innerHTML = bodyHTML;
    modal.style.display = 'flex';
  }

  // ========================================
  // ACTION HANDLERS
  // ========================================

  /**
   * Handle approve action
   * 
   * CRITICAL FUNCTION: This is the most important function in the admin system
   * It ensures inventory integrity by validating stock before approval
   * 
   * WORKFLOW:
   * 1. Fetch request data from allRequests array
   * 2. Fetch current inventory from Firestore (inventory/equipment doc)
   * 3. Calculate what inventory would be AFTER approval
   * 4. VALIDATE: Check if new inventory would be negative
   *    - If YES: Show error modal, block approval, return early
   *    - If NO: Show confirmation modal with before/after preview
   * 5. If admin confirms, update request status to "approved"
   * 6. Trigger updateInventoryInUse() to recalculate inventory.tentsInUse/chairsInUse
   * 
   * INVENTORY VALIDATION LOGIC:
   * - newTents = currentAvailableTents - requestedTents
   * - newChairs = currentAvailableChairs - requestedChairs
   * - If EITHER newTents OR newChairs < 0: BLOCK APPROVAL
   * 
   * ERROR HANDLING:
   * - Request not found: Show toast, return
   * - Inventory document missing: Defaults to 0 stock (will block all approvals)
   * - Insufficient stock: Show detailed error modal with shortage amounts
   * - Firestore update fails: Show error toast, log to console
   * 
   * IMPORTANT NOTES:
   * - This function does NOT directly update inventory.availableTents/Chairs
   * - Inventory is updated by updateInventoryInUse() which recalculates based on ALL approved requests
   * - This prevents race conditions and ensures inventory accuracy
   * 
   * FOR NEXT DEVELOPER:
   * If you need to bypass validation for testing:
   * 1. Comment out the validation block (lines with "if (newTents < 0 || newChairs < 0)")
   * 2. DO NOT DEPLOY WITH VALIDATION DISABLED
   * 3. Re-enable before committing
   * 
   * If you need to adjust default inventory:
   * 1. Go to Firestore Console → inventory → equipment document
   * 2. Manually update availableTents and availableChairs
   * 3. In future: Create admin-manage-inventory.html for this
   */
  async function handleApprove(requestId) {
    console.log(`✅ Approving request: ${requestId}`);
    
    try {
      // Step 1: Get the request data to show inventory changes
      const request = allRequests.find(r => r.id === requestId);
      if (!request) {
        showToast('Request not found', false);
        return;
      }

      // Step 2: Get current inventory from Firestore
      const inventoryRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryRef);
      
      let currentTents = 0;
      let currentChairs = 0;
      
      if (inventorySnap.exists()) {
        const inventoryData = inventorySnap.data();
        currentTents = inventoryData.availableTents || 0;
        currentChairs = inventoryData.availableChairs || 0;
      }

      // Calculate new values (subtract requested amounts)
      const requestedTents = parseInt(request.quantityTents) || 0;
      const requestedChairs = parseInt(request.quantityChairs) || 0;
      const newTents = currentTents - requestedTents;
      const newChairs = currentChairs - requestedChairs;

      // VALIDATION: Check if approval would result in negative stock
      if (newTents < 0 || newChairs < 0) {
        let errorMessage = 'Cannot approve request: Insufficient inventory.\n\n';
        
        if (newTents < 0) {
          errorMessage += `Tents: Requested ${requestedTents}, but only ${currentTents} available (shortage: ${Math.abs(newTents)})\n`;
        }
        
        if (newChairs < 0) {
          errorMessage += `Chairs: Requested ${requestedChairs}, but only ${currentChairs} available (shortage: ${Math.abs(newChairs)})`;
        }
        
        await showConfirmModal(
          'Insufficient Inventory',
          errorMessage.trim(),
          null,
          true // isAlert mode - only shows OK button
        );
        
        console.warn('⚠️ Approval blocked: Insufficient inventory', {
          requestedTents,
          currentTents,
          requestedChairs,
          currentChairs
        });
        
        return;
      }

      // Show confirmation modal with inventory changes
      const confirmed = await showConfirmModal(
        'Approve Request',
        'Are you sure you want to approve this request? The inventory will be updated.',
        {
          tents: requestedTents > 0 ? { old: currentTents, new: newTents } : null,
          chairs: requestedChairs > 0 ? { old: currentChairs, new: newChairs } : null
        }
      );

      if (!confirmed) {
        return;
      }

      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date()
      });

      console.log('✅ Request approved successfully');
      showToast('Request approved successfully', true);
      
      // Reload data
      await loadAllRequests();
      await updateInventoryInUse();
    } catch (error) {
      console.error('❌ Error approving request:', error);
      showToast('Failed to approve request', false);
    }
  }

  /**
   * Handle deny/reject action
   */
  async function handleDeny(requestId) {
    console.log(`❌ Denying request: ${requestId}`);
    // Use unified modal to both confirm and collect optional rejection reason
    const reasonInput = await showConfirmModal(
      'Reject Request',
      'Please provide a reason for rejection (optional):',
      null,
      false,
      { placeholder: 'Enter rejection reason (optional)...', defaultValue: '', multiline: true }
    );

    // If user cancelled (clicked No), reasonInput === false
    if (reasonInput === false) return;

    const reason = typeof reasonInput === 'string' ? reasonInput : '';

    try {
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      });

      console.log('✅ Request rejected successfully');
      showToast('Request rejected', true);
      
      // Reload data
      await loadAllRequests();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      showToast('Failed to reject request', false);
    }
  }

  /**
   * Handle complete action
   */
  async function handleComplete(requestId) {
    console.log(`✔️ Completing request: ${requestId}`);
    
    const confirmed = await showConfirmModal(
      'Mark as Completed',
      'Are you sure you want to mark this request as completed? The inventory will be updated to reflect returned items.'
    );

    if (!confirmed) {
      return;
    }

    try {
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedAt: new Date()
      });

      console.log('✅ Request completed successfully');
      showToast('Request marked as completed', true);
      
      // Reload data
      await loadAllRequests();
      await updateInventoryInUse();
    } catch (error) {
      console.error('❌ Error completing request:', error);
      showToast('Failed to complete request', false);
    }
  }

  /**
   * Handle archive action
   */
  async function handleArchive(requestId) {
    console.log(`📦 Archiving request: ${requestId}`);
    const confirmed = await showConfirmModal(
      'Archive Request',
      'Archive this request? This will hide it from the history view.'
    );

    if (!confirmed) return;

    try {
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        archived: true,
        archivedAt: new Date()
      });

      console.log('✅ Request archived successfully');
      showToast('Request archived', true);
      
      // For now, just reload. In future, filter out archived requests
      await loadAllRequests();
    } catch (error) {
      console.error('❌ Error archiving request:', error);
      showToast('Failed to archive request', false);
    }
  }

  /**
   * Handle unarchive (restore from archives back to history)
   */
  async function handleUnarchive(requestId) {
    console.log(`↩️ Unarchiving request: ${requestId}`);
    const confirmed = await showConfirmModal(
      'Restore Request',
      'Restore this request from Archives back to History?'
    );
    if (!confirmed) return;

    try {
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        archived: false,
        archivedAt: null
      });

      console.log('✅ Request unarchived successfully');
      showToast('Request restored to History', true);
      await loadAllRequests();
    } catch (error) {
      console.error('❌ Error unarchiving request:', error);
      showToast('Failed to restore request', false);
    }
  }

  /**
   * Handle delete action
   */
  async function handleDelete(requestId) {
    console.log(`🗑️ Deleting request: ${requestId}`);
    const confirmed = await showConfirmModal(
      'Delete Request',
      'Are you sure you want to permanently delete this request? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await deleteDoc(requestRef);

      console.log('✅ Request deleted successfully');
      showToast('Request deleted permanently', true);
      
      // Reload data
      await loadAllRequests();
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      showToast('Failed to delete request', false);
    }
  }

  /**
   * Handle "Time's Up" notification
   */
  async function handleTimesUp(requestId) {
    console.log(`⏰ Sending "Time\'s Up" notification for: ${requestId}`);
    
    const confirmed = await showConfirmModal(
      'Send Time\'s Up Notification',
      'Are you sure you want to send a "Time\'s Up" notification to remind the user about their booking?'
    );

    if (!confirmed) {
      return;
    }
    
    // Placeholder: In future, integrate with email/SMS service
    showToast('Time\'s Up notification feature will be implemented soon', false);
    
    // For now, just log the action
    console.log(`📧 Would send "Time's Up" notification to user for request ${requestId}`);
  }

  /**
   * Handle "Collect" notification
   */
  async function handleCollect(requestId) {
    console.log(`📦 Sending "Collect" notification for: ${requestId}`);
    
    const confirmed = await showConfirmModal(
      'Send Collect Notification',
      'Are you sure you want to send a "Collect" notification to remind the user to collect their items?'
    );

    if (!confirmed) {
      return;
    }
    
    // Placeholder: In future, integrate with email/SMS service
    showToast('Collect notification feature will be implemented soon', false);
    
    // For now, just log the action
    console.log(`📧 Would send "Collect" notification to user for request ${requestId}`);
  }

  // ========================================
  // CONFIRMATION MODAL SYSTEM
  // ========================================
  /**
   * CRITICAL COMPONENT: Unified confirmation modal for all admin actions
   * 
   * This modal replaced all native confirm() and alert() dialogs for better UX.
   * Supports two modes: Confirmation mode (Yes/No) and Alert mode (OK only)
   * 
   * SPECIAL FEATURE: Inventory Preview
   * - When approving requests, shows before/after inventory counts
   * - Example: "Tents: 10 → 8" and "Chairs: 250 → 200"
   * - Helps admin visualize impact before confirming
   * 
   * USAGE EXAMPLES:
   * 
   * 1. Simple Confirmation:
   *    const confirmed = await showConfirmModal(
   *      'Delete Request',
   *      'Are you sure? This cannot be undone.'
   *    );
   *    if (confirmed) { // user clicked Yes }
   * 
   * 2. With Inventory Preview:
   *    await showConfirmModal(
   *      'Approve Request',
   *      'This will update your inventory.',
   *      { 
   *        tents: { old: 10, new: 8 },
   *        chairs: { old: 250, new: 200 }
   *      }
   *    );
   * 
   * 3. Alert Mode (errors/info):
   *    await showConfirmModal(
   *      'Insufficient Inventory',
   *      'Cannot approve: Not enough tents available.',
   *      null,
   *      true // isAlert = shows only OK button
   *    );
   * 
   * PARAMETERS:
   * @param {string} title - Modal header (e.g., "Approve Request")
   * @param {string} message - Main message (supports \n for line breaks)
   * @param {Object|null} inventoryChanges - Optional { tents: {old, new}, chairs: {old, new} }
   * @param {boolean} isAlert - If true, shows only OK button (no Yes/No)
   * 
   * RETURNS:
   * @returns {Promise<boolean>} - Resolves to true if Yes/OK clicked, false if No clicked
   * 
   * DOM DEPENDENCIES:
   * - #tentsConfirmModal - Modal container (must have .tents-confirm-modal-overlay class)
   * - #tentsConfirmTitle - H3 element for title
   * - #tentsConfirmMessage - P element for message
   * - #tentsConfirmInventory - Div for inventory preview (hidden if null)
   * - #tentsConfirmYes - Yes/OK button
   * - #tentsConfirmNo - No button (hidden in alert mode)
   * 
   * CSS CLASSES:
   * - .active - Added to modal overlay to show modal
   * - .hidden - Added to inventory preview when not needed
   * 
   * IMPORTANT NOTES:
   * - Always await this function (it returns a Promise)
   * - Event listeners are properly cleaned up to prevent memory leaks
   * - Modal closes when either button is clicked
   * - Pressing OK in alert mode resolves to true (consistency)
   */
  /**
   * Show confirmation modal
   * @param {string} title - Modal title
   * @param {string} message - Confirmation message
   * @param {Object} inventoryChanges - Optional inventory changes {tents: {old, new}, chairs: {old, new}}
   * @param {boolean} isAlert - If true, shows only OK button (for error/info messages)
   * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
   */
  // Extended confirmation modal. Supports:
  // - Alert mode (OK only)
  // - Inventory preview (shows inventoryEl)
  // - Optional input textarea (inputOptions) which when provided will
  //   return the entered string on Yes, or false on No.
  //
  // Signature:
  // showConfirmModal(title, message, inventoryChanges = null, isAlert = false, inputOptions = null)
  // - inputOptions: { placeholder?: string, defaultValue?: string, multiline?: boolean }
  function showConfirmModal(title, message, inventoryChanges = null, isAlert = false, inputOptions = null) {
    return new Promise((resolve) => {
      const modal = document.getElementById('tentsConfirmModal');
      const titleEl = document.getElementById('tentsConfirmTitle');
      const messageEl = document.getElementById('tentsConfirmMessage');
      const inventoryEl = document.getElementById('tentsConfirmInventory');
      const inputContainer = document.getElementById('tentsConfirmInput');
      const inputTextarea = document.getElementById('tentsConfirmInputTextarea');
      const yesBtn = document.getElementById('tentsConfirmYes');
      const noBtn = document.getElementById('tentsConfirmNo');

      // Set content
      titleEl.textContent = title;
      messageEl.textContent = message;
      messageEl.style.whiteSpace = 'pre-line'; // Preserve line breaks

      // Handle alert mode (only OK button)
      if (isAlert) {
        yesBtn.textContent = 'OK';
        yesBtn.style.display = 'inline-block';
        noBtn.style.display = 'none';
      } else {
        yesBtn.textContent = 'Yes';
        yesBtn.style.display = 'inline-block';
        noBtn.style.display = 'inline-block';
      }

      // Setup input area if requested
      const useInput = inputOptions && typeof inputOptions === 'object';
      if (useInput && inputContainer && inputTextarea) {
        inputContainer.style.display = 'block';
        inputTextarea.value = inputOptions.defaultValue || '';
        inputTextarea.placeholder = inputOptions.placeholder || '';
        // autofocus after slight delay to allow modal to become active
        setTimeout(() => inputTextarea.focus(), 50);
      } else if (inputContainer && inputTextarea) {
        inputContainer.style.display = 'none';
        inputTextarea.value = '';
      }

      // Show inventory changes if provided
      if (inventoryChanges) {
        let inventoryHTML = '';
        
        if (inventoryChanges.tents) {
          inventoryHTML += `
            <div class="tents-inventory-item">
              <span class="tents-inventory-label">Tents:</span>
              <div class="tents-inventory-change">
                <span class="tents-inventory-old">${inventoryChanges.tents.old}</span>
                <span class="tents-inventory-arrow">→</span>
                <span class="tents-inventory-new">${inventoryChanges.tents.new}</span>
              </div>
            </div>
          `;
        }
        
        if (inventoryChanges.chairs) {
          inventoryHTML += `
            <div class="tents-inventory-item">
              <span class="tents-inventory-label">Chairs:</span>
              <div class="tents-inventory-change">
                <span class="tents-inventory-old">${inventoryChanges.chairs.old}</span>
                <span class="tents-inventory-arrow">→</span>
                <span class="tents-inventory-new">${inventoryChanges.chairs.new}</span>
              </div>
            </div>
          `;
        }
        
        inventoryEl.innerHTML = inventoryHTML;
        inventoryEl.classList.remove('hidden');
      } else {
        inventoryEl.innerHTML = '';
        inventoryEl.classList.add('hidden');
      }

      // Show modal
      modal.classList.add('active');

      // Handle button clicks
      const handleYes = () => {
        // If input was requested, return the string; otherwise true
        let result = true;
        if (useInput && inputTextarea) {
          result = inputTextarea.value;
        }
        cleanup();
        resolve(result);
      };

      const handleNo = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        modal.classList.remove('active');
        messageEl.style.whiteSpace = 'normal'; // Reset
        // Reset input area
        if (inputContainer && inputTextarea) {
          inputContainer.style.display = 'none';
          inputTextarea.value = '';
        }
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
      };

      yesBtn.addEventListener('click', handleYes);
      noBtn.addEventListener('click', handleNo);
    });
  }

  // ========================================
  // TAB & VIEW SWITCHING
  // ========================================

  /**
   * Switch between All Requests and History tabs
   */
  function switchTab(tabName) {
    console.log(`🔄 Switching to ${tabName} tab`);
    currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tents-tab').forEach(tab => tab.classList.remove('active'));
  // NOTE: HTML uses id="allRequestsTab" for the All Requests button but we use
  // the logical tab name 'all' in the code (to drive filters/export). Map the
  // logical name to the actual element id before adding the active class.
  const tabElementId = tabName === 'all' ? 'allRequestsTab' : `${tabName}Tab`;
  document.getElementById(tabElementId)?.classList.add('active');

    // Show/hide view toggle and export based on tab. History does NOT support
    // calendar view, so always force the table view when switching tabs. We
    // call switchView('table') to ensure the view button active state and the
    // table/calendar DOM sections are kept in sync.
    if (tabName === 'all') {
      document.getElementById('viewToggle').style.display = 'flex';
      document.getElementById('exportDropdown').style.display = 'none';
    } else {
      document.getElementById('viewToggle').style.display = 'none';
      document.getElementById('exportDropdown').style.display = 'block';
    }

    // Update status filter options based on tab
    updateStatusFilterOptions();

    // Ensure we are showing the table view (history has no calendar). Use
    // switchView to update button active classes and the filters/calendar UI.
    switchView('table');
  }

  /**
   * Update status filter options based on current tab
   */
  function updateStatusFilterOptions() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) return;
    if (currentTab === 'all') {
      // All Requests: All, Pending, Approved, In Progress
      statusFilter.innerHTML = `
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="in-progress">In Progress</option>
      `;
    } else if (currentTab === 'history' || currentTab === 'archives') {
      // History & Archives: All, Completed, Rejected, Cancelled
      statusFilter.innerHTML = `
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      `;
    }
  }

  /**
   * Switch between table and calendar views
   */
  function switchView(viewName) {
    console.log(`🔄 Switching to ${viewName} view`);
    currentView = viewName;

    // Update view buttons
    document.querySelectorAll('.tents-view-btn').forEach(btn => btn.classList.remove('active'));
    if (viewName === 'table') {
      document.getElementById('tableViewBtn')?.classList.add('active');
      document.getElementById('tableFilters').style.display = 'grid';
      document.getElementById('calendarButtons').style.display = 'none';
    } else {
      document.getElementById('calendarViewBtn')?.classList.add('active');
      document.getElementById('tableFilters').style.display = 'none';
      document.getElementById('calendarButtons').style.display = 'flex';
    }

    // Re-render content
    renderContent();
  }

  // ========================================
  // EXPORT FUNCTIONS
  // ========================================

  /**
   * Export current filtered data to CSV
   */
  function exportToCSV() {
    console.log('💾 Exporting to CSV...');
    
    const requests = getFilteredRequests();
    if (requests.length === 0) {
      showToast('No data to export', false);
      return;
    }

  // CSV headers
  let csv = 'Submitted On,First Name,Last Name,Start Date,End Date,Chairs,Tents,Delivery Mode,Address,Contact,Email,Status';
  // Include Remarks column for history/archives
  if (currentTab === 'history' || currentTab === 'archives') csv += ',Remarks';
  csv += '\n';

    // CSV rows
    requests.forEach(req => {
      const submittedDate = req.createdAt ? req.createdAt.toDate().toLocaleDateString() : 'N/A';
      const firstName = getFirstName(req.fullName);
      const lastName = getLastName(req.fullName);
      const startDate = formatDateText(req.startDate);
      const endDate = formatDateText(req.endDate);

  // Escape double quotes in remarks for CSV
  const remarkRaw = (req.rejectionReason || req.remarks || '');
  const remarkEsc = remarkRaw.replace(/"/g, '""');
  csv += `"${submittedDate}","${firstName}","${lastName}","${startDate}","${endDate}",${req.quantityChairs || 0},${req.quantityTents || 0},"${req.modeOfReceiving || ''}","${req.completeAddress || ''}","${req.contactNumber || ''}","${req.userEmail || ''}","${req.status}"`;
  if (currentTab === 'history' || currentTab === 'archives') csv += `,"${remarkEsc}"`;
  csv += '\n';
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tents-chairs-requests-${currentTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('✅ CSV exported successfully');
    showToast('CSV exported successfully', true);
  }

  /**
   * Toggle export dropdown menu
   */
  function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('active');
  }

  /**
   * Handle export button click
   */
  function exportData(format) {
    if (format === 'csv') {
      exportToCSV();
    }
    // Close dropdown
    document.getElementById('exportMenu')?.classList.remove('active');
  }

  // ========================================
  // MODAL FUNCTIONS
  // ========================================

  /**
   * Close modal
   */
  function closeTentsModal() {
    document.getElementById('tentsModalOverlay').style.display = 'none';
  }

  /**
   * Close modal when clicking overlay
   */
  function closeModalOnOverlay(event) {
    if (event.target.id === 'tentsModalOverlay') {
      closeTentsModal();
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // Tab switching
    document.getElementById('allRequestsTab')?.addEventListener('click', () => switchTab('all'));
    document.getElementById('historyTab')?.addEventListener('click', () => switchTab('history'));
    document.getElementById('archivesTab')?.addEventListener('click', () => switchTab('archives'));

    // View switching
    document.getElementById('tableViewBtn')?.addEventListener('click', () => switchView('table'));
    document.getElementById('calendarViewBtn')?.addEventListener('click', () => switchView('calendar'));

    // Filters
    document.getElementById('searchInput')?.addEventListener('input', renderContent);
    document.getElementById('statusFilter')?.addEventListener('change', renderContent);
    document.getElementById('dateFilter')?.addEventListener('change', renderContent);
    document.getElementById('deliveryFilter')?.addEventListener('change', renderContent);
    document.getElementById('sortByFilter')?.addEventListener('change', renderContent);

    // Setup internal booking modal
    setupInternalBookingModal();

    console.log('✅ Event listeners set up');
  }

  // ========================================
  // EXPOSE FUNCTIONS TO WINDOW (for onclick handlers)
  // ========================================

  window.tentsAdmin = {
    handleApprove,
    handleDeny,
    handleComplete,
    handleArchive,
    handleDelete,
    handleUnarchive,
    handleTimesUp,
    handleCollect
  };

  window.toggleExportMenu = toggleExportMenu;
  window.exportData = exportData;
  window.closeTentsModal = closeTentsModal;
  window.closeModalOnOverlay = closeModalOnOverlay;

  // ========================================
  // INTERNAL BOOKING MODAL FUNCTIONALITY
  // ========================================

  /**
   * Setup internal booking modal for tents admin page
   */
  function setupInternalBookingModal() {
    const modal = document.getElementById('internalBookingModalTents');
    const openBtn = document.getElementById('addInternalBookingBtnTents');
    const closeBtn = document.getElementById('closeInternalBookingModalTents');
    const cancelBtn = document.getElementById('cancelInternalBookingTents');
    const form = document.getElementById('internalBookingFormTents');

    if (!modal || !openBtn || !form) return;

    // Open modal
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('internalStartDateTents').setAttribute('min', today);
      document.getElementById('internalEndDateTents').setAttribute('min', today);
    });

    // Close modal function
    function closeModal() {
      modal.classList.remove('active');
      form.reset();
      clearAllInternalErrorsTents();
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    // Click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Date validation
    const startDateInput = document.getElementById('internalStartDateTents');
    const endDateInput = document.getElementById('internalEndDateTents');

    if (startDateInput && endDateInput) {
      startDateInput.addEventListener('change', function() {
        endDateInput.setAttribute('min', this.value);
        if (endDateInput.value && endDateInput.value < this.value) {
          endDateInput.value = '';
        }
        clearInternalErrorTents('internal-start-date-tents');
      });

      endDateInput.addEventListener('change', function() {
        clearInternalErrorTents('internal-end-date-tents');
      });
    }

    // Real-time validation
    ['internalTentsTents', 'internalChairsTents', 'internalPurposeTents', 'internalLocationTents', 
     'internalContactPersonTents', 'internalContactNumberTents'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', function() {
          const errorId = id.replace('Tents', '-tents').replace(/([A-Z])/g, '-$1').toLowerCase();
          clearInternalErrorTents(errorId);
        });
      }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      clearAllInternalErrorsTents();
      
      const startDate = document.getElementById('internalStartDateTents').value.trim();
      const endDate = document.getElementById('internalEndDateTents').value.trim();
      const tents = parseInt(document.getElementById('internalTentsTents').value) || 0;
      const chairs = parseInt(document.getElementById('internalChairsTents').value) || 0;
      const purpose = document.getElementById('internalPurposeTents').value.trim();
      const location = document.getElementById('internalLocationTents').value.trim();
      const contactPerson = document.getElementById('internalContactPersonTents').value.trim();
      const contactNumber = document.getElementById('internalContactNumberTents').value.trim();
      
      let hasError = false;
      
      // Validate dates
      if (!startDate) {
        setInternalErrorTents('internal-start-date-tents', 'Event start date is required');
        hasError = true;
      }
      
      if (!endDate) {
        setInternalErrorTents('internal-end-date-tents', 'Event end date is required');
        hasError = true;
      }
      
      if (startDate && endDate && endDate < startDate) {
        setInternalErrorTents('internal-end-date-tents', 'End date cannot be before start date');
        hasError = true;
      }
      
      // Validate quantities
      if (tents < 0) {
        setInternalErrorTents('internal-tents-tents', 'Quantity cannot be negative');
        hasError = true;
      }
      
      if (chairs < 0) {
        setInternalErrorTents('internal-chairs-tents', 'Quantity cannot be negative');
        hasError = true;
      }
      
      if (tents === 0 && chairs === 0) {
        setInternalErrorTents('internal-tents-tents', 'Must request at least 1 tent or chair');
        setInternalErrorTents('internal-chairs-tents', 'Must request at least 1 tent or chair');
        hasError = true;
      }
      
      // Check inventory
      try {
        const inventoryDoc = await getDoc(doc(db, 'inventory', 'equipment'));
        if (inventoryDoc.exists()) {
          const inventory = inventoryDoc.data();
          const availableTents = inventory.availableTents || 0;
          const availableChairs = inventory.availableChairs || 0;
          
          if (tents > availableTents) {
            setInternalErrorTents('internal-tents-tents', `Only ${availableTents} tents available`);
            hasError = true;
          }
          
          if (chairs > availableChairs) {
            setInternalErrorTents('internal-chairs-tents', `Only ${availableChairs} chairs available`);
            hasError = true;
          }
        }
      } catch (error) {
        console.error('Error checking inventory:', error);
      }
      
      // Validate purpose
      if (!purpose) {
        setInternalErrorTents('internal-purpose-tents', 'Purpose is required');
        hasError = true;
      } else if (purpose.length < 10) {
        setInternalErrorTents('internal-purpose-tents', 'Purpose must be at least 10 characters');
        hasError = true;
      }
      
      // Validate location
      if (!location) {
        setInternalErrorTents('internal-location-tents', 'Location is required');
        hasError = true;
      }
      
      // Validate contact person
      if (!contactPerson) {
        setInternalErrorTents('internal-contact-person-tents', 'Contact person is required');
        hasError = true;
      }
      
      // Validate contact number
      if (!contactNumber) {
        setInternalErrorTents('internal-contact-number-tents', 'Contact number is required');
        hasError = true;
      } else if (!/^09\d{9}$/.test(contactNumber)) {
        setInternalErrorTents('internal-contact-number-tents', 'Invalid format. Use: 09XXXXXXXXX (11 digits)');
        hasError = true;
      }
      
      if (hasError) return;
      
      // Show loading
      const submitBtn = this.querySelector('.internal-booking-submit-btn');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
        
        // Create booking
        const bookingData = {
          startDate: startDate,
          endDate: endDate,
          quantityTents: tents,
          quantityChairs: chairs,
          purpose: sanitizeInput(purpose),
          completeAddress: sanitizeInput(location),
          fullName: sanitizeInput(contactPerson),
          contactNumber: contactNumber,
          modeOfReceiving: 'Internal',
          status: 'approved',
          userId: currentUser.uid,
          userEmail: currentUser.email,
          createdAt: new Date(),
          approvedAt: new Date(),
          isInternalBooking: true
        };
        
        await addDoc(collection(db, 'tentsChairsBookings'), bookingData);
        
        // Update inventory
        const inventoryRef = doc(db, 'inventory', 'equipment');
        const inventorySnap = await getDoc(inventoryRef);
        
        if (inventorySnap.exists()) {
          const currentInventory = inventorySnap.data();
          await updateDoc(inventoryRef, {
            availableTents: (currentInventory.availableTents || 0) - tents,
            availableChairs: (currentInventory.availableChairs || 0) - chairs,
            tentsInUse: (currentInventory.tentsInUse || 0) + tents,
            chairsInUse: (currentInventory.chairsInUse || 0) + chairs,
            lastUpdated: new Date()
          });
        }
        
        showAlert('Internal booking added successfully!', true, () => {
          closeModal();
          loadInventoryStats();
          loadAllRequests();
        });
        
      } catch (error) {
        console.error('Error creating internal booking:', error);
        showAlert('Failed to create internal booking. Please try again.', false);
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }

  function setInternalErrorTents(elementId, message) {
    const errorElement = document.getElementById(`error-${elementId}`);
    const inputId = elementId.replace('error-', '').replace(/-/g, '');
    const inputElement = document.getElementById(inputId.charAt(0).toLowerCase() + inputId.slice(1));
    
    if (errorElement) errorElement.textContent = message;
    if (inputElement) inputElement.classList.add('error');
  }

  function clearInternalErrorTents(elementId) {
    const errorElement = document.getElementById(`error-${elementId}`);
    const inputId = elementId.replace('error-', '').replace(/-/g, '');
    const inputElement = document.getElementById(inputId.charAt(0).toLowerCase() + inputId.slice(1));
    
    if (errorElement) errorElement.textContent = '';
    if (inputElement) inputElement.classList.remove('error');
  }

  function clearAllInternalErrorsTents() {
    ['internal-start-date-tents', 'internal-end-date-tents', 'internal-tents-tents', 
     'internal-chairs-tents', 'internal-purpose-tents', 'internal-location-tents',
     'internal-contact-person-tents', 'internal-contact-number-tents'].forEach(clearInternalErrorTents);
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  /**
   * Initialize the page
   */
  async function initPage() {
    console.log('🚀 Initializing Tents & Chairs Admin page...');
    
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn('⚠️ No authenticated user, redirecting to login');
        window.location.href = 'index.html';
        return;
      }

      console.log('✅ User authenticated:', user.email);

      // Setup event listeners
      setupEventListeners();

      // Load data
      await loadInventoryStats();
      await loadAllRequests();

      console.log('✅ Page initialized successfully');
    });
  }

  // Start initialization
  initPage();
}

/* =====================================================
   GLOBAL MODAL CONFIRMATION HANDLER - REMOVED
   This section was causing conflicts with individual form handlers.
   Each form now has its own dedicated handler that properly validates
   and saves to Firebase before redirecting.
===================================================== */

/* =====================================================
   ADMIN MANAGE INVENTORY PAGE
===================================================== */
if (window.location.pathname.endsWith('admin-manage-inventory.html') || window.location.pathname.endsWith('/admin-manage-inventory')) {
  
// ===== Inventory Manager with Real-Time Firestore Sync =====
// --- DOM Elements ---
const editBtn = document.getElementById("editInventory");
const saveBtn = document.getElementById("saveInventory");
const confirmModal = document.getElementById("saveConfirmModal");
const confirmYes = document.getElementById("confirmSaveYes");
const confirmNo = document.getElementById("confirmSaveNo");

const fields = {
  tents: {
    total: document.getElementById("tents-total"),
    available: document.getElementById("tents-available"),
    inuse: document.getElementById("tents-inuse")
  },
  chairs: {
    total: document.getElementById("chairs-total"),
    available: document.getElementById("chairs-available"),
    inuse: document.getElementById("chairs-inuse")
  }
};

// Track original values for change detection
let originalValues = {
  tents: { total: 0, inuse: 0 },
  chairs: { total: 0, inuse: 0 }
};

// --- Load Real-time Data ---
function loadInventoryRealtime() {
  onSnapshot(doc(db, "inventory", "equipment"), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Update tents fields and store original values
      const tentsTotal = (data.availableTents || 0) + (data.tentsInUse || 0);
      const chairsTotal = (data.availableChairs || 0) + (data.chairsInUse || 0);
      
      // Store original values for change detection
      originalValues = {
        tents: { 
          total: tentsTotal,
          inuse: data.tentsInUse || 0
        },
        chairs: {
          total: chairsTotal,
          inuse: data.chairsInUse || 0
        }
      };

      fields.tents.available.value = data.availableTents || 0;
      fields.tents.inuse.value = data.tentsInUse || 0;
      fields.tents.total.value = (data.availableTents || 0) + (data.tentsInUse || 0);
      
      // Update chairs fields
      fields.chairs.available.value = data.availableChairs || 0;
      fields.chairs.inuse.value = data.chairsInUse || 0;
      fields.chairs.total.value = (data.availableChairs || 0) + (data.chairsInUse || 0);
      
      console.log("Inventory synced in real-time:", data);
    } else {
      console.log("No inventory document found, initializing default values.");
      initializeInventory();
    }
  });
}

// --- Initialize Default Data ---
async function initializeInventory() {
  const inventoryRef = doc(db, "inventory", "equipment");
  await setDoc(inventoryRef, {
    availableTents: 24,
    tentsInUse: 0,
    availableChairs: 600,
    chairsInUse: 0,
    lastUpdated: new Date()
  });
}

// --- Enable Editing ---
editBtn.addEventListener("click", () => {
  Object.values(fields).forEach(item => {
    item.total.disabled = false;
    item.inuse.disabled = false;
  });
  saveBtn.disabled = false;
  editBtn.disabled = true;
});

// --- Auto Update Available Values ---
function updateAvailable(itemType) {
  const total = Number(fields[itemType].total.value) || 0;
  let inUse = Number(fields[itemType].inuse.value) || 0;

  // Get error message element (create if doesn't exist)
  let errorElement = document.getElementById(`${itemType}-error`);
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = `${itemType}-error`;
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '4px';
    fields[itemType].inuse.parentNode.appendChild(errorElement);
  }

  // Prevent negative values in "In Use" field
  if (inUse < 0) {
    inUse = 0;
    fields[itemType].inuse.value = '0';
    errorElement.textContent = 'Error: In Use cannot be negative';
    fields[itemType].inuse.style.borderColor = 'red';
    saveBtn.disabled = true;
    return;
  }

  const available = total - inUse;

  if (available < 0) {
    // Show error and disable save button
    fields[itemType].available.style.color = 'red';
    fields[itemType].inuse.style.borderColor = 'red';
    errorElement.textContent = `Error: In Use (${inUse}) cannot exceed Total (${total})`;
    saveBtn.disabled = true;
    
    // Prevent the negative value
    fields[itemType].available.value = '0';
  } else {
    // Clear error state
    fields[itemType].available.style.color = '';
    fields[itemType].inuse.style.borderColor = '';
    errorElement.textContent = '';
    fields[itemType].available.value = available;
    
    // Only enable save button if both items are valid
    const otherType = itemType === 'tents' ? 'chairs' : 'tents';
    const otherTotal = Number(fields[otherType].total.value) || 0;
    const otherInUse = Number(fields[otherType].inuse.value) || 0;
    
    if (otherTotal - otherInUse >= 0 && otherInUse >= 0) {
      saveBtn.disabled = false;
    }
  }
}

// Add input listeners for tents and chairs in-use fields
fields.tents.inuse.addEventListener("input", () => updateAvailable("tents"));
fields.chairs.inuse.addEventListener("input", () => updateAvailable("chairs"));

// Add input listeners for total fields as well to keep available updated
fields.tents.total.addEventListener("input", () => updateAvailable("tents"));
fields.chairs.total.addEventListener("input", () => updateAvailable("chairs"));

// --- Save Changes (Modal Confirmation) ---
saveBtn.addEventListener("click", () => {
  // Get current and new values
  const tentsTotal = Number(fields.tents.total.value);
  const tentsInuse = Number(fields.tents.inuse.value);
  const chairsTotal = Number(fields.chairs.total.value);
  const chairsInuse = Number(fields.chairs.inuse.value);

  // Check if any values have changed
  const hasChanges = 
    tentsTotal !== originalValues.tents.total ||
    tentsInuse !== originalValues.tents.inuse ||
    chairsTotal !== originalValues.chairs.total ||
    chairsInuse !== originalValues.chairs.inuse;

  // Get or create confirmation message element
  let confirmMessage = document.querySelector('.confirm-message');
  if (!confirmMessage) {
    confirmMessage = document.createElement('div');
    confirmMessage.className = 'confirm-message';
    // Find the modal content container
    const modalContent = confirmModal.querySelector('.modal-content') || confirmModal;
    modalContent.appendChild(confirmMessage);
  }
  
  // Style the confirmation message
  confirmMessage.style.padding = '30px 20px';
  confirmMessage.style.maxHeight = '80vh';
  confirmMessage.style.overflowY = 'auto';
  confirmMessage.style.display = 'flex';
  confirmMessage.style.flexDirection = 'column';
  confirmMessage.style.alignItems = 'center';
  confirmMessage.style.justifyContent = 'center';
  confirmMessage.style.minHeight = '300px';
  
  if (!hasChanges) {
    // Show no changes message
    confirmMessage.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 20px 0; color: #1a237e; font-size: 24px; font-weight: 600;">No Changes Detected</h3>
        <p style="color: #666; font-size: 16px; margin: 0;">No modifications have been made to the inventory values.</p>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Edit the values first before saving.</p>
      </div>
    `;
    // Disable the Yes button
    confirmYes.disabled = true;
    confirmYes.style.opacity = '0.5';
    confirmYes.style.cursor = 'not-allowed';
    return;
  }

  // Reset Yes button state if there are changes
  confirmYes.disabled = false;
  confirmYes.style.opacity = '';
  confirmYes.style.cursor = '';
  
  confirmMessage.innerHTML = `
    <h3 style="margin: 0 0 30px 0; color: #1a237e; font-size: 28px; text-align: center; font-weight: 600; text-transform: uppercase;">Review Your Changes</h3>
    <div class="changes-list" style="display: flex; gap: 30px; justify-content: center; width: 100%; max-width: 700px;">
      <div class="change-section" style="background: #f5f5f5; padding: 24px; border-radius: 8px; flex: 1; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <h4 style="margin: 0 0 20px 0; color: #303f9f; font-size: 22px; text-align: center;">Tents</h4>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px;">Total:</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 18px;">${originalValues.tents.total}</span>
              <span style="color: #666; font-size: 20px;">→</span>
              <strong style="color: ${tentsTotal !== originalValues.tents.total ? (tentsTotal > originalValues.tents.total ? '#4caf50' : '#f44336') : '#1a237e'}; font-size: 20px;">${tentsTotal}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px;">In Use:</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 18px;">${originalValues.tents.inuse}</span>
              <span style="color: #666; font-size: 20px;">→</span>
              <strong style="color: ${tentsInuse !== originalValues.tents.inuse ? (tentsInuse > originalValues.tents.inuse ? '#4caf50' : '#f44336') : '#1a237e'}; font-size: 20px;">${tentsInuse}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e0e0e0; padding-top: 16px; margin-top: 8px;">
            <span style="font-weight: 600; font-size: 18px;">Available:</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 18px;">${originalValues.tents.total - originalValues.tents.inuse}</span>
              <span style="color: #666; font-size: 20px;">→</span>
              <strong style="color: ${(tentsTotal - tentsInuse) !== (originalValues.tents.total - originalValues.tents.inuse) ? ((tentsTotal - tentsInuse) > (originalValues.tents.total - originalValues.tents.inuse) ? '#4caf50' : '#f44336') : '#1a237e'}; font-size: 20px;">${tentsTotal - tentsInuse}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="change-section" style="background: #f5f5f5; padding: 20px; border-radius: 8px; flex: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h4 style="margin: 0 0 20px 0; color: #303f9f; font-size: 22px; text-align: center;">Chairs</h4>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px;">Total:</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 18px;">${originalValues.chairs.total}</span>
              <span style="color: #666; font-size: 20px;">→</span>
              <strong style="color: ${chairsTotal !== originalValues.chairs.total ? (chairsTotal > originalValues.chairs.total ? '#4caf50' : '#f44336') : '#1a237e'}; font-size: 20px;">${chairsTotal}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px;">In Use:</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 18px;">${originalValues.chairs.inuse}</span>
              <span style="color: #666; font-size: 20px;">→</span>
              <strong style="color: ${chairsInuse !== originalValues.chairs.inuse ? (chairsInuse > originalValues.chairs.inuse ? '#4caf50' : '#f44336') : '#1a237e'}; font-size: 20px;">${chairsInuse}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e0e0e0; padding-top: 16px; margin-top: 8px;">
            <span style="font-weight: 600; font-size: 18px;">Available:</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${originalValues.chairs.total - originalValues.chairs.inuse}</span>
              <span style="color: #666;">→</span>
              <strong style="color: ${(chairsTotal - chairsInuse) > (originalValues.chairs.total - originalValues.chairs.inuse) ? '#4caf50' : '#f44336'}">${chairsTotal - chairsInuse}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  confirmModal.style.display = "flex";
});

confirmNo.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

// --- Confirm and Save ---
confirmYes.addEventListener("click", async () => {
  const inventoryRef = doc(db, "inventory", "equipment");

  const tentsTotal = Number(fields.tents.total.value);
  const tentsInuse = Number(fields.tents.inuse.value);
  const chairsTotal = Number(fields.chairs.total.value);
  const chairsInuse = Number(fields.chairs.inuse.value);

  const updatedData = {
    availableTents: tentsTotal - tentsInuse,
    tentsInUse: tentsInuse,
    availableChairs: chairsTotal - chairsInuse,
    chairsInUse: chairsInuse,
    lastUpdated: new Date()
  };

  try {
    await setDoc(inventoryRef, updatedData, { merge: true });
    confirmModal.style.display = "none";
    saveBtn.disabled = true;
    editBtn.disabled = false;

    Object.values(fields).forEach(item => {
      item.total.disabled = true;
      item.inuse.disabled = true;
    });

    // Show success message
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.innerHTML = `
      <div class="success-icon"></div>
      <div class="success-message">
        <h4>Changes Saved Successfully!</h4>
        <p>Inventory has been updated.</p>
      </div>
    `;
    document.body.appendChild(successToast);

    // Add styles for the success toast
    successToast.style.position = 'fixed';
    successToast.style.top = '20px';
    successToast.style.right = '20px';
    successToast.style.background = '#4CAF50';
    successToast.style.color = 'white';
    successToast.style.padding = '15px 25px';
    successToast.style.borderRadius = '4px';
    successToast.style.display = 'flex';
    successToast.style.alignItems = 'center';
    successToast.style.gap = '10px';
    successToast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    successToast.style.zIndex = '1000';
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      successToast.style.opacity = '0';
      successToast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(successToast), 500);
    }, 3000);

    console.log("Inventory updated successfully:", updatedData);
  } catch (error) {
    // Show error message if save fails
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.innerHTML = `
      <div class="error-icon">✕</div>
      <div class="error-message">
        <h4>Error Saving Changes</h4>
        <p>${error.message}</p>
      </div>
    `;
    document.body.appendChild(errorToast);
    
    // Style the error toast similarly but in red
    errorToast.style.position = 'fixed';
    errorToast.style.top = '20px';
    errorToast.style.right = '20px';
    errorToast.style.background = '#f44336';
    errorToast.style.color = 'white';
    errorToast.style.padding = '15px 25px';
    errorToast.style.borderRadius = '4px';
    errorToast.style.display = 'flex';
    errorToast.style.alignItems = 'center';
    errorToast.style.gap = '10px';
    errorToast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    errorToast.style.zIndex = '1000';
    
    // Remove the error toast after 5 seconds
    setTimeout(() => {
      errorToast.style.opacity = '0';
      errorToast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(errorToast), 500);
    }, 5000);

    console.error("Error updating inventory:", error);
  }
});

  // --- Start ---
  loadInventoryRealtime();

} // End of admin-manage-inventory.html conditional

/* =====================================================
   ADMIN USER MANAGER PAGE
   - Load total registered users count from Firebase
   - Display count in stats card
===================================================== */

// Check if we're on the admin user manager page
if (window.location.pathname.endsWith('admin-user-manager.html') || window.location.pathname.endsWith('/admin-user-manager')) {
  
  /**
   * Load total registered users count from Firestore with real-time updates
   * Uses onSnapshot to listen for changes in 'users' collection
   * Automatically updates stat card when users are added or removed
   */
  function loadTotalUsersCount() {
    try {
      console.log('📊 Setting up real-time listener for total registered users...');
      
      // Reference to the users collection
      const usersRef = collection(db, 'users');
      
      // Set up real-time listener
      onSnapshot(usersRef, (snapshot) => {
        // Count total users
        const totalUsers = snapshot.size;
        
        console.log(`✅ Total registered users updated: ${totalUsers}`);
        
        // Update the stat card display
        const totalUsersCountElement = document.getElementById('totalUsersCount');
        if (totalUsersCountElement) {
          // Format number with comma separator for better readability
          totalUsersCountElement.textContent = totalUsers.toLocaleString();
        }
      }, (error) => {
        console.error('❌ Error loading total users count:', error);
        
        // Display error state in stat card
        const totalUsersCountElement = document.getElementById('totalUsersCount');
        if (totalUsersCountElement) {
          totalUsersCountElement.textContent = '—';
        }
      });
      
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      
      // Display error state in stat card
      const totalUsersCountElement = document.getElementById('totalUsersCount');
      if (totalUsersCountElement) {
        totalUsersCountElement.textContent = '—';
      }
    }
  }
  
  // Store all users data and their request counts
  let allUsersData = [];
  let userRequestCounts = {};
  
  /**
   * Load request counts for all users
   * Counts both conference room and tents/chairs bookings
   */
  async function loadUserRequestCounts() {
    try {
      console.log('📊 Loading user request counts...');
      
      userRequestCounts = {};
      
      // Get conference room bookings
      const conferenceRef = collection(db, 'conferenceRoomBookings');
      const conferenceSnapshot = await getDocs(conferenceRef);
      
      conferenceSnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId;
        if (userId) {
          userRequestCounts[userId] = (userRequestCounts[userId] || 0) + 1;
        }
      });
      
      // Get tents & chairs bookings
      const tentsRef = collection(db, 'tentsChairsBookings');
      const tentsSnapshot = await getDocs(tentsRef);
      
      tentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId;
        if (userId) {
          userRequestCounts[userId] = (userRequestCounts[userId] || 0) + 1;
        }
      });
      
      console.log(`✅ Request counts loaded for ${Object.keys(userRequestCounts).length} users`);
      
      // Re-render table with updated counts
      renderUsersTable();
      
    } catch (error) {
      console.error('❌ Error loading request counts:', error);
    }
  }
  
  /**
   * Load all users from Firestore with real-time updates
   * Fetches user data and renders the table
   */
  function loadAllUsers() {
    try {
      console.log('👥 Setting up real-time listener for all users...');
      
      // Reference to the users collection
      const usersRef = collection(db, 'users');
      
      // Set up real-time listener
      onSnapshot(usersRef, async (snapshot) => {
        allUsersData = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          allUsersData.push({
            id: doc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || '',
            contactNumber: userData.contactNumber || '',
            address: userData.address || '',
            role: userData.role || 'user',
            createdAt: userData.createdAt?.toDate() || new Date(),
            status: userData.status || 'active'
          });
        });
        
        console.log(`✅ Loaded ${allUsersData.length} users`);
        
        // Load request counts and render table
        await loadUserRequestCounts();
      }, (error) => {
        console.error('❌ Error loading users:', error);
      });
      
    } catch (error) {
      console.error('❌ Error setting up users listener:', error);
    }
  }
  
  /**
   * Get filtered and sorted users based on current filter values
   */
  function getFilteredUsers() {
    let filteredUsers = [...allUsersData];
    
    // Filter by search name
    const searchTerm = document.getElementById('searchUsers')?.value.toLowerCase().trim();
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by status
    const statusFilter = document.getElementById('filterStatus')?.value;
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(user => 
        user.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by date
    const dateFilter = document.getElementById('filterDate')?.value;
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filteredUsers = filteredUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === filterDate.getTime();
      });
    }
    
    // Sort users
    const sortBy = document.getElementById('sortBy')?.value;
    if (sortBy) {
      switch (sortBy) {
        case 'name-asc':
          filteredUsers.sort((a, b) => a.lastName.localeCompare(b.lastName));
          break;
        case 'name-desc':
          filteredUsers.sort((a, b) => b.lastName.localeCompare(a.lastName));
          break;
        case 'date-newest':
          filteredUsers.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case 'date-oldest':
          filteredUsers.sort((a, b) => a.createdAt - b.createdAt);
          break;
      }
    }
    
    return filteredUsers;
  }
  
  /**
   * Render users table with filtered data
   */
  function renderUsersTable() {
    const tbody = document.querySelector('.um-users-table tbody');
    if (!tbody) return;
    
    const filteredUsers = getFilteredUsers();
    
    // Filter out admin users for the "All Registered Users" tab
    const regularUsers = filteredUsers.filter(user => user.role !== 'admin');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (regularUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            No users found matching your filters.
          </td>
        </tr>
      `;
      return;
    }
    
    // Render each user row
    regularUsers.forEach(user => {
      const row = document.createElement('tr');
      
      // Get initials for avatar
      const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || 'U';
      
      // Format date
      const formattedDate = user.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Status badge
      const statusClass = user.status === 'active' ? 'um-status-active' : '';
      const statusStyle = user.status !== 'active' ? 'background:#f8d7da;color:#dc3545;border:1.5px solid #eb8a90;' : '';
      const statusText = user.status.charAt(0).toUpperCase() + user.status.slice(1);
      
      // Get total requests count for this user
      const totalRequests = userRequestCounts[user.id] || 0;
      
      // Action button (Enable/Disable based on status)
      const actionBtn = user.status === 'active' 
        ? '<button class="um-action-btn um-btn-disable" type="button" style="background:#dc3545;border-color:#dc3545;" data-user-id="' + user.id + '">Disable</button>'
        : '<button class="um-action-btn um-btn-enable" type="button" data-user-id="' + user.id + '">Enable</button>';
      
      row.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="um-user-avatar" aria-hidden="true">${initials}</div>
            <div class="um-user-info">
              <div class="um-user-name">${user.fullName}</div>
              <div class="um-user-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td>${user.contactNumber}</td>
        <td>${user.address}</td>
        <td>${formattedDate}</td>
        <td><span class="um-status-label ${statusClass}" style="${statusStyle}">${statusText}</span></td>
        <td style="text-align: center;">${totalRequests}</td>
        <td class="um-table-actions">
          <button class="um-action-btn um-btn-view" type="button" data-user-id="${user.id}">View</button>
          ${actionBtn}
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    console.log(`📋 Rendered ${regularUsers.length} users in table`);
  }
  
  /**
   * Setup filter event listeners
   */
  function setupFilters() {
    // Search input
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderUsersTable();
      });
    }
    
    // Status filter
    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        renderUsersTable();
      });
    }
    
    // Date filter
    const dateFilter = document.getElementById('filterDate');
    if (dateFilter) {
      dateFilter.addEventListener('change', () => {
        renderUsersTable();
      });
    }
    
    // Sort by
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
      sortBy.addEventListener('change', () => {
        renderUsersTable();
      });
    }
    
    console.log('✅ Filter event listeners setup complete');
  }
  
  // View user details in modal
  async function viewUserDetails(userId) {
    console.log('👁️ Viewing user details for:', userId);
    
    const user = allUsersData.find(u => u.id === userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }
    
    const modal = document.getElementById('umUserDetailsModal');
    const modalTitle = document.getElementById('umModalTitle');
    const modalBody = document.getElementById('umModalBody');
    
    if (!modal || !modalTitle || !modalBody) {
      console.error('❌ Modal elements not found');
      return;
    }
    
    // Set modal title
    modalTitle.textContent = 'User Details';
    
    // Get initials for avatar
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const initials = firstName && lastName 
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : (user.fullName ? user.fullName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase() : '?');
    
    // Format created date
    let formattedDate = 'N/A';
    if (user.createdAt) {
      const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    // Format status
    const statusText = user.status === 'active' ? 'Active' : 'Inactive';
    const statusColor = user.status === 'active' ? '#10b981' : '#ef4444';
    
    // Build user details HTML
    let bodyHTML = `
      <div class="um-user-detail-card">
        <div class="um-user-detail-header">
          <div class="um-user-detail-avatar">${initials}</div>
          <div class="um-user-detail-name">
            <h4>${sanitizeInput(user.fullName)}</h4>
            <div class="um-user-email-text">
              <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              ${sanitizeInput(user.email)}
            </div>
          </div>
        </div>
        
        <div class="um-user-detail-row">
          <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span><strong>Contact Number:</strong> ${sanitizeInput(user.contactNumber)}</span>
        </div>
        
        <div class="um-user-detail-row">
          <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span><strong>Address:</strong> ${sanitizeInput(user.address)}</span>
        </div>
        
        <div class="um-user-detail-row">
          <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span><strong>Date Registered:</strong> ${formattedDate}</span>
        </div>
        
        <div class="um-user-detail-row">
          <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></span>
        </div>
        
        <div class="um-user-detail-row">
          <svg style="width: 16px; height: 16px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span><strong>Total Requests:</strong> ${userRequestCounts[userId] || 0}</span>
        </div>
      </div>
    `;
    
    // Load user's requests
    try {
      const conferenceRef = collection(db, 'conferenceRoomBookings');
      const conferenceQuery = query(conferenceRef, where('userId', '==', userId));
      const conferenceSnap = await getDocs(conferenceQuery);
      
      const tentsRef = collection(db, 'tentsChairsBookings');
      const tentsQuery = query(tentsRef, where('userId', '==', userId));
      const tentsSnap = await getDocs(tentsQuery);
      
      const allRequests = [];
      
      conferenceSnap.forEach(doc => {
        const data = doc.data();
        allRequests.push({
          id: doc.id,
          type: 'Conference Room',
          ...data
        });
      });
      
      tentsSnap.forEach(doc => {
        const data = doc.data();
        allRequests.push({
          id: doc.id,
          type: 'Tents & Chairs',
          ...data
        });
      });
      
      // Sort requests by date (newest first)
      allRequests.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      });
      
      // Add requests section
      bodyHTML += `<div class="um-user-requests-section">`;
      bodyHTML += `
        <h4>
          <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Recent Requests (${allRequests.length})
        </h4>
      `;
      
      if (allRequests.length === 0) {
        bodyHTML += `
          <div class="um-no-requests">
            <svg style="width: 48px; height: 48px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No requests found for this user.</p>
          </div>
        `;
      } else {
        // Show only last 5 requests
        const displayRequests = allRequests.slice(0, 5);
        
        displayRequests.forEach(request => {
          const statusClass = `tents-status-badge-${request.status}`;
          const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
          
          let dateInfo = '';
          if (request.type === 'Conference Room') {
            const eventDate = request.eventDate ? new Date(request.eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            dateInfo = `<strong>Date:</strong> ${eventDate}`;
            if (request.startTime && request.endTime) {
              dateInfo += ` | <strong>Time:</strong> ${request.startTime} - ${request.endTime}`;
            }
          } else {
            const startDate = request.startDate ? new Date(request.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
            const endDate = request.endDate ? new Date(request.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : startDate;
            dateInfo = `<strong>Period:</strong> ${startDate} - ${endDate}`;
          }
          
          const submittedDate = request.createdAt ? (request.createdAt.toDate ? request.createdAt.toDate() : new Date(request.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
          
          bodyHTML += `
            <div class="um-request-item">
              <div class="um-request-header">
                <span class="um-request-type">${request.type}</span>
                <span class="${statusClass}">${statusText}</span>
              </div>
              <div class="um-request-detail-row">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>${dateInfo}</span>
              </div>
          `;
          
          if (request.type === 'Tents & Chairs') {
            bodyHTML += `
              <div class="um-request-detail-row">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span><strong>Tents:</strong> ${request.quantityTents || 0} | <strong>Chairs:</strong> ${request.quantityChairs || 0}</span>
              </div>
            `;
          }
          
          bodyHTML += `
              <div class="um-request-detail-row">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span><strong>Submitted:</strong> ${submittedDate}</span>
              </div>
            </div>
          `;
        });
        
        if (allRequests.length > 5) {
          bodyHTML += `<p style="text-align: center; margin-top: 12px; font-size: 13px; color: #6b7280;">Showing 5 of ${allRequests.length} requests</p>`;
        }
      }
      
      bodyHTML += `</div>`;
      
    } catch (error) {
      console.error('❌ Error loading user requests:', error);
    }
    
    modalBody.innerHTML = bodyHTML;
    modal.classList.add('active');
    
    console.log('✅ User details modal displayed');
  }
  
  // Close user details modal
  window.closeUserDetailsModal = function() {
    const modal = document.getElementById('umUserDetailsModal');
    if (modal) {
      modal.classList.remove('active');
    }
  };
  
  // Close modal when clicking on overlay
  window.closeUserDetailsModalOnOverlay = function(event) {
    if (event.target.id === 'umUserDetailsModal') {
      closeUserDetailsModal();
    }
  };
  
  // Close modal on ESC key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('umUserDetailsModal');
      if (modal && modal.classList.contains('active')) {
        closeUserDetailsModal();
      }
    }
  });
  
  // Load admin profile data
  async function loadAdminProfile() {
    console.log('👤 Loading admin profile...');
    
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Get name fields
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || userData.fullName || 'Admin Account';
        const email = userData.email || user.email || 'Not provided';
        const contactNumber = userData.contactNumber || userData.contact || 'Not provided';
        const address = userData.address || 'Not provided';
        
        // Generate initials for avatar
        const initials = firstName && lastName 
          ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
          : fullName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
        
        // Update admin tab panel display using IDs
        const adminAvatar = document.getElementById('adminAvatar');
        if (adminAvatar) adminAvatar.textContent = initials;
        
        const adminFullName = document.getElementById('adminFullName');
        if (adminFullName) adminFullName.textContent = fullName;
        
        const adminEmailText = document.getElementById('adminEmailText');
        if (adminEmailText) adminEmailText.textContent = email;
        
        const adminPhoneText = document.getElementById('adminPhoneText');
        if (adminPhoneText) adminPhoneText.textContent = contactNumber;
        
        // Update account created date if available
        if (userData.createdAt) {
          const createdDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
          const formattedDate = createdDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: '2-digit', 
            year: 'numeric' 
          });
          
          const accountCreatedEl = document.getElementById('adminAccountCreated');
          if (accountCreatedEl) accountCreatedEl.textContent = formattedDate;
        }
        
        // Update account status (assuming admin is always active)
        const accountStatusEl = document.getElementById('adminAccountStatus');
        if (accountStatusEl && userData.status) {
          const status = userData.status;
          const statusText = status === 'active' ? 'Active' : 'Inactive';
          const statusColor = status === 'active' ? '#28a745' : '#dc3545';
          const statusBg = status === 'active' ? '#d8f3d8' : '#f8d7da';
          
          accountStatusEl.textContent = statusText;
          accountStatusEl.style.color = statusColor;
          accountStatusEl.style.background = statusBg;
        }
        
        // Pre-fill edit form
        document.getElementById('adminEditFirstName').value = firstName;
        document.getElementById('adminEditLastName').value = lastName;
        document.getElementById('adminEditEmail').value = email;
        document.getElementById('adminEditContactNumber').value = userData.contactNumber || userData.contact || '';
        
        console.log('✅ Admin profile loaded successfully:', {
          fullName,
          email,
          contactNumber,
          initials
        });
        
      } else {
        console.warn('⚠️ Admin user document not found');
      }
    } catch (error) {
      console.error('❌ Error loading admin profile:', error);
    }
  }
  
  // Handle Admin Edit Profile Form Submit
  async function handleAdminEditProfile(e) {
    e.preventDefault();
    console.log('📝 Submitting admin profile edit...');
    
    const user = auth.currentUser;
    if (!user) {
      showToast('User not authenticated', false);
      return;
    }
    
    // Get error elements
    const errorFirstName = document.getElementById('error-admin-edit-firstname');
    const errorLastName = document.getElementById('error-admin-edit-lastname');
    const errorContact = document.getElementById('error-admin-edit-contact');
    
    // Clear all previous errors
    if (errorFirstName) clearErrorSignup(errorFirstName);
    if (errorLastName) clearErrorSignup(errorLastName);
    if (errorContact) clearErrorSignup(errorContact);
    
    // Get form values
    const firstName = document.getElementById('adminEditFirstName').value.trim();
    const lastName = document.getElementById('adminEditLastName').value.trim();
    const contactNumber = document.getElementById('adminEditContactNumber').value.trim();
    
    let valid = true;
    
    // First Name validation
    if (!firstName) {
      if (errorFirstName) setErrorSignup(errorFirstName, "First name can't be blank");
      valid = false;
    } else if (firstName.length < 2) {
      if (errorFirstName) setErrorSignup(errorFirstName, "First name must be at least 2 characters");
      valid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
      if (errorFirstName) setErrorSignup(errorFirstName, "First name can only contain letters, spaces, hyphens, and apostrophes");
      valid = false;
    } else {
      if (errorFirstName) setSuccessSignup(errorFirstName);
    }
    
    // Last Name validation
    if (!lastName) {
      if (errorLastName) setErrorSignup(errorLastName, "Last name can't be blank");
      valid = false;
    } else if (lastName.length < 2) {
      if (errorLastName) setErrorSignup(errorLastName, "Last name must be at least 2 characters");
      valid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
      if (errorLastName) setErrorSignup(errorLastName, "Last name can only contain letters, spaces, hyphens, and apostrophes");
      valid = false;
    } else {
      if (errorLastName) setSuccessSignup(errorLastName);
    }
    
    // Contact Number validation
    if (!contactNumber) {
      if (errorContact) setErrorSignup(errorContact, "Contact number can't be blank");
      valid = false;
    } else if (!/^\d+$/.test(contactNumber)) {
      if (errorContact) setErrorSignup(errorContact, "Contact number must contain only numbers");
      valid = false;
    } else if (!/^09\d{9}$/.test(contactNumber)) {
      if (errorContact) setErrorSignup(errorContact, "Contact number must be 11 digits and start with '09'");
      valid = false;
    } else {
      if (errorContact) setSuccessSignup(errorContact);
    }
    
    if (!valid) return;
    
    // Show loading state
    const saveButton = document.querySelector('#adminEditProfileForm .save-changes');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';
    }
    
    try {
      const updates = {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        contactNumber: contactNumber
      };
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), updates);
      
      // Also update Auth displayName
      try {
        await updateProfile(user, { displayName: updates.fullName });
      } catch (err) {
        console.warn('Failed to update Auth displayName:', err);
      }
      
      // Close modal and reload profile
      const modal = document.getElementById('adminEditProfileModal');
      if (modal) modal.style.display = 'none';
      
      showToast('Profile updated successfully!', true);
      
      // Reload admin profile
      await loadAdminProfile();
      
    } catch (error) {
      console.error('❌ Error updating admin profile:', error);
      showToast('Failed to update profile. Please try again.', false);
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
      }
    }
  }
  
  // Handle Admin Change Password Form Submit
  async function handleAdminChangePassword(e) {
    e.preventDefault();
    console.log('🔑 Submitting admin password change...');
    
    const user = auth.currentUser;
    if (!user) {
      showToast('User not authenticated', false);
      return;
    }
    
    // Get error elements
    const errorCurrentPassword = document.getElementById('error-admin-current-password');
    const errorNewPassword = document.getElementById('error-admin-new-password');
    const errorConfirmPassword = document.getElementById('error-admin-confirm-password');
    
    // Clear all previous errors
    if (errorCurrentPassword) clearErrorSignup(errorCurrentPassword);
    if (errorNewPassword) clearErrorSignup(errorNewPassword);
    if (errorConfirmPassword) clearErrorSignup(errorConfirmPassword);
    
    // Get form values
    const currentPassword = document.getElementById('adminCurrentPassword').value;
    const newPassword = document.getElementById('adminNewPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    
    let valid = true;
    
    // Current Password validation
    if (!currentPassword) {
      if (errorCurrentPassword) setErrorSignup(errorCurrentPassword, 'Please enter your current password');
      valid = false;
    } else {
      if (errorCurrentPassword) setSuccessSignup(errorCurrentPassword);
    }
    
    // New Password validation
    if (!newPassword) {
      if (errorNewPassword) setErrorSignup(errorNewPassword, 'Please enter a new password');
      valid = false;
    } else if (newPassword.length < 8) {
      if (errorNewPassword) setErrorSignup(errorNewPassword, 'Password must be at least 8 characters');
      valid = false;
    } else {
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /\d/.test(newPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
        if (errorNewPassword) setErrorSignup(errorNewPassword, 'Password must contain uppercase, lowercase, number, and special character');
        valid = false;
      } else if (newPassword === currentPassword) {
        if (errorNewPassword) setErrorSignup(errorNewPassword, 'New password must be different from your current password');
        valid = false;
      } else {
        if (errorNewPassword) setSuccessSignup(errorNewPassword);
      }
    }
    
    // Confirm Password validation
    if (!confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Passwords do not match');
      valid = false;
    } else {
      if (errorConfirmPassword) setSuccessSignup(errorConfirmPassword);
    }
    
    if (!valid) return;
    
    // Show loading state
    const saveButton = document.querySelector('#adminChangePasswordForm .save-changes');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Changing...';
    }
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Close modal and reset form
      const modal = document.getElementById('adminChangePasswordModal');
      const form = document.getElementById('adminChangePasswordForm');
      if (modal) modal.style.display = 'none';
      if (form) form.reset();
      
      // Clear all errors
      if (errorCurrentPassword) clearErrorSignup(errorCurrentPassword);
      if (errorNewPassword) clearErrorSignup(errorNewPassword);
      if (errorConfirmPassword) clearErrorSignup(errorConfirmPassword);
      
      showToast('Password changed successfully!', true);
      
    } catch (error) {
      console.error('❌ Error changing admin password:', error);
      
      // Show error inline instead of toast
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
      
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
      }
    }
  }
  
  // Show confirmation modal
  function showConfirmModal(title, message, isDanger = false) {
    return new Promise((resolve) => {
      const modal = document.getElementById('umConfirmModal');
      const titleEl = document.getElementById('umConfirmTitle');
      const messageEl = document.getElementById('umConfirmMessage');
      const yesBtn = document.getElementById('umConfirmYes');
      const noBtn = document.getElementById('umConfirmNo');
      
      if (!modal || !titleEl || !messageEl || !yesBtn || !noBtn) {
        console.error('❌ Confirmation modal elements not found');
        resolve(false);
        return;
      }
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      
      // Apply danger styling if needed
      if (isDanger) {
        yesBtn.classList.add('danger');
      } else {
        yesBtn.classList.remove('danger');
      }
      
      modal.classList.add('active');
      
      // Handle Yes button click
      const handleYes = () => {
        modal.classList.remove('active');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        resolve(true);
      };
      
      // Handle No button click
      const handleNo = () => {
        modal.classList.remove('active');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        resolve(false);
      };
      
      yesBtn.addEventListener('click', handleYes);
      noBtn.addEventListener('click', handleNo);
      
      // Handle ESC key
      const handleEscape = (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          handleNo();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  }
  
  // Disable user account
  async function disableUser(userId) {
    console.log('🔒 Disabling user account:', userId);
    
    const user = allUsersData.find(u => u.id === userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      showToast('User not found', false);
      return;
    }
    
    const confirmed = await showConfirmModal(
      'Disable User Account',
      `Are you sure you want to disable ${user.fullName}'s account? They will not be able to log in or make requests until their account is re-enabled.`,
      true
    );
    
    if (!confirmed) {
      console.log('ℹ️ User account disable cancelled');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'inactive',
        disabledAt: new Date()
      });
      
      console.log('✅ User account disabled successfully');
      showToast('User account disabled successfully', true);
      
      // Refresh table
      await renderUsersTable();
      
    } catch (error) {
      console.error('❌ Error disabling user account:', error);
      showToast('Failed to disable user account', false);
    }
  }
  
  // Enable user account
  async function enableUser(userId) {
    console.log('🔓 Enabling user account:', userId);
    
    const user = allUsersData.find(u => u.id === userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      showToast('User not found', false);
      return;
    }
    
    const confirmed = await showConfirmModal(
      'Enable User Account',
      `Are you sure you want to enable ${user.fullName}'s account? They will be able to log in and make requests again.`,
      false
    );
    
    if (!confirmed) {
      console.log('ℹ️ User account enable cancelled');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active',
        enabledAt: new Date()
      });
      
      console.log('✅ User account enabled successfully');
      showToast('User account enabled successfully', true);
      
      // Refresh table
      await renderUsersTable();
      
    } catch (error) {
      console.error('❌ Error enabling user account:', error);
      showToast('Failed to enable user account', false);
    }
  }
  
  // Load total users count and all users when page loads
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin User Manager page loaded');
    
    // Load admin profile when page loads
    loadAdminProfile();
    
    // Load total users count (real-time)
    loadTotalUsersCount();
    
    // Load all users (real-time)
    loadAllUsers();
    
    // Setup filter listeners
    setupFilters();
    
    // Admin Edit Profile button
    const adminEditProfileBtn = document.getElementById('adminEditProfileBtn');
    if (adminEditProfileBtn) {
      adminEditProfileBtn.addEventListener('click', () => {
        const modal = document.getElementById('adminEditProfileModal');
        if (modal) modal.style.display = 'flex';
      });
    }
    
    // Admin Change Password button
    const adminChangePasswordBtn = document.getElementById('adminChangePasswordBtn');
    if (adminChangePasswordBtn) {
      adminChangePasswordBtn.addEventListener('click', () => {
        const modal = document.getElementById('adminChangePasswordModal');
        if (modal) modal.style.display = 'flex';
      });
    }
    
    // Admin Edit Profile Form Submit
    const adminEditProfileForm = document.getElementById('adminEditProfileForm');
    if (adminEditProfileForm) {
      adminEditProfileForm.addEventListener('submit', handleAdminEditProfile);
    }
    
    // Admin Change Password Form Submit
    const adminChangePasswordForm = document.getElementById('adminChangePasswordForm');
    if (adminChangePasswordForm) {
      adminChangePasswordForm.addEventListener('submit', handleAdminChangePassword);
    }
    
    // Clear errors when admin types in edit profile form
    document.getElementById('adminEditFirstName')?.addEventListener('input', () => {
      const errorFirstName = document.getElementById('error-admin-edit-firstname');
      if (errorFirstName) clearErrorSignup(errorFirstName);
    });
    
    document.getElementById('adminEditLastName')?.addEventListener('input', () => {
      const errorLastName = document.getElementById('error-admin-edit-lastname');
      if (errorLastName) clearErrorSignup(errorLastName);
    });
    
    document.getElementById('adminEditContactNumber')?.addEventListener('input', () => {
      const errorContact = document.getElementById('error-admin-edit-contact');
      if (errorContact) clearErrorSignup(errorContact);
    });
    
    // Clear errors when admin types in change password form
    document.getElementById('adminCurrentPassword')?.addEventListener('input', () => {
      const errorCurrentPassword = document.getElementById('error-admin-current-password');
      if (errorCurrentPassword) clearErrorSignup(errorCurrentPassword);
    });
    
    document.getElementById('adminNewPassword')?.addEventListener('input', () => {
      const errorNewPassword = document.getElementById('error-admin-new-password');
      if (errorNewPassword) clearErrorSignup(errorNewPassword);
    });
    
    document.getElementById('adminConfirmPassword')?.addEventListener('input', () => {
      const errorConfirmPassword = document.getElementById('error-admin-confirm-password');
      if (errorConfirmPassword) clearErrorSignup(errorConfirmPassword);
    });
    
    // Close modals when clicking close buttons
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.style.display = 'none';
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
    
    // Admin Forgot Password link
    const adminForgotPassword = document.getElementById('adminForgotPassword');
    if (adminForgotPassword) {
      adminForgotPassword.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user || !user.email) {
          showToast('Unable to send password reset email', false);
          return;
        }
        
        const confirmed = await showConfirmModal(
          'Reset Password',
          `A password reset link will be sent to ${user.email}. You will need to use this link to reset your password. Continue?`,
          false
        );
        
        if (!confirmed) return;
        
        try {
          await sendPasswordResetEmail(auth, user.email);
          showToast('Password reset email sent! Check your inbox.', true);
          
          // Close the change password modal
          const modal = document.getElementById('adminChangePasswordModal');
          if (modal) modal.style.display = 'none';
          
        } catch (error) {
          console.error('❌ Error sending password reset email:', error);
          showToast('Failed to send password reset email', false);
        }
      });
    }
    
    // Add event delegation for view, disable, and enable buttons
    const tbody = document.querySelector('.um-users-table tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const target = e.target;
        const userId = target.getAttribute('data-user-id');
        
        if (!userId) return;
        
        if (target.classList.contains('um-btn-view')) {
          viewUserDetails(userId);
        } else if (target.classList.contains('um-btn-disable')) {
          disableUser(userId);
        } else if (target.classList.contains('um-btn-enable')) {
          enableUser(userId);
        }
      });
    }
  });
  
} // End of admin-user-manager.html conditional
