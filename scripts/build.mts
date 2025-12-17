#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { execa } from 'execa';
import type { BuildScriptOptions, BuildOutput } from './types';
import { Logger, FileUtils, GitUtils, PackageUtils, retry } from './utils';

/**
 * Main build script that:
 * 1. Runs TypeScript compilation
 * 2. Runs Vite build
 * 3. Generates hashed JS files
 * 4. Updates index.html with hashed script references
 * 5. Generates build manifest
 * 6. Updates changelog with build info
 */
class BuildScript {
  private logger: Logger;
  private options: BuildScriptOptions;

  constructor(options: BuildScriptOptions) {
    this.logger = new Logger(options.verbose);
    this.options = options;
  }

  async execute(): Promise<BuildOutput> {
    const startTime = Date.now();
    this.logger.log('🚀 Starting build process...');

    const buildSteps = [
      { name: 'Type checking', fn: () => this.runTypeCheck(), condition: () => !this.options.skipTypeCheck },
      { name: 'Linting', fn: () => this.runLinting(), condition: () => !this.options.skipLint },
      { name: 'Vite build', fn: () => this.runViteBuild() },
      { name: 'HTML update', fn: (result: any) => this.updateIndexHtml(result) },
      { name: 'Generate manifest', fn: (result: any) => this.generateManifest(result) },
      { name: 'Update package.json', fn: (result: any) => this.updatePackageJson(result) },
    ];

    let lastResult: any;

    try {
      for (let i = 0; i < buildSteps.length; i++) {
        const step = buildSteps[i];

        if (step.condition && !step.condition()) {
          this.logger.debug(`⏭️  Skipping ${step.name}`);
          continue;
        }

        this.logger.step(i + 1, buildSteps.length, step.name);

        try {
          if (step.name === 'HTML update' || step.name === 'Generate manifest' || step.name === 'Update package.json') {
            lastResult = await step.fn(lastResult);
          } else {
            lastResult = await step.fn();
          }
          this.logger.debug(`✅ ${step.name} completed successfully`);
        } catch (stepError) {
          const error = stepError as Error;
          this.logger.error(`❌ ${step.name} failed:`, error.message);

          // Provide specific error recovery suggestions
          this.provideErrorSuggestions(step.name, error);

          throw new Error(`Build failed at ${step.name}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.success(`🎉 Build completed successfully in ${duration}ms`);
      this.logger.log(`📊 Build statistics:`, {
        duration: `${duration}ms`,
        files: lastResult?.files?.length || 0,
        version: lastResult?.version || 'unknown',
        hash: lastResult?.hash || 'unknown',
      });

      return lastResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`💥 Build failed after ${duration}ms:`, error);
      await this.cleanupOnFailure();
      throw error;
    }
  }

  private provideErrorSuggestions(stepName: string, error: Error): void {
    const suggestions: Record<string, string[]> = {
      'Type checking': [
        'Run `npm install` to install missing dependencies',
        'Check TypeScript configuration in tsconfig.json',
        'Verify all imports and type definitions are correct',
        'Run `npm run type-check:scripts` to check script files separately',
      ],
      'Linting': [
        'Run `npm run lint --fix` to auto-fix linting issues',
        'Check .eslintrc.json configuration',
        'Verify code follows ESLint rules',
      ],
      'Vite build': [
        'Check vite.config.ts configuration',
        'Verify all file paths and imports are correct',
        'Ensure Tailwind CSS is properly configured',
        'Check for missing or corrupted node_modules',
      ],
      'HTML update': [
        'Verify docs/index.html exists and is writable',
        'Check if Tailwind config duplication needs to be removed',
        'Ensure all script references are correct',
      ],
    };

    const stepSuggestions = suggestions[stepName] || [
      'Check error message for specific details',
      'Verify file permissions and paths',
      'Ensure all dependencies are installed',
    ];

    this.logger.log(`💡 Suggestions for ${stepName}:`);
    stepSuggestions.forEach((suggestion, index) => {
      this.logger.log(`   ${index + 1}. ${suggestion}`);
    });
  }

  private async cleanupOnFailure(): Promise<void> {
    this.logger.log('🧹 Cleaning up after build failure...');

    // Clean up any temporary files created during build
    const tempFiles = [
      'docs/manifest.json',
      'dist',
      'node_modules/.cache',
    ];

    for (const file of tempFiles) {
      if (require('fs').existsSync(file)) {
        try {
          if (file.includes('dist') || file.includes('cache')) {
            require('child_process').execSync(`rm -rf ${file}`, { stdio: 'ignore' });
          } else {
            require('fs').unlinkSync(file);
          }
          this.logger.debug(`Cleaned up: ${file}`);
        } catch (error) {
          this.logger.debug(`Failed to clean up ${file}:`, error);
        }
      }
    }
  }

  private async runTypeCheck(): Promise<void> {
    this.logger.step(1, 6, 'Running TypeScript compilation...');

    try {
      await execa('tsc', ['--noEmit'], { stdio: 'inherit' });
      this.logger.success('TypeScript compilation passed');
    } catch (error) {
      throw new Error('TypeScript compilation failed');
    }
  }

  private async runLinting(): Promise<void> {
    this.logger.step(2, 6, 'Running ESLint...');

    try {
      await execa('eslint', ['src', '--ext', '.ts'], { stdio: 'inherit' });
      this.logger.success('Linting passed');
    } catch (error) {
      throw new Error('ESLint failed');
    }
  }

  private async runViteBuild(): Promise<any> {
    this.logger.step(3, 6, 'Running Vite build...');

    try {
      const mode = this.options.mode;
      await execa('vite', ['build', '--mode', mode], { stdio: 'inherit' });

      // Read manifest file
      const manifestPath = 'docs/manifest.json';
      if (existsSync(manifestPath)) {
        const manifestContent = FileUtils.readFile(manifestPath);
        return JSON.parse(manifestContent);
      }

      throw new Error('Vite manifest not found');
    } catch (error) {
      throw new Error('Vite build failed');
    }
  }

  private async updateIndexHtml(manifest: any): Promise<void> {
    this.logger.step(4, 6, 'Updating index.html with hashed assets...');

    const indexPath = 'docs/index.html';
    let htmlContent = FileUtils.readFile(indexPath);

    // Find the main.js entry in manifest
    const mainEntry = manifest['main.js'];
    if (!mainEntry) {
      throw new Error('Main entry not found in manifest');
    }

    const hashedFileName = mainEntry.file;
    this.logger.debug(`Using hashed file: ${hashedFileName}`);

    // Update existing script reference or add new one
    const scriptRegex = /<script\s+src=["']js\/[^"']*\.js["'][^>]*>/g;
    const newScriptTag = `<script src="js/${hashedFileName}" defer></script>`;

    if (scriptRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(scriptRegex, newScriptTag);
    } else {
      // Add script before closing body tag
      htmlContent = htmlContent.replace(
        '</body>',
        `    <script src="js/${hashedFileName}" defer></script>\n</body>`
      );
    }

    // Remove inline Tailwind config if exists (keep external config)
    htmlContent = this.removeInlineTailwindConfig(htmlContent);

    // Add missing sections for navigation
    htmlContent = this.addMissingSections(htmlContent);

    FileUtils.writeFile(indexPath, htmlContent);
    this.logger.success(`Updated index.html with ${hashedFileName}`);
  }

  private removeInlineTailwindConfig(htmlContent: string): string {
    // Remove inline Tailwind script configuration
    const configRegex = /<script>\s*tailwind\.config\s*=\s*\{[^}]*\}\s*<\/script>/gs;
    return htmlContent.replace(configRegex, '');
  }

  private addMissingSections(htmlContent: string): string {
    // Check if sections exist, if not add placeholder sections
    const sections = ['services', 'about', 'contact'];
    const hasAllSections = sections.every(section =>
      htmlContent.includes(`id="${section}"`)
    );

    if (!hasAllSections) {
      const placeholderSections = `
    <!-- Services Section -->
    <section id="services" class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Our Services</h2>
        <p class="text-lg text-gray-600 mb-12">Professional consulting services tailored to your needs</p>
        <!-- Service cards will be added here -->
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">About Us</h2>
        <p class="text-lg text-gray-600 text-center">Learn more about our mission and values</p>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
        <p class="text-lg text-gray-600 mb-8">Ready to start your journey with us?</p>
        <button class="bg-brand-orange text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
          Contact Us
        </button>
      </div>
    </section>`;

      // Insert before footer
      const footerIndex = htmlContent.indexOf('<footer');
      if (footerIndex !== -1) {
        htmlContent = htmlContent.slice(0, footerIndex) + placeholderSections + '\n' + htmlContent.slice(footerIndex);
      }
    }

    return htmlContent;
  }

  private async generateManifest(buildResult: any): Promise<BuildOutput> {
    this.logger.step(5, 6, 'Generating build manifest...');

    const commitHash = await retry(() => GitUtils.getCommitHash(true));
    const version = PackageUtils.getVersion();
    const timestamp = new Date();

    const manifest: BuildOutput = {
      files: Object.entries(buildResult).map(([key, entry]: [string, any]) => ({
        path: entry.file,
        hash: FileUtils.getFileHash(JSON.stringify(entry)),
        size: entry.size || 0,
        lastModified: timestamp,
      })),
      version,
      timestamp,
      hash: commitHash,
    };

    // Write manifest to docs
    const manifestPath = 'docs/build-manifest.json';
    FileUtils.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    this.logger.success(`Build manifest generated: ${manifest.files.length} files`);
    return manifest;
  }

  private async updatePackageJson(manifest: BuildOutput): Promise<void> {
    this.logger.step(6, 6, 'Updating package.json with build info...');

    const pkg = PackageUtils.readPackageJson();

    // Add build information
    pkg.build = {
      version: manifest.version,
      timestamp: manifest.timestamp.toISOString(),
      hash: manifest.hash,
      files: manifest.files.length,
    };

    PackageUtils.writePackageJson(pkg);
    this.logger.success('Package.json updated with build info');
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const skipTypeCheck = args.includes('--skip-type-check');
  const skipLint = args.includes('--skip-lint');

  const options: BuildScriptOptions = {
    mode: 'production',
    verbose,
    skipTypeCheck,
    skipLint,
  };

  try {
    const buildScript = new BuildScript(options);
    await buildScript.execute();
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { BuildScript };

// Run if executed directly
if (require.main === module) {
  main();
}