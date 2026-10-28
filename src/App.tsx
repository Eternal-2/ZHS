import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { DetailTourScreen } from './components/screens/DetailTourScreen';
import { DetailDestinasiScreen } from './components/screens/DetailDestinasiScreen';
import { BookingConfirmScreen } from './components/screens/BookingConfirmScreen';
import { PaymentQrisScreen } from './components/screens/PaymentQrisScreen';
import { PaymentSuccessScreen } from './components/screens/PaymentSuccessScreen';
import { BookingDetailScreen } from './components/screens/BookingDetailScreen';
import { LiveTourScreen } from './components/screens/LiveTourScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { VoucherScreen } from './components/screens/VoucherScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { HelpCenterScreen } from './components/screens/HelpCenterScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { SmartMatchView } from './components/SmartMatchView';
import { GuideDashboard } from './components/GuideDashboard';
import { DirectChatScreen } from './components/DirectChatScreen';
import { Navbar, BottomNav, DesktopFooter } from './components/Navbar';
import { AIChatbotWidget } from './components/AIChatbotWidget';
import { CancelBookingModal } from './components/screens/CancelBookingModal';
// Guide Registration & Verification
import { GuideRegisterScreen } from './components/screens/GuideRegisterScreen';
import {
  GuidePendingReviewScreen,
  GuideVerificationStatusScreen,
  GuideVerificationApprovedScreen,
  GuideFixDocumentsScreen
} from './components/screens/GuideVerificationScreens';
// Guide Booking Confirmation
import { GuideBookingRequestScreen } from './components/screens/GuideBookingRequestScreen';
// Guide Operational
import {
  GuideStartTourScreen,
  GuideTourSummaryScreen,
  GuideNoShowReportScreen,
  GuideDisputeScreen
} from './components/screens/GuideOperationalScreens';

export function App() {
  const { activeScreen, darkMode, catalogReady, initApp } = useAppStore();

  // Muat katalog dari Supabase dan pulihkan sesi login saat aplikasi dibuka
  useEffect(() => {
    void initApp();
  }, [initApp]);

  if (!catalogReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-[#19324d] text-sm font-semibold">
        Memuat Zam Zam Hidden Spot…
      </div>
    );
  }

  const isAuthScreen = activeScreen === 'welcome' || activeScreen === 'login' || activeScreen === 'register';
  const isGuideRegistrationScreen = (
    activeScreen === 'guide-register' ||
    activeScreen === 'guide-pending-review' ||
    activeScreen === 'guide-verification-status' ||
    activeScreen === 'guide-verification-approved' ||
    activeScreen === 'guide-fix-documents'
  );
  const isDedicatedScreen = isAuthScreen || activeScreen === 'direct-chat' || isGuideRegistrationScreen;

  const renderScreenContent = () => {
    switch (activeScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'detail-tour':
        return <DetailTourScreen />;
      case 'detail-destinasi':
        return <DetailDestinasiScreen />;
      case 'booking-confirm':
        return <BookingConfirmScreen />;
      case 'payment-qris':
        return <PaymentQrisScreen />;
      case 'payment-success':
        return <PaymentSuccessScreen />;
      case 'booking-detail':
        return <BookingDetailScreen />;
      case 'live-tour':
        return <LiveTourScreen />;
      case 'review':
        return <ReviewScreen />;
      case 'voucher':
      case 'voucher-success':
        return <VoucherScreen />;
      case 'profile':
      case 'edit-profile':
        return <ProfileScreen />;
      case 'help-center':
      case 'contact-admin':
      case 'admin-chat':
        return <HelpCenterScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'smart-match':
        return <SmartMatchView />;
      case 'guide-dashboard':
        return <GuideDashboard />;
      case 'direct-chat':
        return <DirectChatScreen />;
      // Guide Registration & Verification Flow
      case 'guide-register':
        return <GuideRegisterScreen />;
      case 'guide-pending-review':
        return <GuidePendingReviewScreen />;
      case 'guide-verification-status':
        return <GuideVerificationStatusScreen />;
      case 'guide-verification-approved':
        return <GuideVerificationApprovedScreen />;
      case 'guide-fix-documents':
        return <GuideFixDocumentsScreen />;
      // Guide Booking Confirmation Flow
      case 'guide-booking-request':
      case 'guide-reject-booking':
        return <GuideBookingRequestScreen />;
      // Guide Operational Flow
      case 'guide-start-tour':
      case 'guide-tour-active':
        return <GuideStartTourScreen />;
      case 'guide-tour-summary':
        return <GuideTourSummaryScreen />;
      case 'guide-no-show-report':
        return <GuideNoShowReportScreen />;
      case 'guide-dispute':
        return <GuideDisputeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}>

      {/* Top Navbar: displayed on main non-auth/non-chat screens */}
      {!isDedicatedScreen && <Navbar />}

      {/* Main Screen Body: 100% naturally responsive without synthetic simulator frame */}
      <main className="flex-1 w-full">
        {renderScreenContent()}
      </main>

      {/* Desktop Footer on non-auth screens */}
      {!isDedicatedScreen && <DesktopFooter />}

      {/* Mobile Bottom Navigation Bar: visible on mobile viewports */}
      {!isDedicatedScreen && <BottomNav />}

      {/* Global Modals & AI Chatbot Widget (hidden on welcome and auth screens) */}
      {!isDedicatedScreen && <AIChatbotWidget />}
      <CancelBookingModal />

    </div>
  );
}

export default App;
