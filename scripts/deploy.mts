#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';
import type { DeployOptions, ReleaseOptions, GitOptions } from './types';
import { Logger, GitUtils, GitHubUtils, PackageUtils, VersionUtils, retry } from './utils';

/**
 * Deployment script that:
 * 1. Validates repository state
 * 2. Updates version
 * 3. Builds the project
 * 4. Updates CHANGELOG
 * 5. Creates commit and tag
 * 6. Pushes to main branch
 * 7. Creates GitHub release
 * 8. Manages pull requests
 */
class DeployScript {
  private logger: Logger;
  private options: DeployOptions;

  constructor(options: DeployOptions) {
    this.logger = new Logger();
    this.options = options;
  }

  async execute(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('🚀 Starting deployment process...');

    try {
      await this.validateEnvironment();
      await this.preDeploymentChecks();
      await this.updateVersion();
      await this.updateChangelog();
      await this.buildProject();
      await this.createCommitAndTag();
      await this.pushToGitHub();
      await this.createGitHubRelease();
      await this.managePullRequests();

      const duration = Date.now() - startTime;
      this.logger.success(`🎉 Deployment completed in ${duration}ms`);

      this.showDeploymentSummary();
    } catch (error) {
      this.logger.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  private async validateEnvironment(): Promise<void> {
    this.logger.step(1, 8, 'Validating environment...');

    // Check if git repository
    try {
      await GitUtils.exec(['rev-parse', '--git-dir']);
    } catch {
      throw new Error('Not a git repository');
    }

    // Check if GitHub CLI is installed
    try {
      await GitHubUtils.exec(['--version']);
    } catch {
      throw new Error('GitHub CLI (gh) is not installed. Please install it first.');
    }

    // Check if authenticated with GitHub
    try {
      await GitHubUtils.exec(['auth', 'status']);
    } catch {
      throw new Error('Not authenticated with GitHub CLI. Run "gh auth login" first.');
    }

    // Check working directory is clean
    if (await GitUtils.hasUncommittedChanges()) {
      throw new Error('Working directory has uncommitted changes. Please commit or stash them first.');
    }

    this.logger.success('Environment validation passed');
  }

  private async preDeploymentChecks(): Promise<void> {
    this.logger.step(2, 8, 'Running pre-deployment checks...');

    // Check if we're on main branch or create feature branch
    const currentBranch = await GitUtils.getCurrentBranch();
    this.logger.log(`Current branch: ${currentBranch}`);

    if (currentBranch !== 'main' && !this.options.skipTests) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: `You're not on main branch (currently on ${currentBranch}). Continue deployment?`,
          default: false,
        },
      ]);

