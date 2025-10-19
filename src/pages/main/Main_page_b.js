import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import Navbar from "../../components/Navbar/beforeLogin/Navbar_b";
import Footer from "../../components/Footer/Footer";

const MainB = () => {
  const [featuredAlbums, setFeaturedAlbums] = useState([]);

  useEffect(() => {
    
  }, []);

  return (
    <>
      <Navbar />
      <Container>
      </Container>
      <Footer />
    </>
  );
};

export default MainB;
