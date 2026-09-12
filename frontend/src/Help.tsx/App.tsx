import React, { useState } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Ensure @mui/icons-material is installed

export default function Help() {
  // State to manage the search input text
  const [text, setText] = useState("");
  // Mock loading state (replace with your actual logic)
  const [loading, setLoading] = useState(false);

  // Mock click handler
  const handleClick = () => {
    if (!text.trim() || loading) return;
    console.log("Searching for:", text);
    // Add your search logic here
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <TextField
        placeholder="Search..."
        size="medium"
        fullWidth
        value={text}
        sx={{
          maxWidth: 560,
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            height: 56,
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
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
                    cursor: text.trim() ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <SearchIcon
                    sx={{
                      color: "text.secondary",
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
          if (e.key === "Enter") {
            e.preventDefault();
            handleClick();
          }
        }}
      />
    </Box>
  );
}
