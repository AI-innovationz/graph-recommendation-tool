import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';  
import ThumbDownIcon from '@mui/icons-material/ThumbDown';  
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';

import SearchIcon from '@mui/icons-material/Search';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import axios from 'axios';

import './App.css';

type Helper = {
  original_help: any;
  helper: boolean;
  user_id: string;
  phone: string;
  latitude: number;
  longitude: number;
  name: string;
};

interface FeedbackItem {
  start: string;
  final_node: string;
  score: number;
  feedback?: number;
}

type HelpersMap = {
  [recommendation: string]: Helper[];
};

type LikeMap={
  [recommendation:string]:boolean
}

export default function Search() {
  const [text, setText] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const [searchResult, setSearchResult] = useState<string[]>([]);

  const [loadingMessage, setLoadingMessage] =
    useState<string>('Thinking...');

  const [loading, setLoading] = useState<boolean>(false);

  const [searchTrigger, setSearchTrigger] = useState<number>(0);
 const [searchRec, setSearchRec] = useState<[string[], FeedbackItem[]]>([[], []]);

  /*
   * Stores helpers for each recommendation.
   *
   * Example:
   *
   * {
   *   ambulance: [helper1, helper2],
   *   medicine: [helper3]
   * }
   */
  const [helpers, setHelpers] = useState<HelpersMap>({});

  /*
   * Which recommendation is currently being checked
   * for helpers.
   */
  const [helperLoading, setHelperLoading] =
    useState<string | null>(null);

  /*
   * Modal state
   */
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<string | null>(null);

  const [liked,setLiked] = useState<LikeMap>({})
  const [dislike,setDisliked] = useState<LikeMap>({})
 

  /*
   * Search button / Enter
   */
  const handleClick = () => {
    const trimmedText = text.trim();

    if (!trimmedText || loading) {
      return;
    }

    setSearchText(trimmedText);
    setSearchTrigger((prev) => prev + 1);
  };

  /*
   * Get helpers for ONE recommendation.
   *
   * Backend response:
   *
   * [
   *   [
   *     {
   *       helper: true,
   *       user_id: "...",
   *       phone: "...",
   *       latitude: 23.67,
   *       name: "Poushali2",
   *       longitude: 89.97
   *     },
   *     ["ambulance"]
   *   ]
   * ]
   */
 

  /*
   * Open helper modal
   */
  const handleFeedback = async(recommendation:string,fback:number)=>{
       console.log(searchRec[0],"searchrec- 1----")
       let feedbackBody:FeedbackItem [] = []
       try{
        searchRec[1]?.forEach((element: FeedbackItem) => {
          console.log(element,"element---")
          if(searchRec[0]?.includes(element.final_node)){
            if(element.final_node === recommendation){
              element.feedback = fback
            }
            console.log(element,"element----")
            feedbackBody.push(element)
            
          }
          
        });
      }catch(e){
        console.log(e,"error found ------")
      }
        console.log(feedbackBody,"feedbackbody in handlefeedback")
        const feedback = await axios.post(`http://localhost:8000/api/v1/requests/feedback`,{feedbackBody})

  }

  const handleOpenHelpers = async(recommendation: string) => {
    setSelectedRecommendation(recommendation);

    await handleFeedback(recommendation,0)

  
  };

  /*
   * Close helper modal
   */
  const handleCloseHelpers = () => {
    setSelectedRecommendation(null);
  };

const handleLike = async (recommendation: string) => {
setLiked(prev => ({
  ...prev,
  [recommendation]: !prev[recommendation],
}));

setDisliked(prev => ({
  ...prev,
  [recommendation]: false,
}));

  await handleFeedback(recommendation, 1);
};

const handleDislike = async (recommendation: string) => {
  setDisliked(prev => ({
  ...prev,
  [recommendation]: !prev[recommendation],
}));

setLiked(prev => ({
  ...prev,
  [recommendation]: false,
}));

  await handleFeedback(recommendation, -1);
};
  /*
   * AI-style search loading messages
   */
  useEffect(() => {
    if (!loading) {
      return;
    }

    const messages = [
      'Thinking...',
      'Finding the best recommendations...',
      'Checking relevant helpers...',
      'Ranking matches...',
    ];

    let index = 0;

    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [loading]);

  /*
   * Search API
   */
  useEffect(() => {
    if (!searchText) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Clear previous results and helpers
        setSearchResult([]);
        setHelpers({});

        /*
         * Create request
         */
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

        if (response.status !== 200) {
          return;
        }

        const reqID = response.data?.request_id;

        if (!reqID) {
          console.error(
            'Request ID not found:',
            response.data
          );
          return;
        }

        /*
         * Get recommendations
         */
        const searchRes = await axios.post(
          `http://localhost:8000/api/v1/requests/${reqID}/recommendations`
        );
        
        
        if (searchRes.status !== 200) {
          return;
        }
          console.log(
          'Recommendation response:',
          searchRes.data
        );
        let feedbackBody:FeedbackItem [] = []
        setSearchRec(searchRes.data)
        console.log(searchRes.data,"searched data----")
        searchRes.data[1]?.forEach((element: FeedbackItem) => {
          console.log(element.final_node,"FINAL NODE----")
          if(searchRes.data[0]?.includes(element.final_node)){
            console.log("found-------")
            element.feedback = 0
            feedbackBody.push(element)
            
          }
        
        
          
        });

        console.log(feedbackBody,"feedbackBody------>")
        const feedback = await axios.post(`http://localhost:8000/api/v1/requests/feedback`,{feedbackBody})
        


        /*
         * Support both:
         *
         * [
         *   "ambulance",
         *   "medicine"
         * ]
         *
         * and:
         *
         * [
         *   [
         *     "ambulance",
         *     "medicine"
         *   ]
         * ]
         */
        const recommendations = Array.isArray(
          searchRes.data?.[0]
        )
          ? searchRes.data[0]
          : searchRes.data;

        const formattedResults = recommendations.filter(
          (item: unknown): item is string =>
            typeof item === 'string'
        );
        console.log(formattedResults,"formattd result---------")
        setSearchResult(formattedResults);

        /*
         * IMPORTANT:
         *
         * Check helper availability for every recommendation.
         *
         * This allows us to decide whether the
         * "Tap to see Helpers" button should exist.
         */
        const helperResults: HelpersMap = {};
        const likeRes:LikeMap={}
        const dislikeRes:LikeMap={}
        await Promise.all(
          formattedResults.map(async (recommendation:string) => {
            try {
              const helperResponse = await axios.post(
                'http://localhost:8000/api/v1/requests/match',
                {
                  request: recommendation,
                }
              );

              likeRes[recommendation]=false
              dislikeRes[recommendation]=false
              const helperList: Helper[] =
                Array.isArray(helperResponse.data)
                  ? helperResponse.data
                      .map((item: any) => item?.[0])
                      .filter(
                        (helper: any): helper is Helper =>
                          helper &&
                          typeof helper === 'object' &&
                          helper.helper === true
                      )
                  : [];

              helperResults[recommendation] = helperList;

            } catch (error) {
              console.error(
                `Failed to find helpers for ${recommendation}:`,
                error
              );

              helperResults[recommendation] = [];
            }
          })
        );

        setHelpers(helperResults);
        setLiked(likeRes)
        setDisliked(dislikeRes)
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTrigger, searchText]);

  /*
   * Helpers currently selected in modal
   */
  const selectedHelpers = selectedRecommendation
    ? helpers[selectedRecommendation] || []
    : [];

  return (
    <>
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

        {/* AI-style loading */}

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
            {searchResult.map((result, index) => {
              const helperList = helpers[result] || [];

              const hasHelpers = helperList.length > 0;

              const isHelperLoading =
                helperLoading === result;

              return (
                <Box
                  key={`${result}-${index}`}
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
                      boxShadow:
                        '0 6px 18px rgba(0,0,0,0.25)',
                    },

                    '&:hover .result-text': {
                      opacity: 0.15,
                    },

                    '&:hover .card-overlay': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Recommendation */}

                  <Typography
                    className="result-text"
                    variant="body2"
                    sx={{
                      px: 2,
                      color: 'white',
                      fontWeight: 500,
                      textAlign: 'center',
                      transition:
                        'opacity 0.25s ease',
                    }}
                  >
                    {result}
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
                      pr: 1.5,
                      opacity: isHelperLoading
                        ? 1
                        : 0,

                      transition:
                        'opacity 0.25s ease',

                      backgroundColor:
                        'rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Like / Dislike */}

                  <Box
  className="card-overlay"
  sx={{
    position: 'absolute',
    inset: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    px: 0.75,

    opacity: isHelperLoading ? 1 : 0,

    transition: 'opacity 0.25s ease',

    backgroundColor: 'rgba(255,255,255,0.06)',
  }}
>
  {/* Like / Dislike */}
  <Box
    sx={{
      display: 'flex',
      gap: 0,
      flexShrink: 0,
    }}
  >
    <IconButton
      size="small"
      aria-label="like"
      onClick={(e) => {
        e.stopPropagation();
        handleLike(result)
        console.log('Liked:', result);
      }}
      sx={{
        color: 'white',
        width: 32,
        height: 32,
        
        '&:hover': {
          color: '#81C784',
          backgroundColor: 'rgba(255,255,255,0.15)',
        },
      }}
    >
      {liked[result]?<ThumbUpIcon sx={{ fontSize: 19 }}/>:<ThumbUpOutlinedIcon sx={{ fontSize: 19 }} /> }
    </IconButton>

    <IconButton
      size="small"
      aria-label="dislike"
      onClick={(e) => {
        e.stopPropagation();
        console.log('Disliked:', result);
        handleDislike(result)
      }}
      sx={{
        color: 'white',
        width: 32,
        height: 32,

        '&:hover': {
          color: '#E57373',
          backgroundColor: 'rgba(255,255,255,0.15)',
        },
      }}
    >
      {dislike[result]?<ThumbDownIcon sx={{ fontSize: 19 }}/>:<ThumbDownOutlinedIcon sx={{ fontSize: 19 }} /> }
    </IconButton>
  </Box>

  {/* Find Helpers button */}
  {hasHelpers && (
    <Button
      variant="contained"
      size="small"
      disabled={isHelperLoading}
      onClick={(e) => {
        e.stopPropagation();
        handleOpenHelpers(result);
      }}
      sx={{
        backgroundColor: '#3E2723',
        color: 'white',

        minWidth: 0,
        width: 'auto',

        maxWidth: 125,

        textTransform: 'none',
        fontWeight: 600,
        fontSize: '11px',

        borderRadius: '20px',

        px: 1.25,
        py: 0.7,

        whiteSpace: 'nowrap',
        flexShrink: 1,

        '&:hover': {
          backgroundColor: '#5D4037',
        },

        '&.Mui-disabled': {
          backgroundColor: '#5D4037',
          color: 'white',
          opacity: 1,
        },
      }}
    >
      Tap to see Helpers
    </Button>
  )}
</Box>

                    {/* Find Helpers button
                        ONLY shown if helpers exist */}

                  

                    {/* Spacer */}

                    {/* <Box
                      sx={{
                        width: 20,
                      }}
                    /> */}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* =====================================================
          HELPERS MODAL
          ===================================================== */}

      <Dialog
        open={Boolean(selectedRecommendation)}
        onClose={handleCloseHelpers}
        fullWidth
        maxWidth="sm"
      >
        {/* Modal title */}

        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600,
          }}
        >
          <span>
            {selectedRecommendation}
          </span>

          <IconButton
            onClick={handleCloseHelpers}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* Modal content */}

        <DialogContent
          sx={{
            py: 2,
          }}
        >
          {selectedHelpers.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                py: 4,
              }}
            >
              No helpers available.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {selectedHelpers.map(
                (helper, index) => (
                  <Box
                    key={helper.user_id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      p: 2,

                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,

                      backgroundColor:
                        'background.paper',

                      transition:
                        'all 0.2s ease',

                      '&:hover': {
                        boxShadow:
                          '0 4px 12px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {/* Helper name */}

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {helper.name}
                    </Typography>

                    {/* Helper status */}

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'success.main',
                        fontWeight: 500,
                      }}
                    >
                      ● Available Helper
                    </Typography>

                    {/* Phone */}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      📞 {helper.phone}
                    </Typography>

                    {/* Location */}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      📍 {helper.latitude},{' '}
                      {helper.longitude}
                    </Typography>
                              <Box>
                    {helper.original_help.map((o: string) => (
                      <Typography key={o}>
                        {o}
                      </Typography>
                    ))}
                  </Box>

                  </Box>
                )
              )}
            </Box>
          )}
        </DialogContent>

        {/* Modal footer */}

        <DialogActions>
          <Button
            onClick={handleCloseHelpers}
            sx={{
              textTransform: 'none',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

