/**
 * Profile Management Utility
 * Handles storage and retrieval of user profile data
 * Uses localStorage for persistence
 */

/**
 * Get the user's profile data
 * @returns {Object} Profile object with anonymousName and profile details
 */
function getProfile() {
    try {
        const profileData = localStorage.getItem('neopeer_profile');
        if (profileData) {
            return JSON.parse(profileData);
        }
    } catch (e) {
        console.error('Error reading profile:', e);
    }
    return null;
}

/**
 * Initialize profile with default anonymous name
 * @returns {Object} Initialized profile object
 */
function initializeProfile() {
    const defaultProfile = {
        anonymousName: generateDefaultAnonymousName(),
        fullName: '',
        email: '',
        bio: '',
        interests: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('neopeer_profile', JSON.stringify(defaultProfile));
    return defaultProfile;
}

/**
 * Generate a default anonymous name (student code format)
 * @returns {string} Default anonymous name like "S0819"
 */
function generateDefaultAnonymousName() {
    // Generate a random student code format: S + 4 digits
    const code = 'S' + Math.floor(1000 + Math.random() * 9000);
    return code;
}

/**
 * Update profile data
 * @param {Object} updates - Partial profile object with fields to update
 * @returns {Object} Updated profile object
 */
function updateProfile(updates) {
    let profile = getProfile();
    
    if (!profile) {
        profile = initializeProfile();
    }
    
    // Merge updates
    const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('neopeer_profile', JSON.stringify(updatedProfile));
    return updatedProfile;
}

/**
 * Get the anonymous name (used throughout the app)
 * @returns {string} Anonymous name, defaults to generated code if not set
 */
function getAnonymousName() {
    const profile = getProfile();
    if (profile && profile.anonymousName) {
        return profile.anonymousName;
    }
    
    // If no profile exists, initialize and return default
    const newProfile = initializeProfile();
    return newProfile.anonymousName;
}

/**
 * Get profile details (only to be shared after match)
 * @returns {Object} Profile details object (fullName, email, bio, interests)
 */
function getProfileDetails() {
    const profile = getProfile();
    if (!profile) {
        return {
            fullName: '',
            email: '',
            bio: '',
            interests: ''
        };
    }
    
    return {
        fullName: profile.fullName || '',
        email: profile.email || '',
        bio: profile.bio || '',
        interests: profile.interests || ''
    };
}

/**
 * Check if profile exists
 * @returns {boolean} True if profile exists
 */
function hasProfile() {
    return getProfile() !== null;
}
