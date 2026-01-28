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

/**
 * Find common time slots between two users' availability
 * @param {Array} user1Slots - First user's available slots
 * @param {Array} user2Slots - Second user's available slots
 * @returns {Array} Common/matching slots
 */
function findCommonSlots(user1Slots, user2Slots) {
    const commonSlots = [];
    
    user1Slots.forEach(slot1 => {
        user2Slots.forEach(slot2 => {
            // Check if slots are on the same date
            if (slot1.date === slot2.date) {
                // Parse times
                const slot1Start = parseTime(slot1.startTime);
                const slot1End = parseTime(slot1.endTime);
                const slot2Start = parseTime(slot2.startTime);
                const slot2End = parseTime(slot2.endTime);
                
                // Find overlap
                const overlapStart = slot1Start > slot2Start ? slot1Start : slot2Start;
                const overlapEnd = slot1End < slot2End ? slot1End : slot2End;
                
                // If there's an overlap (at least 30 minutes)
                if (overlapStart < overlapEnd) {
                    const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
                    if (overlapMinutes >= 30) {
                        commonSlots.push({
                            date: slot1.date,
                            startTime: formatTimeFromMinutes(overlapStart),
                            endTime: formatTimeFromMinutes(overlapEnd),
                            user1SlotId: slot1.id,
                            user2SlotId: slot2.id
                        });
                    }
                }
            }
        });
    });
    
    return commonSlots;
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(2000, 0, 1, hours, minutes).getTime();
}

/**
 * Format time from milliseconds to HH:MM string
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} Time string in HH:MM format
 */
function formatTimeFromMinutes(timeMs) {
    const date = new Date(timeMs);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
