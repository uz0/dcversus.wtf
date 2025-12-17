import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import type { BuildOutput, FileInfo } from './types';

/**
 * Logger utility with colors
 */
export class Logger {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  log(message: string, ...args: any[]): void {
    console.log(chalk.blue('ℹ'), message, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(chalk.green('✅'), message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.log(chalk.yellow('⚠️'), message, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.log(chalk.red('❌'), message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message, ...args);
    }
  }

  step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  }
}

/**
 * File system utilities
 */
export class FileUtils {
  static readFile(path: string): string {
    if (!existsSync(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return readFileSync(path, 'utf-8');
  }

  static writeFile(path: string, content: string): void {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, content, 'utf-8');
  }

  static ensureDir(path: string): void {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }

  static getFileHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
  }

  static getFileInfo(path: string): FileInfo {
    const content = this.readFile(path);
    const stats = require('fs').statSync(path);

    return {
      path,
      hash: this.getFileHash(content),
      size: stats.size,
      lastModified: stats.mtime,
    };
  }
}

/**
 * Git utilities
 */
export class GitUtils {
  static async exec(args: string[]): Promise<string> {
    try {
      const { stdout } = await execa('git', args);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Git command failed: git ${args.join(' ')}`);
    }
  }

  static async getCurrentBranch(): Promise<string> {
    return this.exec(['rev-parse', '--abbrev-ref', 'HEAD']);
  }

  static async hasUncommittedChanges(): Promise<boolean> {
    const output = await this.exec(['status', '--porcelain']);
    return output.length > 0;
  }

  static async add(files: string[]): Promise<void> {
    await this.exec(['add', ...files]);
  }

  static async commit(message: string): Promise<void> {
    await this.exec(['commit', '-m', message]);
  }

  static async createTag(name: string, message?: string): Promise<void> {
    const args = ['tag', name];
    if (message) {
      args.push('-m', message);
    }
    await this.exec(args);
  }

  static async push(branch: string, tags: boolean = false): Promise<void> {
    const args = ['push', 'origin', branch];
    if (tags) {
      args.push('--tags');
    }
    await this.exec(args);
  }

  static async getLastTag(): Promise<string> {
    try {
      return this.exec(['describe', '--tags', '--abbrev=0']);
    } catch {
      return '0.0.0';
    }
  }

  static async getCommitHash(short: boolean = false): Promise<string> {
    const args = ['rev-parse', short ? '--short' : '', 'HEAD'].filter(Boolean);
    return this.exec(args);
  }
}

/**
 * GitHub CLI utilities
 */
export class GitHubUtils {
  static async exec(args: string[]): Promise<string> {
    try {
      const { stdout } = await execa('gh', args);
      return stdout.trim();
    } catch (error) {
      throw new Error(`GitHub CLI command failed: gh ${args.join(' ')}`);
    }
  }

  static async createRelease(
    tag: string,
    title: string,
    body: string,
    draft: boolean = false,
    prerelease: boolean = false,
  ): Promise<void> {
    const args = [
      'release',
      'create',
      tag,
      '--title',
      title,
      '--notes',
      body,
    ];

    if (draft) args.push('--draft');
    if (prerelease) args.push('--prerelease');

    await this.exec(args);
  }

  static async createPR(
    title: string,
    body: string,
    base: string,
    head: string,
  ): Promise<string> {
    const { stdout } = await execa('gh', [
      'pr',
      'create',
      '--title',
      title,
      '--body',
      body,
      '--base',
      base,
      '--head',
      head,
    ]);

    return stdout.trim();
  }

  static async mergePR(prNumber: string): Promise<void> {
    await this.exec(['pr', 'merge', prNumber, '--merge']);
  }

  static async getRepoInfo(): Promise<{ owner: string; repo: string }> {
    const repoUrl = await this.exec(['repo', 'view', '--json', 'owner,repo']);
    const info = JSON.parse(repoUrl);
    return { owner: info.owner.login, repo: info.repo.name };
  }
}

/**
 * Version utilities
 */
export class VersionUtils {
  static incrementVersion(
    version: string,
    type: 'patch' | 'minor' | 'major',
  ): string {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (type) {
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'major':
        return `${major + 1}.0.0`;
      default:
        throw new Error(`Invalid version type: ${type}`);
    }
  }

  static isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version);
  }

  static compareVersions(a: string, b: string): number {
    const aParts = a.split('-')[0].split('.').map(Number);
    const bParts = b.split('-')[0].split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (aParts[i] > bParts[i]) return 1;
      if (aParts[i] < bParts[i]) return -1;
    }

    return 0;
  }
}

/**
 * Package utilities
 */
export class PackageUtils {
  static readPackageJson(): any {
    const content = FileUtils.readFile('package.json');
    return JSON.parse(content);
  }

  static writePackageJson(data: any): void {
    const content = JSON.stringify(data, null, 2);
    FileUtils.writeFile('package.json', content);
  }

  static getVersion(): string {
    const pkg = this.readPackageJson();
    return pkg.version;
  }

  static setVersion(version: string): void {
    const pkg = this.readPackageJson();
    pkg.version = version;
    this.writePackageJson(pkg);
  }
}

/**
 * Error handling utility
 */
export class ScriptError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ScriptError';
  }
}

/**
 * Retry utility
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}