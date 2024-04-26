/*
 * File: NumberInput.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: This is a text imput component modified to allow only number inputs
 * adds arrows that can increment the number by 50.
 */

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
