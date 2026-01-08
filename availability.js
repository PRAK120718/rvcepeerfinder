/**
 * Availability Management Utility
 * Handles storage and retrieval of availability slots for aspirations
 */

/**
 * Get availability for a specific aspiration
 * @param {string} aspirationId - Aspiration ID
 * @returns {Object} Availability object with slots, booked, requested
 */
function getAspirationAvailability(aspirationId) {
    try {
        const key = `neopeer_availability_${aspirationId}`;
        const availabilityData = localStorage.getItem(key);
        if (availabilityData) {
            return JSON.parse(availabilityData);
        }
    } catch (e) {
        console.error('Error reading availability:', e);
    }
    
    // Return default structure
    return {
        aspirationId: aspirationId,
        availableSlots: [],
        bookedSlots: [],
        requestedSlots: [],
        updatedAt: new Date().toISOString()
    };
}

/**
 * Save availability for a specific aspiration
 * @param {string} aspirationId - Aspiration ID
 * @param {Object} availability - Availability object
 */
function saveAspirationAvailability(aspirationId, availability) {
    const key = `neopeer_availability_${aspirationId}`;
    availability.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(availability));
}

/**
 * Add available slots to an aspiration
 * @param {string} aspirationId - Aspiration ID
 * @param {Array} slots - Array of slot objects {date, startTime, endTime, id}
 */
function addAvailableSlots(aspirationId, slots) {
    const availability = getAspirationAvailability(aspirationId);
    
    // Add new slots (avoid duplicates)
    slots.forEach(newSlot => {
        const exists = availability.availableSlots.some(slot => 
            slot.id === newSlot.id || 
            (slot.date === newSlot.date && slot.startTime === newSlot.startTime)
        );
        if (!exists) {
            availability.availableSlots.push({
                ...newSlot,
                id: newSlot.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                addedAt: new Date().toISOString()
            });
        }
    });
    
    saveAspirationAvailability(aspirationId, availability);
    return availability;
}

/**
 * Remove available slot
 * @param {string} aspirationId - Aspiration ID
 * @param {string} slotId - Slot ID to remove
 */
function removeAvailableSlot(aspirationId, slotId) {
    const availability = getAspirationAvailability(aspirationId);
    availability.availableSlots = availability.availableSlots.filter(slot => slot.id !== slotId);
    saveAspirationAvailability(aspirationId, availability);
    return availability;
}

/**
 * Add booked slot
 * @param {string} aspirationId - Aspiration ID
 * @param {Object} slot - Slot object with meeting details
 */
function addBookedSlot(aspirationId, slot) {
    const availability = getAspirationAvailability(aspirationId);
    
    // Remove from available slots if it was there
    availability.availableSlots = availability.availableSlots.filter(s => s.id !== slot.availableSlotId);
    
    // Remove from requested slots if it was there
    availability.requestedSlots = availability.requestedSlots.filter(s => s.id !== slot.requestedSlotId);
    
    availability.bookedSlots.push({
        ...slot,
        id: slot.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookedAt: new Date().toISOString()
    });
    
    saveAspirationAvailability(aspirationId, availability);
    return availability;
}

/**
 * Add requested slot
 * @param {string} aspirationId - Aspiration ID
 * @param {Object} slot - Requested slot object
 */
function addRequestedSlot(aspirationId, slot) {
    const availability = getAspirationAvailability(aspirationId);
    
    availability.requestedSlots.push({
        ...slot,
        id: slot.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestedAt: new Date().toISOString()
    });
    
    saveAspirationAvailability(aspirationId, availability);
    return availability;
}

/**
 * Cancel booked slot
 * @param {string} aspirationId - Aspiration ID
 * @param {string} slotId - Slot ID to cancel
 */
function cancelBookedSlot(aspirationId, slotId) {
    const availability = getAspirationAvailability(aspirationId);
    const slot = availability.bookedSlots.find(s => s.id === slotId);
    
    if (slot) {
        availability.bookedSlots = availability.bookedSlots.filter(s => s.id !== slotId);
        saveAspirationAvailability(aspirationId, availability);
    }
    
    return availability;
}

/**
 * Cancel requested slot
 * @param {string} aspirationId - Aspiration ID
 * @param {string} slotId - Slot ID to cancel
 */
function cancelRequestedSlot(aspirationId, slotId) {
    const availability = getAspirationAvailability(aspirationId);
    availability.requestedSlots = availability.requestedSlots.filter(s => s.id !== slotId);
    saveAspirationAvailability(aspirationId, availability);
    return availability;
}

/**
 * Get available slots (excluding booked and requested)
 * @param {string} aspirationId - Aspiration ID
 * @returns {Array} Available slots that can be shown to other users
 */
function getAvailableSlotsForMatching(aspirationId) {
    const availability = getAspirationAvailability(aspirationId);
    const bookedSlotIds = new Set(availability.bookedSlots.map(s => s.availableSlotId || s.id));
    const requestedSlotIds = new Set(availability.requestedSlots.map(s => s.availableSlotId || s.id));
    
    return availability.availableSlots.filter(slot => 
        !bookedSlotIds.has(slot.id) && !requestedSlotIds.has(slot.id)
    );
}
