import { Navigate, Route, Routes } from 'react-router-dom';
import RangeView from '../pages/RangeView';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/day" replace />} />
      <Route path="/day" element={<RangeView range="day" />} />
      <Route path="/week" element={<RangeView range="week" />} />
      <Route path="/month" element={<RangeView range="month" />} />
      <Route path="*" element={<Navigate to="/day" replace />} />
    </Routes>
  );
};

export default AppRoutes;
