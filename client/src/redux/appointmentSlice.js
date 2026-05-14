import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

/* =========================
   PATIENT
========================= */

export const fetchPatientAppointments = createAsyncThunk(
  'appointments/fetchPatient',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/patient/appointments');
      return res.data.appointments;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load appointments'
      );
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelPatient',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/patient/appointments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to cancel appointment'
      );
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/patient/appointments', data);
      return res.data.appointment;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to book appointment'
      );
    }
  }
);

/* =========================
   DOCTOR
========================= */

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctor',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/doctor/appointments');
      return res.data.appointments;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load appointments'
      );
    }
  }
);

/* =========================
   MANAGER
========================= */

export const fetchManagerAppointments = createAsyncThunk(
  'appointments/fetchManager',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/manager/appointments');
      return res.data.appointments;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load appointments'
      );
    }
  }
);

export const managerDeleteAppointment = createAsyncThunk(
  'appointments/managerDelete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/manager/appointments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete appointment'
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAppointmentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      /* Patient */
      .addCase(fetchPatientAppointments.pending, setLoading)
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPatientAppointments.rejected, setError)

      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(cancelAppointment.rejected, setError)

      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(bookAppointment.rejected, setError)

      /* Doctor */
      .addCase(fetchDoctorAppointments.pending, setLoading)
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDoctorAppointments.rejected, setError)

      /* Manager */
      .addCase(fetchManagerAppointments.pending, setLoading)
      .addCase(fetchManagerAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchManagerAppointments.rejected, setError)

      .addCase(managerDeleteAppointment.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(managerDeleteAppointment.rejected, setError);
  },
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
