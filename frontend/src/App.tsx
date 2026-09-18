import * as React from 'react';
import { useState } from 'react';
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
} from '@mui/material';

import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SearchIcon from '@mui/icons-material/Search';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import './App.css';

import ButtonAppBar from './AppBar/App';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Search from './Search/App';
import RegisterDrawer from './RegisterDrawer.tsx/App';
import RegistrationSuccessful from './Registration_Successful/App';
import Help from './Help.tsx/App';


function ActionCard({
  title,
  description,
  icon,
  image,
  buttonText,
  link,
  variant,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  buttonText: string;
  link: string;
  variant: 'find' | 'provide';
}) {
  const navigate = useNavigate();

  return (
    <Card
      className={`action-card ${variant}`}
      onClick={() => navigate(link)}
    >
      {/* Image */}
      <Box className="card-image-wrapper">
        <img src={image} alt={title} className="card-image" />

        <Box className="card-image-overlay" />

        <Box className="card-icon">
          {icon}
        </Box>
      </Box>

      {/* Content */}
      <CardContent className="action-card-content">

        <Typography
          variant="h4"
          className="action-card-title"
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          className="action-card-description"
        >
          {description}
        </Typography>

        <Button
          className="action-card-button"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(link);
          }}
        >
          {buttonText}
        </Button>

      </CardContent>
    </Card>
  );
}


function Home() {

  return (
    <Box className="home">

      {/* Decorative background */}
      <Box className="background-circle circle-one" />
      <Box className="background-circle circle-two" />

      {/* HERO SECTION */}
      <Box className="hero-section">

        <Box className="hero-badge">
          <VolunteerActivismIcon />
          <span>Stronger communities start with us</span>
        </Box>

        <Typography
          variant="h1"
          className="hero-title"
        >
          Helping hands.
          <br />
          <span>One community.</span>
        </Typography>

        <Typography
          variant="h6"
          className="hero-subtitle"
        >
          Find the help you need or lend a helping hand
          to someone around you.
        </Typography>

      </Box>


      {/* ACTION CARDS */}
      <Box className="cards-section">

        <ActionCard
          title="Find Help"
          description="Need a helping hand? Tell us what you need and discover people who can help you."
          buttonText="Find someone to help"
          link="/Search"
          variant="find"
          icon={<SearchIcon />}
          image="https://img.magnific.com/free-photo/tourists-go-up-hill-sunrise_1150-19692.jpg?semt=ais_hybrid&w=740&q=80"
        />

        <ActionCard
          title="Provide Help"
          description="Have time or skills to spare? Connect with someone nearby who needs your support."
          buttonText="Offer your help"
          link="/Help"
          variant="provide"
          icon={<HandshakeIcon />}
          image="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80"
        />

      </Box>


      {/* COMMUNITY STATS */}
     <Box className="community-section">

  <Box className="community-line" />

  <Box className="community-stats">

    <Box className="stat">
      <PeopleAltIcon />

      <Box>
        <Typography className="stat-number">
          Community
        </Typography>

        <Typography className="stat-label">
          People helping people
        </Typography>
      </Box>
    </Box>


    <Box className="stat">
      <VolunteerActivismIcon />

      <Box>
        <Typography className="stat-number">
          Together
        </Typography>

        <Typography className="stat-label">
          Every helping hand matters
        </Typography>
      </Box>
    </Box>


    <Box className="stat">
      <HandshakeIcon />

      <Box>
        <Typography className="stat-number">
          Connected
        </Typography>

        <Typography className="stat-label">
          Help when it matters most
        </Typography>
      </Box>
    </Box>

  </Box>

</Box>

    </Box>
  );
}


function App() {

  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="App">

      <CssBaseline />

      <Container
        maxWidth="xl"
        disableGutters
        className="app-container"
      >

        <ButtonAppBar
          onRegister={() => setRegisterOpen(true)}
        />

        <RegisterDrawer
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
        />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/Search"
            element={<Search />}
          />

          <Route
            path="/Help"
            element={<Help />}
          />

          <Route
            path="/registration_successful"
            element={<RegistrationSuccessful />}
          />

        </Routes>

      </Container>

    </div>
  );
}

export default App;