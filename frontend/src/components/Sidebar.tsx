import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Divider,
    Avatar,
    Stack
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { RootState } from '../store/store';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (onClose) onClose();
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        if (onClose) onClose();
    };

    const menuItems = [
        { text: 'Purchase Approval', icon: <DashboardIcon />, path: '/dashboard', show: true },
        // Removed New Requisition link as per request
        { text: 'Users', icon: <PeopleIcon />, path: '/users', show: user?.role === 'ADMIN' },
    ];

    return (
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Logo Area */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    Requisition App
                </Typography>
            </Box>
            <Divider />

            {/* User Profile Summary */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {user?.fullName || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ textTransform: 'capitalize' }}>
                        {user?.role?.toLowerCase() || 'Role'}
                    </Typography>
                </Box>
            </Box>
            <Divider />

            {/* Navigation Items */}
            <List sx={{ flexGrow: 1, py: 0 }}>
                {menuItems.map((item) => (
                    item.show && (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 0,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.contrastText',
                                        },
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'text.secondary', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    )
                ))}
            </List>

            <Divider />

            {/* Footer Items */}
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}
