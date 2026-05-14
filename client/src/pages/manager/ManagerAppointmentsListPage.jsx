import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import {
  fetchManagerAppointments,
  managerDeleteAppointment,
} from "../../redux/appointmentSlice";

function ManagerAppointmentsListPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state) => state.appointments
  );

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  /* =========================
     Date Range (inputs)
  ========================= */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    dispatch(fetchManagerAppointments());
  }, [dispatch]);

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    await dispatch(managerDeleteAppointment(selectedId));
    setDeleteModal(false);
    setSelectedId(null);
  };

  /* =========================
     ✅ FIXED DATE FILTER
     (compare date-only strings)
  ========================= */
  const filteredList = list.filter((appt) => {
    const apptDate = new Date(appt.date)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

    if (fromDate && apptDate < fromDate) return false;
    if (toDate && apptDate > toDate) return false;

    return true;
  });

  /* =========================
     Pie Chart Data
  ========================= */
  const confirmedCount = filteredList.filter(
    (a) => a.status === "confirmed"
  ).length;

  const cancelledCount = filteredList.filter(
    (a) => a.status === "cancelled"
  ).length;

  const total = confirmedCount + cancelledCount || 1;
  const confirmedPercent = (confirmedCount / total) * 100;

  return (
    <div>
      {/* ================= Header + Print ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Appointments (Manager)</h2>
        <Button outline color="primary" onClick={() => window.print()}>
          🖨️ Print
        </Button>
      </div>

      {/* ================= Date Range ================= */}
      <div className="d-flex gap-3 mb-4">
        <div>
          <label>From</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label>To</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* ================= Pie Chart ================= */}
      <h5 className="mb-3">
        Appointments Status (Selected Date Range)
      </h5>

      <div className="d-flex align-items-center gap-4 mb-5">
        {/* Circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `conic-gradient(
              #198754 0% ${confirmedPercent}%,
              #dc3545 ${confirmedPercent}% 100%
            )`,
          }}
        />

        {/* Legend */}
        <div>
          <p className="mb-2">
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#198754",
                marginRight: 8,
                borderRadius: 3,
              }}
            />
            Confirmed: <strong>{confirmedCount}</strong>
          </p>

          <p className="mb-0">
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#dc3545",
                marginRight: 8,
                borderRadius: 3,
              }}
            />
            Cancelled: <strong>{cancelledCount}</strong>
          </p>
        </div>
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : (
        <Table hover responsive>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th className="action-column">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((appt) => (
              <tr key={appt._id}>
                <td>{appt.patientId?.name || "—"}</td>
                <td>{appt.doctorId?.name || "—"}</td>
                <td>
                  {new Date(appt.date).toLocaleDateString()}
                </td>
                <td>
                  {appt.startTime} – {appt.endTime}
                </td>
                <td>{appt.status}</td>
                <td className="action-column">
                  <Button
                    size="sm"
                    color="danger"
                    outline
                    onClick={() => openDeleteModal(appt._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ================= Delete Modal ================= */}
      <Modal isOpen={deleteModal} centered>
        <ModalHeader>Delete Appointment</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this appointment?
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={() => setDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ManagerAppointmentsListPage;
