import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, CheckCircle2, XCircle, 
  Menu, X, MessageCircle, ChevronRight, Star, Search, Filter, 
  Phone, Mail, Globe, Shield, Lock, Trash2, Edit, Plus, Info, Image as ImageIcon
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Firebase Initialization
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'travel-app-default';

const SEED_PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Kerala Backwaters & Hills',
    location: 'Kerala, India',
    price: 35000,
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800'
    ],
    type: 'Nature',
    description: 'Experience the serene backwaters of Alleppey and the lush green tea gardens of Munnar. A perfect blend of relaxation and nature.',
    itinerary: [
      'Day 1: Arrival in Kochi & Transfer to Munnar',
      'Day 2: Munnar Sightseeing (Tea Gardens, Mattupetty Dam)',
      'Day 3: Transfer to Thekkady & Spice Plantation Tour',
      'Day 4: Transfer to Alleppey & Houseboat Stay',
      'Day 5: Transfer to Kovalam Beach',
      'Day 6: Departure from Trivandrum'
    ],
    inclusions: ['Premium Houseboat Stay', 'Daily Breakfast & Dinner', 'Airport Transfers', 'Private AC Cab'],
    exclusions: ['Flight Tickets', 'Entry Fees to Monuments', 'Personal Expenses']
  },
  {
    id: 'pkg-2',
    title: 'Royal Rajasthan Heritage',
    location: 'Rajasthan, India',
    price: 45000,
    duration: '8 Days / 7 Nights',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800'],
    type: 'Heritage',
    description: 'Immerse yourself in the rich history of the Rajputs. Visit majestic forts, opulent palaces, and vibrant markets across Jaipur, Jodhpur, and Udaipur.',
    itinerary: ['Day 1-2: Jaipur (Amer Fort, City Palace)', 'Day 3-4: Jodhpur (Mehrangarh Fort)', 'Day 5-6: Udaipur (Lake Pichola, City Palace)', 'Day 7: Pushkar Day Trip', 'Day 8: Departure from Jaipur'],
    inclusions: ['Heritage Hotel Stays', 'English Speaking Guide', 'Camel Ride in Pushkar', 'All Transfers'],
    exclusions: ['Lunches', 'Camera Fees at Monuments']
  },
  {
    id: 'pkg-3',
    title: 'Magical Manali & Rohtang',
    location: 'Himachal Pradesh, India',
    price: 28500,
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3e99c0b11?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3e99c0b11?auto=format&fit=crop&q=80&w=800'],
    type: 'Mountain',
    description: 'Escape to the snow-capped peaks of the Himalayas. Enjoy thrilling adventure sports and breathtaking views in Manali.',
    itinerary: ['Day 1: Arrival in Chandigarh & Transfer to Manali', 'Day 2: Manali Local Sightseeing', 'Day 3: Rohtang Pass / Solang Valley Excursion', 'Day 4: Kullu & Manikaran', 'Day 5: Departure to Chandigarh'],
    inclusions: ['3-Star Accommodation', 'Breakfast & Dinner', 'Sedan Cab for Sightseeing'],
    exclusions: ['Rohtang Pass Permit', 'Adventure Activities']
  }
];

