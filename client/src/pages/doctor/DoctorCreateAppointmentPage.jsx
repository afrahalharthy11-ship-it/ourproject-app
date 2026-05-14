import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Table,
} from "reactstrap";
import api from "../../utils/api";

const emptySpecific = { date: "", startTime: "09:00", endTime: "17:00" };

function DoctorCreateAppointmentPage() {
  const [availability, setAvailability] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [specificForm, setSpecificForm] = useState(emptySpecific);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* =========================
     Time helpers & validation
  ========================= */
  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const startMinutes = timeToMinutes(specificForm.startTime);
  const endMinutes = timeToMinutes(specificForm.endTime);
  const durationMinutes = endMinutes - startMinutes;

  const isInvalidTime =
    specificForm.startTime &&
    specificForm.endTime &&
    (endMinutes <= startMinutes || durationMinutes > 120);

  const fetchAvailability = useCallback(async () => {
    setLoadingData(true);
    setError("");
    try {
      const res = await api.get("/doctor/availability");
      setAvailability(res.data.availability);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load availability");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const addSpecific = async (e) => {
    e.preventDefault();
    if (isInvalidTime) return;

    setSubmitting(true);
    setError("");
    try {
      await api.post("/doctor/availability/specific", {
        date: specificForm.date + "T12:00:00.000Z",
        startTime: specificForm.startTime,
        endTime: specificForm.endTime,
        duration: 30,
      });
      await fetchAvailability();
      setSpecificForm(emptySpecific);
      flash("Specific slot added");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add slot");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSpecific = async (slotId) => {
    setDeletingId(slotId);
    try {
      await api.delete(`/doctor/availability/specific/${slotId}`);
      await fetchAvailability();
      flash("Specific slot removed");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete slot");
    } finally {
      setDeletingId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">Manage Availability</h2>
        <p className="text-muted">
          Set when you're available for patient appointments
        </p>
      </div>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <Card className="shadow-sm">
        <CardBody className="p-4">
          <h6 className="fw-semibold mb-3">Add a Specific Date Slot</h6>

          <Form onSubmit={addSpecific}>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={4}>
                <FormGroup>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    min={today}
                    value={specificForm.date}
                    required
                    onChange={(e) =>
                      setSpecificForm({
                        ...specificForm,
                        date: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>

              <Col xs={6} md={3}>
                <FormGroup>
                  <Label>Start</Label>
                  <Input
                    type="time"
                    value={specificForm.startTime}
                    onChange={(e) =>
                      setSpecificForm({
                        ...specificForm,
                        startTime: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>

              <Col xs={6} md={3}>
                <FormGroup>
                  <Label>End</Label>
                  <Input
                    type="time"
                    value={specificForm.endTime}
                    onChange={(e) =>
                      setSpecificForm({
                        ...specificForm,
                        endTime: e.target.value,
                      })
                    }
                  />

                  {specificForm.startTime &&
                    specificForm.endTime &&
                    endMinutes <= startMinutes && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "0.85rem" }}
                      >
                        End time must be later than start time
                      </div>
                    )}

                  {specificForm.startTime &&
                    specificForm.endTime &&
                    durationMinutes > 120 && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Maximum appointment duration is 2 hours
                      </div>
                    )}
                </FormGroup>
              </Col>

              <Col xs={12} md={2} className="availability-add-col">
                <Button
                  type="submit"
                  color={isInvalidTime ? "secondary" : "primary"}
                  disabled={submitting || isInvalidTime}
                  className="w-100 availability-add-btn"
                >
                  {submitting ? <Spinner size="sm" /> : "+ Add"}
                </Button>
              </Col>
            </Row>
          </Form>

          <hr className="my-4" />

          <h6 className="fw-semibold mb-3">Your Specific Date Slots</h6>

          {loadingData ? (
            <div className="text-center py-3">
              <Spinner color="primary" />
            </div>
          ) : !availability?.specificSlots?.length ? (
            <p className="text-muted">No specific date slots added yet.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {availability.specificSlots.map((slot) => (
                    <tr key={slot._id}>
                      <td>
                        {new Date(slot.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td>{slot.startTime}</td>
                      <td>{slot.endTime}</td>
                      <td>
                        <Button
                          size="sm"
                          color="danger"
                          outline
                          disabled={deletingId === slot._id}
                          onClick={() => deleteSpecific(slot._id)}
                        >
                          {deletingId === slot._id ? (
                            <Spinner size="sm" />
                          ) : (
                            "Remove"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default DoctorCreateAppointmentPage;
