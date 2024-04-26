/*
 * File: SearchLoadingWidget.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: This component is displayed when the website is loading the map, directions
 * and availible gas stations. It notifies the user that the map is loading.
 */
import React from "react";

const SearchLoadingWidget = () => {
  return (
    <div className="loading-widget">
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <div className="message">Finding Gas Stations</div>
    </div>
  );
};

export default SearchLoadingWidget;
