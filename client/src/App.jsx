import Map from './Map';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';

const demoListings = [
  {
    id: 'demo-1',
    title: 'Fresh Bagels and Muffins',
    business: 'Sunrise Cafe',
    description: 'Assorted bagels, muffins, and rolls made fresh today.',
    quantity: 24,
    unit: 'items',
    address: '120 Main Street',
    distance: 0.7,
    tags: ['vegetarian'],
    minutesLeft: 95,
    status: 'available',
    photo: '/images/bakery.jpg',
    isDemo: true
  },
  {
    id: 'demo-2',
    title: 'Healthy Salad Bowls',
    business: 'Green Market Deli',
    description: 'Vegetable bowls packed in individual containers.',
    quantity: 15,
    unit: 'servings',
    address: '88 Oak Avenue',
    distance: 1.3,
    tags: ['vegan', 'gluten-free'],
    minutesLeft: 140,
    status: 'available',
    photo: '/images/veggie-bowl.jpg',
    isDemo: true
  },
  {
    id: 'demo-3',
    title: 'Produce Boxes',
    business: 'Neighborhood Grocer',
    description: 'Mixed produce boxes with apples, lettuce, carrots, and tomatoes.',
    quantity: 8,
    unit: 'boxes',
    address: '45 Pine Road',
    distance: 2.1,
    tags: ['vegan', 'vegetarian'],
    minutesLeft: 210,
    status: 'available',
    photo: '/images/produce.jpg',
    isDemo: true
  }
];

function minutesFromDate(dateValue) {
  if (!dateValue) {
    return 120;
  }

  const expiresAt = new Date(dateValue);
  const difference = expiresAt.getTime() - Date.now();
  const minutes = Math.round(difference / 60000);

  if (minutes < 0) {
    return 0;
  }

  return minutes;
}

function formatMinutes(minutes) {
  if (minutes < 60) {
    return minutes + ' min';
  }

  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;

  return hours + ' hr ' + leftoverMinutes + ' min';
}

function cleanBackendListing(listing) {
  return {
    id: listing._id || listing.id,
    title: listing.title || 'Untitled listing',
    business: listing.businessName || 'Local Business',
    description: listing.description || 'No description added.',
    quantity: listing.quantity?.amount || listing.quantity || 0,
    unit: listing.quantity?.unit || listing.unit || 'items',
    address: listing.address || 'No address listed',
    distance: listing.distance || 1,
    tags: listing.dietaryTags || listing.tags || [],
    minutesLeft: minutesFromDate(listing.expiresAt),
    status: listing.status || 'available',
    photo: listing.photos?.[0] || listing.photo || '/images/stock.jpg',
    isDemo: false
  };
}

