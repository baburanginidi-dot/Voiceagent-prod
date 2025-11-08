
import React from 'react';
import { STAGES } from '../constants';
import type { StageId } from '../types';
import { CheckIcon } from './icons';

interface StepperProps {
  currentStageId: StageId;
}

const Stepper: React.FC<StepperProps> = ({ currentStageId }) => {
  const currentStageIndex = STAGES.findIndex(stage => stage.id === currentStageId);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center">
        {STAGES.map((stage, stageIdx) => (
          <li key={stage.title} className={`relative ${stageIdx !== STAGES.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stageIdx < currentStageIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-[#0058FF]" />
                </div>
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0058FF] hover:bg-blue-800">
                  <CheckIcon className="h-5 w-5 text-white" />
                  <span className="sr-only">{stage.title}</span>
                </a>
              </>
            ) : stageIdx === currentStageIndex ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  href="#"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0058FF] bg-white"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0058FF]" aria-hidden="true" />
                  <span className="sr-only">{stage.title}</span>
                </a>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a
                  href="#"
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{stage.title}</span>
                </a>
              </>
            )}
             <div className="absolute top-10 w-max -translate-x-1/2 left-1/2">
                <span className={`text-xs font-medium ${stageIdx <= currentStageIndex ? 'text-[#0A1A3F]' : 'text-gray-400'}`}>{stage.title}</span>
             </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
