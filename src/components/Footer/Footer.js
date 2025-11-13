import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box component="footer" textAlign="center" py={3} bgcolor="#000">
      <Link
        href="https://pinlib.tistory.com"
        color="white"
        underline="hover"
        target="_blank"
        rel="noopener"
      >
        <Typography variant="caption">PINLIB STUDIO</Typography>
      </Link>
    </Box>
  );
};

export default Footer;
