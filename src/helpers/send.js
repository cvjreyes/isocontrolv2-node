exports.send = (res, ok, body, err) => {
  return res.send({ ok, body, err });
};
