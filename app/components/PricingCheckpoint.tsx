import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface PricingCheckpointProps {
  text: string;
}

const PricingCheckpoint: React.FC<PricingCheckpointProps> = ({ text }) => {
  return (
    <div>
      <p className="flex items-center text-gray-600 mb-2 gap-2">
        <FaCheckCircle className="text-blue-500 bg-transparent" />
        {text}
      </p>
    </div>
  );
};

export default PricingCheckpoint;