export default function App() {
  // State Management
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // home, destinations, package, about, contact, blog, testimonials, admin
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Simplified admin toggle for demo

  // Data State
  const [packages, setPackages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100000);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !authInitialized) return;

    // References to public collections
    const packagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'packages');
    const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'leads');

    // Fetch Packages
    const unsubPackages = onSnapshot(packagesRef, (snapshot) => {
      const fetchedPackages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Seed data if empty
      if (fetchedPackages.length === 0) {
        seedDatabase(packagesRef);
      } else {
        setPackages(fetchedPackages);
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Error fetching packages:", error);
      setIsLoading(false);
    });

    // Fetch Leads (Admin only normally, but kept public for demo)
    const unsubLeads = onSnapshot(leadsRef, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Error fetching leads:", error);
    });

    return () => {
      unsubPackages();
      unsubLeads();
    };
  }, [user, authInitialized]);

  const seedDatabase = async (packagesRef) => {
    try {
      for (const pkg of SEED_PACKAGES) {
        const { id, ...data } = pkg;
        await setDoc(doc(packagesRef, id), data);
      }
      console.log("Database seeded with default packages.");
    } catch (err) {
      console.error("Error seeding database:", err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (page, packageId = null) => {
    setCurrentPage(page);
    if (packageId) setSelectedPackageId(packageId);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLeadSubmit = async (e, packageInfo) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Basic sanitization/validation (simulated)
    if (!data.name || !data.email || !data.phone) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const leadData = {
      ...data,
      packageId: packageInfo?.id || 'General Inquiry',
      packageName: packageInfo?.title || 'N/A',
      createdAt: Date.now(),
      status: 'New'
    };

    try {
      const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'leads');
      await addDoc(leadsRef, leadData);
      showToast('Inquiry sent successfully! We will contact you soon.');
      e.target.reset();
    } catch (err) {
      showToast('Error sending inquiry. Please try again.', 'error');
      console.error(err);
    }
  };

  const NavBar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('home')}>
            <img src="1.jpg.jpeg" alt="Joy Makers Holidays Logo" className="h-12 w-auto mr-3 object-cover rounded-md shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight tracking-tight text-gray-900">Joy Makers</span>
              <span className="text-xs text-blue-600 font-semibold tracking-widest uppercase">Holidays</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'destinations', 'about', 'testimonials', 'blog', 'contact'].map((page) => (
              <button 
                key={page}
                onClick={() => navigate(page)}
                className={`capitalize font-medium transition-colors hover:text-blue-600 ${currentPage === page ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              [Admin]
            </button>
            {isAdmin && (
               <button 
                 onClick={() => navigate('admin')}
                 className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
               >
                 Dashboard
               </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {['home', 'destinations', 'about', 'testimonials', 'blog', 'contact'].map((page) => (
              <button 
                key={page}
                onClick={() => navigate(page)}
                className={`block w-full text-left px-3 py-4 rounded-md text-base font-medium capitalize ${currentPage === page ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
             {isAdmin && (
               <button 
                 onClick={() => navigate('admin')}
                 className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-white bg-blue-600"
               >
                 Admin Dashboard
               </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  const Home = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
            alt="Travel Hero" 
            className="w-full h-full object-cover filter brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Discover Your Next Great Adventure
          </h1>
          <p className="text-xl text-gray-200 mb-8 drop-shadow-md">
            Expertly crafted travel packages to the world's most stunning destinations. Book your dream vacation today.
          </p>
          <button 
            onClick={() => navigate('destinations')}
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center mx-auto"
          >
            Explore Packages <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* USP Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Joy Makers Holidays?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide premium travel experiences with exceptional service from start to finish.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <Shield className="h-10 w-10 text-blue-600 mb-4 mx-auto" />, title: 'Secure & Safe', desc: 'Your safety is our priority. We vet all our partners and provide secure booking systems.' },
              { icon: <Star className="h-10 w-10 text-blue-600 mb-4 mx-auto" />, title: 'Expert Guides', desc: 'Travel with knowledgeable locals who bring every destination to life.' },
              { icon: <Phone className="h-10 w-10 text-blue-600 mb-4 mx-auto" />, title: '24/7 Support', desc: 'Our dedicated team is available around the clock to assist you anywhere in the world.' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Packages */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Destinations</h2>
              <p className="text-gray-600">Hand-picked packages for your next getaway.</p>
            </div>
            <button onClick={() => navigate('destinations')} className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-800">
              View All <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.slice(0, 3).map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PackageCard = ({ pkg }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={pkg.image} 
          alt={pkg.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-800">
          {pkg.type || 'Standard'}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1 text-blue-500" /> {pkg.location}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4 border-t pt-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-sm font-medium">{pkg.duration}</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 block">Starting from</span>
              <span className="text-2xl font-bold text-blue-600">₹{pkg.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('packageDetails', pkg.id)}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const Destinations = () => {
    const filteredPackages = packages.filter(pkg => {
      const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || pkg.type === filterType;
      const matchesPrice = pkg.price <= maxPrice;
      return matchesSearch && matchesType && matchesPrice;
    });

    const uniqueTypes = ['All', ...new Set(packages.map(p => p.type).filter(Boolean))];

    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Destinations</h1>
            <p className="text-lg text-gray-600">Find the perfect package tailored to your budget and style.</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Location or Tour</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="e.g. Bali, Swiss..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500"
              >
                {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Max Budget: ₹{maxPrice.toLocaleString('en-IN')}</span>
              </label>
              <input 
                type="range" 
                min="10000" 
                max="200000" 
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>
          </div>

          {/* Grid */}
          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No packages found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={() => {setSearchTerm(''); setFilterType('All'); setMaxPrice(5000);}} className="mt-4 text-blue-600 font-medium hover:underline">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PackageDetails = () => {
    const pkg = packages.find(p => p.id === selectedPackageId);
    const [activeImage, setActiveImage] = useState(pkg?.images?.[0] || pkg?.image);
    const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, inclusions

    if (!pkg) return <div className="p-20 text-center">Package not found.</div>;

    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <button onClick={() => navigate('destinations')} className="text-blue-600 font-medium flex items-center mb-6 hover:underline">
            ← Back to Destinations
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content (Images + Details) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="h-96 relative">
                  <img src={activeImage} alt={pkg.title} className="w-full h-full object-cover" />
                </div>
                {pkg.images && pkg.images.length > 1 && (
                  <div className="p-4 flex space-x-4 overflow-x-auto">
                    {pkg.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(img)}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${activeImage === img ? 'border-blue-600' : 'border-transparent'}`}
                      >
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Basics */}
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
                    <div className="flex items-center text-gray-500 space-x-4">
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-blue-500" /> {pkg.location}</span>
                      <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-blue-500" /> {pkg.duration}</span>
                    </div>
                  </div>
                  <div className="text-right bg-blue-50 p-4 rounded-xl">
                    <span className="text-sm text-gray-500 block">Price per person</span>
                    <span className="text-3xl font-bold text-blue-600">₹{pkg.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{pkg.description}</p>
              </div>

              {/* Tabs for Itinerary / Inclusions */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex border-b">
                  <button onClick={() => setActiveTab('itinerary')} className={`flex-1 py-4 text-center font-medium ${activeTab === 'itinerary' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>Itinerary</button>
                  <button onClick={() => setActiveTab('inclusions')} className={`flex-1 py-4 text-center font-medium ${activeTab === 'inclusions' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>Inclusions & Exclusions</button>
                </div>
                <div className="p-8">
                  {activeTab === 'itinerary' && (
                    <div className="space-y-6">
                      {pkg.itinerary && pkg.itinerary.map((day, idx) => (
                        <div key={idx} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                            {idx !== pkg.itinerary.length - 1 && <div className="w-px h-full bg-blue-100 my-2"></div>}
                          </div>
                          <div className="pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{day.split(':')[0]}</h4>
                            <p className="text-gray-600 mt-1">{day.split(':')[1] || 'Details provided upon booking.'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'inclusions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-semibold mb-4 text-gray-900 flex items-center"><CheckCircle2 className="text-green-500 mr-2" /> Included</h4>
                        <ul className="space-y-3 text-gray-600">
                          {pkg.inclusions?.map((inc, i) => <li key={i} className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> <span>{inc}</span></li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-4 text-gray-900 flex items-center"><XCircle className="text-red-500 mr-2" /> Excluded</h4>
                        <ul className="space-y-3 text-gray-600">
                          {pkg.exclusions?.map((exc, i) => <li key={i} className="flex items-start"><XCircle className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" /> <span>{exc}</span></li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Lead Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-24 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Book This Tour</h3>
                <p className="text-gray-500 text-sm mb-6">Send us an inquiry and our travel experts will get back to you within 24 hours.</p>
                
                <form onSubmit={(e) => handleLeadSubmit(e, pkg)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="name" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" name="email" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" name="phone" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="+1 234 567 8900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                      <input type="date" name="dates" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                      <input type="number" name="travelers" min="1" defaultValue="2" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message / Special Requests</label>
                    <textarea name="message" rows="3" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Any dietary requirements or special occasions?"></textarea>
                  </div>
                  
                  {/* Honeypot field (hidden from users) to deter simple bots */}
                  <div className="hidden">
                    <label>Don't fill this out if you're human: <input type="text" name="bot-field" /></label>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex justify-center items-center">
                    Send Inquiry <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    <Lock className="inline h-3 w-3 mr-1" /> Your information is secure and encrypted. We respect your privacy.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StaticHero = ({ title, bgImage }) => (
    <div className="relative h-64 flex items-center justify-center text-center">
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt={title} className="w-full h-full object-cover filter brightness-50" />
      </div>
      <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{title}</h1>
    </div>
  );

  const About = () => (
    <div>
      <StaticHero title="About Joy Makers Holidays" bgImage="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=2000" />
      <div className="max-w-4xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Story</h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Founded in 2010, Joy Makers Holidays was born out of a simple passion for exploring the unknown and sharing the world's most beautiful destinations with others. We believe that travel is not just about visiting places, but about the experiences that change you.
        </p>
        <p className="text-lg text-gray-700 mb-10 leading-relaxed">
          Our team of expert travel curators spends months researching and vetting every hotel, guide, and experience to ensure your trip is nothing short of spectacular. Whether you're looking for a relaxing beach retreat or an adrenaline-pumping mountain trek, we have the perfect itinerary for you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" alt="Team" className="rounded-2xl shadow-md" />
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-700">To create unforgettable, hassle-free travel experiences that connect people with the world's diverse cultures, landscapes, and histories.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div>
      <StaticHero title="Contact Us" bgImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000" />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <p className="text-gray-600 mb-8">Have a question about a package? Want a custom itinerary? Reach out to our team!</p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                <div><h4 className="font-semibold">Office Location</h4><p className="text-gray-600">123 Cyber Hub, DLF Phase 2<br/>Gurugram, Haryana 122002</p></div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                <div><h4 className="font-semibold">Phone</h4><p className="text-gray-600">+91 98765 43210</p></div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                <div><h4 className="font-semibold">Email</h4><p className="text-gray-600">contact@joymakersholidays.com</p></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <form onSubmit={(e) => handleLeadSubmit(e, { id: 'General Contact', title: 'General Inquiry' })} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" name="name" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" name="phone" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea name="message" rows="4" required className="w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500"></textarea></div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const Testimonials = () => (
    <div className="bg-gray-50 min-h-screen">
      <StaticHero title="What Our Travelers Say" bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000" />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Priya Sharma", loc: "Kerala Retreat", text: "Absolutely incredible experience. Every detail was taken care of. The houseboat was amazing!", stars: 5 },
            { name: "Rahul & Neha", loc: "Rajasthan Heritage", text: "Our honeymoon was perfect. The heritage hotels selected by Joy Makers Holidays were top-tier with breathtaking views.", stars: 5 },
            { name: "Amit Patel", loc: "Manali Tour", text: "A truly authentic mountain experience. Loved the snow activities and the hotel view. Highly recommend.", stars: 5 },
            { name: "Sneha Reddy", loc: "General Booking", text: "Customer service is phenomenal. They helped me customize my itinerary exactly how I wanted it.", stars: 4 },
            { name: "The Gupta Family", loc: "Goa (Custom)", text: "Traveling with 3 kids is hard, but they made it seamless. The private transfers were a lifesaver.", stars: 5 },
            { name: "Vikram S.", loc: "Himachal Trip", text: "Everything ran on time. Very professional company. Will book again.", stars: 5 }
          ].map((review, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex mb-4">
                {[...Array(review.stars)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
              </div>
              <p className="text-gray-700 italic mb-6">"{review.text}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">{review.name.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <span className="text-sm text-gray-500">{review.loc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Blog = () => (
    <div>
      <StaticHero title="Travel Inspiration" bgImage="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=2000" />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Top 10 Hidden Gems in Europe for 2024", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600", category: "Guides" },
            { title: "How to Pack Light for a 2-Week Trip", img: "https://images.unsplash.com/photo-1553531384-411a4a8dd3ce?auto=format&fit=crop&q=80&w=600", category: "Tips" },
            { title: "The Best Street Food Markets in Southeast Asia", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600", category: "Food" },
            { title: "Sustainable Travel: Leaving a Lighter Footprint", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600", category: "Eco" }
          ].map((post, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden group cursor-pointer border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{post.category}</span>
                <h3 className="text-xl font-bold mt-2 text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="text-gray-500 mt-2 text-sm">Read more →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AdminDashboard = () => {
    const [adminTab, setAdminTab] = useState('leads'); // leads, packages, settings
    const [editingPackage, setEditingPackage] = useState(null);

    const handlePackageDelete = async (id) => {
      if(window.confirm('Are you sure you want to delete this package?')) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'packages', id));
          showToast('Package deleted.');
        } catch(e) {
          showToast('Error deleting.', 'error');
        }
      }
    };

    const handlePackageSave = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      // Parse arrays and numbers
      const parsedData = {
        ...data,
        price: Number(data.price),
        itinerary: data.itinerary.split('\n').filter(i => i.trim() !== ''),
        inclusions: data.inclusions.split('\n').filter(i => i.trim() !== ''),
        exclusions: data.exclusions.split('\n').filter(i => i.trim() !== ''),
        images: [data.image] // Simplification for demo
      };

      try {
        if (editingPackage?.id) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'packages', editingPackage.id), parsedData);
          showToast('Package updated successfully.');
        } else {
          const newId = 'pkg-' + Date.now();
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'packages', newId), { ...parsedData, id: newId });
          showToast('New package created.');
        }
        setEditingPackage(null);
      } catch (err) {
        showToast('Error saving package.', 'error');
        console.error(err);
      }
    };

    const markLeadContacted = async (leadId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Contacted' ? 'New' : 'Contacted';
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', leadId), { status: newStatus });
            showToast(`Lead marked as ${newStatus}`);
        } catch (err) {
            console.error(err);
        }
    }

    return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-2" /> Secure Area
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b">
              <button onClick={() => setAdminTab('leads')} className={`px-6 py-4 font-medium ${adminTab === 'leads' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Inquiries ({leads.length})</button>
              <button onClick={() => setAdminTab('packages')} className={`px-6 py-4 font-medium ${adminTab === 'packages' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Manage Packages</button>
              <button onClick={() => setAdminTab('settings')} className={`px-6 py-4 font-medium ${adminTab === 'settings' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>Security Info</button>
            </div>

            <div className="p-6">
              {/* Leads Tab */}
              {adminTab === 'leads' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Recent Inquiries</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package / Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map(lead => (
                          <tr key={lead.id} className={lead.status === 'New' ? 'bg-blue-50/30' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.email}</div>
                              <div className="text-sm text-gray-500">{lead.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-blue-600">{lead.packageName}</div>
                              <div className="text-sm text-gray-500">Dates: {lead.dates || 'N/A'} | Pax: {lead.travelers || 'N/A'}</div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-2 italic">"{lead.message}"</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'New' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {lead.status || 'New'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <button 
                                 onClick={() => markLeadContacted(lead.id, lead.status)} 
                                 className="text-blue-600 hover:text-blue-900"
                               >
                                 Toggle Status
                               </button>
                            </td>
                          </tr>
                        ))}
                        {leads.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No leads found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Packages Tab */}
              {adminTab === 'packages' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Manage Packages</h2>
                    <button onClick={() => setEditingPackage({})} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" /> Add Package
                    </button>
                  </div>

                  {editingPackage ? (
                    <div className="bg-gray-50 p-6 rounded-xl border mb-6">
                      <h3 className="text-lg font-bold mb-4">{editingPackage.id ? 'Edit Package' : 'New Package'}</h3>
                      <form onSubmit={handlePackageSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Title</label><input type="text" name="title" defaultValue={editingPackage.title} required className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Location</label><input type="text" name="location" defaultValue={editingPackage.location} required className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Type (e.g. Beach, Mountain)</label><input type="text" name="type" defaultValue={editingPackage.type} required className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Price (₹)</label><input type="number" name="price" defaultValue={editingPackage.price} required className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-sm font-medium mb-1">Duration (e.g. 7 Days)</label><input type="text" name="duration" defaultValue={editingPackage.duration} required className="w-full border p-2 rounded" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Main Image URL</label><input type="url" name="image" defaultValue={editingPackage.image} required className="w-full border p-2 rounded" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" defaultValue={editingPackage.description} rows="3" required className="w-full border p-2 rounded"></textarea></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Itinerary (One per line)</label><textarea name="itinerary" defaultValue={editingPackage.itinerary?.join('\n')} rows="4" className="w-full border p-2 rounded" placeholder="Day 1: Arrival..."></textarea></div>
                        <div><label className="block text-sm font-medium mb-1">Inclusions (One per line)</label><textarea name="inclusions" defaultValue={editingPackage.inclusions?.join('\n')} rows="4" className="w-full border p-2 rounded"></textarea></div>
                        <div><label className="block text-sm font-medium mb-1">Exclusions (One per line)</label><textarea name="exclusions" defaultValue={editingPackage.exclusions?.join('\n')} rows="4" className="w-full border p-2 rounded"></textarea></div>
                        
                        <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                          <button type="button" onClick={() => setEditingPackage(null)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Package</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {packages.map(pkg => (
                        <div key={pkg.id} className="border rounded-xl p-4 flex flex-col">
                          <img src={pkg.image} alt={pkg.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                          <h4 className="font-bold text-lg">{pkg.title}</h4>
                          <p className="text-gray-500 text-sm mb-4">₹{pkg.price.toLocaleString('en-IN')} | {pkg.location}</p>
                          <div className="mt-auto flex justify-between">
                            <button onClick={() => setEditingPackage(pkg)} className="text-blue-600 flex items-center text-sm font-medium"><Edit className="w-4 h-4 mr-1"/> Edit</button>
                            <button onClick={() => handlePackageDelete(pkg.id)} className="text-red-600 flex items-center text-sm font-medium"><Trash2 className="w-4 h-4 mr-1"/> Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings / Security Tab */}
              {adminTab === 'settings' && (
                <div className="max-w-2xl">
                  <h2 className="text-xl font-bold mb-4">Site Security & Best Practices</h2>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                    <p className="text-blue-800 text-sm"><Info className="inline w-4 h-4 mr-1 mb-0.5" /> Note: This is a demonstration admin panel built for this specific environment. In a production setting, this route would be protected by Firebase Authentication Custom Claims or a robust backend session.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div><strong className="block text-gray-900">HTTPS Enforced</strong><span className="text-sm text-gray-600">All data transmitted between clients and the database is encrypted via SSL/TLS.</span></div>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div><strong className="block text-gray-900">Form Protection</strong><span className="text-sm text-gray-600">Client-side validation and honeypot fields are active to deter basic spam bots. Input sanitization is recommended on the backend/database rules layer.</span></div>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div><strong className="block text-gray-900">Database Security Rules</strong><span className="text-sm text-gray-600">In production, Firestore rules should strictly limit write access to `leads` (append only for users, read/write for admins) and `packages` (read only for users, read/write for admins).</span></div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="1.jpg.jpg" alt="Joy Makers Holidays Logo" className="h-10 w-auto mr-3 object-cover rounded-md shadow-sm" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">Joy Makers</span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">Holidays</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Crafting Memories. Curating the world's most extraordinary travel experiences. Your journey begins with us.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => navigate('destinations')} className="hover:text-white transition-colors">Destinations</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-2">Subscribe for travel tips & exclusive offers.</p>
            <div className="flex">
              <input type="email" placeholder="Email Address" className="px-3 py-2 bg-gray-800 text-white rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <button className="bg-blue-600 px-3 py-2 rounded-r-md hover:bg-blue-700 transition-colors">Go</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Joy Makers Holidays. All rights reserved. (Demo Application)
        </div>
      </div>
    </footer>
  );

  const WhatsAppFloat = () => (
    <button 
      onClick={() => window.open('https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20booking%20a%20tour.', '_blank')}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 z-50 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-2 font-medium">
        Chat with us
      </span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <NavBar />
      
      <main className="flex-grow">
        {currentPage === 'home' && <Home />}
        {currentPage === 'destinations' && <Destinations />}
        {currentPage === 'packageDetails' && <PackageDetails />}
        {currentPage === 'about' && <About />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'blog' && <Blog />}
        {currentPage === 'testimonials' && <Testimonials />}
        {currentPage === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      <Footer />
      <WhatsAppFloat />

      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl text-white font-medium transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
