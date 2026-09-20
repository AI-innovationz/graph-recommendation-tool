import React, { useEffect, useState} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

interface RegisterDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

function RegisterDrawer({ open, onClose }: RegisterDrawerProps) {
  // Moved inside the component function
  const [successMessage, setSuccessMessage] = useState('');
  const [loading,setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [register, setRegister] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/';
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();
    setLoading(true)

    try {
      // Fixed OpenStreetMap endpoint URL (nominatim sub-domain is required for searches)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalcode: formData.pinCode,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'Community-Helper-React-App'
        }
      });

      let latitude = "";
      let longitude = "";
      
      if (response && response.data && response.data.length > 0) {
        latitude = response.data[0].lat;
        longitude = response.data[0].lon;
      }

      const userRes = await axios.post(
        'https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/users/',
        {
          name: formData.name,
          phone: formData.phone,
          latitude: latitude,
          longitude: longitude
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (userRes.status === 200 || userRes.status === 201) {
        setLoading(false)
        console.log(userRes.data,"user--------")
        localStorage.setItem('user', JSON.stringify(userRes.data));
        onClose();
        // 1. Show the success notification
        // alert('Registered Successfully');
        // setTimeout(()=>{
          window.dispatchEvent(new Event('user-auth-change'));
          navigate('/registration_successful', { state: { returnTo: redirectPath } });
        // 2. Hide the drawer component
        
        // },1500)
        
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 500 }, p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join your community and help others.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
            <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth required />
            <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
            <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth multiline rows={2} required />
            <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth required />
            <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth required />
            <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth required />
            <TextField label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleChange} fullWidth required />
            <Button type="submit" variant="contained" size="large" sx={{ backgroundColor: "#c79999", mt: 2, py: 1.5, borderRadius: 2 }}>
              {loading?'Registering...':'Register'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

export default RegisterDrawer;
