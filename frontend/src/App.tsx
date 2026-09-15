import * as React from 'react';
import { CssBaseline, Box, Container } from '@mui/material';
import './App.css';
import { useState } from 'react';
import ButtonAppBar from './AppBar/App';
import HoverCard from './HoverCard/App';
import { Routes, Route } from 'react-router-dom';
import Search from './Search/App';
import RegisterDrawer from './RegisterDrawer.tsx/App';
import RegistrationSuccessful from './Registration_Successful/App';
import Help from './Help.tsx/App'
function Home() {
  
  return (
    <>

          <Box
            sx={{
              p: 4,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mt: '25vh',
            }}
          >
            <HoverCard
              title="Find Help"
              description="Any problem, find solution here"
              imageUrl="https://img.magnific.com/free-photo/tourists-go-up-hill-sunrise_1150-19692.jpg?semt=ais_hybrid&w=740&q=80"
              link="/Search"
            />

            <HoverCard
              title="Provide Help"
              description="Solve someone's problem"
              imageUrl="https://img.magnific.com/free-photo/tourists-go-up-hill-sunrise_1150-19692.jpg?semt=ais_hybrid&w=740&q=80"
              link="/Help"
            />
          </Box>

    </>
  );
}

function App() {
  const [registerOpen,setRegisterOpen] = useState(false)
  return (
    <div className="App">
            <CssBaseline />

      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            background:
              'linear-gradient(135deg, #F5F7FA 0%, #E8F1F5 100%)',
          }}
        >
          <ButtonAppBar onRegister={() => setRegisterOpen(true)} />
          <RegisterDrawer
            open={registerOpen}
            onClose={() => setRegisterOpen(false)}
          />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/Help" element={<Help/>}/>
        <Route path="/registration_successful" element={<RegistrationSuccessful/>} />
      </Routes>
              </Box>
      </Container>
    </div>
  );
}

export default App;