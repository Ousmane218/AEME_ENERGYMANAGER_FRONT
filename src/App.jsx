import { Routes, Route, Navigate } from 'react-router-dom';
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
import Users from './pages/admin/Users';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import UserReports from './pages/admin/UserReports';
import ErrorBoundary from './components/ErrorBoundary';

const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    return user?.isAdmin ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-primary font-semibold text-lg">Chargement...</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="flex h-screen overflow-hidden bg-gray-50/50">
                {/* Professional Sidebar */}
                <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="h-16 md:hidden bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50">
                    <img src="/logo.png" alt="AEME Logo" className="h-8 w-auto" />
                    <Navbar isMobileOnly />
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/reports" element={<ReportsList />} />
                            <Route path="/reports/new" element={<NewReport />} />
                            <Route path="/reports/:id" element={<ReportDetails />} />
                            <Route path="/meetings" element={<MeetingsList />} />
                            <Route path="/meetings/new" element={<NewMeeting />} />
                            <Route path="/meetings/:id" element={<MeetingRoom />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/profile" element={<Profile />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                            <Route 
                                path="/admin/users" 
                                element={<AdminRoute><Users /></AdminRoute>} 
                            />
                            <Route 
                                path="/admin/users/:userId" 
                                element={<AdminRoute><AdminUserDetail /></AdminRoute>} 
                            />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
        </ErrorBoundary>
    );
}

export default App;