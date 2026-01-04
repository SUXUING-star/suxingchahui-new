import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext
from tkinterdnd2 import DND_FILES, TkinterDnD
import os
import zipfile
import time
import subprocess
import threading
import shutil
from datetime import datetime

class BlogHelperGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Markdown Blog Helper")
        self.root.geometry("1000x700")
        
        # 变量初始化
        self.project_path = tk.StringVar()
        self.posts_path = tk.StringVar()
        self.zip_path = tk.StringVar()
        self.git_branch = tk.StringVar()
        self.git_remote = tk.StringVar()
        
        # 命令执行状态
        self.command_running = False
        self.command_lock = threading.Lock()
        
        # 设置窗口支持文件拖放
        self.root.drop_target_register(DND_FILES)
        self.root.dnd_bind('<<Drop>>', self.handle_drop)
        
        self.setup_ui()
        
    def setup_ui(self):
        # 创建左右分栏
        left_frame = ttk.Frame(self.root)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        right_frame = ttk.Frame(self.root)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 左侧布局
        # 项目路径选择
        ttk.Label(left_frame, text="React项目路径:").pack(anchor=tk.W, pady=2)
        project_entry = ttk.Entry(left_frame, textvariable=self.project_path)
        project_entry.pack(fill=tk.X, pady=2)
        ttk.Button(left_frame, text="选择项目文件夹", command=self.select_project).pack(anchor=tk.W, pady=2)
        
        # Git配置区域
        git_frame = ttk.LabelFrame(left_frame, text="Git配置", padding=5)
        git_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(git_frame, text="远程仓库:").pack(anchor=tk.W)
        self.remote_combo = ttk.Combobox(git_frame, textvariable=self.git_remote)
        self.remote_combo.pack(fill=tk.X, pady=2)
        
        ttk.Label(git_frame, text="分支:").pack(anchor=tk.W)
        self.branch_combo = ttk.Combobox(git_frame, textvariable=self.git_branch)
        self.branch_combo.pack(fill=tk.X, pady=2)
        
        ttk.Button(git_frame, text="刷新Git信息", command=self.refresh_git_info).pack(anchor=tk.W, pady=2)
        
        # 文章路径设置
        ttk.Label(left_frame, text="文章存放路径:").pack(anchor=tk.W, pady=2)
        posts_entry = ttk.Entry(left_frame, textvariable=self.posts_path)
        posts_entry.pack(fill=tk.X, pady=2)
        
        # 拖放区域
        drop_frame = ttk.LabelFrame(left_frame, text="ZIP文件上传区域", padding=5)
        drop_frame.pack(fill=tk.X, pady=5)
        
        self.drop_area = ttk.Label(
            drop_frame, 
            text="将ZIP文件拖放到这里\n或点击选择文件",
            relief="solid",
            padding=40
        )
        self.drop_area.pack(fill=tk.X, pady=10)
        
        # 为拖放区域注册拖放事件
        self.drop_area.drop_target_register(DND_FILES)
        self.drop_area.dnd_bind('<<Drop>>', self.handle_drop)
        # 点击事件
        self.drop_area.bind("<Button-1>", self.select_zip)
        
        ttk.Button(drop_frame, text="选择ZIP文件", command=self.select_zip).pack(anchor=tk.W, pady=2)
        
        # 右侧控制台输出
        console_frame = ttk.LabelFrame(right_frame, text="控制台输出", padding=5)
        console_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.console = scrolledtext.ScrolledText(console_frame, height=20)
        self.console.pack(fill=tk.BOTH, expand=True, pady=2)
        
        # Git操作按钮
        git_buttons_frame = ttk.LabelFrame(right_frame, text="Git操作", padding=5)
        git_buttons_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(git_buttons_frame, text="Checkout分支", command=self.git_checkout).pack(side=tk.LEFT, padx=2)
        ttk.Button(git_buttons_frame, text="Pull", command=lambda: self.run_command("git pull")).pack(side=tk.LEFT, padx=2)
        ttk.Button(git_buttons_frame, text="Add", command=lambda: self.run_command("git add .")).pack(side=tk.LEFT, padx=2)
        ttk.Button(git_buttons_frame, text="Commit", command=self.git_commit).pack(side=tk.LEFT, padx=2)
        ttk.Button(git_buttons_frame, text="Push", command=self.git_push).pack(side=tk.LEFT, padx=2)
        
        # npm命令按钮
        npm_buttons_frame = ttk.LabelFrame(right_frame, text="NPM操作", padding=5)
        npm_buttons_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(npm_buttons_frame, text="npm install", command=lambda: self.run_command("npm install")).pack(side=tk.LEFT, padx=2)
        ttk.Button(npm_buttons_frame, text="npm run build", command=lambda: self.run_command("npm run build")).pack(side=tk.LEFT, padx=2)
        
        # 设置默认值
        self.posts_path.set("src/posts/")
        
    def handle_drop(self, event):
        """处理文件拖放"""
        file_path = event.data.strip('{}')  # 去除可能的大括号
        if file_path.lower().endswith('.zip'):
            self.zip_path.set(file_path)
            self.process_zip()
        else:
            self.log_message("请拖入ZIP文件")
            
    def refresh_git_info(self):
        """刷新Git仓库和分支信息"""
        if not self.project_path.get():
            self.log_message("请先选择项目路径")
            return
            
        try:
            # 获取远程仓库列表
            remotes = subprocess.check_output(
                "git remote",
                shell=True,
                cwd=self.project_path.get(),
                text=True
            ).strip().split('\n')
            if remotes and remotes[0]:  # 检查是否为空列表或只包含空字符串
                self.remote_combo['values'] = remotes
                self.git_remote.set(remotes[0])
                
            # 获取分支列表
            branches = subprocess.check_output(
                "git branch",
                shell=True,
                cwd=self.project_path.get(),
                text=True
            ).strip().split('\n')
            if branches:
                # 去除'*'标记和空格
                branches = [b.replace('*', '').strip() for b in branches]
                self.branch_combo['values'] = branches
                
                # 获取当前分支
                current_branch = subprocess.check_output(
                    "git branch --show-current",
                    shell=True,
                    cwd=self.project_path.get(),
                    text=True
                ).strip()
                self.git_branch.set(current_branch)
                
            self.log_message("Git信息已更新")
            
        except subprocess.CalledProcessError as e:
            self.log_message(f"Git命令执行失败: {str(e)}")
        except Exception as e:
            self.log_message(f"更新Git信息时出错: {str(e)}")
            
    def git_checkout(self):
        """切换Git分支"""
        branch = self.git_branch.get()
        if branch:
            self.run_command(f"git checkout {branch}")
        else:
            self.log_message("请先选择要切换的分支")
            
    def git_push(self):
        """推送到远程仓库"""
        remote = self.git_remote.get()
        branch = self.git_branch.get()
        if remote and branch:
            # 先检查是否配置了凭证存储
            self.check_git_credentials()
            # 使用 git push 命令并显示进度
            self.run_command_with_progress(f"git push {remote} {branch}")
        else:
            self.log_message("请先选择远程仓库和分支")
            
    def check_git_credentials(self):
        """检查 Git 凭证配置"""
        try:
            # 检查是否配置了凭证存储
            result = subprocess.run(
                'git config --get credential.helper',
                shell=True,
                cwd=self.project_path.get(),
                capture_output=True,
                text=True
            )
            
            if not result.stdout.strip():
                self.log_message("提示：未配置Git凭证存储，可能需要手动输入用户名密码")
                self.log_message("建议执行: git config --global credential.helper store")
                
        except Exception as e:
            self.log_message(f"检查Git凭证时出错: {str(e)}")
            
    def run_command_with_progress(self, command):
        """执行命令并显示进度"""
        if self.command_running:
            self.log_message("有命令正在执行，请等待完成...")
            return
            
        def execute():
            try:
                with self.command_lock:
                    if self.command_running:
                        return
                    self.command_running = True
                
                project_path = self.project_path.get()
                if not project_path:
                    self.log_message("请先选择项目路径")
                    return
                    
                self.log_message(f"开始执行命令: {command}")
                
                # 设置环境变量
                my_env = os.environ.copy()
                my_env["PYTHONIOENCODING"] = "utf-8"
                my_env["GIT_TERMINAL_PROMPT"] = "0"  # 禁用 Git 终端提示
                
                startupinfo = None
                if os.name == 'nt':
                    startupinfo = subprocess.STARTUPINFO()
                    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                
                process = subprocess.Popen(
                    command,
                    shell=True,
                    cwd=project_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=my_env,
                    startupinfo=startupinfo,
                    encoding='utf-8',
                    errors='replace'
                )
                
                # 使用非阻塞方式读取输出
                self.log_message("正在执行中，请稍候...")
                
                while True:
                    # 读取输出，设置超时
                    try:
                        stdout_line = process.stdout.readline()
                        if stdout_line:
                            self.log_message(stdout_line.strip())
                        
                        stderr_line = process.stderr.readline()
                        if stderr_line:
                            self.log_message(f"错误: {stderr_line.strip()}")
                            
                        # 检查进程是否结束
                        if process.poll() is not None:
                            break
                            
                    except Exception as e:
                        self.log_message(f"读取输出时出错: {str(e)}")
                        break
                
                # 获取剩余输出
                remaining_out, remaining_err = process.communicate()
                if remaining_out:
                    self.log_message(remaining_out)
                if remaining_err:
                    self.log_message(f"错误: {remaining_err}")
                
                # 检查返回码
                if process.returncode == 0:
                    self.log_message(f"命令 '{command}' 执行成功")
                else:
                    self.log_message(f"命令执行失败，返回码: {process.returncode}")
                
            except subprocess.CalledProcessError as e:
                self.log_message(f"命令执行失败: {str(e)}")
            except Exception as e:
                self.log_message(f"执行命令时出错: {str(e)}")
            finally:
                with self.command_lock:
                    self.command_running = False
                
        # 在新线程中运行命令
        thread = threading.Thread(target=execute)
        thread.start()
            
    def select_project(self):
        """选择项目文件夹"""
        path = filedialog.askdirectory()
        if path:
            self.project_path.set(path)
            self.log_message(f"已选择项目路径: {path}")
            self.refresh_git_info()
            
    def select_zip(self, event=None):
        """选择ZIP文件"""
        path = filedialog.askopenfilename(filetypes=[("ZIP files", "*.zip")])
        if path:
            self.zip_path.set(path)
            self.process_zip()
            
    def process_zip(self):
        """处理ZIP文件，解压到文章目录并备份"""
        try:
            zip_path = self.zip_path.get()
            if not zip_path:
                self.log_message("请先选择ZIP文件")
                return
                
            project_path = self.project_path.get()
            if not project_path:
                self.log_message("请先选择项目路径")
                return
                
            # 验证ZIP文件
            if not zipfile.is_zipfile(zip_path):
                self.log_message("所选文件不是有效的ZIP文件")
                return
                
            # 创建文章目录
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            article_dir = os.path.join(
                project_path,
                self.posts_path.get(),
                timestamp
            )
            
            # 检查文章目录是否已存在
            if os.path.exists(article_dir):
                self.log_message(f"文件夹已存在: {article_dir}")
                return
                
            os.makedirs(article_dir)
            self.log_message(f"创建文章目录: {article_dir}")
            
            # 解压文件
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(article_dir)
            self.log_message(f"文件已解压到: {article_dir}")
            
            # 创建备份目录
            backup_base = os.path.join(project_path, "backup")
            os.makedirs(backup_base, exist_ok=True)
            
            backup_dir = os.path.join(backup_base, timestamp)
            if os.path.exists(backup_dir):
                self.log_message(f"备份目录已存在: {backup_dir}")
                return
                
            # 使用copytree进行完整备份
            shutil.copytree(article_dir, backup_dir)
            self.log_message(f"文件已备份到: {backup_dir}")
            
        except zipfile.BadZipFile:
            self.log_message("无效的ZIP文件格式")
        except PermissionError:
            self.log_message("无法访问文件或目录，请检查权限")
        except Exception as e:
            self.log_message(f"处理ZIP文件时出错: {str(e)}")
            
    def run_command(self, command):
        """在新线程中执行命令"""
        if self.command_running:
            self.log_message("有命令正在执行，请等待完成...")
            return
            
        def execute():
            try:
                with self.command_lock:
                    if self.command_running:
                        return
                    self.command_running = True
                
                project_path = self.project_path.get()
                if not project_path:
                    self.log_message("请先选择项目路径")
                    return
                    
                self.log_message(f"开始执行命令: {command}")
                
                # 设置环境变量以支持UTF-8
                my_env = os.environ.copy()
                my_env["PYTHONIOENCODING"] = "utf-8"
                
                startupinfo = None
                if os.name == 'nt':
                    startupinfo = subprocess.STARTUPINFO()
                    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                    startupinfo.wShowWindow = subprocess.SW_HIDE
                
                process = subprocess.Popen(
                    command,
                    shell=True,
                    cwd=project_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=my_env,
                    startupinfo=startupinfo,
                    encoding='utf-8',
                    errors='replace'
                )
                
                stdout, stderr = process.communicate()
                
                if stdout:
                    self.log_message(f"命令输出:\n{stdout}")
                if stderr:
                    self.log_message(f"错误输出:\n{stderr}")
                    
                self.log_message(f"命令 '{command}' 执行完成")
                
            except subprocess.CalledProcessError as e:
                self.log_message(f"命令执行失败: {str(e)}")
            except Exception as e:
                self.log_message(f"执行命令时出错: {str(e)}")
            finally:
                with self.command_lock:
                    self.command_running = False
                
        # 在新线程中运行命令
        thread = threading.Thread(target=execute)
        thread.start()
        
    def git_commit(self):
        """Git提交"""
        commit_message = tk.simpledialog.askstring("Git Commit", "请输入提交信息:")
        if commit_message:
            self.run_command(f'git commit -m "{commit_message}"')
            
    def log_message(self, message):
        """向控制台输出信息"""
        self.console.insert(tk.END, f"[{datetime.now().strftime('%H:%M:%S')}] {message}\n")
        self.console.see(tk.END)
        
def main():
    root = TkinterDnD.Tk()  # 使用支持拖放的Tk
    app = BlogHelperGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()