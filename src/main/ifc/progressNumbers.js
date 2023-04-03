exports.progressNumbers = {
  TL1: {
    design: 0,
    materials: 85,
    issuer: 90,
    toissue: 95,
    issued: 100,
  },
  TL2: {
    design: 0,
    supports: 80,
    materials: 85,
    issuer: 90,
    toissue: 95,
    issued: 100,
  },
  TL3: {
    design: 0,
    stress: 60,
    supports: 80,
    materials: 85,
    issuer: 90,
    toissue: 95,
    issued: 100,
  },
};

exports.calculateNextStep = (type, status) => {
  const list = Object.keys(this.progressNumbers[type]);
  const tempStatus = status
    .replace("-", "")
    .replace("*", "")
    .replace(" ", "")
    .toLowerCase();
  const idx = list.findIndex((item) => tempStatus == item);
  const nextStep = list[idx] === "issued" ? "completed" : list[idx + 1];
  return this.formatStatus(nextStep);
};

exports.calculatePreviousStep = (type, status) => {
  const list = Object.keys(this.progressNumbers[type]);
  const tempStatus = status.replace("-", "").replace("*", "").toLowerCase();
  const idx = list.findIndex((item) => tempStatus == item);
  const previousStep = list[idx] === "design" ? "design" : list[idx - 1];
  return this.formatStatus(previousStep);
};

exports.formatStatus = (status) => {
  const list = {
    design: "Design",
    stress: "Stress",
    supports: "Supports",
    materials: "Materials",
    issuer: "Issuer",
    toissue: "To Issue",
    issued: "Issued",
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

exports.fillProgress = (data) => {
  return data.map((item) => ({
    ...item,
    progress:
      this.progressNumbers[item.type][
        item.status
          .toLowerCase()
          .replace("-", "")
          .replace("*", "")
          .replace(" ", "")
      ],
  }));
};
