import { NavLink } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <strong>Alcohol Tracker</strong>
        <NavLink to="/day" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Daily Log
        </NavLink>
        <NavLink to="/week" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Weekly Overview
        </NavLink>
        <NavLink to="/month" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Monthly Trends
        </NavLink>
      </nav>
      <main className="app-content">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
