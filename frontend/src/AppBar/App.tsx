import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LoginIcon from '@mui/icons-material/Login'
import MenuIcon from '@mui/icons-material/Menu'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useEffect, useState, MouseEvent,useCallback } from 'react'
import axios from 'axios'

interface ButtonAppBarProps {
  onRegister: () => void;
}

export default function ButtonAppBar({ onRegister }: ButtonAppBarProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // State to manage the dropdown menu anchor element
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

 const checkAuthStatus = useCallback(async () => {
    if (localStorage.getItem('user')) {
      const userObj = JSON.parse(localStorage.getItem('user') ?? '{}')
      try {
        const userData = await axios.get(`https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/users/${userObj.user_id}`)
        if (userData.status === 200) {
          const name = userData.data.name || ''
          setFirstName(name.split(' ')[0] || '') // Added fixed index [0]
          setLastName(name.split(' ')[1] || '')  // Added fixed index [1]
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    } else {
      setFirstName('')
      setLastName('')
    }
  }, []) // Empty array means this function reference is created exactly once

  // 3. Now you can safely pass checkAuthStatus into the dependency array
  useEffect(() => {
    checkAuthStatus() // Runs on mount

    window.addEventListener('user-auth-change', checkAuthStatus)
    
    return () => {
      window.removeEventListener('user-auth-change', checkAuthStatus)
    }
  }, [checkAuthStatus])

  // Open dropdown
  const handleAvatarClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // Close dropdown
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user')
    setFirstName('')
    setLastName('')
    handleClose()
    // Optional: Redirect user or trigger parent state update here
  }

  // Determine if user data exists to show the avatar
  const hasUser = firstName || lastName
  // Extract initials (e.g., "John Doe" -> "JD")
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: "white", color: "#163A4D" }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Community Helper Portal
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasUser ? (
              <>
                {/* Avatar Button */}
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#163A4D', color: 'white' }}>
                    {initials}
                  </Avatar>
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* Fallback Auth Buttons */}
                <Button color="inherit" startIcon={<PersonAddIcon />} aria-label="Register" onClick={onRegister}>
                  Register
                </Button>
                <Button color="inherit" startIcon={<LoginIcon />} aria-label="Login">
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
