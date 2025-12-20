// toasthelper.jsx

import Toast from 'react-native-toast-message';

const showToast = ({ type, text1, text2, props = {} }) => {
  Toast.show({
    type,
    text1,
    text2,
    visibilityTime: 3000, // 3 seconds (default is 4000ms)
    autoHide: true,
    topOffset: 60,
    bottomOffset: 40,
    onPress: () => Toast.hide(), // Tap to dismiss
    ...props,
  });
};

// Exported toast methods
export const Toasthelper = {
  showSuccess: (message, description, extraProps = {}) =>
    showToast({ type: 'success', text1: message, text2: description, props: extraProps }),

  showError: (message, description, extraProps = {}) =>
    showToast({ type: 'error', text1: message, text2: description, props: extraProps }),

  showInfo: (message, description, extraProps = {}) =>
    showToast({ type: 'info', text1: message, text2: description, props: extraProps }),
};

export default Toasthelper;
