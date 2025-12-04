import React from "react";
import ChatBox from "../components/Chat/ChatBox";
import Navbar from "../components/Navbar/afterLogin/Navbar_a";
import Footer from "../components/Footer/Footer";

function TravelChatPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "100px" }}>
        <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
          ✈ AI 여행 추천
        </h1>
        <ChatBox />
      </div>
      <Footer />
    </>
  );
}

export default TravelChatPage;
