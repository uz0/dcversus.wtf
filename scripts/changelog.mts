#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';
import type { ChangelogOptions, ChangelogEntry } from './types';
import { Logger, FileUtils, GitUtils, VersionUtils } from './utils';

/**
 * CHANGELOG management script that:
 * 1. Parses current CHANGELOG.md
 * 2. Adds unreleased changes
 * 3. Releases versions with proper formatting
 * 4. Maintains semantic versioning
 */
class ChangelogScript {
  private logger: Logger;
  private changelogPath: string;

  constructor(verbose: boolean = false) {
    this.logger = new Logger(verbose);
    this.changelogPath = 'CHANGELOG.md';
  }

  async execute(options?: Partial<ChangelogOptions>): Promise<void> {
    this.logger.log('Managing CHANGELOG...');

    try {
      if (options) {
        await this.addChanges(options);
      } else {
        await this.interactiveMode();
      }

      this.logger.success('CHANGELOG updated successfully');
    } catch (error) {
      this.logger.error('CHANGELOG update failed:', error);
      throw error;
    }
  }

  private async interactiveMode(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Add unreleased changes', value: 'add' },
          { name: 'Release a new version', value: 'release' },
          { name: 'Show unreleased changes', value: 'show' },
          { name: 'Clear unreleased changes', value: 'clear' },
        ],
      },
    ]);

    switch (answers.action) {
      case 'add':
        await this.interactiveAddChanges();
        break;
      case 'release':
        await this.interactiveRelease();
        break;
      case 'show':
        await this.showUnreleasedChanges();
        break;
      case 'clear':
        await this.clearUnreleasedChanges();
        break;
    }
  }

  private async interactiveAddChanges(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of version is this?',
        choices: [
          { name: 'Patch (bug fixes)', value: 'patch' },
          { name: 'Minor (new features)', value: 'minor' },
          { name: 'Major (breaking changes)', value: 'major' },
        ],
      },
      {
        type: 'checkbox',
        name: 'added',
        message: 'Added features (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
      {
        type: 'checkbox',
        name: 'changed',
        message: 'Changed features (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
      {
        type: 'checkbox',
        name: 'deprecated',
        message: 'Deprecated features (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
      {
        type: 'checkbox',
        name: 'removed',
        message: 'Removed features (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
      {
        type: 'checkbox',
        name: 'fixed',
        message: 'Fixed bugs (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
      {
        type: 'checkbox',
        name: 'security',
        message: 'Security fixes (press Enter to add items):',
        when: () => true,
        pageSize: 10,
      },
    ]);

    const options: ChangelogOptions = {
      version: '', // Will be calculated
      type: answers.type,
      changes: {
        added: answers.added,
        changed: answers.changed,
        deprecated: answers.deprecated,
        removed: answers.removed,
        fixed: answers.fixed,
        security: answers.security,
      },
      unreleased: true,
    };

    await this.addChanges(options);
  }

  private async interactiveRelease(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const lastTag = await GitUtils.getLastTag();

    this.logger.log(`Current version: ${currentVersion}`);
    this.logger.log(`Last tag: ${lastTag}`);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of release is this?',
        choices: [
          { name: `Patch (${this.incrementVersion(currentVersion, 'patch')})`, value: 'patch' },
          { name: `Minor (${this.incrementVersion(currentVersion, 'minor')})`, value: 'minor' },
          { name: `Major (${this.incrementVersion(currentVersion, 'major')})`, value: 'major' },
          { name: 'Custom version', value: 'custom' },
        ],
      },
      {
        type: 'input',
        name: 'customVersion',
        message: 'Enter custom version:',
        when: (answers) => answers.type === 'custom',
        validate: (input) => {
          if (!VersionUtils.isValidVersion(input)) {
            return 'Please enter a valid semantic version (e.g., 1.2.3)';
          }
          return true;
        },
      },
    ]);

    const version = answers.type === 'custom'
      ? answers.customVersion
      : this.incrementVersion(currentVersion, answers.type);

    await this.releaseVersion(version);
  }

  private async addChanges(options: ChangelogOptions): Promise<void> {
    const changelog = this.parseChangelog();
    const version = options.version || (options.unreleased ? 'Unreleased' : await this.getNextVersion(options.type));

    const entry: ChangelogEntry = {
      version,
      date: options.unreleased ? 'Unreleased' : new Date().toISOString().split('T')[0],
      changes: options.changes,
    };

    // Add to unreleased or create new version
    if (options.unreleased) {
      changelog.unshift(entry);
    } else {
      const unreleasedIndex = changelog.findIndex(e => e.version === 'Unreleased');
      if (unreleasedIndex !== -1) {
        changelog.splice(unreleasedIndex, 0, entry);
      } else {
        changelog.unshift(entry);
      }
    }

    this.writeChangelog(changelog);
    this.logger.success(`Changes added to ${version}`);
  }

  private async releaseVersion(version: string): Promise<void> {
    const changelog = this.parseChangelog();
    const unreleasedIndex = changelog.findIndex(e => e.version === 'Unreleased');

    if (unreleasedIndex !== -1) {
      // Move unreleased changes to new version
      const unreleasedEntry = changelog[unreleasedIndex];
      changelog.splice(unreleasedIndex, 1);

      const releaseEntry: ChangelogEntry = {
        version,
        date: new Date().toISOString().split('T')[0],
        changes: unreleasedEntry.changes,
      };

      changelog.unshift(releaseEntry);
    } else {
      // Create empty release entry
      const releaseEntry: ChangelogEntry = {
        version,
        date: new Date().toISOString().split('T')[0],
        changes: {},
      };

      changelog.unshift(releaseEntry);
    }

    this.writeChangelog(changelog);
    this.logger.success(`Version ${version} released`);

    // Show what would be committed
    this.logger.log('\nChanges to be committed:');
    this.logger.log(`  CHANGELOG.md (updated with version ${version})`);
  }

  private async showUnreleasedChanges(): Promise<void> {
    const changelog = this.parseChangelog();
    const unreleasedEntry = changelog.find(e => e.version === 'Unreleased');

    if (!unreleasedEntry) {
      this.logger.log('No unreleased changes found.');
      return;
    }

    this.logger.log('\n📝 Unreleased Changes:');
    this.logEntry(unreleasedEntry);
  }

  private async clearUnreleasedChanges(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to clear all unreleased changes?',
        default: false,
      },
    ]);

    if (!answers.confirm) {
      this.logger.log('Cancelled.');
      return;
    }

    const changelog = this.parseChangelog();
    const filteredChangelog = changelog.filter(e => e.version !== 'Unreleased');

    this.writeChangelog(filteredChangelog);
    this.logger.success('Unreleased changes cleared');
  }

  private parseChangelog(): ChangelogEntry[] {
    if (!existsSync(this.changelogPath)) {
      return [];
    }

    const content = FileUtils.readFile(this.changelogPath);
    const entries: ChangelogEntry[] = [];

    // Split by version headers
    const sections = content.split(/^## \[([^\]]+)\] - (.+)$/gm);

    for (let i = 1; i < sections.length; i += 3) {
      const version = sections[i];
      const date = sections[i + 1];
      const content = sections[i + 2];

      if (!version || !date) continue;

      const changes = this.parseChanges(content);
      entries.push({
        version,
        date: date === 'Unreleased' ? 'Unreleased' : date,
        changes,
      });
    }

    return entries;
  }

  private parseChanges(content: string): ChangelogEntry['changes'] {
    const changes: ChangelogEntry['changes'] = {};

    const sections = {
      added: /^### Added\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
      changed: /^### Changed\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
      deprecated: /^### Deprecated\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
      removed: /^### Removed\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
      fixed: /^### Fixed\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
      security: /^### Security\n([\s\S]*?)(?=\n### |\n\n## |$)/gm,
    };

    for (const [key, regex] of Object.entries(sections)) {
      const match = regex.exec(content);
      if (match) {
        const items = match[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s+/, ''))
          .filter(item => item.length > 0);

        if (items.length > 0) {
          changes[key as keyof ChangelogEntry['changes']] = items;
        }
      }
    }

    return changes;
  }

  private writeChangelog(entries: ChangelogEntry[]): void {
    let content = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

    for (const entry of entries) {
      content += `## [${entry.version}] - ${entry.date}\n\n`;

      for (const [type, items] of Object.entries(entry.changes)) {
        if (items && items.length > 0) {
          const title = type.charAt(0).toUpperCase() + type.slice(1);
          content += `### ${title}\n\n`;
          items.forEach(item => {
            content += `- ${item}\n`;
          });
          content += '\n';
        }
      }
    }

    FileUtils.writeFile(this.changelogPath, content);
  }

  private logEntry(entry: ChangelogEntry): void {
    for (const [type, items] of Object.entries(entry.changes)) {
      if (items && items.length > 0) {
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        console.log(chalk.cyan(`\n${title}:`));
        items.forEach(item => {
          console.log(`  - ${item}`);
        });
      }
    }
  }

  private async getCurrentVersion(): Promise<string> {
    try {
      const { stdout } = await execa('npm', ['pkg', 'get', 'version']);
      return JSON.parse(stdout);
    } catch {
      return '1.0.0';
    }
  }

  private async getNextVersion(type: 'patch' | 'minor' | 'major'): Promise<string> {
    const current = await this.getCurrentVersion();
    return this.incrementVersion(current, type);
  }

  private incrementVersion(version: string, type: 'patch' | 'minor' | 'major'): string {
    return VersionUtils.incrementVersion(version, type);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');

  try {
    const script = new ChangelogScript(verbose);
    await script.execute();
    process.exit(0);
  } catch (error) {
    console.error('CHANGELOG script failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { ChangelogScript };

// Run if executed directly
if (require.main === module) {
  main();
}