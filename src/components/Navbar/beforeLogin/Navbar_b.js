import { AppBar, Toolbar, Button, TextField, Box, Paper, List, ListItem } from "@mui/material";
import SignInButton from "./SignInButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleLoginSuccess = (credentialResponse) => {
    console.log("Google 로그인 성공:", credentialResponse);
  };

  const handleLoginFailure = () => {
    console.log("Google 로그인 실패");
  };

  // debounce 검색 함수
  const debouncedSearch = _.debounce(async (query) => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/album/search?keyword=${query}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(search);
    return debouncedSearch.cancel;
  }, [search]);

  const handleSelect = (album) => {
    navigate(`/album/detail/${encodeURIComponent(album.albumName)}`);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#000" }}>
      <Toolbar>
        <Button color="inherit" onClick={() => navigate("/main_b")}>Home</Button>
        <Button color="inherit">Nav1</Button>

        <Button
          color="inherit"
          sx={{ marginLeft: "20px" }}
          onClick={() => navigate("/user/qualityReviewerAward")}
        >
          Nav2
        </Button>

        <SignInButton />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
