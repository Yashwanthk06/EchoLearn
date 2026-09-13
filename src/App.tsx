import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { AppLayout } from "./components/layout/AppLayout";

import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Learn } from "./pages/Learn";
import { TopicLearning } from "./pages/TopicLearning";
import { TeachBack } from "./pages/TeachBack";
import { Assessment } from "./pages/Assessment";
import { Gaps } from "./pages/Gaps";
import { LearningPath } from "./pages/LearningPath";
import { Progress } from "./pages/Progress";
import { ParentUpdates } from "./pages/ParentUpdates";


function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-500">
            Loading EchoLearn...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          {/* Public routes */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* Protected application routes */}

          <Route element={<ProtectedRoutes />}>

            {/* Home */}

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/home"
              element={<Dashboard />}
            />


            {/* Learn */}

            <Route
              path="/learn"
              element={<Learn />}
            />

            <Route
              path="/learn/:topicId"
              element={<TopicLearning />}
            />


            {/* Main features */}

            <Route
              path="/teach-back"
              element={<TeachBack />}
            />

            <Route
              path="/assessment"
              element={<Assessment />}
            />

            <Route
              path="/gaps"
              element={<Gaps />}
            />

            <Route
              path="/learning-path"
              element={<LearningPath />}
            />

            <Route
              path="/progress"
              element={<Progress />}
            />

            <Route
              path="/parent-updates"
              element={<ParentUpdates />}
            />

          </Route>


          {/* Unknown URL → Home */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}