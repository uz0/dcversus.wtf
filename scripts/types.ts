import type { BuildOutput, FileInfo, DeployOptions, ChangelogEntry } from '../src/types';

export interface BuildScriptOptions {
  mode: 'development' | 'production';
  skipTypeCheck?: boolean;
  skipLint?: boolean;
  generateManifest?: boolean;
}

export interface ChangelogOptions {
  version: string;
  changes: {
    added?: string[];
    changed?: string[];
    deprecated?: string[];
    removed?: string[];
    fixed?: string[];
    security?: string[];
  };
  type: 'patch' | 'minor' | 'major';
  unreleased?: boolean;
}

export interface ReleaseOptions {
  version: string;
  title?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  target: string;
}

export interface GitOptions {
  commitMessage: string;
  tagName: string;
  targetBranch: string;
  createTag: boolean;
  push: boolean;
}

export interface CLIOptions {
  verbose?: boolean;
  dryRun?: boolean;
  force?: boolean;
  silent?: boolean;
}

export type ScriptContext = BuildScriptOptions & CLIOptions;