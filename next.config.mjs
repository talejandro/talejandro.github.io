const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  trailingSlash: true,
  basePath,
};

export default config;
