import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import PaywallModal from './components/PaywallModal';
import MediaPreview from './components/MediaPreview';
import LandingPage from './components/LandingPage';
import Settings from './components/Settings';
import { auth, db, signInWithGoogle } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [currentMenu, setCurrentMenu] = useState('My Data');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [kpcBalance, setKpcBalance] = useState(0);
  const [monthlyQuota, setMonthlyQuota] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpcStatus, setKpcStatus] = useState('active');
  const [autoDeleteDate, setAutoDeleteDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Cleanup previous listener if any
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);

        // Ensure user document exists
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              kpcBalance: 0,
              monthlyQuota: 1,
              email: currentUser.email,
              displayName: currentUser.displayName
            });
          }

          // Real-time listener
          unsubscribeDoc = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setKpcBalance(data.kpcBalance || 0);
              setMonthlyQuota(data.monthlyQuota || 1);
              setKpcStatus(data.kpc_status || 'active');
              setAutoDeleteDate(data.auto_delete_date || null);
            }
          }, (error) => {
            console.error("Firestore Listener Error:", error);
          });
        } catch (err) {
          console.error("Firestore Initial Sync Error:", err);
        }

        setLoading(false);
      } else {
        setKpcBalance(0);
        setMonthlyQuota(1);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Emergency Countdown Timer
  useEffect(() => {
    if (kpcStatus !== 'suspended' || !autoDeleteDate) return;

    const timer = setInterval(() => {
      const distance = autoDeleteDate - Date.now();
      if (distance < 0) {
        setTimeLeft("PURGING...");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}n ${hours}ó ${minutes}p ${seconds}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [kpcStatus, autoDeleteDate]);

  const handleTopUp = async (amount) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    // In a real app, this would be a server-side transaction
    await setDoc(userRef, { kpcBalance: kpcBalance + amount }, { merge: true });
    alert(`Purchase successful! Added ${amount.toLocaleString()} KPC.`);
  };

  const handleApplyConfig = async (newQuota, cost) => {
    if (!user) return;
    if (kpcBalance < cost) {
      alert("Inszignifikáns KPC egyenleg!");
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      kpcBalance: kpcBalance - cost,
      monthlyQuota: newQuota,
      lastBillingDate: Date.now()
    }, { merge: true });
    alert(`Configuration applied! Storage updated to ${newQuota} GB.`);
  };

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#030303] flex items-center justify-center">
        <div className="text-cyan-500 animate-pulse font-mono tracking-widest text-xl">INITIALIZING GRID...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={signInWithGoogle} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030303] text-white font-mono overflow-hidden relative">
      {/* Emergency Protocol Banner */}
      {kpcStatus === 'suspended' && (
        <div className="bg-rose-600 text-white py-2 px-4 text-center font-bold animate-pulse text-[10px] md:text-xs tracking-widest flex flex-wrap items-center justify-center gap-x-6 gap-y-2 z-[100] border-b border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <span className="uppercase">Veszélyhelyzeti Protokoll: Fiók Zárolva (0 KPC)</span>
          </div>
          <div className="bg-black/20 border border-white/30 px-4 py-1 rounded-full font-mono">
            ADATMEGSEMMISÍTÉS: <span className="text-yellow-300">{timeLeft}</span>
          </div>
          <button
            onClick={() => setIsPaywallOpen(true)}
            className="bg-white text-rose-600 px-6 py-1 rounded-full hover:bg-rose-100 transition-all shadow-lg text-[10px] active:scale-95"
          >
            EGRIENLEGFELTÖLTÉS
          </button>
        </div>
      )}

      {/* Background Visuals */}
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      {/* Top Header */}
      <Header
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={handleSignOut}
        kpcBalance={kpcBalance}
        onOpenStore={() => setIsPaywallOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentMenu={currentMenu}
          setCurrentMenu={setCurrentMenu}
          onOpenStore={() => setIsPaywallOpen(true)}
          kpcBalance={kpcBalance}
          monthlyQuota={monthlyQuota}
          kpcStatus={kpcStatus}
        />

        {/* Central Drive Panel (Rounded Rectangle) */}
        <main className="flex-1 m-4 ml-0 bg-[#0a0a0a]/90 backdrop-blur-xl border border-cyan-900/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">

          <div className="content-scroll p-6 lg:p-8">
            <h1 className="text-2xl text-gray-100 font-normal tracking-wide mb-8 pl-2">
              {currentMenu === 'Settings' ? 'System Settings' : (currentMenu === 'My Data' ? (user ? `Welcome, ${user.displayName.split(' ')[0]}` : 'Welcome to Grid Access') : currentMenu)}
            </h1>

            {currentMenu === 'Settings' ? (
              <Settings
                user={user}
                kpcStatus={kpcStatus}
                balance={kpcBalance}
                onUpgrade={() => setIsPaywallOpen(true)}
              />
            ) : (
              <FileList
                currentMenu={currentMenu}
                user={user}
                kpcStatus={kpcStatus}
                onPreview={(item) => setPreviewItem(item)}
              />
            )}
          </div>

        </main>
      </div>

      {/* Media Preview Overlay */}
      {previewItem && (
        <MediaPreview
          item={previewItem}
          uid={user?.uid}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* KPC Store Modal */}
      {isPaywallOpen && (
        <PaywallModal
          kpcBalance={kpcBalance}
          currentQuota={monthlyQuota}
          onClose={() => setIsPaywallOpen(false)}
          onTopUp={handleTopUp}
          onApplyConfig={handleApplyConfig}
        />
      )}
    </div>
  );
}

export default App;
