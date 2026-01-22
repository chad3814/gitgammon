/**
 * Tests for GitHub Action Workflow Configuration
 * Task Group 1: GitHub Action Workflow YAML
 * @module tests/action/workflow
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { join } from 'path';

const WORKFLOW_PATH = join(process.cwd(), '.github/workflows/process-move.yml');

describe('GitHub Action Workflow Configuration', () => {
  let workflowContent;
  let workflow;

  beforeAll(() => {
    if (!existsSync(WORKFLOW_PATH)) {
      throw new Error(`Workflow file not found at ${WORKFLOW_PATH}`);
    }
    workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    workflow = parseYaml(workflowContent);
  });

  describe('Workflow YAML syntax', () => {
    it('should be valid YAML syntax', () => {
      expect(() => parseYaml(workflowContent)).not.toThrow();
      expect(workflow).toBeDefined();
      expect(workflow.name).toBeDefined();
    });
  });

  describe('Trigger configuration', () => {
    it('should trigger on push to main branch only', () => {
      expect(workflow.on).toBeDefined();
      expect(workflow.on.push).toBeDefined();
      expect(workflow.on.push.branches).toContain('main');
    });

    it('should filter paths to tables/*/moves/*.json pattern', () => {
      expect(workflow.on.push.paths).toBeDefined();
      expect(workflow.on.push.paths).toContain('tables/*/moves/*.json');
    });
  });

  describe('Concurrency configuration', () => {
    it('should use correct concurrency group pattern', () => {
      expect(workflow.concurrency).toBeDefined();
      expect(workflow.concurrency.group).toContain('gitgammon');
      expect(workflow.concurrency.group).toContain('${{ github.ref }}');
    });

    it('should set cancel-in-progress to false to queue moves', () => {
      expect(workflow.concurrency['cancel-in-progress']).toBe(false);
    });
  });

  describe('Bot commit detection', () => {
    it('should have bot actor check conditional in job or steps', () => {
      const jobs = workflow.jobs;
      expect(jobs).toBeDefined();

      // Check if any job or step has the bot check condition
      let hasBotCheck = false;
      for (const jobName in jobs) {
        const job = jobs[jobName];
        // Check job-level condition
        if (job.if && job.if.includes("github.actor != 'github-actions[bot]'")) {
          hasBotCheck = true;
          break;
        }
        // Check step-level conditions
        if (job.steps) {
          for (const step of job.steps) {
            if (step.if && step.if.includes("github.actor != 'github-actions[bot]'")) {
              hasBotCheck = true;
              break;
            }
          }
        }
      }
      expect(hasBotCheck).toBe(true);
    });
  });

  describe('Permissions', () => {
    it('should configure contents: write permission', () => {
      // Check job-level or workflow-level permissions
      let hasWritePermission = false;

      if (workflow.permissions && workflow.permissions.contents === 'write') {
        hasWritePermission = true;
      }

      for (const jobName in workflow.jobs) {
        const job = workflow.jobs[jobName];
        if (job.permissions && job.permissions.contents === 'write') {
          hasWritePermission = true;
          break;
        }
      }

      expect(hasWritePermission).toBe(true);
    });
  });
});
