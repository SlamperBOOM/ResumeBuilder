import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import log from 'electron-log';
import axios from 'axios';
import path from 'node:path';
import getPort from 'detect-port';
import FrontendActionEnum from '../renderer/frontendAction/FrontendActionEnum';

let backendProcess: ChildProcess | null = null;

interface BackendOptions {
  preferredPort: number;
  extraJvmArgs?: string[]; // ex. ['-Xmx256m']
  env?: Record<string, string>; // additional args for Quarkus
}

function getBackendPaths() {
  const isDev = !app.isPackaged;

  let javaPath: string;
  if (!isDev) {
    const prodJavaBin =
      process.platform === 'win32'
        ? 'ResumeBuilderBackend.exe'
        : 'resume-builder-backend';
    javaPath = path.join(process.resourcesPath, 'jre', 'bin', prodJavaBin);
  } else {
    const devJavaBin = process.platform === 'win32' ? 'java.exe' : 'java';
    if (process.env.JAVA_HOME) {
      javaPath = path.join(process.env.JAVA_HOME, 'bin', devJavaBin);
    } else {
      javaPath = devJavaBin;
    }
  }

  const jarPath = isDev
    ? path.join(
        process.cwd(),
        '../../backend/build/quarkus-app/quarkus-run.jar',
      )
    : path.join(process.resourcesPath, 'backend', 'quarkus-run.jar');

  return { javaPath, jarPath };
}

class BackendStartupError extends Error {}

async function waitForHealth(port: number, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  const url = `http://127.0.0.1:${port}/check_health`;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(url, {
        timeout: 2000,
        validateStatus: () => true,
      });

      if (response.status === 204) {
        return;
      }

      if (response.status === 200) {
        const body = response.data as {
          frontend_action?: string;
          payload?: { title?: string; text?: string };
        };
        if (body?.frontend_action === FrontendActionEnum.SHOW_MESSAGE) {
          throw new BackendStartupError(
            body.payload?.text ||
              body.payload?.title ||
              'Backend reported a startup error',
          );
        }
        return;
      }
    } catch (error) {
      if (error instanceof BackendStartupError) {
        throw error;
      }
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Backend /check_health did not respond within ${timeoutMs}ms`,
      );
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }
}

export async function startBackend(options: BackendOptions): Promise<number> {
  if (!app.isPackaged) {
    log.info("dev mode, don't launch backend");
    return options.preferredPort;
  }

  const { javaPath, jarPath } = getBackendPaths();

  const port = await getPort(options.preferredPort);
  if (port !== options.preferredPort) {
    log.warn(
      `[backend] preferred port ${options.preferredPort} is busy, using ${port} instead`,
    );
  }

  const args = [
    ...(options.extraJvmArgs ?? []),
    `-Dquarkus.http.port=${port}`,
    '-jar',
    jarPath,
  ];

  const workingDir = app.getPath('userData');

  log.info(`[backend] spawning: "${javaPath}" ${args.join(' ')}`);
  log.info(`[backend] cwd: ${workingDir}`);

  backendProcess = spawn(javaPath, args, {
    cwd: workingDir,
    env: {
      ...process.env,
      ...options.env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const proc = backendProcess;

  let recentOutput = '';
  const appendOutput = (chunk: string) => {
    recentOutput = `${recentOutput}${chunk}`.slice(-4000);
  };

  proc.stdout?.on('data', (data) => {
    const text = data.toString();
    appendOutput(text);
    log.info(`[quarkus] ${text.trim()}`);
  });

  proc.stderr?.on('data', (data) => {
    const text = data.toString();
    appendOutput(text);
    log.error(`[quarkus:err] ${text.trim()}`);
  });

  let backendHealthy = false;

  proc.on('exit', (code, signal) => {
    log.info(`[backend] process exited: code=${code} signal=${signal}`);
    backendProcess = null;
  });

  const healthReady = waitForHealth(port).then(() => {
    backendHealthy = true;
    return port;
  });

  const processFailed = new Promise<never>((_, reject) => {
    proc.once('error', (err) => {
      reject(
        new Error(
          `Не удалось запустить java-процесс (${javaPath}): ${err.message}`,
        ),
      );
    });
    proc.once('exit', (code, signal) => {
      if (!backendHealthy) {
        reject(
          new Error(
            `Backend завершился раньше, чем прошёл health-check ` +
              `(code=${code}, signal=${signal}).\n${recentOutput.trim()}`,
          ),
        );
      }
    });
  });

  return Promise.race([healthReady, processFailed]);
}

export function stopBackend(): Promise<void> {
  return new Promise((resolve) => {
    if (backendProcess?.pid === undefined) {
      resolve();
      return;
    }

    const { pid } = backendProcess;
    const proc = backendProcess;

    proc.once('exit', () => resolve());

    if (process.platform === 'win32') {
      log.info(`[backend] taskkill /T /F pid=${pid}`);
      spawn('taskkill', ['/pid', String(pid), '/T', '/F']);
    } else {
      proc.kill('SIGTERM');

      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          proc.kill('SIGKILL');
        }
      }, 5000);
    }
  });
}

export function isBackendRunning(): boolean {
  return backendProcess !== null;
}
