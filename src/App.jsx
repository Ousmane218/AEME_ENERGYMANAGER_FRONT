import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/dashboard';
import ReportsList from './pages/reports/reportsList';
import NewReport from './pages/reports/newReport';
import ReportDetails from './pages/reports/reportDetails';
import MeetingsList from './pages/meetings/meetingsList';
import NewMeeting from './pages/meetings/newMeeting';
import MeetingRoom from './pages/meetings/meetingRoom';
import Chat from './pages/chat/Chat';
import Profile from './pages/Profile';
import MapPage from './pages/MapPage';
import LandingPage from './pages/LandingPage';
import Users from './pages/admin/Users';
import Structures from './pages/admin/Structures';
import Ministeres from './pages/admin/Ministeres';
import Cohortes from './pages/admin/Cohortes';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import UserReports from './pages/admin/UserReports';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { cn } from './lib/utils';

import RoleGuard from './components/RoleGuard';
import NotificationBell from './components/NotificationBell';

const ProtectedLayout = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const isChat = location.pathname === '/chat';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-primary font-semibold text-lg">Chargement...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
            {/* Professional Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="h-16 md:hidden bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50">
                    <img src="/logo.png" alt="AEME Logo" className="h-8 w-auto" />
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Navbar isMobileOnly />
                    </div>
                </header>

                <div className="hidden md:flex justify-end px-8 pt-4 pb-0 shrink-0">
                    <NotificationBell />
                </div>

                <main className={cn(
                    "flex-1 overflow-hidden",
                    !isChat && "p-4 md:p-8 lg:p-12 overflow-y-auto"
                )}>
                    <div className={cn(
                        "h-full",
                        !isChat && "w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto"
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route path="/*" element={
                    <ProtectedLayout>
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/reports" element={<RoleGuard allowedRoles={['ADMIN', 'DAGE', 'GESTIONNAIRE']}><ReportsList /></RoleGuard>} />
                            <Route path="/reports/new" element={<RoleGuard allowedRoles={['GESTIONNAIRE']}><NewReport /></RoleGuard>} />
                            <Route path="/reports/:id" element={<RoleGuard allowedRoles={['ADMIN', 'DAGE', 'GESTIONNAIRE']}><ReportDetails /></RoleGuard>} />
                            <Route path="/meetings" element={<RoleGuard allowedRoles={['ADMIN', 'DAGE', 'GESTIONNAIRE']}><MeetingsList /></RoleGuard>} />
                            <Route path="/meetings/new" element={<RoleGuard allowedRoles={['ADMIN']}><NewMeeting /></RoleGuard>} />
                            <Route path="/meetings/:id" element={<RoleGuard allowedRoles={['ADMIN', 'DAGE', 'GESTIONNAIRE']}><MeetingRoom /></RoleGuard>} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/profile" element={<Profile />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                            <Route
                                path="/admin/users"
                                element={<RoleGuard allowedRoles={['ADMIN']}><Users /></RoleGuard>}
                            />
                            <Route
                                path="/admin/structures"
                                element={<RoleGuard allowedRoles={['ADMIN']}><Structures /></RoleGuard>}
                            />
                            <Route
                                path="/admin/ministeres"
                                element={<RoleGuard allowedRoles={['ADMIN']}><Ministeres /></RoleGuard>}
                            />
                            <Route
                                path="/admin/cohortes"
                                element={<RoleGuard allowedRoles={['ADMIN']}><Cohortes /></RoleGuard>}
                            />
                            <Route
                                path="/admin/users/:userId"
                                element={<RoleGuard allowedRoles={['ADMIN']}><AdminUserDetail /></RoleGuard>}
                            />
                        </Routes>
                    </ProtectedLayout>
                } />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
