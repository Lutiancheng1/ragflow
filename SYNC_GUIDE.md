# 同步上游更新指南

本文档介绍如何同步上游仓库的更新，同时保持本地修改不变。

## 前置条件

1. 确保已经添加了上游仓库：

```bash
# 查看当前远程仓库配置
git remote -v

# 如果没有 upstream，添加上游仓库
git remote add upstream https://github.com/infiniflow/ragflow.git
```

## 同步步骤

### 1. 保存本地修改

在同步前，确保本地修改已经提交：

```bash
# 查看本地修改状态
git status

# 如果有修改，提交修改
git add .
git commit -m "feat: 你的修改描述"
```

### 2. 获取上游更新

```bash
# 获取上游仓库的最新代码
git fetch upstream
```

### 3. 同步更新（两种方式）

#### 方式一：合并（Merge）方式

```bash
# 合并上游更新到本地
git merge upstream/main

# 如果有冲突，解决冲突后：
git add .
git commit -m "merge: 解决冲突"
```

#### 方式二：变基（Rebase）方式

```bash
# 在上游更新的基础上重放本地修改
git rebase upstream/main

# 如果有冲突，解决冲突后：
git add .
git rebase --continue
```

### 4. 推送 ��� 远程仓库

```bash
# 推送到你的远程仓库
git push origin main
```

## 最佳实践

1. 创建新分支进行同步

```bash
# 创建并切换到新分支
git checkout -b sync-upstream
# 进行同步操作
# 如果同步成功，合并到主分支
git checkout main
git merge sync-upstream
```

2. 定期同步

- 建议每周或每两周同步一次上游更新
- 避免积累太多差异，减少冲突的可能性

3. 查看更新内容

```bash
# 查看上游更新日志
git log upstream/main

# 查看具体文件变化
git diff upstream/main
```

4. 处理冲突

- 冲突文件会包含 <<<<<<< HEAD, =======, 和 >>>>>>> 标记
- 手动编辑冲突文件，选择要保留的代码
- 保存文件并标记为已解决：git add <文件名>

## 常见问题

1. 如果不小心弄错了，可以取消操作：

```bash
# 取消合并
git merge --abort

# 取消变基
git rebase --abort
```

2. 如果想要放弃本地修改：

```bash
# 放弃工作区的修改
git checkout .

# 放弃暂存区的修改
git reset HEAD
```

3. 如果想要查看具体分支：

```bash
# 查看所有分支
git branch -a

# 查看当前分支
git branch
```

## 注意事项

1. 同步前务必备份重要文件
2. 建议在同步前创建新分支
3. 保持良好的提交习惯，每个提交都应该 �� 完整的功能修改
4. 定期推送到远程仓库，避免本地代码丢失
