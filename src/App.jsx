import { useAuth } from './context/AuthContext';
import Navbar from './components/navbar';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-[#003366] font-semibold text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
    </div>
  );
}

export default App;