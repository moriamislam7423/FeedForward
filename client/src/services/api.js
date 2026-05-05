const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

// These functions are ready for the backend later.
// The current App.jsx uses mock data so the website works before backend routes are complete.
export const api = {
  getListings: () => request('/listings'),
  createListing: (listing) =>
    request('/listings', {
      method: 'POST',
      body: JSON.stringify(listing)
    }),
  claimListing: (listingId) =>
    request('/claims', {
      method: 'POST',
      body: JSON.stringify({ listingId })
    }),
  getNotifications: () => request('/notifications')
};
