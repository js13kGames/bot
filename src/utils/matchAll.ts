export const matchAll = (text: string, re: RegExp) => {
  re.lastIndex = -1;

  const matches: string[][] = [];
  let m;
  while ((m = re.exec(text))) {
    matches.push(m);
  }
  return matches;
};
