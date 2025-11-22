// Pakistan Time utility functions
export function parsePakistanDate(dateString: string): Date {
    // Parse date string as Pakistan Time (UTC+5)
    const date = new Date(dateString);
    return date;
  }

export function getPakistanDate(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
}

export function formatPakistanDate(date: Date): string {
    // Format date for Pakistan timezone
    return date.toLocaleDateString('en-PK', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }