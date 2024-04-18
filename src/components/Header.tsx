/*
 *  File Name: Header.tsx
 *  Project: GoogleGas
 *  Completed by: Matjaz Cigler
 * Description: This is a component displays the webapp name
 * and a link to the authors website.
 *
 */
import Button from "@mui/material/Button";
import "../styles.css";

const Header = () => {
  return (
    <div className="header">
      <h1>Google Gas</h1>
      <div className="author">
        <p>Author: </p>
        <a href="https://www.linkedin.com/in/matjazcigler">Matjaz Cigler</a>
      </div>
    </div>
  );
};

export default Header;
