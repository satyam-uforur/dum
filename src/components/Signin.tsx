import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const register = (e: React.FormEvent) => {
    e.preventDefault();

    const obj = {
      username: username.current?.value || "",
      password: password.current?.value || "",
    };

    axios
      .post("http://localhost:3535/verify", obj)
      .then(function () {
        localStorage.setItem("nameofuser", obj.username);
        localStorage.setItem("loginnn", "done");
        axios
          .get("http://localhost:3535/getuser", {
            params: { username: obj.username },
          })
          .then(function (response) {
            localStorage.setItem("role", response.data.data.role);
            toast.success("Login Successful..");
            setTimeout(() => {
              if (response.data.data.role.includes("Director")) {
                navigate("/dashboard/director");
              } else if (response.data.data.role.includes("TeamLead")) {
                navigate("/dashboard/teamlead");
              } else if (response.data.data.role.includes("Associate")) {
                navigate("/dashboard/associate");
              } else {
                navigate("/"); // Default route
              }
            }, 1500);
          })
          .catch(function (error) {
            toast(error.response.data.message);
          });
      })
      .catch(function (error) {
        toast(error.response.data.message);
      });
  };

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen bg-white">
        {/* Left side with branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-black mb-4">TMC</h1>
            <h2 className="text-4xl font-bold text-black mb-6">
              Task Management System
            </h2>
            <p className="text-xl text-gray-700">
              Streamline your workflow and boost productivity with our intuitive
              task management solution.
            </p>
          </div>
        </div>

        {/* Right side with login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <p className="mt-1 text-gray-500 font-bold">
                Enter TMC ID & Password
              </p>
            </div>

            <form className="space-y-4" onSubmit={register}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white text-gray-900"
                    placeholder="Enter username"
                    required
                    ref={username}
                    name="username"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white text-gray-900"
                    placeholder="••••••••"
                    required
                    name="password"
                    ref={password}
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors mt-2"
              >
                Sign In
              </button>
            </form>

              <div className="mt-2 text-center">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => navigate("/forgotpassword")}
                >
                  Forgot password?
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