      if (!answers.continue) {
        throw new Error('Deployment cancelled');
      }
    }

    // Get current version
    const currentVersion = PackageUtils.getVersion();
    const newVersion = this.getNewVersion(currentVersion);

    this.logger.log(`Current version: ${currentVersion}`);
    this.logger.log(`New version: ${newVersion}`);

    // Confirm deployment
    if (!this.options.skipTests) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Deploy version ${newVersion} to production?`,
          default: true,
        },
      ]);

      if (!answers.confirm) {
        throw new Error('Deployment cancelled');
      }
    }

    this.logger.success('Pre-deployment checks passed');
  }

  private async updateVersion(): Promise<void> {
    this.logger.step(3, 8, 'Updating version...');

    const currentVersion = PackageUtils.getVersion();
    const newVersion = this.getNewVersion(currentVersion);

    PackageUtils.setVersion(newVersion);
    this.logger.success(`Version updated to ${newVersion}`);
  }

  private async updateChangelog(): Promise<void> {
    this.logger.step(4, 8, 'Updating CHANGELOG...');

    const currentVersion = this.getNewVersion(PackageUtils.getVersion());

    // Run changelog script
    await execa('node', [
      '--loader',
      'ts-node/esm',
      'scripts/changelog.mts',
      'release',
    ]);

    this.logger.success('CHANGELOG updated');
  }

  private async buildProject(): Promise<void> {
    this.logger.step(5, 8, 'Building project...');

    try {
      await execa('npm', ['run', 'build'], { stdio: 'inherit' });
      this.logger.success('Project built successfully');
    } catch (error) {
      throw new Error('Build failed');
    }
  }

  private async createCommitAndTag(): Promise<void> {
    this.logger.step(6, 8, 'Creating commit and tag...');

    const version = PackageUtils.getVersion();
    const commitMessage = `chore(release): v${version}`;
    const tagName = `v${version}`;
    const tagMessage = `Release ${version}`;

    // Stage all changes
    await GitUtils.add(['.']);

    // Create commit
    await GitUtils.commit(commitMessage);
    this.logger.success(`Commit created: ${commitMessage}`);

    // Create tag
    if (this.options.createTag) {
      await GitUtils.createTag(tagName, tagMessage);
      this.logger.success(`Tag created: ${tagName}`);
    }
  }

  private async pushToGitHub(): Promise<void> {
    this.logger.step(7, 8, 'Pushing to GitHub...');

    const currentBranch = await GitUtils.getCurrentBranch();

    if (this.options.pushToMain) {
      await GitUtils.push(currentBranch, this.options.createTag);
      this.logger.success(`Pushed to ${currentBranch} with tags`);
    } else {
      this.logger.log('Skipping push to main (dry run mode)');
    }
  }

  private async createGitHubRelease(): Promise<void> {
    this.logger.step(8, 8, 'Creating GitHub release...');

    if (!this.options.createRelease) {
      this.logger.log('Skipping GitHub release creation');
      return;
    }

    const version = PackageUtils.getVersion();
    const tagName = `v${version}`;

    // Generate release notes from CHANGELOG
    const releaseNotes = this.generateReleaseNotes(version);

    const releaseOptions: ReleaseOptions = {
      version: tagName,
      title: `Release ${version}`,
      body: releaseNotes,
      draft: false,
      prerelease: false,
      target: 'main',
    };

    await retry(() => GitHubUtils.createRelease(
      releaseOptions.version,
      releaseOptions.title,
      releaseOptions.body,
      releaseOptions.draft,
      releaseOptions.prerelease,
    ));

    this.logger.success(`GitHub release created: ${tagName}`);
  }

  private async managePullRequests(): Promise<void> {
    this.logger.log('Managing pull requests...');

    const currentBranch = await GitUtils.getCurrentBranch();

    if (currentBranch === 'main') {
      this.logger.log('Already on main branch, no PR needed');
      return;
    }

    // Create PR to main
    const prTitle = `Release v${PackageUtils.getVersion()}`;
    const prBody = this.generatePRDescription();
    const repoInfo = await GitHubUtils.getRepoInfo();

    try {
      const prUrl = await GitHubUtils.createPR(
        prTitle,
        prBody,
        'main',
        currentBranch,
      );

      this.logger.success(`Pull request created: ${prUrl}`);

      // Auto-merge if configured
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'merge',
          message: 'Auto-merge pull request?',
          default: false,
        },
      ]);

      if (answers.merge) {
        const prNumber = prUrl.split('/').pop();
        await GitHubUtils.mergePR(prNumber!);
        this.logger.success('Pull request merged');
      }
    } catch (error) {
      this.logger.warn('Failed to create pull request:', error);
    }
  }

  private getNewVersion(currentVersion: string): string {
    if (this.options.customVersion) {
      if (!VersionUtils.isValidVersion(this.options.customVersion)) {
        throw new Error(`Invalid version: ${this.options.customVersion}`);
      }
      return this.options.customVersion;
    }

    return VersionUtils.incrementVersion(currentVersion, this.options.version);
  }

  private generateReleaseNotes(version: string): string {
    const changelogPath = 'CHANGELOG.md';

    if (!existsSync(changelogPath)) {
      return `Release ${version}`;
    }

    const content = readFileSync(changelogPath, 'utf-8');
    const versionRegex = new RegExp(`## \\[${version}\\] - ([\\d-]+)\\n\\n([\\s\\S]*?)(?=\\n## |\\n$)`, 'g');
    const match = versionRegex.exec(content);

    if (!match) {
      return `Release ${version}`;
    }

    const date = match[1];
    const changes = match[2];

    return `# Release ${version}

**Date:** ${date}

${changes}

---

### Installation

\`\`\`bash
npm install dcversus.wtf@${version}
\`\`\`

### Verification

You can verify the installation by checking the version:

\`\`\`bash
npm list dcversus.wtf
\`\`\``;
  }

  private generatePRDescription(): string {
    const version = PackageUtils.getVersion();
    return `## Summary

Automated release PR for version ${version}.

### Changes

This PR includes:
- Version bump to ${version}
- Updated CHANGELOG with release notes
- Built and optimized assets
- Updated package.json with build information

### Test Plan

- [ ] Version has been correctly updated
- [ ] CHANGELOG is accurate and complete
- [ ] Build completes successfully
- [ ] All tests pass
- [ ] Assets are properly optimized

### Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally

This is an automated release PR created by the deployment script.`;
  }

  private showDeploymentSummary(): void {
    const version = PackageUtils.getVersion();
    const currentBranch = this.getCurrentBranch();

    console.log(chalk.green('\n🎉 Deployment Summary'));
    console.log(chalk.cyan('─────────────────────────'));
    console.log(`Version: ${chalk.yellow(version)}`);
    console.log(`Branch: ${chalk.yellow(currentBranch)}`);
    console.log(`Tag created: ${chalk.yellow(this.options.createTag)}`);
    console.log(`GitHub release: ${chalk.yellow(this.options.createRelease)}`);
    console.log(`Pushed to main: ${chalk.yellow(this.options.pushToMain)}`);

    console.log(chalk.green('\nNext steps:'));
    console.log('1. Monitor the GitHub Actions workflow');
    console.log('2. Verify the deployment at https://dcversus.wtf');
    console.log('3. Update any documentation if needed');

    console.log(chalk.green('\n✨ All done! Your release is live.'));
  }

  private getCurrentBranch(): string {
    try {
      return require('child_process')
        .execSync('git rev-parse --abbrev-ref HEAD')
        .toString()
        .trim();
    } catch {
      return 'unknown';
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options: Partial<DeployOptions> = {
    version: 'patch', // default
    createRelease: true,
    createTag: true,
    pushToMain: true,
    skipTests: false,
  };

  // Parse flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--patch':
        options.version = 'patch';
        break;
      case '--minor':
        options.version = 'minor';
        break;
      case '--major':
        options.version = 'major';
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--no-release':
        options.createRelease = false;
        break;
      case '--no-tag':
        options.createTag = false;
        break;
      case '--no-push':
        options.pushToMain = false;
        break;
      case '--dry-run':
        options.pushToMain = false;
        options.createRelease = false;
        break;
      case '--version':
        options.customVersion = args[++i];
        break;
      case '--help':
        console.log(`
Usage: npm run deploy [options]

Options:
  --patch           Increment patch version (default)
  --minor           Increment minor version
  --major           Increment major version
  --version X.Y.Z   Set custom version
  --skip-tests      Skip pre-deployment checks
  --no-release      Skip GitHub release creation
  --no-tag          Skip tag creation
  --no-push         Skip pushing to main branch
  --dry-run         Dry run mode (no push, no release)
  --help            Show this help message

Examples:
  npm run deploy                    # Patch release with all features
  npm run deploy --minor            # Minor release
  npm run deploy --version 2.1.0   # Custom version
  npm run deploy --dry-run          # Dry run mode
        `);
        process.exit(0);
        break;
    }
  }

  // Interactive mode if no specific options provided
  if (args.length === 0) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: 'What type of release is this?',
        choices: [
          { name: 'Patch (bug fixes)', value: 'patch' },
          { name: 'Minor (new features)', value: 'minor' },
          { name: 'Major (breaking changes)', value: 'major' },
          { name: 'Custom version', value: 'custom' },
        ],
      },
      {
        type: 'input',
        name: 'customVersion',
        message: 'Enter custom version:',
        when: (answers) => answers.version === 'custom',
        validate: (input) => {
          if (!VersionUtils.isValidVersion(input)) {
            return 'Please enter a valid semantic version (e.g., 1.2.3)';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'createRelease',
        message: 'Create GitHub release?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'createTag',
        message: 'Create git tag?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'pushToMain',
        message: 'Push to main branch?',
        default: true,
      },
    ]);

    Object.assign(options, answers);
  }

  try {
    const deployScript = new DeployScript(options as DeployOptions);
    await deployScript.execute();
    process.exit(0);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { DeployScript };

// Run if executed directly
if (require.main === module) {
  main();
}