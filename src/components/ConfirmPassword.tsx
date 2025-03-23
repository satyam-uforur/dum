import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { KeyRound } from "lucide-react";

const ConfirmPassword = () => {
  const navigate = useNavigate();
  const newpassword = useRef<HTMLInputElement>(null);
  const rnewpassword = useRef<HTMLInputElement>(null);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newPass = newpassword.current?.value;
    const confirmPass = rnewpassword.current?.value;

    if (!newPass || !confirmPass) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPass !== confirmPass) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPass.length < 8 || newPass.length > 12) {
      toast.error("Password must be at least 8 to 12 characters long");
      return;
    }

    const params = { newpassword: newPass, rnewpassword: confirmPass };

    try {
      const response = await axios.post(
        "http://localhost:3535/newpassword",
        params
      );

      if (response.data.status === "changed") {
        toast.success("Password changed successfully!");
        setTimeout(() => {
          navigate("/signin");
        },1500);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      );
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
              Create New Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter and confirm your new password
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newpassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  ref={newpassword}
                  id="newpassword"
                  name="newpassword"
                  type="password"
                  required
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label
                  htmlFor="rnewpassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  ref={rnewpassword}
                  id="rnewpassword"
                  name="rnewpassword"
                  type="password"
                  required
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Change Password
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

export default ConfirmPassword;
