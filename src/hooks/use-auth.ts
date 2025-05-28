export default function useAuth() {
  const auth = localStorage.getItem("userEmail") || false;

  if (auth) {
    return true;
  } else {
    return false;
  }
}
