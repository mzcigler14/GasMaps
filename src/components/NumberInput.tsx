import React, { useState, ChangeEvent } from "react";
import TextField from "@mui/material/TextField";

type handleDistance = (distance: number) => void;

interface props {
  setDistance: handleDistance;
}
function NumberInput({ setDistance }: props) {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setDistance(Number(value));
  };

  return (
    <div>
      <TextField
        label="Distance to Empty (km)"
        type="number" // Set the type to "number"
        variant="outlined"
        value={value}
        onChange={handleChange}
        style={{ width: "160px" }}
        inputProps={{
          min: 0, // Set the minimum value if needed
          step: 50, // Set the step increment/decrement
        }}
      />
    </div>
  );
}

export default NumberInput;
