"use client";

import axios from "axios";
import type React from "react";
import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Addworker = () => {
  const username = useRef<HTMLInputElement>(null);
  const role = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const domain = useRef<HTMLInputElement>(null);
  const Navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const mobile = useRef<HTMLInputElement>(null);

  const userdashboard = () => {
    const username = localStorage.getItem("role") || "";
    if (username.startsWith("Director")) {
      return "/dashboard/director";
    } else if (username.startsWith("TeamLead")) {
      return "/dashboard/teamlead";
    } else if (username.startsWith("Associate")) {
      return "/dashboard/associate";
    }
    return "/";
  };

  const register = (e: React.FormEvent) => {
    e.preventDefault();

    const obj = {
      username: username.current?.value,
      role: role.current?.value,
      email: email.current?.value,
      domain: domain.current?.value,
      password: password.current?.value,
      mobile: mobile.current?.value,
    };

    axios
      .post("http://localhost:3535/add", obj)
      .then((response) => {
        console.log(response);
        if (response.data.status === "done") {
          toast("Worker added successfully");
          localStorage.setItem("email", obj.email || "");
          setTimeout(() => {Navigate(userdashboard());},2000)
        }
      })
      .catch((error) => {
        console.log(error);
        toast("An error occurred");
      });
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">New Worker</h2>
              <p className="mt-2 text-gray-600">Create New Worker Account</p>
            </div>
            <form className="space-y-4" onSubmit={register}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Wor000"
                    required
                    ref={username}
                    className="pl-10"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <Input
                    id="role"
                    type="text"
                    placeholder="Associate"
                    readOnly
                    defaultValue={"Associate"}
                    required
                    ref={role}
                    className="pl-10"
                  />
                  <Briefcase className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="worker@example.com"
                    required
                    ref={email}
                    className="pl-10"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <div className="relative">
                  <Input
                    id="mobile"
                    type="mobile"
                    placeholder="1234567890"
                    required
                    ref={mobile}
                    className="pl-10"
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    ref={password}
                    className="pl-10"
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

              <Button type="submit" className="w-full">
                Add Worker
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => Navigate(`${userdashboard()}`)}
              >
                Cancel
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addworker;
