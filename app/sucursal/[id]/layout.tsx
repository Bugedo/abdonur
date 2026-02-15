import { CartProvider } from '@/components/cart/CartProvider';

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}


