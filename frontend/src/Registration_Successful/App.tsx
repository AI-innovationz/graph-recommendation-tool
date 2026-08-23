import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CheckCircleOutlined as CheckCircleOutlinedIcon } from '@mui/icons-material';



export default function RegistrationSuccessful() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  // Retrieve the target return route passed from the form
  const returnTo = location.state?.returnTo || '/';

  useEffect(() => {
    // 1. Set up a regular 1-second interval to tick the UI countdown numbers down
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // 2. Set up a 5-second timeout to perform the actual redirect execution
    const redirectTimeout = setTimeout(() => {
      navigate(returnTo);
    }, 5000);

    // Clean up both timers if the component unmounts prematurely
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [navigate, returnTo]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      {/* Big Green Tick */}
      <CheckCircleOutlinedIcon sx={{ fontSize: 100, color: '#4caf50' }} />
      
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#163A4D' }}>
        Registration Successful!
      </Typography>
      
      <Typography variant="body1" color="text.secondary">
        Redirecting you back to where you left off in <strong>{countdown}</strong> seconds...
      </Typography>
    </Box>
  );
}
