import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

interface HoverCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export default function HoverCard({ title, description, imageUrl, link }: HoverCardProps) {
  return (
    <Card sx={{
    width: 380,
    height: 250,
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    },
  }}>
      {/* Container for Image and Hover Overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={title}
          sx={{
            transition: 'filter 0.3s ease',
            // Apply blur when the parent Card is hovered
            '.MuiCard-root:hover &': {
              filter: 'blur(4px)',
            },
          }}
        />
        
        {/* Hover Overlay with Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // subtle darkening to make button stand out
            opacity: 0,
            transition: 'opacity 0.3s ease',
            // Fade in when the parent Card is hovered
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <Button variant="contained" color="primary" href={link}>
            View Page
          </Button>
        </Box>
      </Box>

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}
