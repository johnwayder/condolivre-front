// PM2 process definition for the production server — runs `next start`.
module.exports = {
  apps: [
    {
      name: "condolivre-front",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      merge_logs: true,
      max_memory_restart: "400M",
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
