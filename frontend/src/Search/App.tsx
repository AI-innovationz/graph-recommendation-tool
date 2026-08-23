import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import SearchIcon from '@mui/icons-material/Search';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';

import { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

export default function Search() {
  const [text, setText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [loading, setLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleClick = () => {
     
    if (!text.trim()) return;

    setSearchText(text);
    setSearchTrigger(prev => prev + 1);
  };

  // Change loading message like an AI chat
  useEffect(() => {
    if (!loading) return;

    const messages = [
      'Thinking...',
      'Finding the best recommendations...',
      'Checking relevant helpers...',
      'Ranking matches...',
    ];

    let index = 0;

    // Reset to first message whenever loading starts
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  // Search API
  useEffect(() => {
    if (!searchText) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axios.post(
          'http://localhost:8000/api/v1/requests',
          {
            user_id: '',
            request_type: [],
            description: searchText,
            latitude: 23.68,
            longitude: 89.95,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(typeof response.data);

        if (response.status === 200) {
          const reqID = response.data?.request_id;

          const searchRes = await axios.post(
            `http://localhost:8000/api/v1/requests/${reqID}/recommendations`
          );

          if (searchRes.status === 200) {
            console.log(
              searchRes.data,
              'search result------>'
            );

            setSearchResult(searchRes.data);
          }
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTrigger]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      {/* Search bar */}
      <TextField
        placeholder="Search..."
        size="medium"
        fullWidth
        value={text}
        sx={{
          maxWidth: 560,

          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            height: 56,

            '&:hover fieldset': {
              borderColor: 'primary.main',
            },

            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClick}
                  edge="end"
                  aria-label="search"
                  disabled={!text.trim() || loading}
                  sx={{
                    cursor: text.trim()
                      ? 'pointer'
                      : 'default',

                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <SearchIcon
                    sx={{
                      color: 'text.secondary',
                    }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleClick();
          }
        }}
      />

      {/* AI-style loading message */}
      {loading && (
        <Box
          sx={{
            width: '100%',
            maxWidth: 560,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 1,
            px: 1,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            {loadingMessage}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 0.3,
            }}
          >
            <Box className="dot">•</Box>
            <Box className="dot">•</Box>
            <Box className="dot">•</Box>
          </Box>
        </Box>
      )}

      {/* Search results */}
{!loading && searchResult.length > 0 && (
  <Box
    sx={{
      width: '100%',
      maxWidth: 700,
      mt: 3,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      },
      gap: 2,
    }}
  >
    {searchResult.map((result, index) => (
      <Box
        key={index}
        sx={{
          position: 'relative',
          minHeight: 110,
          borderRadius: '20px',
          overflow: 'hidden',

          backgroundColor: '#555',
          border: '1px solid silver',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          transition: 'all 0.25s ease',

          '&:hover': {
            backgroundColor: '#707070',
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          },

          '&:hover .result-text': {
            opacity: 0.15,
          },

          '&:hover .card-overlay': {
            opacity: 1,
          },
        }}
      >
        {/* Original result */}
        <Typography
          className="result-text"
          variant="body2"
          sx={{
            px: 2,
            color: 'white',
            fontWeight: 500,
            transition: 'opacity 0.25s ease',
          }}
        >
          {typeof result === 'string'
            ? result
            : result}
        </Typography>

        {/* Hover overlay */}
        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            inset: 0,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            px: 1.5,

            opacity: 0,
            transition: 'opacity 0.25s ease',

            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {/* Like / Dislike */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.3,
            }}
          >
            <IconButton
              size="small"
              aria-label="like"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Liked:', result);
              }}
              sx={{
                color: 'white',

                '&:hover': {
                  color: '#81C784',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <ThumbUpOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              aria-label="dislike"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Disliked:', result);
              }}
              sx={{
                color: 'white',

                '&:hover': {
                  color: '#E57373',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <ThumbDownOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Find Helpers */}
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();

              console.log(
                'Finding helpers for:',
                result
              );

              // Call your helper API here
            }}
            sx={{
              backgroundColor: '#3E2723',
              color: 'white',
              width:'150vh',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              marginLeft:'2vh',
              borderRadius: '20px',

              px: 1.5,

              whiteSpace: 'nowrap',

              '&:hover': {
                backgroundColor: '#5D4037',
              },
            }}
          >
            Tap to find Helpers
          </Button>

          {/* Keeps the center button visually centered */}
          <Box
            sx={{
              width: 64,
            }}
          />
        </Box>
      </Box>
    ))}
  </Box>
)}
    </Box>
  );
}