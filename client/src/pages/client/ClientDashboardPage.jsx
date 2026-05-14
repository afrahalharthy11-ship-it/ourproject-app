import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  Collapse,
} from "reactstrap";
import { fetchPatientAppointments } from "../../redux/appointmentSlice";

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

function ClientDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: appointments, loading, error } = useSelector(
    (state) => state.appointments
  );

  const [showReminder, setShowReminder] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationTimer = useRef(null);

  useEffect(() => {
    dispatch(fetchPatientAppointments());
  }, [dispatch]);

  /* ===== Correct Upcoming Logic ===== */
  const upcoming = appointments.filter((a) => {
    if (a.status !== "confirmed") return false;

    const dateOnly = a.date.split("T")[0];
    const appointmentDateTime = new Date(
      `${dateOnly}T${a.startTime}:00`
    );

    return appointmentDateTime > new Date();
  });

  const total = appointments.length;
  const cancelled = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  // أقرب موعد قادم فقط
  const nextAppointment = upcoming[0];

  /* ===== Temporary Notification (5 seconds) ===== */
  useEffect(() => {
    if (nextAppointment) {
      setShowNotification(true);
      notificationTimer.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, [nextAppointment]);

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">
          Welcome, <span className="text-primary">{user?.name}</span>
        </h2>
        <p className="text-muted">
          Here's an overview of your appointments
        </p>
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
            <Col xs={12} md={4}>
              <StatCard
                value={total}
                label="Total Appointments"
                icon="📅"
                color="primary"
              />
            </Col>
            <Col xs={12} md={4}>
              <StatCard
                value={upcoming.length}
                label="Upcoming"
                icon="🕐"
                color="success"
              />
            </Col>
            <Col xs={12} md={4}>
              <StatCard
                value={cancelled}
                label="Cancelled"
                icon="✕"
                color="danger"
              />
            </Col>
          </Row>

          {/* ===== Temporary Notification ===== */}
          {showNotification && (
            <div
              className="alert alert-success d-flex align-items-center py-2 mb-2"
              style={{ maxWidth: "420px" }}
            >
              <span className="me-2">🔔</span>
              <span>
                There is an upcoming appointment reminder
              </span>
            </div>
          )}

          {/* ===== Reminder Toggle Button ===== */}
          {nextAppointment && (
            <button
              className="btn btn-sm btn-outline-success mb-3"
              onClick={() => setShowReminder(!showReminder)}
            >
              {showReminder ? "Hide Reminder" : "View Reminder"}
            </button>
          )}

          {/* ===== Reminder (Collapse Animation) ===== */}
          {nextAppointment && (
            <Collapse isOpen={showReminder}>
              <Card className="mb-4">
                <CardBody>
                  <h6 className="fw-semibold mb-2">
                    Appointment Reminder / تذكير بالموعد
                  </h6>

                  <p className="mb-1">
                    <strong>From:</strong>{" "}
                    dr.saja@smarthealthcare.com
                  </p>
                  <p className="mb-3">
                    <strong>Subject:</strong>{" "}
                    Appointment Reminder
                  </p>

                  <hr />

                  {/* English */}
                  <p><strong>English</strong></p>
                  <p>
                    Dear {user?.name},
                    <br />
                    This is a reminder for your upcoming appointment
                    with
                    <strong>
                      {" "}Dr. {nextAppointment.doctorId?.name}
                    </strong>.
                    <br />
                    <strong>Date:</strong>{" "}
                    {new Date(nextAppointment.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                    <br />
                    <strong>Time:</strong>{" "}
                    {nextAppointment.startTime} –{" "}
                    {nextAppointment.endTime}
                    <br />
                    Please make sure to attend on time.
                  </p>

                  <hr />

                  {/* Arabic */}
                  <p style={{ direction: "rtl", textAlign: "right" }}>
                    <strong>العربية</strong>
                  </p>
                  <p style={{ direction: "rtl", textAlign: "right" }}>
                    عزيزتنا {user?.name}،
                    <br />
                    هذا تذكير بموعدك القادم مع
                    <strong>
                      {" "}الدكتورة {nextAppointment.doctorId?.name}
                    </strong>.
                    <br />
                    <strong>التاريخ:</strong>{" "}
                    {new Date(nextAppointment.date).toLocaleDateString(
                      "ar-EG",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    <br />
                    <strong>الوقت:</strong>{" "}
                    {nextAppointment.startTime} –{" "}
                    {nextAppointment.endTime}
                    <br />
                    نرجو الحضور في الوقت المحدد.
                  </p>
                </CardBody>
              </Card>
            </Collapse>
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
                      <h6 className="fw-semibold mb-1">
                        Dr. {appt.doctorId?.name}
                      </h6>
                      <Badge color={STATUS_COLOR[appt.status]}>
                        {appt.status}
                      </Badge>
                      <div className="mt-2">
                        {appt.startTime} – {appt.endTime}
                      </div>
                      <div className="text-muted">
                        {appt.duration} min
                      </div>
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

export default ClientDashboardPage;