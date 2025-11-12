import { AppBar, Toolbar, Button, TextField, Box, Paper, List, ListItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogOutButton from "./LogoutButton";
import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // 디바운스된 함수
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
  }, 300); // 300ms 딜레이

  useEffect(() => {
    debouncedSearch(search);
    return debouncedSearch.cancel; // cleanup
  }, [search]);

  const handleSelect = (album) => {
    // 예시로 album name을 쿼리파라미터로 보냄
    navigate(`/album/detail/${encodeURIComponent(album.albumName)}`);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#000" }}>
      <Toolbar>
        <Button color="inherit" onClick={() => navigate("/main/plan")}>Home</Button>
        <Button color="inherit">KADR25</Button>
        
        <Box position="relative" ml={2}>
          <TextField
            variant="outlined"
            placeholder="Search Album..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ backgroundColor: "white", borderRadius: 1, width: "300px" }}
          />
          {suggestions.length > 0 && (
            <Paper
              sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10 }}
              elevation={3}
            >
              <List>
                {suggestions.map((item) => (
                  <ListItem button key={item.id} onClick={() => handleSelect(item)}>
                    {item.albumName} - {item.artistName}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        <Button color="inherit" sx={{ marginLeft: "20px" }} onClick={() => navigate("/user/qualityReviewerAward")}>Quality Reviewer Award</Button>
        <Button color="inherit" onClick={() => navigate("/user/userInfo")}>User Info</Button>
        <Button color="inherit" onClick={() => navigate("/album/regist")}>앨범등록</Button>
        <LogOutButton />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
