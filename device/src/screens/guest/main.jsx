/**
 * main.jsx - Guest/Non-User Main Screen
 *
 * Entry point for guest users - displays weather screen
 */

import React from 'react';
import GuestWeather from './weather';

const GuestMain = () => {
  return <GuestWeather />;
};

export default GuestMain;
