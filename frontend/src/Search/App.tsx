import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Paper,
  Avatar,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import EmergencyOutlinedIcon from "@mui/icons-material/EmergencyOutlined";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";

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

type LikeMap = {
  [recommendation: string]: boolean;
};

const quickHelpOptions = [
  {
    label: "Grocery",
    icon: <LocalGroceryStoreOutlinedIcon fontSize="small" />,
    prompt: "I need help getting groceries",
  },
  {
    label: "Medicine",
    icon: <MedicationOutlinedIcon fontSize="small" />,
    prompt: "I need help getting medicine",
  },
  {
    label: "Transportation",
    icon: <DirectionsCarOutlinedIcon fontSize="small" />,
    prompt: "I need transportation help",
  },
  {
    label: "Emergency",
    icon: <EmergencyOutlinedIcon fontSize="small" />,
    prompt: "I need help with an emergency",
  },
];

export default function Search() {
  const [text, setText] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const [searchResult, setSearchResult] = useState<string[]>([]);

  const [loadingMessage, setLoadingMessage] =
    useState<string>("Finding help...");

  const [loading, setLoading] = useState<boolean>(false);

  const [searchTrigger, setSearchTrigger] = useState<number>(0);

  const [searchRec, setSearchRec] = useState<
    [string[], FeedbackItem[]]
  >([[], []]);

  const [helpers, setHelpers] = useState<HelpersMap>({});

  const [helperLoading, setHelperLoading] =
    useState<string | null>(null);

  const [selectedRecommendation, setSelectedRecommendation] =
    useState<string | null>(null);

  const [liked, setLiked] = useState<LikeMap>({});
  const [dislike, setDisliked] = useState<LikeMap>({});

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const handleClick = () => {
    const trimmedText = text.trim();

    if (!trimmedText || loading) {
      return;
    }

    setSearchText(trimmedText);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleQuickHelp = (prompt: string) => {
    setText(prompt);

    setTimeout(() => {
      setSearchText(prompt);
      setSearchTrigger((prev) => prev + 1);
    }, 0);
  };

  /*
   * ---------------------------------------------------------
   * FEEDBACK
   * ---------------------------------------------------------
   */

  const handleFeedback = async (
    recommendation: string,
    fback: number
  ) => {
    const feedbackBody: FeedbackItem[] = [];

    try {
      searchRec[1]?.forEach((element: FeedbackItem) => {
        if (searchRec[0]?.includes(element.final_node)) {
          const feedbackItem = {
            ...element,
          };

          if (feedbackItem.final_node === recommendation) {
            feedbackItem.feedback = fback;
          }

          feedbackBody.push(feedbackItem);
        }
      });

      await axios.post(
        "https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/requests/feedback",
        { feedbackBody }
      );
    } catch (error) {
      console.error("Feedback failed:", error);
    }
  };

  const handleLike = async (recommendation: string) => {
    setLiked((prev) => ({
      ...prev,
      [recommendation]: !prev[recommendation],
    }));

    setDisliked((prev) => ({
      ...prev,
      [recommendation]: false,
    }));

    await handleFeedback(recommendation, 1);
  };

  const handleDislike = async (recommendation: string) => {
    setDisliked((prev) => ({
      ...prev,
      [recommendation]: !prev[recommendation],
    }));

    setLiked((prev) => ({
      ...prev,
      [recommendation]: false,
    }));

    await handleFeedback(recommendation, -1);
  };

  /*
   * ---------------------------------------------------------
   * HELPER MODAL
   * ---------------------------------------------------------
   */

  const handleOpenHelpers = async (recommendation: string) => {
    setSelectedRecommendation(recommendation);

    await handleFeedback(recommendation, 0);
  };

  const handleCloseHelpers = () => {
    setSelectedRecommendation(null);
  };

  /*
   * ---------------------------------------------------------
   * LOADING MESSAGES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const messages = [
      "Understanding your request...",
      "Finding relevant recommendations...",
      "Checking available helpers...",
      "Ranking the best matches...",
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
   * ---------------------------------------------------------
   * SEARCH API
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!searchText) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        setSearchResult([]);
        setHelpers({});

        /*
         * Create request
         */
        console.log(searchText,"new search text--")
        const response = await axios.post(
          "https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/requests",
          {
            user_id: "",
            request_type: [],
            description: searchText,
            latitude: 23.68,
            longitude: 89.95,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200) {
          return;
        }

        const reqID = response.data?.request_id;

        if (!reqID) {
          console.error("Request ID not found:", response.data);
          return;
        }

        /*
         * Get recommendations
         */
        const searchRes = await axios.post(
          `https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/requests/${reqID}/recommendations`
        );

        if (searchRes.status !== 200) {
          return;
        }

        console.log(
          "Recommendation response:",
          searchRes.data
        );

        setSearchRec(searchRes.data);

        /*
         * Initialize feedback
         */
        const feedbackBody: FeedbackItem[] = [];

        searchRes.data[1]?.forEach(
          (element: FeedbackItem) => {
            if (
              searchRes.data[0]?.includes(
                element.final_node
              )
            ) {
              const feedbackItem = {
                ...element,
                feedback: 0,
              };

              feedbackBody.push(feedbackItem);
            }
          }
        );

        await axios.post(
          "https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/requests/feedback",
          { feedbackBody }
        );

        /*
         * Recommendations
         */
        const recommendations = Array.isArray(
          searchRes.data?.[0]
        )
          ? searchRes.data[0]
          : searchRes.data;

        const formattedResults = recommendations.filter(
          (item: unknown): item is string =>
            typeof item === "string"
        );

        setSearchResult(formattedResults);

        /*
         * Find helpers for every recommendation
         */
        const helperResults: HelpersMap = {};
        const likeRes: LikeMap = {};
        const dislikeRes: LikeMap = {};

        await Promise.all(
          formattedResults.map(
            async (rec: string) => {
              try {
                const helperResponse = await axios.post(
                  "https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/requests/match",
                  {
                    request: rec,
                  }
                );

                likeRes[rec] = false;
                dislikeRes[rec] = false;

                const helperList: Helper[] =
                  Array.isArray(helperResponse.data)
                    ? helperResponse.data
                        .map((item: any) => item?.[0])
                        .filter(
                          (
                            helper: any
                          ): helper is Helper =>
                            helper &&
                            typeof helper === "object" &&
                            helper.helper === true
                        )
                    : [];

                helperResults[rec] =
                  helperList;
              } catch (error) {
                console.error(
                  `Failed to find helpers for ${rec}:`,
                  error
                );

                helperResults[rec] = [];
              }
            }
          )
        );

        setHelpers(helperResults);
        setLiked(likeRes);
        setDisliked(dislikeRes);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTrigger]);

  /*
   * ---------------------------------------------------------
   * SELECTED HELPERS
   * ---------------------------------------------------------
   */

  const selectedHelpers = selectedRecommendation
    ? helpers[selectedRecommendation] || []
    : [];

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          background:
            "linear-gradient(180deg, #f4f9fc 0%, #ffffff 70%)",
          px: { xs: 2, sm: 3 },
          py: { xs: 5, sm: 7 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 920,
            mx: "auto",
          }}
        >
          {/* =================================================
              HERO
              ================================================= */}

          {!loading &&
            searchResult.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  maxWidth: 720,
                  mx: "auto",
                  mb: 5,
                }}
              >
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    mx: "auto",
                    mb: 2.5,
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #0f4c5c, #176b7d)",
                    color: "white",
                    boxShadow:
                      "0 10px 30px rgba(15,76,92,0.20)",
                  }}
                >
                  <VolunteerActivismOutlinedIcon
                    sx={{ fontSize: 34 }}
                  />
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "#12313d",
                    fontSize: {
                      xs: "2rem",
                      sm: "2.6rem",
                    },
                    letterSpacing: "-0.5px",
                    mb: 1.5,
                  }}
                >
                  What do you need help with?
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    fontSize: {
                      xs: "0.98rem",
                      sm: "1.08rem",
                    },
                    lineHeight: 1.7,
                    maxWidth: 620,
                    mx: "auto",
                  }}
                >
                  Tell us what you need and we'll find
                  relevant community helpers who may be
                  able to assist you.
                </Typography>
              </Box>
            )}

          {/* =================================================
              SEARCH BOX
              ================================================= */}

          <Paper
            elevation={0}
            sx={{
              maxWidth: 760,
              mx: "auto",
              p: { xs: 1, sm: 1.25 },
              borderRadius: "18px",
              border: "1px solid",
              borderColor: "rgba(15,76,92,0.18)",
              backgroundColor: "white",
              boxShadow:
                "0 10px 35px rgba(26,67,80,0.08)",
            }}
          >
            <TextField
              placeholder="Describe what you need help with..."
              fullWidth
              multiline
              maxRows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  border: "none",
                  borderRadius: "14px",
                  backgroundColor: "#f8fbfc",
                  pr: 0.5,

                  "& fieldset": {
                    border: "none",
                  },

                  "&:hover fieldset": {
                    border: "none",
                  },

                  "&.Mui-focused fieldset": {
                    border: "none",
                  },

                  "& textarea": {
                    padding: "14px 4px 14px 6px",
                  },
                },

                "& .MuiInputBase-input::placeholder": {
                  opacity: 0.65,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        alignSelf: "flex-start",
                        mt: 1.2,
                        ml: 1,
                      }}
                    >
                      <SearchIcon
                        sx={{
                          color: "text.secondary",
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        alignSelf: "flex-end",
                        mb: 0.8,
                      }}
                    >
                      <IconButton
                        onClick={handleClick}
                        disabled={
                          !text.trim() || loading
                        }
                        aria-label="search for help"
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "13px",
                          backgroundColor:
                            "#0f4c5c",
                          color: "white",

                          "&:hover": {
                            backgroundColor:
                              "#0b3c49",
                          },

                          "&.Mui-disabled": {
                            backgroundColor:
                              "#d9e3e7",
                            color: "#9aaab0",
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            size={21}
                            sx={{
                              color: "white",
                            }}
                          />
                        ) : (
                          <ArrowForwardIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleClick();
                }
              }}
            />
          </Paper>

          {/* =================================================
              QUICK HELP
              ================================================= */}

          {!loading &&
            searchResult.length === 0 && (
              <Box
                sx={{
                  maxWidth: 760,
                  mx: "auto",
                  mt: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mb: 1.2,
                    textAlign: {
                      xs: "center",
                      sm: "left",
                    },
                  }}
                >
                  Or start with a common request
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                    justifyContent: {
                      xs: "center",
                      sm: "flex-start",
                    },
                  }}
                >
                  {quickHelpOptions.map((option) => (
                    <Chip
                      key={option.label}
                      icon={option.icon}
                      label={option.label}
                      clickable
                      onClick={() =>
                        handleQuickHelp(option.prompt)
                      }
                      sx={{
                        height: 42,
                        px: 0.7,
                        borderRadius: "12px",
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor:
                          "rgba(15,76,92,0.14)",
                        color: "#294752",
                        fontWeight: 500,

                        "& .MuiChip-icon": {
                          color: "#0f4c5c",
                        },

                        "&:hover": {
                          backgroundColor:
                            "#eef7f9",
                          borderColor:
                            "rgba(15,76,92,0.35)",
                        },
                      }}
                    />
                  ))}
                </Stack>

                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    color: "text.secondary",
                  }}
                >
                  <PeopleIcon
                    sx={{ fontSize: 19 }}
                  />

                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.78rem" }}
                  >
                    We'll match your request with
                    relevant community helpers.
                  </Typography>
                </Box>
              </Box>
            )}

          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (
            <Box
              sx={{
                maxWidth: 760,
                mx: "auto",
                mt: 3,
                p: 2.5,
                borderRadius: 3,
                backgroundColor: "white",
                border: "1px solid",
                borderColor:
                  "rgba(15,76,92,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress
                size={22}
                thickness={4}
                sx={{
                  color: "#0f4c5c",
                }}
              />

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#294752",
                  }}
                >
                  {loadingMessage}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  This may take a few moments.
                </Typography>
              </Box>
            </Box>
          )}

          {/* =================================================
              RESULTS HEADER
              ================================================= */}

          {!loading &&
            searchResult.length > 0 && (
              <Box
                sx={{
                  mt: 5,
                  mb: 2.5,
                  display: "flex",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                  gap: 2,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#12313d",
                      mb: 0.5,
                    }}
                  >
                    We found some ways to help
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Based on your request:
                    <strong> "{searchText}"</strong>
                  </Typography>
                </Box>

                <Chip
                  label={`${searchResult.length} recommendations`}
                  size="small"
                  sx={{
                    backgroundColor: "#e8f3f5",
                    color: "#0f4c5c",
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}

          {/* =================================================
              RESULT CARDS
              ================================================= */}

          {!loading &&
            searchResult.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {searchResult.map(
                  (result, index) => {
                    const helperList =
                      helpers[result] || [];

                    const hasHelpers =
                      helperList.length > 0;

                    const isHelperLoading =
                      helperLoading === result;

                    return (
                      <Paper
                        key={`${result}-${index}`}
                        elevation={0}
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          minHeight: 190,
                          borderRadius: "18px",
                          border: "1px solid",
                          borderColor:
                            "rgba(15,76,92,0.13)",
                          backgroundColor: "white",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent:
                            "space-between",
                          p: 2.2,

                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",

                          "&:hover": {
                            transform:
                              "translateY(-4px)",
                            boxShadow:
                              "0 12px 30px rgba(20,60,75,0.11)",
                            borderColor:
                              "rgba(15,76,92,0.25)",
                          },
                        }}
                      >
                        {/* Top */}
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "space-between",
                              mb: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius:
                                  "12px",
                                backgroundColor:
                                  "#e8f3f5",
                                color:
                                  "#0f4c5c",
                              }}
                            >
                              <VolunteerActivismOutlinedIcon />
                            </Avatar>

                            <Chip
                              size="small"
                              label={
                                hasHelpers
                                  ? `${helperList.length} ${
                                      helperList.length ===
                                      1
                                        ? "helper"
                                        : "helpers"
                                    }`
                                  : "No helpers yet"
                              }
                              sx={{
                                fontSize:
                                  "0.72rem",
                                fontWeight: 600,
                                backgroundColor:
                                  hasHelpers
                                    ? "#edf7ef"
                                    : "#f3f4f5",
                                color:
                                  hasHelpers
                                    ? "#2e6b3b"
                                    : "#777",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 650,
                              color: "#1c3842",
                              fontSize:
                                "1.02rem",
                              lineHeight: 1.4,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {result}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.7,
                              lineHeight: 1.5,
                            }}
                          >
                            Community members who
                            may be able to help with
                            this.
                          </Typography>
                        </Box>

                        {/* Bottom */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 1,
                            mt: 2,
                          }}
                        >
                          {/* Feedback */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.25,
                            }}
                          >
                            <IconButton
                              size="small"
                              aria-label="like recommendation"
                              onClick={() =>
                                handleLike(result)
                              }
                              sx={{
                                width: 34,
                                height: 34,
                                color: liked[result]
                                  ? "#2e7d32"
                                  : "#829197",
                                backgroundColor:
                                  liked[result]
                                    ? "#edf7ef"
                                    : "transparent",

                                "&:hover": {
                                  backgroundColor:
                                    "#edf7ef",
                                  color:
                                    "#2e7d32",
                                },
                              }}
                            >
                              {liked[result] ? (
                                <ThumbUpIcon
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              ) : (
                                <ThumbUpOutlinedIcon
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              )}
                            </IconButton>

                            <IconButton
                              size="small"
                              aria-label="dislike recommendation"
                              onClick={() =>
                                handleDislike(result)
                              }
                              sx={{
                                width: 34,
                                height: 34,
                                color: dislike[result]
                                  ? "#c62828"
                                  : "#829197",
                                backgroundColor:
                                  dislike[result]
                                    ? "#fff1f1"
                                    : "transparent",

                                "&:hover": {
                                  backgroundColor:
                                    "#fff1f1",
                                  color:
                                    "#c62828",
                                },
                              }}
                            >
                              {dislike[result] ? (
                                <ThumbDownIcon
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              ) : (
                                <ThumbDownOutlinedIcon
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              )}
                            </IconButton>
                          </Box>

                          {/* Helpers */}
                          {hasHelpers && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={
                                isHelperLoading
                              }
                              onClick={() =>
                                handleOpenHelpers(
                                  result
                                )
                              }
                              endIcon={
                                isHelperLoading ? (
                                  <CircularProgress
                                    size={14}
                                    sx={{
                                      color:
                                        "white",
                                    }}
                                  />
                                ) : (
                                  <ArrowForwardIcon
                                    sx={{
                                      fontSize:
                                        16,
                                    }}
                                  />
                                )
                              }
                              sx={{
                                borderRadius:
                                  "10px",
                                backgroundColor:
                                  "#0f4c5c",
                                textTransform:
                                  "none",
                                fontWeight: 600,
                                fontSize:
                                  "0.78rem",
                                px: 1.4,
                                py: 0.8,

                                "&:hover": {
                                  backgroundColor:
                                    "#0b3c49",
                                },
                              }}
                            >
                              Find Helpers
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    );
                  }
                )}
              </Box>
            )}
        </Box>
      </Box>

      {/* =====================================================
          HELPERS MODAL
          ===================================================== */}

      <Dialog
        open={Boolean(selectedRecommendation)}
        onClose={handleCloseHelpers}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper:{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
          },
        }
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#173b46",
              }}
            >
              People who may help
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {selectedRecommendation}
            </Typography>
          </Box>

          <IconButton
            onClick={handleCloseHelpers}
            aria-label="close"
            size="small"
            sx={{
              backgroundColor: "#f3f6f7",

              "&:hover": {
                backgroundColor: "#e8edef",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            p: 2.5,
            backgroundColor: "#f8fafb",
          }}
        >
          {selectedHelpers.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <PeopleIcon
                sx={{
                  fontSize: 45,
                  color: "text.disabled",
                  mb: 1,
                }}
              />

              <Typography
                variant="body1"
                sx={{ fontWeight: 600 }}
              >
                No helpers available right now
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Try another request or check back
                later.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {selectedHelpers.map(
                (helper, index) => (
                  <Paper
                    key={helper.user_id || index}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "15px",
                      border: "1px solid",
                      borderColor:
                        "rgba(15,76,92,0.12)",
                      backgroundColor: "white",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          backgroundColor:
                            "#e8f3f5",
                          color: "#0f4c5c",
                          fontWeight: 700,
                        }}
                      >
                        {helper.name
                          ?.charAt(0)
                          ?.toUpperCase() || "H"}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {helper.name}
                          </Typography>

                          <Chip
                            label="Available"
                            size="small"
                            sx={{
                              height: 24,
                              fontSize:
                                "0.68rem",
                              fontWeight: 600,
                              backgroundColor:
                                "#edf7ef",
                              color: "#2e7d32",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.8,
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 0.5,
                          }}
                        >
                          <LocationOnOutlinedIcon
                            sx={{
                              fontSize: 16,
                            }}
                          />

                          {helper.latitude},{" "}
                          {helper.longitude}
                        </Typography>

                        {helper.phone && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.4 }}
                          >
                            📞 {helper.phone}
                          </Typography>
                        )}

                        {Array.isArray(
                          helper.original_help
                        ) &&
                          helper.original_help
                            .length > 0 && (
                            <Box
                              sx={{
                                mt: 1.2,
                                display: "flex",
                                flexWrap:
                                  "wrap",
                                gap: 0.6,
                              }}
                            >
                              {helper.original_help.map(
                                (
                                  item: string,
                                  helpIndex: number
                                ) => (
                                  <Chip
                                    key={`${item}-${helpIndex}`}
                                    label={item}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius:
                                        "7px",
                                      fontSize:
                                        "0.7rem",
                                    }}
                                  />
                                )
                              )}
                            </Box>
                          )}
                      </Box>
                    </Box>
                  </Paper>
                )
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            backgroundColor: "white",
          }}
        >
          <Button
            onClick={handleCloseHelpers}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 2,
              color: "#0f4c5c",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}