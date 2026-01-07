/**
 * Aspirations Management Utility
 * Handles storage and retrieval of user aspirations
 */

/**
 * Get all aspirations for the user
 * @returns {Array} Array of aspiration objects
 */
function getAllAspirations() {
    try {
        const aspirationsData = localStorage.getItem('neopeer_aspirations');
        if (aspirationsData) {
            return JSON.parse(aspirationsData);
        }
    } catch (e) {
        console.error('Error reading aspirations:', e);
    }
    return [];
}

/**
 * Save all aspirations
 * @param {Array} aspirations - Array of aspiration objects
 */
function saveAllAspirations(aspirations) {
    localStorage.setItem('neopeer_aspirations', JSON.stringify(aspirations));
}

/**
 * Add a new aspiration
 * @param {Object} aspiration - Aspiration object with name, description, etc.
 * @returns {Object} Added aspiration with ID and timestamps
 */
function addAspiration(aspiration) {
    const aspirations = getAllAspirations();
    const newAspiration = {
        id: Date.now().toString(),
        name: aspiration.name || 'New Aspiration',
        description: aspiration.description || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...aspiration
    };
    
    aspirations.push(newAspiration);
    saveAllAspirations(aspirations);
    return newAspiration;
}

/**
 * Get a specific aspiration by ID
 * @param {string} id - Aspiration ID
 * @returns {Object|null} Aspiration object or null
 */
function getAspirationById(id) {
    const aspirations = getAllAspirations();
    return aspirations.find(asp => asp.id === id) || null;
}

/**
 * Update an aspiration
 * @param {string} id - Aspiration ID
 * @param {Object} updates - Fields to update
 */
function updateAspiration(id, updates) {
    const aspirations = getAllAspirations();
    const index = aspirations.findIndex(asp => asp.id === id);
    if (index !== -1) {
        aspirations[index] = {
            ...aspirations[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveAllAspirations(aspirations);
        return aspirations[index];
    }
    return null;
}

/**
 * Check if user has any aspirations
 * @returns {boolean} True if user has at least one aspiration
 */
function hasAspirations() {
    return getAllAspirations().length > 0;
}

/**
 * Check if user is a first-time user (no profile or no aspirations)
 * @returns {boolean} True if first-time user
 */
function isFirstTimeUser() {
    // Check if profile exists and is complete
    const profile = getProfile();
    if (!profile) {
        return true;
    }
    
    // Check if user has any aspirations
    if (!hasAspirations()) {
        return true;
    }
    
    return false;
}
