import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Director from "./pages/Director";
import Teamlead from "./pages/Teamlead";
import Associate from "./pages/Associate";
import Calendar from "./pages/Calender";
import Discussion from "./pages/Discussion";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Viewtask from "./pages/Viewtask";
import RejectedTasks from "./pages/Rejected-tasks";
import Addworker from "./components/AddWorker";
import AddManager from "./components/AddManager";
import Addtaskforworker from "./components/AddTaskForWorker";
import Pendingtask from "./pages/Pendingtask";
import RejectedWorkerTask from "./pages/RejectedWorkerTask";
import Workertask from "./pages/Workertask";
import { Login } from "./pages/chat/task/Login";
import { useState, useEffect } from "react";
import { TaskChatRoom } from "./pages/chat/task/TaskChatRoom";
import { Task } from "./types";
import Workercalender from "./pages/Workercalender";
import ForgotPassword from "./components/ForgotPassword";
import RemoveManager from "./components/RemoveManager";
import RemoveWorker from "./components/RemoveWorker";
import ManagerCalendar from "./pages/ManagerCalender";
import Otp from "./components/Otp";
import ConfirmPassword from "./components/ConfirmPassword";
import Anydesk from "./pages/Anydesk";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("nameofuser");
    const role = localStorage.getItem("role");
    if (name) {
      setUsername(name);
    }
    // Set role properly at app level
    if (role) {
      console.log("App role detected:", role);
    }
  }, []);

  const handleLogin = async (
    workerName: string,
    taskName: string,
    role: string
  ) => {
    try {
      // Ensure role is never undefined or empty
      const safeRole = role && role.trim() !== "" ? role : "User";
      console.log("Handle Login - Role:", safeRole);
      console.log("Handle Login - Worker:", workerName);
      console.log("Handle Login - Task:", taskName);

      if (safeRole.includes("Director")) {
        console.log("Director access path");
        // Director fetches task directly - no validation required
        const res = await fetch(
          `http://localhost:4000/api/get-task/${encodeURIComponent(taskName)}`
        );
        const data = await res.json();

        if (res.ok && data.task) {
          setUsername(workerName);
          setCurrentTask(data.task);
          setIsLoggedIn(true);
          console.log("Director task found:", data.task);
        } else {
          console.log("Task not found response:", data);
          alert("Task not found. Please check the task name and try again.");
        }
      } else {
        console.log("Non-Director access path");
        // Validate access for other roles
        const res = await fetch(
          "http://localhost:4000/api/validate-task-access",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              workerName,
              taskName,
              role: safeRole, // Send the safe role
            }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Server error (${res.status}): ${errorText}`);
          alert(`Server error: ${res.status}. Please try again.`);
          return;
        }

        const data = await res.json();
        console.log("Validation response:", data);

        if (data.valid && data.task) {
          setUsername(workerName);
          setCurrentTask(data.task);
          setIsLoggedIn(true);
        } else {
          alert("You do not have access to this task chat.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to validate access. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setCurrentTask(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/addworker" element={<Addworker />} />
        <Route path="/addmanager" element={<AddManager />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/addtaskforworker/:id" element={<Addtaskforworker />} />
        <Route path="/removemanager" element={<RemoveManager />} />
        <Route path="/removeworker" element={<RemoveWorker />} />
        <Route path="/otpcheck" element={<Otp />} />
        <Route path="/confirmpassword" element={<ConfirmPassword />} />

        <Route path="/dashboard" element={<Layout />}>
          <Route path="director" element={<Director />} />
          <Route path="teamlead" element={<Teamlead />} />
          <Route path="associate" element={<Associate />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="discussion" element={<Discussion />} />
          <Route path="viewtask" element={<Viewtask />} />
          <Route path="workercalender" element={<Workercalender />} />
          <Route path="rejected-tasks" element={<RejectedTasks />} />
          <Route path="pending-tasks" element={<Pendingtask />} />
          <Route path="rejectedworkertask" element={<RejectedWorkerTask />} />
          <Route path="workertask" element={<Workertask />} />
          <Route path="managercalender" element={<ManagerCalendar />} />
          <Route path="anydesktop" element={<Anydesk />} />
          <Route
            path="login"
            element={
              !isLoggedIn ? (
                <Login onLogin={handleLogin} />
              ) : currentTask ? (
                <TaskChatRoom
                  task={currentTask}
                  username={username}
                  onLogout={handleLogout}
                />
              ) : null
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
