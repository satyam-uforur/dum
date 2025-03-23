import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { KeyRound } from "lucide-react";
import { toast ,ToastContainer } from "react-toastify";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

const handleForgetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const emailValue = emailRef.current?.value || "";
  const params = { email: emailValue };

  try {
    const response = await axios.post("http://localhost:3535/otp", params);

    if (response.data.status === "valid_user") {
      localStorage.clear();
      localStorage.setItem("userEmail", emailValue);
      toast.success("OTP sent to your email");
      navigate("/otpcheck");
    } else if (response.data.status === "invalid_user") {
      toast.error("Invalid email");
    } else {
      toast.warning("Please enter a valid email");
    }
  } catch (error) {
    toast.error("Something went wrong. Please try again.");
    console.error("Error in forgot password:", error);
  }
};

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <ToastContainer />
      <div className="max-w-md w-full space-y-8 bg-gray-50 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-black rounded-full flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the email address you used to register. You will
            receive an OTP to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleForgetPassword}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              Send OTP
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/signin");
              }}
              className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
