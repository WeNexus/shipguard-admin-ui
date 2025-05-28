export default function useAuth() {
  const auth = sessionStorage.getItem("userEmail") || false;

  if (auth) {
    return true;
  } else {
    return false;
  }
}
