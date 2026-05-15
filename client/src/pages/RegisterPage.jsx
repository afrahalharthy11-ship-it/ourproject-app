import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
} from "reactstrap";
import { registerUser, clearError } from "../redux/authSlice";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialty: "",
  });

  useEffect(() => {
    if (user) {
      navigate(
        user.role === "doctor" ? "/doctor/dashboard" : "/client/dashboard",
        { replace: true }
      );
    }
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.role !== "doctor") delete payload.specialty;
    dispatch(registerUser(payload));
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={7} lg={6}>
            <div className="text-center mb-4">
              <img
                src="/image/image.png"
                alt="Smart Healthcare logo"
                className="brand-logo-large"
              />
              <h1 className="auth-brand-name">Smart Healthcare</h1>
              <p className="text-muted">Join our platform today</p>
            </div>

            <Card className="auth-card shadow-lg">
              <CardBody className="p-4">
                <h4 className="mb-4 text-center fw-semibold">Create Account</h4>

                {error && (
                  <Alert color="danger" className="py-2">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name" className="form-label-custom">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="email" className="form-label-custom">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="password" className="form-label-custom">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="role" className="form-label-custom">
                      I am a
                    </Label>
                    <Input
                      id="role"
                      type="select"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="form-input-custom"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </Input>
                  </FormGroup>

                  {form.role === "doctor" && (
                    <FormGroup>
                      <Label for="specialty" className="form-label-custom">
                        Specialty
                      </Label>
                      <Input
                        id="specialty"
                        type="text"
                        name="specialty"
                        placeholder="e.g. Cardiology, Pediatrics"
                        value={form.specialty}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </FormGroup>
                  )}

                  <Button
                    type="submit"
                    color="primary"
                    block
                    disabled={loading}
                    className="btn-primary-custom mt-2"
                  >
                    {loading && <Spinner size="sm" className="me-2" />}
                    {loading ? "Creating Account…" : "Create Account"}
                  </Button>
                </Form>

                <p className="text-center mt-3 mb-0 text-muted">
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
