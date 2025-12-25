import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin, logoutUser, verifyUser } from "../redux/actions/authAction";
import { updateProfile, updateProfileImage, updatePersonalInfo, updateAddress } from "../redux/actions/userAction";
import { clearError, setUser } from "../redux/reducers/authReducer";
import { clearUpdateStatus } from "../redux/reducers/userReducer";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { user, token, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { updateLoading, updateError, updateSuccess } = useSelector((state) => state.user);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Verify user on mount if token exists
  useEffect(() => {
    if (token && !user) {
      dispatch(verifyUser());
    }
  }, [dispatch, token, user]);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Google login function
  const loginWithGoogle = async () => {
    try {
      const result = await dispatch(googleLogin()).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Logout function
  const logout = async () => {
    await dispatch(logoutUser());
  };

  // Update profile function (full update with optional image)
  const handleUpdateProfile = async (profileData) => {
    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      // Sync user state in auth reducer
      dispatch(setUser(result));
      return { success: true, user: result };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Update profile image only
  const handleUpdateProfileImage = async (userId, imageFile) => {
    try {
      const result = await dispatch(updateProfileImage({ userId, imageFile })).unwrap();
      // Sync user state in auth reducer
      dispatch(setUser(result));
      return { success: true, user: result };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Update personal info only
  const handleUpdatePersonalInfo = async (userData) => {
    try {
      const result = await dispatch(updatePersonalInfo(userData)).unwrap();
      // Sync user state in auth reducer
      dispatch(setUser(result));
      return { success: true, user: result };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Update address only
  const handleUpdateAddress = async (userId, address) => {
    try {
      const result = await dispatch(updateAddress({ userId, address })).unwrap();
      // Sync user state in auth reducer
      dispatch(setUser(result));
      return { success: true, user: result };
    } catch (err) {
      return { success: false, message: err };
    }
  };

  // Clear errors
  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearUserUpdateStatus = () => {
    dispatch(clearUpdateStatus());
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    updateLoading,
    updateError,
    updateSuccess,
    login,
    loginWithGoogle,
    logout,
    updateProfile: handleUpdateProfile,
    updateProfileImage: handleUpdateProfileImage,
    updatePersonalInfo: handleUpdatePersonalInfo,
    updateAddress: handleUpdateAddress,
    clearError: clearAuthError,
    clearUpdateStatus: clearUserUpdateStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
