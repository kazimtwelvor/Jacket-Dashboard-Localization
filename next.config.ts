
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modern Next.js versions have appDir enabled by default
  experimental: {
    disableOptimizedLoading: true,
    // Removed appDir as it's now standard
    // Removed unstable_runtimeJS as it's deprecated
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "localhost",
      "via.placeholder.com",
      "jacket.us.com",
      "d1.fineyst.com",
      "192.168.100.14",
      "192.168.100.114"
    ],
  },
  // Removed unstable_runtimeJS as it's deprecated
}

export default nextConfig











// let userConfig = undefined
// try {
//   // try to import ESM first
//   userConfig = await import('./v0-user-next.config.mjs')
// } catch (e) {
//   try {
//     // fallback to CJS import
//     userConfig = await import("./v0-user-next.config");
//   } catch (innerError) {
//     // ignore error
//   }
// }

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   experimental: {
//     webpackBuildWorker: true,
//     parallelServerBuildTraces: true,
//     parallelServerCompiles: true,
//   },
// }

// if (userConfig) {
//   // ESM imports will have a "default" property
//   const config = userConfig.default || userConfig

//   for (const key in config) {
//     if (
//       typeof nextConfig[key] === 'object' &&
//       !Array.isArray(nextConfig[key])
//     ) {
//       nextConfig[key] = {
//         ...nextConfig[key],
//         ...config[key],
//       }
//     } else {
//       nextConfig[key] = config[key]
//     }
//   }
// }

// export default nextConfig
