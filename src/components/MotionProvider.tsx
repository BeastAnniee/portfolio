'use client';

import { MotionConfig } from 'framer-motion';

const MotionProvider = ({ children }: { children: React.ReactNode }) => {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
};

export default MotionProvider;
