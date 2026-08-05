import { MemoryRouter } from 'react-router-dom';
import AppProviders from '../app/AppProviders';
import { AppRoutes } from '../App';

export default function PublicSsrApp({ url }: { url: string }) {
  return (
    <AppProviders>
      <MemoryRouter initialEntries={[url]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>
  );
}
