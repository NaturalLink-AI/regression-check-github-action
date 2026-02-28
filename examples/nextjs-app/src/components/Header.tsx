import Link from 'next/link'

export function Header() {
  return (
    <header className="header">
      <div className="logo">DemoApp</div>
      <nav className="nav">
        <Link href="/">Home</Link>
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  )
}
