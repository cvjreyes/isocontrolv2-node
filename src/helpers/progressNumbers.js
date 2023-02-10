exports.progressNumbers = {
  TL1: {
    modelled: 50,
    sdesign: 100,
  },
  TL2: {
    modelled: 50,
    supports: 90,
    sdesign: 100,
  },
  TL3: {
    modelled: 50,
    sstress: 75,
    rstress: 80,
    stress: 85,
    supports: 90,
    sdesign: 100,
    isotracker: 100,
  },
};

exports.calculateNextStep = (type, status) => {
  const list = Object.keys(this.progressNumbers[type]);
  const tempStatus = status.replace("-", "").replace("*", "").toLowerCase();
  const idx = list.findIndex((item) => tempStatus == item);
  const nextStep = list[idx] === "sdesign" ? "IsoTracker" : list[idx + 1];
  return this.formatStatus(nextStep);
};

exports.calculatePreviousStep = (type, status) => {
  const list = Object.keys(this.progressNumbers[type]);
  const tempStatus = status.replace("-", "").replace("*", "").toLowerCase();
  const idx = list.findIndex((item) => tempStatus == item);
  const previousStep = list[idx] === "modelled" ? "modelled" : list[idx - 1];
  return this.formatStatus(previousStep);
};

exports.formatStatus = (status) => {
  const list = {
    sstress: "S-Stress",
    rstress: "R-Stress",
    stress: "Stress",
    supports: "Supports",
    sdesign: "S-Design",
  };
  return (
    list[status.toLowerCase()] ||
    status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")
  );
};

exports.IFDWeight = {
  TL1: 6,
  TL2: 10,
  TL3: 20,
};
