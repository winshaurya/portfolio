import React from 'react';
import App from './App';

type Props = {
  roleKey: string;
};

const RolePage: React.FC<Props> = ({ roleKey }) => {
  // For now we just render the main App but add a data attribute
  // so pages can be customized later based on roleKey.
  return (
    <div data-role={roleKey}>
      <App />
    </div>
  );
};

export default RolePage;
