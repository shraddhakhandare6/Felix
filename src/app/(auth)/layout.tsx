
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background/95 p-4">
      {children}
    </main>
  )
}
