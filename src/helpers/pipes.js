exports.fillType = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].calc_notes === "NA" || data[i].calc_notes === "unset") {
      if (process.env.NODE_MMDN == "0") {
        if (data[i].diameter < 2.0) data[i].type = "TL1";
        else data[i].type = "TL2";
      } else {
        if (data[i].diameter < 50) data[i].type = "TL1";
        else data[i].type = "TL2";
      }
    } else data[i].type = "TL3";
  }
  return data;
};
