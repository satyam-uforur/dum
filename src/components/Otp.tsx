import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { KeyRound } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

const Otp = () => {
  const navigate = useNavigate();
  const otp = useRef<HTMLInputElement>(null);

const handleCheckOtp = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const params = { otp: otp.current?.value };

  try {
    const response = await axios.post("http://localhost:3535/checkotp", params);

    if (response.data.status === "otp_varified") {
      toast.success("OTP Verified");
      navigate("/confirmpassword");
    } else {
      toast.error("Invalid OTP");
    }
  } catch (error) {
    toast.error("Something went wrong. Please try again.");
    console.error("Error in OTP verification:", error);
  }
};

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-gray-50 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-black rounded-full flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Enter OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter the OTP sent to your email address
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleCheckOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp" className="sr-only">
                  Enter OTP
                </label>
                <input
                  ref={otp}
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Enter OTP"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Verify OTP
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
    </>
  );
};

export default Otp;
