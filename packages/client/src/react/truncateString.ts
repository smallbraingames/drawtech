const ELLIPSIS = "…";
const truncateString = (str: string, maxLength: number): string => {
  const strLength = str.length;

  if (strLength <= maxLength) {
    return str;
  }

  const charsToShow = maxLength - ELLIPSIS.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return (
    str.substring(0, frontChars) +
    ELLIPSIS +
    str.substring(strLength - backChars)
  );
};

export default truncateString;
