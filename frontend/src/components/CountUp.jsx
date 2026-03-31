import { useState, useEffect, useRef } from 'react';

export default function CountUp({ end, duration = 800, prefix = '', suffix = '', decimals = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    if (end === 0) { setValue(0); return; }

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    startTime.current = null;
    ref.current = requestAnimationFrame(animate);

    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration]);

  return (
    <span className="count-up">
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}
