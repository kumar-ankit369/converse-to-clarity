import { useEffect, useState } from 'react';
import socketService from '@/lib/socket';

export function useSocket(token?: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token) {
      const socket = socketService.connect(token);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    } else {
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [token]);

  return {
    socket: socketService.getSocket(),
    isConnected,
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
  };
}
