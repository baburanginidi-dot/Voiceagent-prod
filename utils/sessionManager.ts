import type { User, StageId, Message } from '../types';

const SESSION_KEY = 'onboardingSession';

export interface SessionData {
    user: User;
    currentStageId: StageId;
    transcripts: Message[];
}

/**
 * Saves the entire session, including the transcript, to localStorage.
 * @param sessionData - The session data to save.
 */
export const saveSession = (sessionData: SessionData): void => {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error("Failed to save session to localStorage", error);
    }
};

/**
 * Loads the session, including the transcript, from localStorage.
 * @returns The saved session data, or null if not found or invalid.
 */
export const loadSession = (): SessionData | null => {
    try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (!savedSession) {
            return null;
        }
        const parsed = JSON.parse(savedSession);
        // Basic validation to ensure the loaded data has the expected shape
        if (parsed.user && parsed.currentStageId && Array.isArray(parsed.transcripts)) {
             return parsed as SessionData;
        }
        // If data is malformed, clear it
        clearSession();
        return null;
    } catch (error) {
        console.error("Failed to load session from localStorage", error);
        clearSession(); // Clear potentially corrupted data
        return null;
    }
};

/**
 * Clears the session and transcript from localStorage.
 */
export const clearSession = (): void => {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
         console.error("Failed to clear session from localStorage", error);
    }
};
