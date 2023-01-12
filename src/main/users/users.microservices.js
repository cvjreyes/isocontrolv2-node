exports.buildQueryService = (roles) => {
  var q = "SELECT name FROM roles WHERE id IN (";
  roles.forEach(({ role_id: role }, i) => {
    q += i === roles.length - 1 ? role : role + ",";
  });
  q += ")";
  return q;
};
