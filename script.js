// script.js
// All JS scripts from HTML files are combined here.

/* =====================
   LOGIN PAGE SCRIPT
   (from index.html)
====================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
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
const errorFullname = document.getElementById("error-fullname");
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
  const fullname = document.getElementById("signup-fullname").value.trim();
  const contact = document.getElementById("signup-contact").value.trim();
  const address = document.getElementById("signup-address").value.trim();

  // Reset all previous errors
  [errorFullname, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress]
    .forEach(clearErrorSignup);

  let valid = true;

  // Fullname validation
  if (!fullname) {
    setErrorSignup(errorFullname, "Full Name can't be blank");
    valid = false;
  } else if (fullname.length < 3) {
    setErrorSignup(errorFullname, "Full Name must be at least 3 characters");
    valid = false;
  } else {
    setSuccessSignup(errorFullname);
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
  [errorFullname, errorEmail, errorPassword, errorConfirm, errorContact, errorAddress].forEach(clearErrorSignup);

  try {
    // Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: fullname });

    // Save extra info to Firestore
    // Save user profile using consistent camelCase field names
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullname,
      email: email,
      contactNumber: contact,
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
// Include UserProfile page so profile view is protected as well
const protectedPaths = ["/user.html", "/admin.html", "user.html", "admin.html", "/UserProfile.html", "UserProfile.html"];
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

/* User Profile Page Scripts */
document.addEventListener('DOMContentLoaded', function() {
  // Only run this code on the UserProfile page
  if (!document.querySelector('.user-profile-layout')) return;

  const editProfileModal = document.getElementById('editProfileModal');
  const changePasswordModal = document.getElementById('changePasswordModal');
  const editProfileBtn = document.querySelector('.edit-profile-btn');
  const changePasswordBtn = document.querySelector('.change-password-btn');
  const changePasswordMessage = document.getElementById('changePasswordMessage');
  // per-field error elements (Edit Profile)
  const errorEditFullname = document.getElementById('error-edit-fullname');
  const errorEditContact = document.getElementById('error-edit-contact');
  const errorEditEmail = document.getElementById('error-edit-email');
  const errorEditAddress = document.getElementById('error-edit-address');
  // per-field error elements (Change Password)
  const errorCurrentPassword = document.getElementById('error-current-password');
  const errorNewPassword = document.getElementById('error-new-password');
  const errorConfirmPassword = document.getElementById('error-confirm-password');
  const logoutBtn = document.querySelector('.logout-btn');
  const makeRequestBtn = document.querySelector('.make-request-btn');
  const dropdownContent = document.querySelector('.dropdown-content');
  const closeButtons = document.querySelectorAll('.close-modal');

  // Load user data after Firebase confirms auth state so auth.currentUser is available
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Not signed in -> go to login
      window.location.href = "index.html";
      return;
    }
    // User signed in -> populate profile
    loadUserData();
  });

  // Edit Profile Modal
  editProfileBtn?.addEventListener('click', () => {
    editProfileModal.style.display = 'block';
  });

  // Change Password Modal
  changePasswordBtn?.addEventListener('click', () => {
    // Clear any previous messages and inputs when opening
    if (changePasswordMessage) {
      changePasswordMessage.style.display = 'none';
      changePasswordMessage.textContent = '';
    }
    changePasswordForm?.reset();
    changePasswordModal.style.display = 'block';
  });

  // Close modals when clicking close button
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      editProfileModal.style.display = 'none';
      changePasswordModal.style.display = 'none';
      // clear password modal message and reset fields
      if (changePasswordMessage) {
        changePasswordMessage.style.display = 'none';
        changePasswordMessage.textContent = '';
      }
      changePasswordForm?.reset();
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editProfileModal) editProfileModal.style.display = 'none';
    if (e.target === changePasswordModal) changePasswordModal.style.display = 'none';
  });

  // Make Request Dropdown
  makeRequestBtn?.addEventListener('click', () => {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  });

  // Close dropdown when clicking outside
  window.addEventListener('click', (e) => {
    if (!e.target.matches('.make-request-btn')) {
      dropdownContent.style.display = 'none';
    }
  });

  // Logout functionality
  logoutBtn?.addEventListener('click', () => {
    window.logout();
  });

  // Handle Edit Profile Form Submit
  const editProfileForm = document.getElementById('editProfileForm');
  editProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Clear previous errors
    [errorEditFullname, errorEditContact, errorEditAddress].forEach(el => {
      if (el) clearErrorSignup(el);
    });

    const fullName = document.getElementById('editFullName').value.trim();
    const contact = document.getElementById('editContactNumber').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    let valid = true;

    // Fullname validation
    if (!fullName) {
      setErrorSignup(errorEditFullname, "Full Name can't be blank");
      valid = false;
    } else if (fullName.length < 3) {
      setErrorSignup(errorEditFullname, "Full Name must be at least 3 characters");
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
      fullName: fullName,
      contactNumber: contact,
      address: address
    };

    try {
      // Update Firestore
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });

      // Also update the Auth displayName so Auth and Firestore stay in sync
      try {
        await updateProfile(user, { displayName: updates.fullName });
      } catch (err) {
        console.warn('Failed to update Auth displayName:', err);
      }

      editProfileModal.style.display = 'none';
      loadUserData(); // Reload the user data
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert('Failed to update profile. Please try again.');
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
  document.getElementById('editFullName')?.addEventListener('input', () => { if (errorEditFullname) clearErrorSignup(errorEditFullname); });
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

    if (!confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      if (errorConfirmPassword) setErrorSignup(errorConfirmPassword, 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    // Disable save button while processing
    const saveButton = document.querySelector('#changePasswordForm .save-changes');
    if (saveButton) saveButton.disabled = true;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      // Show success banner and close after short delay
      setChangePasswordMessage('Password Changed Successfully!', true);
      setTimeout(() => {
        changePasswordModal.style.display = 'none';
        changePasswordForm?.reset();
        if (changePasswordMessage) { changePasswordMessage.style.display = 'none'; changePasswordMessage.textContent = ''; }
        if (saveButton) saveButton.disabled = false;
      }, 1600);
    } catch (error) {
      console.error('Error updating password:', error);
      if (saveButton) saveButton.disabled = false;
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
      
      // Support both legacy keys and new camelCase keys (backwards compatibility)
      const fullName = userData.fullName || userData.fullname || user.displayName || 'User';
      const contactNumber = userData.contactNumber || userData.contact || 'Not provided';
      const email = userData.email || user.email || 'Not provided';
      const address = userData.address || 'Not provided';

      // Update profile information
      document.getElementById('profileFullName').textContent = fullName;
      document.getElementById('infoFullName').textContent = fullName;
      document.getElementById('infoContactNumber').textContent = contactNumber;
      document.getElementById('infoEmail').textContent = email;
      document.getElementById('infoAddress').textContent = address;

      // Pre-fill edit form
      document.getElementById('editFullName').value = userData.fullName || userData.fullname || '';
      document.getElementById('editContactNumber').value = userData.contactNumber || userData.contact || '';
      document.getElementById('editEmail').value = userData.email || '';
      document.getElementById('editAddress').value = userData.address || '';
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
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
  const infoFullNameEl = document.getElementById('infoFullName');
  const infoContactNumberEl = document.getElementById('infoContactNumber');
  const infoEmailEl = document.getElementById('infoEmail');
  const infoAddressEl = document.getElementById('infoAddress');

  // If required elements are not on the page, skip silently.
  if (!profileNameEl && !infoFullNameEl) {
    console.log("Profile elements not found on this page, skipping data population.");
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Use the camelCase field names we store at signup (fullName, contactNumber)
      if (profileNameEl) profileNameEl.textContent = userData.fullName || user.displayName || "User";
      if (infoFullNameEl) infoFullNameEl.textContent = userData.fullName || user.displayName || "Not provided";
      if (infoContactNumberEl) infoContactNumberEl.textContent = userData.contactNumber || "Not provided";
      if (infoEmailEl) infoEmailEl.textContent = userData.email || user.email || "Not provided";
      if (infoAddressEl) infoAddressEl.textContent = userData.address || "Not provided";
    } else {
      console.warn("No user profile document found in Firestore, using Auth fallback.");
      if (profileNameEl) profileNameEl.textContent = user.displayName || "User";
      if (infoFullNameEl) infoFullNameEl.textContent = user.displayName || "Not provided";
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