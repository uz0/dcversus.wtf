#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Logger, FileUtils } from './utils';

/**
 * Post-build script that:
 * 1. Cleans up build artifacts
 * 2. Optimizes generated files
 * 3. Updates documentation
 * 4. Validates build output
 * 5. Generates build reports
 */
class PostBuildScript {
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.logger = new Logger(verbose);
  }

  async execute(): Promise<void> {
    this.logger.log('🔧 Running post-build tasks...');

    try {
      await this.cleanupArtifacts();
      await this.validateBuild();
      await this.generateBuildReport();
      await this.optimizeAssets();
      await this.updateDocumentation();

      this.logger.success('✅ Post-build tasks completed');
    } catch (error) {
      this.logger.error('❌ Post-build tasks failed:', error);
      throw error;
    }
  }

  private async cleanupArtifacts(): Promise<void> {
    this.logger.step(1, 5, 'Cleaning up build artifacts...');

    // Remove temporary files
    const tempFiles = [
      'docs/manifest.json',
      'dist',
      'node_modules/.cache',
    ];

    for (const file of tempFiles) {
      if (existsSync(file)) {
        try {
          if (file.includes('dist') || file.includes('cache')) {
            // Use rm -rf for directories
            await import('child_process').then(({ execSync }) => {
              execSync(`rm -rf ${file}`, { stdio: 'ignore' });
            });
          } else {
            unlinkSync(file);
          }
          this.logger.debug(`Removed: ${file}`);
        } catch (error) {
          this.logger.warn(`Failed to remove ${file}:`, error);
        }
      }
    }

    this.logger.success('Cleanup completed');
  }

  private async validateBuild(): Promise<void> {
    this.logger.step(2, 5, 'Validating build output...');

    const requiredFiles = [
      'docs/index.html',
    ];

    // Find the hashed JS file
    const jsFiles = require('fs')
      .readdirSync('docs/js')
      .filter((file: string) => file.startsWith('main.') && file.endsWith('.js'));

    if (jsFiles.length === 0) {
      throw new Error('No hashed JavaScript file found in docs/js/');
    }

    requiredFiles.push(`docs/js/${jsFiles[0]}`);

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }

      // Validate file content
      const content = FileUtils.readFile(file);
      if (content.length === 0) {
        throw new Error(`File is empty: ${file}`);
      }

      this.logger.debug(`✓ ${file} (${content.length} bytes)`);
    }

    // Validate HTML references correct JS file
    const htmlContent = FileUtils.readFile('docs/index.html');
    if (!htmlContent.includes(jsFiles[0])) {
      throw new Error('HTML does not reference the correct hashed JS file');
    }

    this.logger.success(`Build validation passed (${requiredFiles.length} files)`);
  }

  private async generateBuildReport(): Promise<void> {
    this.logger.step(3, 5, 'Generating build report...');

    const report = {
      timestamp: new Date().toISOString(),
      version: JSON.parse(FileUtils.readFile('package.json')).version,
      files: [],
      totalSize: 0,
    };

    // Get all files in docs directory
    const getAllFiles = (dir: string, basePath: string = ''): any[] => {
      const fs = require('fs');
      const path = require('path');
      const files: any[] = [];

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          files.push(...getAllFiles(fullPath, relativePath));
        } else {
          const fileInfo = {
            path: relativePath,
            size: stats.size,
            hash: FileUtils.getFileHash(FileUtils.readFile(fullPath)),
            lastModified: stats.mtime,
          };

          files.push(fileInfo);
          report.totalSize += stats.size;
        }
      }

      return files;
    };

    report.files = getAllFiles('docs');

    // Write build report
    const reportPath = 'docs/build-report.json';
    FileUtils.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.logger.success(`Build report generated: ${reportPath}`);
    this.logger.log(`Total build size: ${(report.totalSize / 1024).toFixed(2)} KB`);
    this.logger.log(`Files generated: ${report.files.length}`);
  }

  private async optimizeAssets(): Promise<void> {
    this.logger.step(4, 5, 'Optimizing assets...');

    // Optimize SVG files (remove unnecessary metadata)
    const svgFiles = require('fs')
      .readdirSync('docs')
      .filter((file: string) => file.endsWith('.svg'));

    for (const svgFile of svgFiles) {
      const content = FileUtils.readFile(`docs/${svgFile}`);

      // Remove XML declaration, comments, and metadata
      const optimized = content
        .replace(/<\?xml[^>]*\?>\s*/g, '')
        .replace(/<!--[^>]*-->/g, '')
        .replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (optimized !== content) {
        FileUtils.writeFile(`docs/${svgFile}`, optimized);
        this.logger.debug(`Optimized: ${svgFile}`);
      }
    }

    // Generate .gitkeep for empty directories
    const emptyDirs = ['docs/css'];
    for (const dir of emptyDirs) {
      if (!existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
      }
      const gitkeepPath = join(dir, '.gitkeep');
      if (!existsSync(gitkeepPath)) {
        FileUtils.writeFile(gitkeepPath, '');
      }
    }

    this.logger.success('Asset optimization completed');
  }

  private async updateDocumentation(): Promise<void> {
    this.logger.step(5, 5, 'Updating documentation...');

    // Update build size in README if exists
    if (existsSync('README.md')) {
      const readmeContent = FileUtils.readFile('README.md');
      const buildReport = JSON.parse(FileUtils.readFile('docs/build-report.json'));
      const buildSizeKB = (buildReport.totalSize / 1024).toFixed(2);

      // Update build size information
      const buildSizeRegex = /Build Size:.*KB/g;
      const updatedContent = buildSizeRegex.test(readmeContent)
        ? readmeContent.replace(buildSizeRegex, `Build Size: ${buildSizeKB} KB`)
        : readmeContent;

      if (updatedContent !== readmeContent) {
        FileUtils.writeFile('README.md', updatedContent);
        this.logger.debug('Updated build size in README.md');
      }
    }

    // Create or update .gitignore
    const gitignorePath = '.gitignore';
    let gitignoreContent = '';

    if (existsSync(gitignorePath)) {
      gitignoreContent = FileUtils.readFile(gitignorePath);
    }

    const ignoreEntries = [
      'node_modules/',
      'dist/',
      '.DS_Store',
      '*.log',
      '.env*',
      'coverage/',
      '.nyc_output/',
      'docs/build-report.json',
    ];

    const requiredEntries = ignoreEntries.filter(entry => !gitignoreContent.includes(entry));

    if (requiredEntries.length > 0) {
      gitignoreContent += '\n' + requiredEntries.join('\n') + '\n';
      FileUtils.writeFile(gitignorePath, gitignoreContent);
      this.logger.debug(`Updated .gitignore with ${requiredEntries.length} entries`);
    }

    this.logger.success('Documentation updated');
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');

  try {
    const script = new PostBuildScript(verbose);
    await script.execute();
    process.exit(0);
  } catch (error) {
    console.error('Post-build script failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { PostBuildScript };

// Run if executed directly
if (require.main === module) {
  main();
}