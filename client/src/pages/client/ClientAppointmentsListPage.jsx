import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  fetchPatientAppointments,
  cancelAppointment,
} from "../../redux/appointmentSlice";

const STATUS_COLOR = {
  confirmed: "success",
  cancelled: "secondary",
};

function ClientAppointmentsListPage() {
  const dispatch = useDispatch();
  const {
    list: appointments,
    loading,
    error,
  } = useSelector((state) => state.appointments);

  const [cancelModal, setCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    dispatch(fetchPatientAppointments());
  }, [dispatch]);

  const openCancelModal = (id) => {
    setSelectedId(id);
    setCancelModal(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    await dispatch(cancelAppointment(selectedId));
    setCancelling(false);
    setCancelModal(false);
    setSelectedId(null);
    setSuccessMsg("Appointment cancelled successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const sorted = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title">My Appointments</h2>
          <p className="text-muted">All your bookings in one place</p>
        </div>
        <Button
          tag={Link}
          to="/client/book"
          color="primary"
          className="btn-primary-custom"
        >
          + Book New
        </Button>
      </div>

      {successMsg && (
        <Alert color="success" className="py-2">
          {successMsg}
        </Alert>
      )}
      {error && <Alert color="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : sorted.length === 0 ? (
        <Card className="empty-state-card">
          <CardBody className="text-center py-5">
            <div className="empty-icon mb-3">📋</div>
            <h6 className="text-muted">No appointments yet</h6>
            <Button
              tag={Link}
              to="/client/book"
              color="primary"
              className="btn-primary-custom mt-3"
            >
              Book your first appointment
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card className="table-card">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 custom-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th className="date-col">Date</th>
                    <th className="time-col">Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((appt) => (
                    <tr key={appt._id}>
                      <td className="fw-semibold">
                        Dr. {appt.doctorId?.name || "—"}
                      </td>
                      <td className="text-muted">
                        {appt.doctorId?.specialty || "—"}
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
                        {appt.status !== "cancelled" && (
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => openCancelModal(appt._id)}
                            className="btn-danger-outline"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal isOpen={cancelModal} toggle={() => setCancelModal(false)} centered>
        <ModalHeader toggle={() => setCancelModal(false)}>
          Cancel Appointment
        </ModalHeader>
        <ModalBody>
          Are you sure you want to cancel this appointment? This action cannot
          be undone.
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={() => setCancelModal(false)}
          >
            Keep it
          </Button>
          <Button color="danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <Spinner size="sm" className="me-1" /> : null}
            {cancelling ? "Cancelling…" : "Yes, Cancel"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ClientAppointmentsListPage;
