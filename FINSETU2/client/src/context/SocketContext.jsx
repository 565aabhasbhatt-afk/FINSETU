import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestAttackEvent, setLatestAttackEvent] = useState(null);
  const [latestImpactEvent, setLatestImpactEvent] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const s = io('/', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    s.on('connect', () => {
      console.log('[FINSETU Socket] Connected to real-time server:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[FINSETU Socket] Disconnected');
      setIsConnected(false);
    });

    s.on('attack_event', (event) => {
      setLatestAttackEvent(event);
    });

    s.on('impact_event', (impact) => {
      setLatestImpactEvent(impact);
    });

    s.on('security_alert', (alert) => {
      setLatestAlert(alert);
      setAlerts((prev) => [alert, ...prev.slice(0, 4)]);
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a !== alert));
      }, 6000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        latestAttackEvent,
        latestImpactEvent,
        latestAlert,
        alerts
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
