import { render, screen } from '@testing-library/react';
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  },
}));
import HomePage from '../app/page';

describe('Home page', () => {
  it('renders branch selector heading', async () => {
    const ui = await HomePage();
    render(ui);
    expect(screen.getByText(/Elegí tu sucursal/i)).toBeInTheDocument();
  });
});
