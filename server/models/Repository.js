const database = require('../config/database');
const { ObjectId } = require('mongodb');

class Repository {
  static async create(userId, repoUrl, repoData) {
    if (database.isUsingFallback()) {
      // Fallback storage
      const storage = database.getFallbackStorage();
      const repoId = storage.repoIdCounter++;
      const repository = {
        id: repoId,
        user_id: parseInt(userId),
        repo_url: repoUrl,
        repo_data: repoData,
        created_at: new Date()
      };
      storage.repositories.set(repoId, repository);
      return repository;
    }

    try {
      const db = database.getDb();
      const result = await db.collection('repositories').insertOne({
        user_id: new ObjectId(userId),
        repo_url: repoUrl,
        repo_data: repoData,
        created_at: new Date()
      });

      return {
        id: result.insertedId.toString(),
        user_id: userId,
        repo_url: repoUrl,
        repo_data: repoData
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    if (database.isUsingFallback()) {
      // Fallback storage
      const storage = database.getFallbackStorage();
      const repositories = [];
      for (const repo of storage.repositories.values()) {
        if (repo.user_id === parseInt(userId)) {
          repositories.push(repo);
        }
      }
      return repositories.sort((a, b) => b.created_at - a.created_at);
    }

    try {
      const db = database.getDb();
      const repositories = await db.collection('repositories')
        .find({ user_id: new ObjectId(userId) })
        .sort({ created_at: -1 })
        .toArray();

      return repositories.map(repo => ({
        ...repo,
        id: repo._id.toString()
      }));
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(userId, repoId) {
    if (database.isUsingFallback()) {
      // Fallback storage
      const storage = database.getFallbackStorage();
      const repo = storage.repositories.get(parseInt(repoId));
      if (repo && repo.user_id === parseInt(userId)) {
        storage.repositories.delete(parseInt(repoId));
        return true;
      }
      return false;
    }

    try {
      const db = database.getDb();
      const result = await db.collection('repositories').deleteOne({
        _id: new ObjectId(repoId),
        user_id: new ObjectId(userId)
      });

      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Repository;