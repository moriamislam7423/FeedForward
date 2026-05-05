import { useMemo, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';

const STARTER_LISTINGS = [
  {
    id: 1,
    title: 'Fresh Bagels and Muffins',
    business: 'Sunrise Cafe',
    description: 'Assorted bagels, blueberry muffins, and plain rolls made fresh today.',
    quantity: 24,
    unit: 'items',
    distance: 0.7,
    address: '120 Main Street',
    dietaryTags: ['vegetarian'],
    expiresInMinutes: 95,
    status: 'available',
    photo: '/images/bakery.jpg'
  },
  {
    id: 2,
    title: 'Healthy Salad Bowls',
    business: 'Green Market Deli',
    description: 'Vegetable bowls packed in individual containers.',
    quantity: 15,
    unit: 'servings',
    distance: 1.3,
    address: '88 Oak Avenue',
    dietaryTags: ['vegan', 'gluten-free'],
    expiresInMinutes: 140,
    status: 'available',
    photo: '/images/veggie-bowl.jpg'
  },
  {
    id: 3,
    title: 'Produce Boxes',
    business: 'Neighborhood Grocer',
    description: 'Mixed produce boxes with apples, lettuce, carrots, tomatoes, and many more.',
    quantity: 8,
    unit: 'boxes',
    distance: 2.1,
    address: '45 Pine Road',
    dietaryTags: ['vegan', 'vegetarian'],
    expiresInMinutes: 210,
    status: 'available',
    photo: '/images/produce.jpg'
  }
];

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
}

function ListingCard({ listing, onClaim }) {
  return (
    <article className="card listing-card">
      <img className="listing-image" src={listing.photo} alt={listing.title} />

      <div className="listing-content">
        <div className="card-header-row">
          <div>
            <h3>{listing.title}</h3>
            <p className="muted">{listing.business}</p>
          </div>
          <span className={listing.status === 'claimed' ? 'badge claimed' : 'badge'}>
            {listing.status}
          </span>
        </div>

        <p>{listing.description}</p>

        <div className="tag-row">
          {listing.dietaryTags.map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>

        <div className="listing-facts">
          <span><strong>{listing.quantity}</strong> {listing.unit}</span>
          <span><strong>{listing.distance}</strong> mi away</span>
          <span><strong>{formatTime(listing.expiresInMinutes)}</strong> left</span>
        </div>

        <p className="address">📍 {listing.address}</p>

        <button
          className="primary-button"
          disabled={listing.status === 'claimed'}
          onClick={() => onClaim(listing.id)}
        >
          {listing.status === 'claimed' ? 'Already claimed' : 'Claim pickup'}
        </button>
      </div>
    </article>
  );
}

function BusinessForm({ onAddListing }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'items',
    address: '',
    expiresInMinutes: '120',
    dietaryTags: 'vegetarian'
  });

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newListing = {
      id: Date.now(),
      title: form.title,
      business: 'Demo Business',
      description: form.description,
      quantity: Number(form.quantity),
      unit: form.unit,
      distance: 0.4,
      address: form.address,
      expiresInMinutes: Number(form.expiresInMinutes),
      dietaryTags: form.dietaryTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      status: 'available',
      photo: '/images/stock.jpg'
    };

    onAddListing(newListing);

    setForm({
      title: '',
      description: '',
      quantity: '',
      unit: 'items',
      address: '',
      expiresInMinutes: '120',
      dietaryTags: 'vegetarian'
    });
  }

  return (
    <section className="card form-card">
      <h2>Post extra food</h2>
      <p className="muted">This form lets a business add a donation listing locally.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Food title
          <input
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="Example: Sandwich trays"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="Briefly describe the food."
            required
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
              onChange={updateField}
              required
            />
          </label>

          <label>
            Unit
            <select name="unit" value={form.unit} onChange={updateField}>
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
            onChange={updateField}
            placeholder="Example: 10 Market Street"
            required
          />
        </label>

        <div className="two-column-form">
          <label>
            Expires in minutes
            <input
              name="expiresInMinutes"
              type="number"
              min="15"
              value={form.expiresInMinutes}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Dietary tags
            <input
              name="dietaryTags"
              value={form.dietaryTags}
              onChange={updateField}
              placeholder="vegan, nut-free"
            />
          </label>
        </div>

        <button className="primary-button" type="submit">Add listing</button>
      </form>
    </section>
  );
}

function ImpactDashboard({ listings }) {
  const claimedListings = listings.filter((listing) => listing.status === 'claimed');
  const poundsRescued = claimedListings.reduce((total, listing) => {
    if (listing.unit === 'lbs') return total + listing.quantity;
    return total + listing.quantity * 0.75;
  }, 0);
  const co2Saved = poundsRescued * 2.5;

  return (
    <section className="dashboard-grid">
      <div className="stat-card">
        <span>Pounds rescued</span>
        <strong>{poundsRescued.toFixed(1)}</strong>
      </div>
      <div className="stat-card">
        <span>CO₂ diverted</span>
        <strong>{co2Saved.toFixed(1)} lbs</strong>
      </div>
      <div className="stat-card">
        <span>Completed claims</span>
        <strong>{claimedListings.length}</strong>
      </div>
    </section>
  );
}

function Notifications({ messages }) {
  return (
    <section className="card notifications-card">
      <h2>Notifications</h2>
      {messages.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id}>{message.text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function App() {
  const { user, switchRole } = useAuth();
  const [listings, setListings] = useState(STARTER_LISTINGS);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to FeedForward! Nearby food listings are ready to view.' }
  ]);

  const availableListings = useMemo(() => {
    return listings.filter((listing) => listing.status === 'available');
  }, [listings]);

  function handleClaimListing(id) {
    const listing = listings.find((item) => item.id === id);

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === id ? { ...item, status: 'claimed' } : item
      )
    );

    setNotifications((currentNotifications) => [
      {
        id: Date.now(),
        text: `You claimed ${listing.title}. Your demo pickup PIN is 123456.`
      },
      ...currentNotifications
    ]);
  }

  function handleAddListing(newListing) {
    setListings((currentListings) => [newListing, ...currentListings]);
    setNotifications((currentNotifications) => [
      {
        id: Date.now(),
        text: `${newListing.title} was posted and is now visible to volunteers.`
      },
      ...currentNotifications
    ]);
  }

  return (
    <main>
      <section className="hero">
        <nav className="top-nav">
          <div className="logo">FeedForward</div>
          <div className="role-switcher" aria-label="Switch demo role">
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
              and shelters see nearby donations before they expire.
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
          <ImpactDashboard listings={listings} />

          <section className="map-placeholder card">
            <div>
              <h2>Nearby pickup map</h2>
              <p className="muted">Mapbox or Google Maps can replace this placeholder later.</p>
            </div>
            <div className="fake-map">
              <span className="map-dot dot-one">Cafe</span>
              <span className="map-dot dot-two">Deli</span>
              <span className="map-dot dot-three">Grocer</span>
            </div>
          </section>

          <section>
            <div className="section-heading">
              <h2>Available food listings</h2>
              <p className="muted">{availableListings.length} pickup options available right now</p>
            </div>

            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClaim={handleClaimListing}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="side-column">
          <BusinessForm onAddListing={handleAddListing} />
          <Notifications messages={notifications} />
        </aside>
      </section>
    </main>
  );
}

export default App;
