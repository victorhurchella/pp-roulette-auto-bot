export function generateSession(): string {
  const length = 6;

  let result = "";

  const characters =
    "0Aa1Bb2Cc3Dd4Ee5Ff6Gg7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
