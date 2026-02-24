import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import PaywallModal from './components/PaywallModal';
import { auth, db, signInWithGoogle } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [currentMenu, setCurrentMenu] = useState('My Data');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [kpcBalance, setKpcBalance] = useState(0);
  const [monthlyQuota, setMonthlyQuota] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
              kpcBalance: 500,
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
      monthlyQuota: newQuota
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030303] text-white font-mono overflow-hidden relative">
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
        />

        {/* Central Drive Panel (Rounded Rectangle) */}
        <main className="flex-1 m-4 ml-0 bg-[#0a0a0a]/90 backdrop-blur-xl border border-cyan-900/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">

          <div className="content-scroll p-6 lg:p-8">
            <h1 className="text-2xl text-gray-100 font-normal tracking-wide mb-8 pl-2">
              {currentMenu === 'My Data' ? (user ? `Welcome, ${user.displayName.split(' ')[0]}` : 'Welcome to Grid Access') : currentMenu}
            </h1>

            <FileList currentMenu={currentMenu} />
          </div>

        </main>
      </div>

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
