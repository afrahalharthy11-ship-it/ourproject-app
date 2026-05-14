import React from "react";
import { Link } from "react-router-dom";

function ManagerDashboard() {
  return (
    <div className="page-content manager-dashboard">
      <h2 className="page-title">Manager Dashboard</h2>
      <p className="page-subtitle">
        Manage the system: users and appointments overview.
      </p>

      <div className="manager-dashboard-grid">
        <div className="manager-dashboard-card">
          <h4>Appointments</h4>
          <p>View, manage, or delete appointments.</p>
          <Link to="/manager/appointments" className="dashboard-btn primary">
            Go to Appointments
          </Link>
        </div>

        <div className="manager-dashboard-card">
          <h4>Users</h4>
          <p>View all patients and doctors.</p>
          <Link
  to="/manager/users"
  className="dashboard-btn primary"
>
  Go to Users
</Link>

        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
