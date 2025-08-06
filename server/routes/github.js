const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Repository = require('../models/Repository');

const router = express.Router();

// Helper function to parse GitHub URL
const parseGitHubUrl = (url) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  return match ? { owner: match[1], repo: match[2] } : null;
};

// Helper function to build file tree recursively
const buildFileTree = async (owner, repo, path = '', githubToken = null) => {
  try {
    const headers = githubToken ? { Authorization: `token ${githubToken}` } : {};
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    const items = response.data;
    const tree = {
      name: path || repo,
      type: 'folder',
      children: []
    };

    for (const item of items) {
      if (item.type === 'dir') {
        // Recursively get folder contents
        const subTree = await buildFileTree(owner, repo, item.path, githubToken);
        tree.children.push({
          name: item.name,
          type: 'folder',
          path: item.path,
          children: subTree.children
        });
      } else {
        // File
        tree.children.push({
          name: item.name,
          type: 'file',
          path: item.path,
          download_url: item.download_url,
          size: item.size
        });
      }
    }

    return tree;
  } catch (error) {
    throw new Error(`GitHub API error: ${error.message}`);
  }
};

// Helper function to build file tree with cancellation support and enhanced nesting
const buildFileTreeWithCancellation = async (owner, repo, path = '', githubToken = null, analysisId = null, depth = 0, maxDepth = 10) => {
  try {
    // Check if analysis was cancelled
    if (analysisId && activeAnalyses.get(analysisId)?.cancelled) {
      throw new Error('Analysis cancelled by user');
    }

    // Update progress for deep analysis
    if (analysisId && depth > 0) {
      const progress = Math.min((depth / maxDepth) * 100, 100);
      activeAnalyses.set(analysisId, { 
        ...activeAnalyses.get(analysisId), 
        progress: Math.round(progress),
        currentDepth: depth,
        currentPath: path
      });
    }

    // Check depth limit
    if (depth > maxDepth) {
      return {
        name: path || repo,
        type: 'folder',
        children: [],
        truncated: true,
        message: `Maximum depth (${maxDepth}) reached`
      };
    }

    const headers = githubToken ? { Authorization: `token ${githubToken}` } : {};
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    const items = response.data;
    const tree = {
      name: path || repo,
      type: 'folder',
      children: [],
      depth: depth
    };

    // Files/folders to skip for performance
    const skipPatterns = [
      'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
      'coverage', '.nyc_output', '.cache', '.parcel-cache',
      '*.log', '*.lock', '*.min.js', '*.min.css', '*.map'
    ];

    for (const item of items) {
      // Check for cancellation before processing each item
      if (analysisId && activeAnalyses.get(analysisId)?.cancelled) {
        throw new Error('Analysis cancelled by user');
      }

      // Skip certain files/folders for performance
      const shouldSkip = skipPatterns.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(item.name);
        }
        return item.name === pattern;
      });

      if (shouldSkip) {
        continue;
      }

      if (item.type === 'dir') {
        // Recursively get folder contents with increased depth
        const subTree = await buildFileTreeWithCancellation(
          owner, 
          repo, 
          item.path, 
          githubToken, 
          analysisId, 
          depth + 1, 
          maxDepth
        );
        tree.children.push({
          name: item.name,
          type: 'folder',
          path: item.path,
          children: subTree.children,
          depth: depth + 1,
          truncated: subTree.truncated,
          message: subTree.message
        });
      } else {
        // File - only include if it's a reasonable size (less than 1MB)
        if (item.size && item.size < 1024 * 1024) {
          tree.children.push({
            name: item.name,
            type: 'file',
            path: item.path,
            download_url: item.download_url,
            size: item.size,
            depth: depth
          });
        }
      }
    }

    return tree;
  } catch (error) {
    throw new Error(`GitHub API error: ${error.message}`);
  }
};

// Store active analysis requests
const activeAnalyses = new Map();

// Fetch repository structure
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { repoUrl, maxDepth = 15 } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: 'Repository URL is required' });
    }

    // Validate maxDepth
    const depth = Math.min(Math.max(parseInt(maxDepth) || 15, 1), 20); // Between 1 and 20

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }

    const { owner, repo } = parsed;
    const githubToken = process.env.GITHUB_TOKEN;

    // Create a unique ID for this analysis
    const analysisId = `${req.user.id}-${Date.now()}`;
    activeAnalyses.set(analysisId, { cancelled: false, progress: 0 });

    // Build file tree with cancellation support and enhanced depth
    const fileTree = await buildFileTreeWithCancellation(owner, repo, '', githubToken, analysisId, 0, depth);

    // Remove from active analyses
    activeAnalyses.delete(analysisId);

    // Check if analysis was cancelled
    if (activeAnalyses.get(analysisId)?.cancelled) {
      return res.status(499).json({ message: 'Analysis cancelled by user' });
    }

    // Save to database
    await Repository.create(req.user.id, repoUrl, fileTree);

    res.json({
      message: 'Repository analyzed successfully',
      repoInfo: { owner, repo },
      fileTree,
      analysisConfig: { maxDepth: depth }
    });
  } catch (error) {
    console.error('GitHub analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze repository',
      error: error.message
    });
  }
});

// Cancel analysis
router.post('/analyze/cancel', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.body;
    
    // Find and cancel the analysis
    for (const [id, analysis] of activeAnalyses.entries()) {
      if (id.startsWith(req.user.id)) {
        analysis.cancelled = true;
      }
    }
    
    res.json({ message: 'Analysis cancellation requested' });
  } catch (error) {
    console.error('Cancel analysis error:', error);
    res.status(500).json({ message: 'Failed to cancel analysis' });
  }
});

// Get analysis progress
router.get('/analyze/progress', authMiddleware, async (req, res) => {
  try {
    // Find active analysis for this user
    for (const [id, analysis] of activeAnalyses.entries()) {
      if (id.startsWith(req.user.id)) {
        return res.json({
          active: true,
          progress: analysis.progress || 0,
          currentDepth: analysis.currentDepth || 0,
          currentPath: analysis.currentPath || '',
          cancelled: analysis.cancelled || false
        });
      }
    }
    
    res.json({ active: false });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to get analysis progress' });
  }
});

// Get file content
router.get('/file-content', authMiddleware, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    const response = await axios.get(url);
    res.json({ content: response.data });
  } catch (error) {
    console.error('File content error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch file content',
      error: error.message
    });
  }
});

// Get user's repositories
router.get('/repositories', authMiddleware, async (req, res) => {
  try {
    const repositories = await Repository.findByUserId(req.user.id);
    res.json({ repositories });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({ message: 'Failed to fetch repositories' });
  }
});

// Delete repository
router.delete('/repositories/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Repository.deleteById(req.user.id, id);
    
    if (deleted) {
      res.json({ message: 'Repository deleted successfully' });
    } else {
      res.status(404).json({ message: 'Repository not found' });
    }
  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({ message: 'Failed to delete repository' });
  }
});

module.exports = router;