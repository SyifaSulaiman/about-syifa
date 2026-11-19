import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: false,
        ...options,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

const buildEnvironment = { ...process.env, PORTFOLIO_STATIC_BUILD: '1' };
if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, 'run', 'build'], { env: buildEnvironment });
} else if (isWindows) {
    run(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], { env: buildEnvironment });
} else {
    run('npm', ['run', 'build'], { env: buildEnvironment });
}

if (process.env.PORTFOLIO_PHP) {
    run(process.env.PORTFOLIO_PHP, ['scripts/export-static.php']);
} else if (isWindows) {
    run(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'php scripts/export-static.php']);
} else {
    run('php', ['scripts/export-static.php']);
}
run(process.execPath, ['scripts/check-static.mjs'], { shell: false });
