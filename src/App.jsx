
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Home from "./pages/Home";
import AuthSuccess from "./pages/AuthSuccess";
import { CreateAccount, AdminDashboard } from "./pages/AdminPage";
import DoctorRoute from "./pages/DoctorPage/DoctorRoute";
import StaffLayout from "./pages/StaffPage/StaffLayout";
//import StaffHome from "./pages/StaffPage/StaffHome";
import StaffAppointments from "./pages/StaffPage/StaffAppointments";
import ManagementLayout from "./pages/ManagementPage/ManagementLayout";
import ManagementDashboard from "./pages/ManagementPage/ManagementDashboard";
import ManagementScheduleStaff from "./pages/ManagementPage/ManagementScheduleStaff";
import ManagementScheduleDoctor from "./pages/ManagementPage/ManagementScheduleDoctor";
import ProfilePage from "./pages/patient/ProfilePage";
import ProfileGuard from "./components/ProfileGuard";
import ForgotPasswordPage from "./pages/ForgotPassword";
import PaymentStatusPage from "./pages/patient/PaymentStatusPage";
import ReschedulePage from './pages/patient/ReschedulePage';
import StaffContacts from "./pages/StaffPage/StaffContacts";
import StaffInvoices from "./pages/StaffPage/StaffInvoices";
import PaymentHistory from './pages/StaffPage/PaymentHistory';
import LocationsPage from "./pages/ManagementPage/LocationsPage";
import ManagementInformation from "./pages/ManagementPage/ManagementInformation";
import RevenueStatistics from "./pages/ManagementPage/RevenueStatistics";
import InventoryManagement from "./pages/StaffPage/InventoryManagement";
import EquipmentManagement from "./pages/StaffPage/EquipmentManagement";
import ReportIssue from "./pages/StaffPage/ReportIssue";
import StaffTypeGuard from "./components/StaffTypeGuard";
import ManagementProfilePage from "./pages/ManagementPage/ManagementProfilePage";
import StaffProfilePage from "./pages/StaffPage/StaffProfilePage";
import StaffSchedulePage from "./pages/StaffPage/StaffSchedulePage";
import ViewManagerEquipmentIssue from './pages/ManagementPage/ViewManagerEquipmentIssue';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProfileGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            <Route path="/staff" element={<StaffLayout />}>
              {/* <Route index element={<StaffHome />} /> */}
              <Route path="work-schedule" element={<StaffSchedulePage />} />
              <Route path="receptionist/profile/self" element={<StaffProfilePage />} />
              <Route path="store/profile/self" element={<StaffProfilePage />} />
              <Route element={<StaffTypeGuard allowedType="receptionist" />}>
              <Route path="appointments" element={<StaffAppointments />} />
              <Route path="contacts" element={<StaffContacts />} />
              {/* Placeholders for future */}
              {/* <Route path="patients" element={<StaffHome />} /> */}
              <Route path="invoices" element={<StaffInvoices />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              
              </Route>
              
              <Route element={<StaffTypeGuard allowedType="storeKepper" />}>
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="equipment" element={<EquipmentManagement />} />
              <Route path="report-issue" element={<ReportIssue />} />
              </Route>
            </Route>
            {/* Placeholders for future */}
            <Route path="/management" element={<ManagementLayout />}>
              <Route index element={<ManagementDashboard />} />
              <Route path="equipment-issues" element={<ViewManagerEquipmentIssue />} />
              <Route path="profile" element={<ManagementProfilePage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="information" element={<ManagementInformation />} />
              <Route path="doctor/information" element={<ManagementScheduleDoctor />} />
              <Route path="doctor/schedule" element={<ManagementScheduleDoctor />} />
              
              <Route path="location/:locationId/doctor/schedule/fulltime" element={<ManagementScheduleDoctor />} />
              <Route path="location/:locationId/doctor/schedule/parttime" element={<ManagementScheduleDoctor />} />
  
              <Route path="staff/information" element={<ManagementScheduleStaff />} />
              <Route path="staff/schedule" element={<ManagementScheduleStaff />} />

              <Route path="location/:locationId/staff/schedule/fulltime" element={<ManagementScheduleStaff />} />
              <Route path="location/:locationId/staff/schedule/parttime" element={<ManagementScheduleStaff />} />
  
              <Route path="revenue" element={<RevenueStatistics />} />
            </Route>
            {/* Placeholders for future */}
            <Route path="/doctor/*" element={<DoctorRoute />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ForgotPasswordPage />} />
            <Route path="/payment" element={<PaymentStatusPage />} />
            <Route path="/reschedule" element={<ReschedulePage />} />
          </Routes>
        </ProfileGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;