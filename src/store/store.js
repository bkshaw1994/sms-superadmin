import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import schoolsReducer from "../features/schools/schoolsSlice";
import schoolInsightsReducer from "../features/schoolInsights/schoolInsightsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
    schoolInsights: schoolInsightsReducer,
  },
});

export default store;
