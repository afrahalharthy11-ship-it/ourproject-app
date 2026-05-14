import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardBody,
  Row,
  Col,
  Badge,
  Button,
  Input,
  FormGroup,
  Label,
  Alert,
} from "reactstrap";

function InfoRow({ label, value }) {
  return (
    <div className="settings-info-row">
      <span className="settings-label">{label}</span>
      <span className="settings-value">{value || "—"}</span>
    </div>
  );
}

function SettingsPage() {
  const { user } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    specialty: user?.specialty || "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setEditMode(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div>
      <div className="page-header mb-4">
        <h2 className="page-title">Account Settings</h2>
        <p className="text-muted">Your profile information</p>
      </div>

      {success && (
        <Alert color="success">
          Profile updated successfully
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="settings-card shadow-sm">
            <CardBody className="p-4">
              {/* Avatar */}
              <div className="text-center mb-4">
                <div
                  className="settings-avatar mx-auto mb-2"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    backgroundColor: "#1b8f88",
                    color: "#fff",
                    fontSize: 36,
                    lineHeight: "90px",
                    overflow: "hidden",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    formData.name?.charAt(0).toUpperCase()
                  )}
                </div>

                {editMode && (
                  <Label className="btn btn-sm btn-outline-success">
                    Change Photo
                    <Input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Label>
                )}

                <h4 className="fw-semibold mt-3 mb-1">
                  {formData.name}
                </h4>

                <Badge
                  color={user?.role === "doctor" ? "primary" : "success"}
                  pill
                >
                  {user?.role === "doctor" ? "Doctor" : "Patient"}
                </Badge>
              </div>

              <hr />

              <div className="mt-3">
                {!editMode ? (
                  <>
                    <InfoRow label="Full Name" value={formData.name} />
                    <InfoRow label="Email Address" value={formData.email} />
                  </>
                ) : (
                  <>
                    <FormGroup>
                      <Label>Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                      />
                    </FormGroup>
                  </>
                )}

                <InfoRow
                  label="Role"
                  value={
                    user?.role?.charAt(0).toUpperCase() +
                    user?.role?.slice(1)
                  }
                />

                {user?.role === "doctor" && (
                  !editMode ? (
                    <InfoRow
                      label="Specialty"
                      value={formData.specialty}
                    />
                  ) : (
                    <FormGroup>
                      <Label>Specialty</Label>
                      <Input
                        value={formData.specialty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialty: e.target.value,
                          })
                        }
                      />
                    </FormGroup>
                  )
                )}

                <InfoRow
                  label="Member Since"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"
                  }
                />
              </div>

              <hr />

              {!editMode ? (
                <Button
                  color="success"
                  outline
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button color="success" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button
                    color="secondary"
                    outline
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SettingsPage;
