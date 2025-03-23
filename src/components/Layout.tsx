"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Calendar,
  MessageSquare,
  BookmarkX,
  CheckSquare,
  Menu,
  Album,
} from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

interface Task {
  _id: string;
  assigndate: string;
  detail: string;
  duedate: string;
  mainstatus: string;
  manageraction: string;
  name: string;
  priority: "low" | "medium" | "high";
  task: string;
  workercount: number;
  title: string;
  actionStatuses: string[];
  taskforworker: string;
  taskforworker_details: any[];
  actions: string;
}

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const [taskData, setTaskData] = useState<Task[]>([]);

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

  useEffect(() => {
    axios
      .get("http://localhost:3535/taskalldetail")
      .then((response) => {
        setTaskData(response.data.data);
        console.log(response.data.data);
      })
      .catch(() => toast("Failed to fetch task data."));
  }, []);

  // Count tasks by status
  const OwnerTasks = taskData.length;
  const ManagerTasks = taskData
    .filter((task) => task.name === localStorage.getItem("nameofuser"))
    .filter((task) => task.manageraction === "accepted").length;

  const WorkerTasks = () => {
    const matchingDetails = taskData.flatMap((task) =>
      task.taskforworker_details.filter((detail) => {
        // console.log(`Checking detail at index ${index}:`, detail); // Debugging log

        return (
          detail.workers &&
          detail.workers.includes(localStorage.getItem("nameofuser")) &&
          Array.isArray(detail.actionStatuses) &&
          detail.actionStatuses.length > 0 &&
          detail.actionStatuses?.some(
            (action: any) => action.actions === "accepted"
          )
        );
      })
    );

    // console.log("Matching Details:", matchingDetails);
    return matchingDetails.length;
  };

  const associateTasks = () => {
    const matchingDetails = taskData.flatMap((task) =>
      task.taskforworker_details.filter((detail) => {
        // console.log(`Checking detail at index ${index}:`, detail); // Debugging log

        return (
          (detail.workers &&
            detail.name.includes(localStorage.getItem("nameofuser")) &&
            Array.isArray(detail.actionStatuses) &&
            detail.actionStatuses.length === 0) ||
          detail.actionStatuses?.some(
            (action: any) => action.actions === "accepted"
          ) ||
          detail.actionStatuses?.some(
            (action: any) => action.actions === "initiated"
          )
        );
      })
    );

    // console.log("Matching Details:", matchingDetails);
    return matchingDetails.length;
  };

  const rejectedManagerTasks = () => {
    const rejectedTasks = taskData.flatMap((task) =>
      task.taskforworker_details.filter((detail) => {
        // console.log(`Checking Rejected Worker detail at index ${index}:`, detail);
        return (
          (detail.actionStatuses &&
            Array.isArray(
              detail.actionStatuses && detail.actionStatuses.length > 0
            )) ||
          detail.actionStatuses?.some(
            (action: any) => action.actions === "declined"
          )
        );
      })
    );

    // console.log("Rejected Manager Tasks:", rejectedTasks);
    return rejectedTasks.length;
  };

  const pendingManagerTasks = taskData
    .filter((task) => task.manageraction === "initiated")
    .filter((task) => task.name === localStorage.getItem("nameofuser")).length;

  const pendingWorkerTasks = () => {
    const matchingDetails = taskData.flatMap((task) =>
      task.taskforworker_details.filter((detail) => {
        // console.log(`Checking detail at index ${index}:`, detail); // Debugging log

        return (
          (detail.workers &&
            detail.workers.includes(localStorage.getItem("nameofuser")) &&
            Array.isArray(detail.actionStatuses) &&
            detail.actionStatuses.length === 0) ||
          detail.actionStatuses?.some((action: any) => action.actions === "") ||
          detail.actionStatuses?.some(
            (action: any) => action.actions === "initiated"
          )
        );
      })
    );

    // console.log("Matching Details:", matchingDetails);
    return matchingDetails.length;
  };

  const rejectedOwnerTasks = taskData.filter(
    (task) => task.manageraction === "declined"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-4 text-xl font-semibold">
                Task Management System
              </h1>
            </div>
            <div className="flex items-center">
              {localStorage.getItem("nameofuser") && (
                <span className="text-gray-700 mr-4">
                  {localStorage.getItem("nameofuser")}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {localStorage.getItem("nameofuser") ? (
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/signin";
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/signin"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white shadow-sm transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-14"
        }`}
      >
        <div className="py-4">
          {/* Dashboard */}
          <Link
            to={userdashboard()}
            className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
              location.pathname === "/"
                ? "bg-gray-50 text-black font-medium"
                : ""
            }`}
          >
            <div className="flex items-center">
              <LayoutGrid
                size={20}
                className={isSidebarOpen ? "" : "mx-auto"}
              />
              <span
                className={`ml-4 transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Dashboard
              </span>
            </div>
            {OwnerTasks > 0 &&
              localStorage.getItem("role")?.includes("Director") && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {OwnerTasks}
                </span>
              )}
            {ManagerTasks > 0 &&
              localStorage.getItem("role")?.includes("TeamLead") && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {ManagerTasks}
                </span>
              )}
            {WorkerTasks() + ManagerTasks > 0 &&
              localStorage.getItem("role")?.includes("Associate") && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {WorkerTasks() + ManagerTasks}
                </span>
              )}
          </Link>

          {/* Access Any Task */}
          {localStorage.getItem("role")?.includes("Director") && (
            <Link
              to="/dashboard/anydesktop"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                location.pathname === "/dashboard/anydesktop"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <CheckSquare
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Other Desk
                </span>
              </div>
            </Link>
          )}

          {/* Manager Tasks Pending Tasks */}
          {localStorage.getItem("role")?.includes("TeamLead") &&
            !localStorage.getItem("role")?.includes("Associate") && (
              <Link
                to="/dashboard/viewtask"
                className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                  location.pathname === "/dashboard/viewtask"
                    ? "bg-gray-50 text-black font-medium"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <CheckSquare
                    size={20}
                    className={isSidebarOpen ? "" : "mx-auto"}
                  />
                  <span
                    className={`ml-4 transition-opacity duration-200 ${
                      isSidebarOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Pending
                  </span>
                </div>
                {pendingManagerTasks > 0 &&
                  localStorage.getItem("role")?.includes("TeamLead") && (
                    <span
                      className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                        isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                      }`}
                    >
                      {pendingManagerTasks}
                    </span>
                  )}
              </Link>
            )}

          {/* Worker Pending Tasks */}
          {localStorage.getItem("role")?.includes("Associate") && (
            <Link
              to="/dashboard/pending-tasks"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                location.pathname === "/dashboard/pending-tasks"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <CheckSquare
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Pending
                </span>
              </div>
              {pendingWorkerTasks() + pendingManagerTasks > 0 && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {pendingWorkerTasks() + pendingManagerTasks}
                </span>
              )}
            </Link>
          )}

          {/* Rejected Tasks */}
          {localStorage.getItem("role")?.includes("Director") && (
            <Link
              to="/dashboard/rejected-tasks"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                location.pathname === "/dashboard/rejected-tasks"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <BookmarkX
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Rejected
                </span>
              </div>
              {rejectedOwnerTasks > 0 && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {rejectedOwnerTasks}
                </span>
              )}
            </Link>
          )}

          {localStorage.getItem("role")?.includes("TeamLead") && (
            <Link
              to="/dashboard/rejectedworkertask"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                location.pathname === "/dashboard/rejectedworkertask"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <BookmarkX
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Rejected
                </span>
              </div>
              {rejectedManagerTasks() > 0 && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {rejectedManagerTasks()}
                </span>
              )}
            </Link>
          )}

          {localStorage.getItem("role")?.includes("TeamLead") && (
            <Link
              to="/dashboard/workertask"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 relative ${
                location.pathname === "/dashboard/workertask"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <Album size={20} className={isSidebarOpen ? "" : "mx-auto"} />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Associate
                </span>
              </div>
              {associateTasks() > 0 && (
                <span
                  className={`flex items-center justify-center min-w-5 h-5 rounded-full bg-gray-200 text-xs font-medium ${
                    isSidebarOpen ? "ml-2" : "absolute -right-2 -top-1"
                  }`}
                >
                  {associateTasks()}
                </span>
              )}
            </Link>
          )}

          {/* Calendar */}
          {localStorage.getItem("role")?.includes("Director") && (
            <Link
              to="/dashboard/calendar"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                location.pathname === "/dashboard/calendar"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <Calendar
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Calendar
                </span>
              </div>
            </Link>
          )}

          {(localStorage.getItem("role") || "").includes("TeamLead") ||
          localStorage.getItem("role")?.includes("Associate") ? (
            <Link
              to="/dashboard/managercalender"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                location.pathname === "/dashboard/managercalender"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <Calendar
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Director Calendar
                </span>
              </div>
            </Link>
          ) : null}

          {localStorage.getItem("role")?.includes("Associate") && (
            <Link
              to="/dashboard/workercalender"
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                location.pathname === "/dashboard/workercalender"
                  ? "bg-gray-50 text-black font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <Calendar
                  size={20}
                  className={isSidebarOpen ? "" : "mx-auto"}
                />
                <span
                  className={`ml-4 transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  TeamLead Calendar
                </span>
              </div>
            </Link>
          )}

          {/* Discussion */}
          <Link
            to="/dashboard/discussion"
            className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
              location.pathname === "/dashboard/discussion"
                ? "bg-gray-50 text-black font-medium"
                : ""
            }`}
          >
            <div className="flex items-center">
              <MessageSquare
                size={20}
                className={isSidebarOpen ? "" : "mx-auto"}
              />
              <span
                className={`ml-4 transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Discussion
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="p-6">
          <Outlet /> {/* This is where child routes will be rendered */}
        </div>
      </main>
    </div>
  );
};

export default Layout;
