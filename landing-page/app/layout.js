export const metadata = {
  title: 'EMAIL FLOW - Automated Email Outreach Platform',
  description: 'Automate your cold email campaigns with intelligent scheduling, auto-refreshing tokens, and real-time tracking.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
