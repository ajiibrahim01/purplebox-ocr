const nlp = (text) => {
  const doc = nlp(text);
  return {
    people: doc.people().out("array"),
    organizations: doc.organizations().out("array"),
    locations: doc.places().out("array"),
    dates: doc.dates().out("array"),
    money: text.match(/(?:\$|€|£|¥)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g) || [],
  };
};

export default nlp;
