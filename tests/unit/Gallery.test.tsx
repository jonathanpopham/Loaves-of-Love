import { render, screen } from '@testing-library/react'
import { Gallery } from '@/components/Gallery'

describe('Gallery', () => {
  it('renders empty state when no images provided', () => {
    render(<Gallery images={[]} />)
    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Gallery images={[]} title="Ministry Photos" />)
    expect(screen.getByRole('heading', { name: 'Ministry Photos' })).toBeInTheDocument()
  })

  it('does not render a heading when title is omitted', () => {
    render(<Gallery images={[]} />)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders images when provided', () => {
    const images = [
      { src: '/images/gallery/photo1.jpg', alt: 'Baking photo 1', width: 800, height: 600 },
      { src: '/images/gallery/photo2.jpg', alt: 'Baking photo 2', width: 800, height: 600 },
    ]
    render(<Gallery images={images} />)
    expect(screen.getByAltText('Baking photo 1')).toBeInTheDocument()
    expect(screen.getByAltText('Baking photo 2')).toBeInTheDocument()
  })

  it('does not render empty state when images are provided', () => {
    const images = [
      { src: '/images/gallery/photo1.jpg', alt: 'Baking photo', width: 800, height: 600 },
    ]
    render(<Gallery images={images} />)
    expect(screen.queryByText('No photos yet.')).toBeNull()
  })
})