function App() {
  const { user, switchRole } = useAuth();

  const [listings, setListings] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('expires');
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState('');
  const [backendStatus, setBackendStatus] = useState('Checking backend...');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'items',
    address: '',
    tags: 'vegetarian',
    expiresInMinutes: '120'
  });

  useEffect(() => {
    loadSavedData();
    loadListings();
    loadNotifications();
  }, []);

  useEffect(() => {
    localStorage.setItem('feedforward_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('feedforward_claims', JSON.stringify(myClaims));
  }, [myClaims]);

  function loadSavedData() {
    const savedListings = localStorage.getItem('feedforward_listings');
    const savedClaims = localStorage.getItem('feedforward_claims');

    if (savedListings) {
      setListings(JSON.parse(savedListings));
    }

    if (savedClaims) {
      setMyClaims(JSON.parse(savedClaims));
    }
  }

  async function loadListings() {
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await api.getListings();

      const listingArray = Array.isArray(data) ? data : data.listings || [];
      const cleanListings = listingArray.map(cleanBackendListing);

      if (cleanListings.length > 0) {
        setListings(cleanListings);
      } else {
        setListings(demoListings);
      }

      setBackendStatus('Backend connected');
    } catch {
      const savedListings = localStorage.getItem('feedforward_listings');

      if (savedListings) {
        setListings(JSON.parse(savedListings));
      } else {
        setListings(demoListings);
      }

      setBackendStatus('Demo mode: backend is not connected');
      setErrorMessage('Backend is not running, so demo data is being used.');
    }

    setLoading(false);
  }

  async function loadNotifications() {
    try {
      const data = await api.getNotifications();
      const notificationArray = Array.isArray(data) ? data : data.notifications || [];

      const cleanNotifications = notificationArray.map(function (item) {
        return {
          id: item._id || item.id,
          text: item.message || 'Notification',
          read: item.read || false,
          isDemo: false
        };
      });

      setNotifications(cleanNotifications);
    } catch {
      setNotifications([
        {
          id: 'demo-note-1',
          text: 'Welcome to FeedForward. New food listings will appear here.',
          read: false,
          isDemo: true
        }
      ]);
    }
  }

  function updateForm(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function addListing(event) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (form.title.trim() === '') {
      setErrorMessage('Please enter a food title.');
      return;
    }

    if (form.quantity === '' || Number(form.quantity) <= 0) {
      setErrorMessage('Please enter a quantity greater than 0.');
      return;
    }

    if (form.address.trim() === '') {
      setErrorMessage('Please enter a pickup address.');
      return;
    }

    const tagList = form.tags
      .split(',')
      .map(function (tag) {
        return tag.trim();
      })
      .filter(function (tag) {
        return tag !== '';
      });

    const listingForBackend = {
      title: form.title,
      description: form.description,
      quantity: {
        amount: Number(form.quantity),
        unit: form.unit
      },
      dietaryTags: tagList,
      expiresAt: new Date(Date.now() + Number(form.expiresInMinutes) * 60000).toISOString(),
      address: form.address,
      location: {
        type: 'Point',
        coordinates: [-73.9857, 40.7484]
      },
      photos: []
    };

    try {
      const savedListing = await api.createListing(listingForBackend);
      const cleanListing = cleanBackendListing(savedListing.listing || savedListing);

      setListings([cleanListing, ...listings]);
      setSuccessMessage('Listing saved to backend.');
      setBackendStatus('Backend connected');
    } catch {
      const localListing = {
        id: 'local-' + Date.now(),
        title: form.title,
        business: 'My Business',
        description: form.description || 'No description added.',
        quantity: Number(form.quantity),
        unit: form.unit,
        address: form.address,
        distance: 0.5,
        tags: tagList,
        minutesLeft: Number(form.expiresInMinutes),
        status: 'available',
        photo: '/images/stock.jpg',
        isDemo: true
      };

      setListings([localListing, ...listings]);
      setSuccessMessage('Backend is not connected, so the listing was saved locally for demo.');
      setBackendStatus('Demo mode: backend is not connected');
    }

    setNotifications([
      {
        id: 'note-' + Date.now(),
        text: form.title + ' was added as a new food listing.',
        read: false,
        isDemo: true
      },
      ...notifications
    ]);

    setForm({
      title: '',
      description: '',
      quantity: '',
      unit: 'items',
      address: '',
      tags: 'vegetarian',
      expiresInMinutes: '120'
    });
  }
