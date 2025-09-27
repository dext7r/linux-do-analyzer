#!/bin/bash

echo "🐧 Linux.do 论坛数据分析工具演示"
echo "=================================="

echo ""
echo "📋 1. 检查数据文件..."
if [ -f "user_archive.csv" ]; then
    echo "✅ user_archive.csv 存在"
    echo "📝 发现 $(wc -l < user_archive.csv) 行用户档案数据"
else
    echo "❌ user_archive.csv 不存在"
fi

if [ -f "preferences.json" ]; then
    echo "✅ preferences.json 存在"
else
    echo "❌ preferences.json 不存在"
fi

if [ -f "visits.csv" ]; then
    echo "✅ visits.csv 存在"
    echo "📊 发现 $(wc -l < visits.csv) 行访问数据"
else
    echo "❌ visits.csv 不存在"
fi

echo ""
echo "🔍 2. 开始数据分析..."
deno task analyze

echo ""
echo "🚀 3. 启动 Web 服务..."
echo "🌐 请在浏览器中访问: http://localhost:8000"
echo "📄 或直接打开: analysis-report.html"
echo ""
echo "💡 使用提示:"
echo "- 数据概览显示你的社区贡献统计"
echo "- 活跃度分析展示访问和阅读趋势"
echo "- 互动分析显示点赞和参与情况"
echo "- 成就分析展示徽章和等级进展"
echo "- 设备分析显示访问设备和地理分布"
echo ""

# 启动服务器
deno task serve