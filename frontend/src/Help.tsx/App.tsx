import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import RegisterDrawer from "../RegisterDrawer.tsx/App";
import axios from "axios";

export default function Help() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  const suggestions = [
    {
      label: "Grocery",
      icon: <LocalGroceryStoreOutlinedIcon fontSize="small" />,
    },
    {
      label: "Medicine",
      icon: <MedicationOutlinedIcon fontSize="small" />,
    },
    {
      label: "Transportation",
      icon: <DirectionsCarOutlinedIcon fontSize="small" />,
    },
    {
      label: "Emergency",
      icon: <VolunteerActivismOutlinedIcon fontSize="small" />,
    },
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setText(
      text.trim()
        ? `${text.trim()}, ${suggestion.toLowerCase()}`
        : `I can help with ${suggestion.toLowerCase()}`
    );
  };

  useEffect(()=>{
    console.log(preferences,"preferences----")

  },[preferences])
  const handleClick = async () => {
    if (!text.trim() || loading) return;

    if (!localStorage.getItem("user")) {
      setRegisterOpen(true);
      return;
    }

    try {
      setLoading(true);

      const userObj = JSON.parse(
        localStorage.getItem("user") ?? "{}"
      );

      const res = await axios.patch(
        `https://community-helper-api-poushali-fse2fddpgqf8hfa4.westus3-01.azurewebsites.net/api/v1/users/${userObj.user_id}/become-helper`,
        { preferences: text },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setPreferences(res.data.pref_list[1] || []);
      setText("");
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          px: { xs: 2, sm: 3 },
          pt: { xs: 6, sm: 10 },
          pb: 6,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              maxWidth: 620,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <VolunteerActivismOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1.5,
              }}
            >
              What would you like to help with?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.7,
              }}
            >
              Tell us what you're comfortable helping with. We'll use your
              preferences to connect you with people who need help.
            </Typography>
          </Box>

          {/* Main input card */}
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              Describe how you can help
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="For example: I can help pick up medicines or groceries for elderly people..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "background.default",
                  pr: 1,
                  "& fieldset": {
                    borderColor: "divider",
                  },
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        alignSelf: "flex-end",
                        mb: 1,
                      }}
                    >
                      <IconButton
                        onClick={handleClick}
                        disabled={!text.trim() || loading}
                        aria-label="save help preferences"
                        sx={{
                          width: 42,
                          height: 42,
                          backgroundColor: "primary.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "action.disabledBackground",
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            size={20}
                            sx={{ color: "white" }}
                          />
                        ) : (
                          <SearchIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleClick();
                }
              }}
            />

            {/* Suggestions */}
            <Box sx={{ mt: 2.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1.2,
                }}
              >
                Or choose a popular option
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                }}
              >
                {suggestions.map((suggestion) => (
                  <Chip
                    key={suggestion.label}
                    icon={suggestion.icon}
                    label={suggestion.label}
                    clickable
                    variant="outlined"
                    onClick={() =>
                      handleSuggestionClick(suggestion.label)
                    }
                    sx={{
                      borderRadius: 2.5,
                      px: 0.5,
                      py: 2.2,
                      fontSize: "0.9rem",
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderColor: "primary.main",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>

          {/* Saved preferences */}
          {preferences.length > 0 && (
            <Box
              sx={{
                width: "100%",
                mt: 4,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                }}
              >
                Your help preferences
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                  }}
                >
                  {preferences.map((pref, index) => (
                    <Chip
                      key={`${pref}-${index}`}
                      label={pref}
                      color="primary"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Bottom hint */}
          <Typography
            variant="caption"
            sx={{
              mt: 4,
              color: "text.secondary",
              textAlign: "center",
              maxWidth: 520,
            }}
          >
            You can describe multiple things you can help with in one sentence.
            Our system will identify your preferences automatically.
          </Typography>
        </Box>
      </Box>

      <RegisterDrawer
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}