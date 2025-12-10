import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const LoginError = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error")) {
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, [location]);

  return (
    <div>
      <h2>로그인 페이지</h2>
      <a href="https://sw6885travelplannerfin.uk/oauth2/authorization/google">
        <button>Google로 로그인</button>
      </a>
    </div>
  );
};

export default LoginError;
