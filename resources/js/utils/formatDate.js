/**
 * Format a session date for display.
 *
 * Accepts a YYYY-MM-DD string or an ISO 8601 timestamp (e.g. the
 * "2026-10-20T00:00:00.000000Z" that Laravel serializes by default).
 *
 * Only the first 10 characters are used, so the value is treated as a
 * calendar date in the stored timezone rather than converted through the
 * local Date object (which would silently shift the day for some users).
 *
 * Output: "Oct 20, 2026"
 */
export function formatDate(value) {
    if (!value) return '';

    const datePart = String(value).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

    if (!match) {
        return String(value);
    }

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const year = match[1];
    const month = months[Number(match[2]) - 1];
    const day = String(Number(match[3]));

    return `${month} ${day}, ${year}`;
}

export default formatDate;