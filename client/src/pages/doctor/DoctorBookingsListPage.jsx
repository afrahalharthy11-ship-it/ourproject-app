import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Badge, Spinner, Alert, Card, CardBody } from "reactstrap";
import { fetchDoctorAppointments } from "../../redux/appointmentSlice";

const STATUS_COLOR = {
  confirmed: "success",
  cancelled: "secondary",
};

function DoctorBookingsListPage() {
  const dispatch = useDispatch();
  const {
    list: appointments,
    loading,
    error,
  } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  const sorted = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">All Bookings</h2>
        <p className="text-muted">Complete list of patient appointments</p>
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : sorted.length === 0 ? (
        <Card className="empty-state-card">
          <CardBody className="text-center py-5">
            <div className="empty-icon mb-3">📋</div>
            <h6 className="text-muted">
              No bookings yet. Set up your availability to start receiving
              patients.
            </h6>
          </CardBody>
        </Card>
      ) : (
        <Card className="table-card">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Email</th>
                    <th className="date-col">Date</th>
                    <th className="time-col">Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((appt) => (
                    <tr key={appt._id}>
                      <td className="fw-semibold">
                        {appt.patientId?.name || "—"}
                      </td>
                      <td className="text-muted">
                        {appt.patientId?.email || "—"}
                      </td>
                      <td className="date-col">
                        {new Date(appt.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="time-col">
                        {appt.startTime} – {appt.endTime}
                      </td>
                      <td>{appt.duration} min</td>
                      <td>
                        <Badge
                          color={STATUS_COLOR[appt.status] || "secondary"}
                          className="status-badge"
                        >
                          {appt.status}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {appt.notes ? `"${appt.notes}"` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default DoctorBookingsListPage;
