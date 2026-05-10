const API_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(API_URL + path, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  getListings() {
    return request('/listings');
  },

  createListing(listing) {
    return request('/listings', {
      method: 'POST',
      body: JSON.stringify(listing)
    });
  },

  claimListing(listingId) {
    return request('/claims', {
      method: 'POST',
      body: JSON.stringify({ listingId })
    });
  },

  getNotifications() {
    return request('/notifications');
  },

  markNotificationRead(id) {
    return request('/notifications/' + id + '/read', {
      method: 'PATCH'
    });
  }
};