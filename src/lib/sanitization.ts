/**
 * Security-focused sanitization utility.
 * Prevents XSS, script injection, and unintended HTML rendering.
 */

/**
 * Basic character escaping for HTML contexts.
 * Note: React already does this for data in curly braces, 
 * but this is useful for attributes or when handling raw strings.
 */
export function escapeHTML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Strict sanitizer for user descriptions and text inputs.
 * Trims and removes any potentially harmful characters.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Trim and normalize whitespace
    let sanitized = input.trim().replace(/\s+/g, ' ');
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Basic XSS prevention (even though React handles many cases)
    // We escape tags to prevent them from being interpreted as HTML if they ever reach a vulnerable sink
    return escapeHTML(sanitized);
}

/**
 * Validates and formats currency strings.
 */
export function validateCurrency(amount: string | number): number {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 0;
    // Round to 2 decimal places and ensure non-negative
    return Math.max(0, Math.round(num * 100) / 100);
}
