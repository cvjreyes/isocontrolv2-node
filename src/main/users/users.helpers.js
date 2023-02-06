exports.getName = (email) => {
  const idx1 = email.indexOf(".");
  const idx2 = email.indexOf("-");
  const idx3 = email.indexOf("@");
  if (idx1 > idx3 && idx2 === -1) {
    // 1 name
    return `${
      email.substring(0, idx3).charAt(0).toUpperCase() +
      email.substring(0, idx3).slice(1)
    }`;
  } else if (idx1 > idx3) {
    // 1 name 1 surname
    const name = email.substring(0, idx2);
    const surname = email.substring(idx2 + 1, idx3);
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ${
      surname.charAt(0).toUpperCase() + surname.slice(1)
    }`;
  } else if (idx3 > idx1 && idx2 == -1) {
    // 2 names
    const name = email.substring(0, idx1);
    const surname = email.substring(idx1 + 1, idx3);
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ${
      surname.charAt(0).toUpperCase() + surname.slice(1)
    }`;
  } else if (idx1 > idx2) {
    // 2 names
    const name1 = email.substring(0, idx2);
    const name2 = email.substring(idx2 + 1, idx1);
    const surname = email.substring(idx1 + 1, idx3);
    return `${name1.charAt(0).toUpperCase() + name1.slice(1)} ${
      name2.charAt(0).toUpperCase() + name2.slice(1)
    } ${surname.charAt(0).toUpperCase() + surname.slice(1)}`;
  } else {
    // 2 surnames
    const name = email.substring(0, idx1);
    const surname1 = email.substring(idx1 + 1, idx2);
    const surname2 = email.substring(idx2 + 1, idx3);
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ${
      surname1.charAt(0).toUpperCase() + surname1.slice(1)
    } ${surname2.charAt(0).toUpperCase() + surname2.slice(1)}`;
  }
};
