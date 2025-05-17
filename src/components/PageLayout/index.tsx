import { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
}

interface PageMainProps {
  children: ReactNode;
  className?: string;
}

export function Page({ children }: PageProps) {
  return <div className="w-full min-h-screen">{children}</div>;
}

Page.Main = function PageMain({ children, className }: PageMainProps) {
  return <main className={`w-full ${className || ''}`}>{children}</main>;
};