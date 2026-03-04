import { render, screen } from "@testing-library/react";
import GallerySection from "@/components/GallerySection";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

describe("GallerySection", () => {
  it("renders the section heading", () => {
    render(<GallerySection />);
    expect(
      screen.getByRole("heading", { name: /ministry in action/i })
    ).toBeInTheDocument();
  });

  it("renders 12 gallery images", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(12);
  });

  it("gallery images have descriptive alt text", () => {
    render(<GallerySection />);
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("has accessible section landmark", () => {
    render(<GallerySection />);
    expect(
      screen.getByRole("region", { name: /ministry gallery/i })
    ).toBeInTheDocument();
  });
});
