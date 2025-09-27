/**
 * IndexedDB 数据管理器
 * 负责浏览器本地数据存储和检索
 */
class DataManager {
    constructor() {
        this.dbName = 'LinuxDoAnalyzer';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * 初始化数据库
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('数据库初始化失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建分析数据存储
                if (!db.objectStoreNames.contains('analyses')) {
                    const store = db.createObjectStore('analyses', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // 创建索引
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('username', 'userData.username', { unique: false });
                    store.createIndex('userId', 'userData.id', { unique: false });
                }

                console.log('数据库结构创建完成');
            };
        });
    }

    /**
     * 保存分析数据
     */
    async saveAnalysis(analysisData) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readwrite');
            const store = transaction.objectStore('analyses');

            const dataToSave = {
                ...analysisData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            const request = store.add(dataToSave);

            request.onsuccess = () => {
                console.log('分析数据保存成功, ID:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('保存数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 获取所有分析数据
     */
    async getAllAnalyses() {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readonly');
            const store = transaction.objectStore('analyses');
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result || [];
                console.log(`获取到 ${results.length} 条分析记录`);
                resolve(results);
            };

            request.onerror = () => {
                console.error('获取数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 根据ID获取分析数据
     */
    async getAnalysisById(id) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readonly');
            const store = transaction.objectStore('analyses');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('获取数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 删除分析数据
     */
    async deleteAnalysis(id) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readwrite');
            const store = transaction.objectStore('analyses');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('删除数据成功, ID:', id);
                resolve();
            };

            request.onerror = () => {
                console.error('删除数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 清空所有数据
     */
    async clearAllData() {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analyses'], 'readwrite');
            const store = transaction.objectStore('analyses');
            const request = store.clear();

            request.onsuccess = () => {
                console.log('所有数据已清空');
                resolve();
            };

            request.onerror = () => {
                console.error('清空数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 获取数据库统计信息
     */
    async getStats() {
        if (!this.db) await this.initDB();

        const analyses = await this.getAllAnalyses();
        const totalSize = JSON.stringify(analyses).length;

        return {
            totalRecords: analyses.length,
            totalSize: this.formatBytes(totalSize),
            oldestRecord: analyses.length > 0 ?
                Math.min(...analyses.map(a => new Date(a.timestamp).getTime())) : null,
            newestRecord: analyses.length > 0 ?
                Math.max(...analyses.map(a => new Date(a.timestamp).getTime())) : null
        };
    }

    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 导出数据为JSON
     */
    async exportData() {
        const analyses = await this.getAllAnalyses();
        const exportData = {
            version: '1.0',
            exportTime: new Date().toISOString(),
            totalRecords: analyses.length,
            data: analyses
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// 导出为全局变量以供其他模块使用
window.DataManager = DataManager;