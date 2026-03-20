module.exports = {
  apps: [{
    name: 'presentation-hub',
    script: 'src/server/index.js',
    cwd: '/home/sammy/presentations',
    env: {
      NODE_ENV: 'production',
      PORT: 3847,
      JWT_SECRET: 'ph_s3cr3t_k3y_2026_pr3s3nt4t10n_hub_x7k9m2',
      JWT_REFRESH_SECRET: 'ph_r3fr3sh_s3cr3t_2026_hub_q4w8e1r5',
      ADMIN_PASSWORD: 'PH@dmin2026!Secure'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    log_file: '/home/sammy/presentations/logs/pm2.log',
    error_file: '/home/sammy/presentations/logs/pm2-error.log',
    out_file: '/home/sammy/presentations/logs/pm2-out.log'
  }]
};
