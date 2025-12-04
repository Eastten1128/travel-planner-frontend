// 하단 푸터 컴포넌트 - 서비스 정보와 링크를 노출
const Footer = () => {
  return (
    <footer className="border-t bg-gray-50 py-6 text-center text-sm text-gray-500">
      <a
        href="https://pinlib.tistory.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gray-700 transition hover:text-gray-900"
      >
        PINLIB STUDIO
      </a>
    </footer>
  );
};

export default Footer;
