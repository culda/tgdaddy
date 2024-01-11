/** @type {import('next').NextConfig} */

module.exports = {
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'www.members.page', // Your www domain
          },
        ],
        permanent: true, // Set this to true for permanent (301) redirection
        destination: 'https://members.page/$1', // Your non-www domain
      },
    ];
  },
};
