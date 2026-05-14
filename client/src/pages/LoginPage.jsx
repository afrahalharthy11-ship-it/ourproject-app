import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'reactstrap';
import { loginUser, clearError } from '../redux/authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={6} lg={5}>
            <div className="text-center mb-4">
              <img
                src="/image/image.png"
                alt="Smart Healthcare logo"
                className="brand-logo-large"
              />
              <h1 className="auth-brand-name">Smart Healthcare</h1>
              <p className="text-muted">
                Your trusted appointment platform
              </p>
            </div>

            <Card className="auth-card shadow-lg">
              <CardBody className="p-4">
                <h4 className="mb-4 text-center fw-semibold">Sign In</h4>

                {error && (
                  <Alert color="danger" className="py-2">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    />
                  </FormGroup>

                  <Button
                    type="submit"
                    color="primary"
                    block
                    disabled={loading}
                    className="btn-primary-custom mt-2"
                  >
                    {loading && <Spinner size="sm" className="me-2" />}
                    {loading ? 'Signing In…' : 'Sign In'}
                  </Button>
                </Form>

                <p className="text-center mt-3 mb-0 text-muted">
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Create one
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

export default LoginPage;
