import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, X } from 'lucide-react';

interface QiblaCompassProps {
  onClose: () => void;
  userLat: number;
  userLon: number;
}

export const QiblaCompass = ({ onClose, userLat, userLon }: QiblaCompassProps) => {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Calculate Qibla direction
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const y = Math.sin(kaabaLon * (Math.PI / 180) - userLon * (Math.PI / 180));
    const x = Math.cos(userLat * (Math.PI / 180)) * Math.tan(kaabaLat * (Math.PI / 180)) - 
              Math.sin(userLat * (Math.PI / 180)) * Math.cos(kaabaLon * (Math.PI / 180) - userLon * (Math.PI / 180));
    
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    setQiblaDirection((qibla + 360) % 360);

    // Handle device orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading is non-standard but widely used
      const compassHeading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : 0);
      setHeading(compassHeading);
    };

    if (window.DeviceOrientationEvent) {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        DeviceOrientationEvent.requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            } else {
              setError("Permission denied for compass");
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setError("Compass not supported on this device");
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [userLat, userLon]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-2 rounded-full bg-white/10 text-white"
      >
        <X size={24} />
      </button>

      <div className="text-center space-y-2 mb-12">
        <h3 className="text-2xl font-bold text-accent">Qibla Finder</h3>
        <p className="text-slate-400 text-sm">Align your device to find the Kaaba</p>
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
        
        {/* Compass card */}
        <motion.div 
          style={{ rotate: -heading }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {['N', 'E', 'S', 'W'].map((dir, i) => (
            <div 
              key={dir}
              className="absolute font-bold text-slate-500"
              style={{ 
                transform: `rotate(${i * 90}deg) translateY(-120px)`,
              }}
            >
              {dir}
            </div>
          ))}
          
          {/* Qibla Marker */}
          <motion.div 
            style={{ rotate: qiblaDirection }}
            className="absolute inset-0 flex flex-col items-center pt-4"
          >
            <div className="w-1 h-12 bg-accent rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            <Compass className="text-accent mt-2" size={24} />
          </motion.div>
        </motion.div>

        {/* Center point */}
        <div className="w-4 h-4 bg-white rounded-full shadow-lg z-10" />
      </div>

      <div className="mt-12 text-center">
        <div className="text-4xl font-black text-white">
          {Math.round((qiblaDirection - heading + 360) % 360)}°
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Relative Angle</p>
      </div>

      {error && (
        <div className="mt-8 text-danger text-sm bg-danger/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </motion.div>
  );
};
