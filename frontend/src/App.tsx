import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRequisition from './pages/CreateRequisition';
import RegisterOrganization from './pages/RegisterOrganization';
import UserManagement from './pages/UserManagement';
import ViewRequisition from './pages/ViewRequisition';
import EditRequisition from './pages/EditRequisition';
import Profile from './pages/Profile';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useSelector((state: RootState) => state.auth);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register-organization" element={<RegisterOrganization />} />
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="create"
                        element={
                            <ProtectedRoute>
                                <CreateRequisition />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute>
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="requisitions/:id"
                        element={
                            <ProtectedRoute>
                                <ViewRequisition />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="edit/:id"
                        element={
                            <ProtectedRoute>
                                <EditRequisition />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
