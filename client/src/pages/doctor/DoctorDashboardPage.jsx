import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  Button,
} from "reactstrap";
import { fetchDoctorAppointments } from "../../redux/appointmentSlice";

const STATUS_COLOR = {
  confirmed: "success",
  cancelled: "secondary",
};

function StatCard({ value, label, icon, color }) {
  return (
    <Card className="stat-card h-100">
      <CardBody className="d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${color}-subtle text-${color}`}>
          {icon}
        </div>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label text-muted">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}

function DoctorDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: appointments, loading, error } = useSelector(
    (state) => state.appointments
  );

  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  /* =========================
     Upcoming Logic (Correct)
  ========================= */
  const upcoming = appointments.filter((a) => {
    if (a.status !== "confirmed") return false;

    const dateOnly = a.date.split("T")[0];
    const appointmentDateTime = new Date(
      `${dateOnly}T${a.startTime}:00`
    );

    return appointmentDateTime > new Date();
  });

  /* =========================
     Simulate Email Reminder
  ========================= */
  const sendReminder = (email) => {
    setReminderMessage(
      `Reminder email sent successfully to ${email}`
    );

    setTimeout(() => {
      setReminderMessage("");
    }, 3000);
  };

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">
          Good day,{" "}
          <span className="text-primary">Dr. {user?.name}</span>
        </h2>
        {user?.specialty && (
          <p className="text-muted">
            <Badge color="primary" pill>
              {user.specialty}
            </Badge>
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      )}

      {error && <Alert color="danger">{error}</Alert>}

      {!loading && (
        <>
          {/* ===== Stats ===== */}
          <Row className="g-4 mb-4">
            <Col xs={12} md={6}>
              <StatCard
                value={appointments.length}
                label="Total Bookings"
                icon="📋"
                color="primary"
              />
            </Col>
            <Col xs={12} md={6}>
              <StatCard
                value={upcoming.length}
                label="Upcoming"
                icon="🕐"
                color="success"
              />
            </Col>
          </Row>

          {/* ===== Reminder Message ===== */}
          {reminderMessage && (
            <Alert color="success" className="mb-3">
              {reminderMessage}
            </Alert>
          )}

          {/* ===== Upcoming Appointments ===== */}
          <h5 className="mb-3 fw-semibold">
            Upcoming Appointments
          </h5>

          {upcoming.length === 0 ? (
            <Card className="empty-state-card">
              <CardBody className="text-center py-5">
                <h6 className="text-muted">
                  No upcoming appointments
                </h6>
              </CardBody>
            </Card>
          ) : (
            <Row className="g-3">
              {upcoming.slice(0, 3).map((appt) => (
                <Col key={appt._id} xs={12} md={6} lg={4}>
                  <Card className="appt-card h-100">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-semibold mb-0">
                          {appt.patientId?.name || "Patient"}
                        </h6>
                        <Badge
                          color={
                            STATUS_COLOR[appt.status] ||
                            "secondary"
                          }
                        >
                          {appt.status}
                        </Badge>
                      </div>

                      <p className="text-muted small mb-2">
                        {appt.patientId?.email || ""}
                      </p>

                      <div className="appt-detail">
                        {new Date(appt.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      <div className="appt-detail">
                        {appt.startTime} – {appt.endTime}
                      </div>

                      <div className="appt-detail">
                        {appt.duration} min
                      </div>

                      {appt.notes && (
                        <div className="appt-notes mt-2">
                          <small className="text-muted">
                            "{appt.notes}"
                          </small>
                        </div>
                      )}

                      <Button
                        size="sm"
                        color="primary"
                        outline
                        className="mt-3"
                        onClick={() =>
                          sendReminder(
                            appt.patientId?.email || "patient"
                          )
                        }
                      >
                        Send Reminder
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </div>
  );
}

export default DoctorDashboardPage;
