import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded shadow">
                <p>User list will go here.</p>
            </div>
        </div>
    );
}
