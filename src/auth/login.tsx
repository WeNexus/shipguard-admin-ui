import { useState } from "react";
import { useNavigate } from "react-router";
import { BASE_URL } from "../config";
const googleLogo = "https://shipguard.nyc3.cdn.digitaloceanspaces.com/ShipGuard-Widget-Assets/assets/Logo-google-icon-PNG.png";
const appLogo = 'https://shipguard.nyc3.cdn.digitaloceanspaces.com/ShipGuard-Widget-Assets/app-logo/Inhouse-Shipping-Protection.png'

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: any) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch(`${BASE_URL}/admin/api`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        if (data.redirect) {
          localStorage.setItem("userEmail", data.email);
          navigate("/");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Login failed. Please check your credentials.");
        setLoading(false);
      });
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-50">
        {/* Logo */}
        <img src={appLogo} alt="Logo" className="h-10 mb-4" />
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Log in to your account
          </h2>
          {/* {fetcher.data?.error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {fetcher.data.error}
            </p>
          )} */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="sifat@wenexus.io"
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center !mb-4">{error}</p>
            )}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Loading..." : "Log In"}
            </button>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100 flex justify-center items-center gap-2"
              >
                <img className="w-4 h-4" src={googleLogo} alt="logo" /> Sign in
                with Google
              </button>
            </div>
            <div className="text-center">
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right - Promo Section */}
      <div className="hidden md:flex w-1/2 bg-blue-700 text-white flex-col justify-center items-center text-center p-10">
        <h3 className="text-2xl font-bold mb-4">
          Spin up GPU Droplets to run AI/ML workloads
        </h3>
        <p className="max-w-md mb-6">
          Our flexible, easy-to-use GPU solution is perfect for devs needing
          on-demand compute, cost-effectiveness, and fast deployment.
        </p>
        <p className="max-w-md mb-6">
          Train GenAI apps, analyze huge data sets, perform inference, and much
          more on GPU Droplets.
        </p>
        <a
          href="#"
          className="bg-white text-blue-700 px-6 py-2 rounded hover:bg-gray-200 transition"
        >
          Learn more
        </a>
      </div>
    </div>
  );
};

export default Login;
