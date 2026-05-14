import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Spinner,
  Alert,
  Badge,
} from "reactstrap";

import { fetchAllUsers } from "../../redux/userSlice";

function ManagerUsersListPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const roleColor = (role) => {
    if (role === "doctor") return "info";
    if (role === "patient") return "success";
    if (role === "manager") return "warning";
    return "secondary";
  };

  return (
    <div>
      <h2 className="mb-4">All Users (Manager)</h2>

      {error && <Alert color="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : (
        <Table hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Badge color={roleColor(user.role)}>
                    {user.role}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default ManagerUsersListPage;