import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Badge,
} from 'reactstrap';
import api from '../../utils/api';
import { bookAppointment } from '../../redux/appointmentSlice';

const STEPS = ['Choose Doctor', 'Select Date & Time', 'Confirm'];

function StepIndicator({ current }) {
  return (
    <div className="step-indicator mb-4">
      {STEPS.map((label, idx) => (
        <div key={idx} className={`step-item ${idx < current ? 'done' : ''} ${idx === current ? 'active' : ''}`}>
          <div className="step-circle">{idx < current ? '✓' : idx + 1}</div>
          <div className="step-label">{label}</div>
          {idx < STEPS.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
}

function ClientCreateAppointmentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // dates with pre-loaded slots: [{ date: 'YYYY-MM-DD', slots: [...] }]
  const [datesWithSlots, setDatesWithSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/patient/doctors').then((res) => setDoctors(res.data.doctors || []));
  }, []);

  const loadDates = async (doctorId) => {
    setLoadingDates(true);
    setError('');
    setDatesWithSlots([]);
    setSelectedDate('');
    setSelectedSlot(null);
    try {
      const res = await api.get(`/patient/doctors/${doctorId}/dates`);
      setDatesWithSlots(res.data.dates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load available dates');
    } finally {
      setLoadingDates(false);
    }
  };

  const handleSelectDoctor = async (docId) => {
    setSelectedDoctor(docId);
    await loadDates(docId);
    setStep(1);
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');
    const result = await dispatch(
      bookAppointment({
        doctorId: selectedDoctor,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: selectedSlot.duration,
        notes,
      })
    );
    setLoading(false);
    if (bookAppointment.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/client/appointments'), 2000);
    } else {
      setError(result.payload || 'Booking failed');
    }
  };

  const doctorObj = doctors.find((d) => d._id === selectedDoctor);
  const activeDateEntry = datesWithSlots.find((d) => d.date === selectedDate);
  const activeSlots = activeDateEntry?.slots || [];

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">Book an Appointment</h2>
        <p className="text-muted">Follow the steps to schedule your visit</p>
      </div>

      <Card className="booking-card shadow-sm">
        <CardBody className="p-4">
          <StepIndicator current={step} />

          {error && <Alert color="danger" className="py-2">{error}</Alert>}
          {success && (
            <Alert color="success">
              Appointment booked successfully! Redirecting…
            </Alert>
          )}

          {/* Step 0 – Choose Doctor */}
          {step === 0 && (
            <div>
              <h5 className="mb-3 fw-semibold">Select a Doctor</h5>
              <Row className="g-3">
                {doctors.map((doc) => (
                  <Col key={doc._id} xs={12} md={6} lg={4}>
                    <Card
                      className={`doctor-card ${selectedDoctor === doc._id ? 'selected' : ''}`}
                      onClick={() => handleSelectDoctor(doc._id)}
                      style={{ cursor: loadingDates ? 'wait' : 'pointer' }}
                    >
                      <CardBody>
                        {loadingDates && selectedDoctor === doc._id ? (
                          <div className="text-center py-2">
                            <Spinner size="sm" color="primary" />
                          </div>
                        ) : (
                          <>
                            <div className="doctor-avatar">{doc.name?.charAt(0)}</div>
                            <h6 className="fw-semibold mt-2 mb-1">Dr. {doc.name}</h6>
                            {doc.specialty && (
                              <Badge color="primary" pill className="specialty-badge">
                                {doc.specialty}
                              </Badge>
                            )}
                          </>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
                {doctors.length === 0 && (
                  <Col>
                    <p className="text-muted">No doctors available.</p>
                  </Col>
                )}
              </Row>
            </div>
          )}

          {/* Step 1 – Select Date & Time */}
          {step === 1 && (
            <div>
              <h5 className="mb-1 fw-semibold">
                Available dates for Dr. {doctorObj?.name}
              </h5>
              <p className="text-muted mb-3">Pick a date, then choose your time slot.</p>

              {loadingDates ? (
                <div className="text-center py-4">
                  <Spinner color="primary" />
                  <p className="text-muted mt-2">Loading available dates…</p>
                </div>
              ) : datesWithSlots.length === 0 ? (
                <Alert color="warning">
                  This doctor has no available dates. Please choose another doctor.
                </Alert>
              ) : (
                <>
                  {/* Date picker buttons */}
                  <div className="slot-grid mb-4">
                    {datesWithSlots.map(({ date }) => {
                      const d = new Date(date + 'T00:00:00');
                      return (
                        <Button
                          key={date}
                          outline={selectedDate !== date}
                          color="primary"
                          className={`slot-btn ${selectedDate === date ? 'selected' : ''}`}
                          onClick={() => handleSelectDate(date)}
                        >
                          <div style={{ fontWeight: 600 }}>
                            {d.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div>
                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Time slot picker — shown once a date is selected */}
                  {selectedDate && (
                    <>
                      <h6 className="fw-semibold mb-2">
                        Available times on{' '}
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric',
                        })}
                      </h6>
                      <div className="slot-grid">
                        {activeSlots.map((slot, i) => (
                          <Button
                            key={i}
                            outline={selectedSlot !== slot}
                            color="primary"
                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot.startTime} – {slot.endTime}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="d-flex justify-content-between mt-4">
                <Button
                  outline
                  color="secondary"
                  onClick={() => {
                    setStep(0);
                    setSelectedDoctor('');
                    setDatesWithSlots([]);
                    setSelectedDate('');
                    setSelectedSlot(null);
                  }}
                >
                  ← Back
                </Button>
                <Button
                  color="primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className="btn-primary-custom"
                >
                  Next: Confirm →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 – Confirm */}
          {step === 2 && (
            <div>
              <h5 className="mb-3 fw-semibold">Confirm Your Booking</h5>
              <Card className="confirm-summary mb-4">
                <CardBody>
                  <Row>
                    <Col xs={6}><span className="text-muted">Doctor</span></Col>
                    <Col xs={6}><strong>Dr. {doctorObj?.name}</strong></Col>
                  </Row>
                  {doctorObj?.specialty && (
                    <Row className="mt-2">
                      <Col xs={6}><span className="text-muted">Specialty</span></Col>
                      <Col xs={6}>{doctorObj.specialty}</Col>
                    </Row>
                  )}
                  <Row className="mt-2">
                    <Col xs={6}><span className="text-muted">Date</span></Col>
                    <Col xs={6}>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col xs={6}><span className="text-muted">Time</span></Col>
                    <Col xs={6}><strong>{selectedSlot?.startTime} – {selectedSlot?.endTime}</strong></Col>
                  </Row>
                  <Row className="mt-2">
                    <Col xs={6}><span className="text-muted">Duration</span></Col>
                    <Col xs={6}>{selectedSlot?.duration} min</Col>
                  </Row>
                </CardBody>
              </Card>
              <FormGroup>
                <Label className="form-label-custom">Notes (optional)</Label>
                <Input
                  type="textarea"
                  rows={3}
                  placeholder="Any symptoms, concerns or information for the doctor…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input-custom"
                />
              </FormGroup>
              <div className="d-flex justify-content-between mt-3">
                <Button outline color="secondary" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  color="success"
                  onClick={handleBook}
                  disabled={loading || success}
                  className="btn-success-custom"
                >
                  {loading ? <Spinner size="sm" className="me-2" /> : null}
                  {loading ? 'Booking…' : '✓ Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ClientCreateAppointmentPage;
