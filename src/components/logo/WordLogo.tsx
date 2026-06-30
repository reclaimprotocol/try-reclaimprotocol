import wordLogo from "../../assets/word_icon.svg";
import { useIsLargeScreen } from "../../hooks/useIsLargeScreen";
import { LINKS } from "../../constants";

export default function WordLogo() {
  const isMobile = !useIsLargeScreen();

  return (
    <div
      className="logo-container"
      style={{ marginTop: isMobile ? "6vh" : "20vh" }}
    >
      <a href={LINKS.website} target="_blank" rel="noreferrer">
        <img
          src={wordLogo}
          alt="Reclaim Protocol"
          className="logo-icon"
          style={{ height: isMobile ? "40px" : "80px", width: "auto" }}
        />
      </a>
    </div>
  );
}
