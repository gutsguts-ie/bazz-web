/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are plain <img> tags pointing at /public — no next/image optimisation needed.
  images: { unoptimized: true },
}

export default nextConfig
