import axios from "axios";
import { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { User, Mail, Lock, Eye, EyeOff, CalendarRange, Phone } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const username = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const role = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const password = useRef<HTMLInputElement>(null);
  const mobile = useRef<HTMLInputElement>(null);
  const Navigate = useNavigate();
  const nameofrole = localStorage.getItem("role");

  const register = (e:any) => {
    e.preventDefault();

    var obj = {
      username: username.current?.value || "",
      email: email.current?.value || "",
      password: password.current?.value || "",
      role: role.current?.value || "",
      mobile: mobile.current?.value || "",
    };

    axios
      .post("http://localhost:3535/add", obj)
      .then(function (response) {
        // handle success
        console.log(response);
        if (response.data.status == "done") {
          toast(`${obj.username} Register Successfully`);
          localStorage.setItem("email", obj.email);
          Navigate("/signin");
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        toast("An error occurred",error);
      });
  };

  return (
    <>
      <ToastContainer />
      {nameofrole == "Director" && (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-gray-600">
                  Sign Up to access your account
                </p>
              </div>
              <form className="space-y-2" onSubmit={register}>
                <div>
                  <label
                    htmlFor="Username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="username"
                      id="username"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#1fd43a] focus:border-[#1fd43a] bg-white text-black"
                      placeholder="Man000"
                      required
                      ref={username}
                      name="username"
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <div className="relative">
                    <input
                      type="role"
                      id="role"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#1fd43a] focus:border-[#1fd43a] bg-white text-black"
                      placeholder="Role"
                      required
                      ref={role}
                      name="role"
                    />
                    <CalendarRange className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#1fd43a] focus:border-[#1fd43a] bg-white text-black"
                      placeholder="user@example.com"
                      required
                      ref={email}
                      name="email"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 mt-1" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile No
                  </label>
                  <div className="relative">
                    <input
                      type="mobile"
                      id="mobile"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#1fd43a] focus:border-[#1fd43a] bg-white text-black"
                      placeholder="123456789"
                      required
                      ref={mobile}
                      name="mobile"
                    />
                    <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 mt-1" />
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#1fd43a] focus:border-[#1fd43a] bg-white text-black"
                      placeholder="••••••••"
                      required
                      name="password"
                      ref={password}
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      className="absolute right-1 top-0.5 bg-white hover:bg-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-9 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-9 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mt-4"
                  >
                    Sign Up
                  </button>
                </div>
              </form>

              <div className="mt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      "Already have an account?"
                    </span>
                  </div>
                </div>

                <button
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mt-4"
                  onClick={() => Navigate("/signin")}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>)}  
    </>
  );
};

export default Signup;
