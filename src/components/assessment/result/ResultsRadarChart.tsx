'use client';

interface ResultsRadarChartProps {
  autonomicInflammation: number;
  somaticLowertone: number;
  traumaticMemory: number;
  emotionalDepth: number;
  presenceHere: number;
}

export function ResultsRadarChart({
  autonomicInflammation,
  somaticLowertone,
  traumaticMemory,
  emotionalDepth,
  presenceHere,
}: ResultsRadarChartProps) {
  // Prepare data for radar chart
  const data = [
    {
      name: 'Nervous System Activation',
      value: Math.round(autonomicInflammation),
    },
    {
      name: 'Physical Tension',
      value: Math.round(somaticLowertone),
    },
    {
      name: 'Difficult Memories',
      value: Math.round(traumaticMemory),
    },
    {
      name: 'Emotional Connection',
      value: Math.round(emotionalDepth),
    },
    {
      name: 'Present Moment Awareness',
      value: Math.round(presenceHere),
    },
  ];

  // SVG Radar Chart Implementation
  const size = 300;
  const center = size / 2;
  const maxValue = 100;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / data.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const radius = (value / maxValue) * (center - 40);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLevelCoordinates = (level: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const radius = (level / levels) * (center - 40);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Create polygon points for the radar area
  const polygonPoints = data
    .map((_, index) => {
      const coords = getCoordinates(data[index].value, index);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  // Create axes
  const axes = data.map((_, index) => {
    const coords = getCoordinates(maxValue, index);
    return (
      <line
        key={`axis-${index}`}
        x1={center}
        y1={center}
        x2={coords.x}
        y2={coords.y}
        stroke="#e2e8f0"
        strokeWidth="1"
      />
    );
  });

  // Create level circles
  const circles = Array.from({ length: levels }).map((_, level) => {
    const levelValue = ((level + 1) / levels) * maxValue;
    const firstCoord = getLevelCoordinates(level + 1, 0);
    const points = data
      .map((_, index) => {
        const coords = getLevelCoordinates(level + 1, index);
        return `${coords.x},${coords.y}`;
      })
      .join(' ');

    return (
      <polygon
        key={`level-${level}`}
        points={points}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
    );
  });

  // Create labels
  const labels = data.map((item, index) => {
    const coords = getCoordinates(maxValue + 20, index);
    return (
      <text
        key={`label-${index}`}
        x={coords.x}
        y={coords.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fill="#64748b"
        fontWeight="500"
      >
        {item.name.split(' ')[0]}
      </text>
    );
  });

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background */}
          <circle cx={center} cy={center} r={center - 40} fill="#f8fafc" />
          
          {/* Level circles */}
          {circles}
          
          {/* Axes */}
          {axes}
          
          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="#8b5cf6"
            fillOpacity="0.15"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((_, index) => {
            const coords = getCoordinates(data[index].value, index);
            return (
              <circle
                key={`point-${index}`}
                cx={coords.x}
                cy={coords.y}
                r="4"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {labels}
        </svg>
      </div>

      {/* Legend and interpretation */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => (
          <div key={item.name} className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">
              {item.name}
            </p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">/100</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
