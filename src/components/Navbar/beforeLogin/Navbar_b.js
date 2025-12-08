// 로그인 전 상단 네비게이션 바 컴포넌트 - 로고와 검색, 로그인 버튼을 표시
import SignInButton from "./SignInButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            onClick={() => navigate("/main_b")}
          >
            Home
          </button>
          <span className="text-sm font-semibold text-gray-800"></span>
        </div>

        <div className="relative hidden flex-1 items-center justify-center px-6 sm:flex">
          
          {suggestions.length > 0 && (
            <div className="absolute left-1/2 top-12 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <ul className="divide-y divide-gray-100">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="cursor-pointer px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    onClick={() => handleSelect(item)}
                  >
                    {item.albumName} - {item.artistName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
         
          <SignInButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
