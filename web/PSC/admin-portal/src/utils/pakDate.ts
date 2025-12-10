// Add these Pakistan Time utility functions
export const parsePakistanDate = (dateString: string): Date => {
  // Parse date string as Pakistan Time (UTC+5)
  const date = new Date(dateString + 'T00:00:00+05:00');
  return date;
};

export const getPakistanDate = (): Date => {
  // Get current time in Pakistan (UTC+5)
  const now = new Date();
  const pktOffset = 5 * 60 * 60 * 1000; // PKT is UTC+5
  return new Date(now.getTime() + pktOffset);
};

export const normalizeToPakistanDate = (date: Date): Date => {
  // Normalize any date to Pakistan Time start of day
  const pktDate = new Date(date.getTime() + (5 * 60 * 60 * 1000));
  pktDate.setHours(0, 0, 0, 0);
  return pktDate;
};

export const getPakistanDateString = (date: Date): string => {
  // Convert to Pakistan time (UTC+5) and format as YYYY-MM-DD
  const pktDate = new Date(date.getTime() + (5 * 60 * 60 * 1000));
  return pktDate.toISOString().split('T')[0];
};



// Helper function to format dates for display in Pakistan time
export const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};