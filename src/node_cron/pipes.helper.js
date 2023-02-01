const fs = require("fs/promises");

exports.buildRow = (pipe) => {
  return `New :Cpipes /${buildTag(pipe)} :DiametersRefFromCpipes '${
    pipe.line_reference
  }' :720001MTOAREA '${pipe.area}' :720003TRAIN '${pipe.train}'\n`;
};

const buildTag = (pipe) => {
  let tag = "";
  let tag_order = process.env.NODE_TAG_ORDER.split(/[ -]+/);
  for (let i = 0; i < tag_order.length; i++) {
    if (i === tag_order.length - 1) {
      tag += "_" + pipe[tag_order[i]];
    } else if (i === 0) {
      tag = pipe[tag_order[i]];
    } else {
      tag += "-" + pipe[tag_order[i]];
    }
  }
  return tag;
};

exports.writeFile = async (data, fileName) => {
  try {
    await fs.writeFile(`${process.env.NODE_CPIPES_ROUTE}/${fileName}`, data);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
