import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header'

describe('Header', () => {
  it('renders the logo image', () => {
    render(<Header />)
    const logo = screen.getByAltText('Loaves of Love')
    expect(logo).toBeInTheDocument()
  })

  it('renders a link to the home page', () => {
    render(<Header />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders a header element', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
