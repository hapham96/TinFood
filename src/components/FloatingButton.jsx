import { useNavigate } from "react-router-dom";

function FloatingButton() {
  const navigate = useNavigate();

  return (
    <button
      className="floating-btn"
      onClick={() => navigate("/money-share")}
    >
      💰
    </button>
  );
}

export default FloatingButton;
