import { Outlet } from 'react-router-dom';
import Header from '../components/nav/Header';
import Footer from '../components/shared/Footer';
import ThemeLoader from '../components/shared/ThemeLoader';

export default function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ThemeLoader />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