function sendBrowserNotification(title, body) {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}
  async function claimListing(listing) {
    setSuccessMessage('');
    setErrorMessage('');
    setClaimingId(listing.id);

    try {
      if (!listing.isDemo) {
        await api.claimListing(listing.id);
      }

      const updatedListings = listings.map(function (item) {
        if (item.id === listing.id) {
          return {
            ...item,
            status: 'claimed'
          };
        }

        return item;
      });

      const newClaim = {
        id: 'claim-' + Date.now(),
        title: listing.title,
        business: listing.business,
        address: listing.address,
        pin: '123456'
      };

      setListings(updatedListings);
      setMyClaims([newClaim, ...myClaims]);

      setNotifications([
        {
          id: 'note-' + Date.now(),
          text: 'You claimed ' + listing.title + '. Pickup PIN: 123456.',
          read: false,
          isDemo: true
        },
        ...notifications
      ]);
sendBrowserNotification(
  'Pickup claimed',
  'Your pickup PIN for ' + listing.title + ' is 123456'
);
      setSuccessMessage('Pickup claimed. Demo PIN: 123456.');
    } catch (error) {
      setErrorMessage(error.message);
    }

    setClaimingId('');
  }

  function markNotificationRead(id) {
    const updatedNotifications = notifications.map(function (note) {
      if (note.id === id) {
        return {
          ...note,
          read: true
        };
      }

      return note;
    });

    setNotifications(updatedNotifications);
  }

  function resetDemoData() {
    localStorage.removeItem('feedforward_listings');
    localStorage.removeItem('feedforward_claims');

    setListings(demoListings);
    setMyClaims([]);
    setSuccessMessage('Demo data was reset.');
    setErrorMessage('');
  }

  let visibleListings = listings.filter(function (listing) {
    const search = searchText.toLowerCase();

    const matchesSearch =
      listing.title.toLowerCase().includes(search) ||
      listing.business.toLowerCase().includes(search) ||
      listing.description.toLowerCase().includes(search) ||
      listing.address.toLowerCase().includes(search);

    const matchesTag =
      filterTag === 'all' || listing.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  visibleListings = visibleListings.sort(function (a, b) {
    if (sortBy === 'expires') {
      return a.minutesLeft - b.minutesLeft;
    }

    if (sortBy === 'distance') {
      return a.distance - b.distance;
    }

    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }

    return 0;
  });

  const claimedListings = listings.filter(function (listing) {
    return listing.status === 'claimed';
  });

  const poundsSaved = claimedListings.length * 5;
  const co2Saved = poundsSaved * 2.5;

  return (
    <main>
      <section className="hero">
        <nav className="top-nav">
          <div className="logo">FeedForward</div>

          <div className="role-switcher">
            <button onClick={() => switchRole('volunteer')}>Volunteer</button>
            <button onClick={() => switchRole('business')}>Business</button>
            <button onClick={() => switchRole('recipient')}>Recipient</button>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">Food rescue made simple</p>
            <h1>Connect surplus food with people who need it.</h1>
            <p>
              FeedForward helps businesses post extra food, volunteers claim pickups,
              and shelters find nearby donations before they expire.
            </p>
          </div>

          <div className="hero-panel">
            <p className="muted">Signed in as</p>
            <h2>{user.name}</h2>
            <span className="badge">{user.role}</span>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="main-column">
          <section className="status-card card">
            <div>
              <h2>Frontend status</h2>
              <p>{backendStatus}</p>
            </div>

            <button className="secondary-button" onClick={resetDemoData}>
              Reset demo data
            </button>
          </section>

          <section className="dashboard-grid">
            <div className="stat-card">
              <span>Pounds rescued</span>
              <strong>{poundsSaved}</strong>
            </div>

            <div className="stat-card">
              <span>CO₂ diverted</span>
              <strong>{co2Saved} lbs</strong>
            </div>

            <div className="stat-card">
              <span>My claims</span>
              <strong>{myClaims.length}</strong>
            </div>
          </section>

          {successMessage && <p className="alert success">{successMessage}</p>}
          {errorMessage && <p className="alert error">{errorMessage}</p>}

          <section className="map-placeholder card">
            <div>
               <h2>Nearby pickup map</h2>
               <p className="muted">
                 Live Google Maps view of nearby food listings.
               </p>
           </div>

            <Map />
          </section>

          <section className="card controls-card">
            <h2>Find food</h2>

            <label>
              Search
              <input
                value={searchText}
                onChange={function (event) {
                  setSearchText(event.target.value);
                }}
                placeholder="Search by food, business, or address"
              />
            </label>

            <div className="control-row">
              <label>
                Filter
                <select
                  value={filterTag}
                  onChange={function (event) {
                    setFilterTag(event.target.value);
                  }}
                >
                  <option value="all">All</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-free</option>
                </select>
              </label>

              <label>
                Sort
                <select
                  value={sortBy}
                  onChange={function (event) {
                    setSortBy(event.target.value);
                  }}
                >
                  <option value="expires">Expiring soon</option>
                  <option value="distance">Closest first</option>
                  <option value="quantity">Most food</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <div className="section-heading">
              <h2>Available food listings</h2>
              <p className="muted">{visibleListings.length} listing(s) found</p>
            </div>

            {loading ? (
              <div className="card loading-box">Loading listings...</div>
            ) : visibleListings.length === 0 ? (
              <div className="card empty-state">
                <h3>No listings found.</h3>
                <p className="muted">Try changing the search or filter.</p>
              </div>
            ) : (
              <div className="listing-grid">
                {visibleListings.map(function (listing) {
                  const isClaiming = claimingId === listing.id;
                  const isClaimed = listing.status === 'claimed';

                  return (
                    <article className="card listing-card" key={listing.id}>
                      <img
                        className="listing-image"
                        src={listing.photo}
                        alt={listing.title}
                      />

                      <div className="listing-content">
                        <div className="card-header-row">
                          <div>
                            <h3>{listing.title}</h3>
                            <p className="muted">{listing.business}</p>
                          </div>

                          <span className={isClaimed ? 'badge claimed' : 'badge'}>
                            {listing.status}
                          </span>
                        </div>

                        <p>{listing.description}</p>

                        <div className="tag-row">
                          {listing.tags.map(function (tag) {
                            return (
                              <span className="tag" key={tag}>
                                {tag}
                              </span>
                            );
                          })}
                        </div>

                        <div className="listing-facts">
                          <span>
                            <strong>{listing.quantity}</strong> {listing.unit}
                          </span>
                          <span>
                            <strong>{listing.distance}</strong> mi away
                          </span>
                          <span>
                            <strong>{formatMinutes(listing.minutesLeft)}</strong> left
                          </span>
                        </div>

                        <p className="address">📍 {listing.address}</p>

                        <button
                          className="primary-button"
                          disabled={isClaimed || isClaiming}
                          onClick={function () {
                            claimListing(listing);
                          }}
                        >
                          {isClaiming
                            ? 'Claiming...'
                            : isClaimed
                              ? 'Already claimed'
                              : 'Claim pickup'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="side-column">
          <section className="card form-card">
            <h2>Post extra food</h2>
            <p className="muted">Businesses can add a new food donation here.</p>

            <form onSubmit={addListing}>
              <label>
                Food title
                <input
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="Example: Sandwich trays"
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Describe the food."
                />
              </label>

              <div className="two-column-form">
                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={updateForm}
                  />
                </label>

                <label>
                  Unit
                  <select name="unit" value={form.unit} onChange={updateForm}>
                    <option value="items">items</option>
                    <option value="servings">servings</option>
                    <option value="boxes">boxes</option>
                    <option value="lbs">lbs</option>
                  </select>
                </label>
              </div>

              <label>
                Pickup address
                <input
                  name="address"
                  value={form.address}
                  onChange={updateForm}
                  placeholder="Example: 10 Market Street"
                />
              </label>

              <label>
                Dietary tags
                <input
                  name="tags"
                  value={form.tags}
                  onChange={updateForm}
                  placeholder="Example: vegan, vegetarian"
                />
              </label>

              <label>
                Expires in minutes
                <input
                  name="expiresInMinutes"
                  type="number"
                  min="15"
                  value={form.expiresInMinutes}
                  onChange={updateForm}
                />
              </label>

              <button className="primary-button" type="submit">
                Add listing
              </button>
            </form>
          </section>

          <section className="card">
            <h2>My Claims</h2>

            {myClaims.length === 0 ? (
              <p className="muted">You have not claimed any pickups yet.</p>
            ) : (
              <div className="claim-list">
                {myClaims.map(function (claim) {
                  return (
                    <div className="claim-item" key={claim.id}>
                      <strong>{claim.title}</strong>
                      <p>{claim.business}</p>
                      <p>{claim.address}</p>
                      <p>Pickup PIN: {claim.pin}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card">
            <h2>Notifications</h2>

            {notifications.length === 0 ? (
              <p className="muted">No notifications yet.</p>
            ) : (
              <ul className="notification-list">
                {notifications.map(function (note) {
                  return (
                    <li
                      className={note.read ? 'notification-item read' : 'notification-item'}
                      key={note.id}
                    >
                      <span>{note.text}</span>

                      {!note.read && (
                        <button
                          className="small-button"
                          onClick={function () {
                            markNotificationRead(note.id);
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}

export default App;