import os
import re
import shutil
from pathlib import Path
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import frontmatter

# 白名单配置 - 使用更精确的路径格式
WHITELIST_FOLDERS = [
    'src/posts/aboutme/index.md',  # 具体文件
    'src/posts/aboutme/',          # 或者整个文件夹
    'src/posts/broadcast/',        # 也可以是文件夹
    'src/posts/broadcast/index.md',
]

def is_whitelisted(file_path: Path) -> bool:
    """检查文件是否在白名单中"""
    str_path = str(file_path).replace('\\', '/')  # 统一使用正斜杠
    
    # 打印调试信息
    print(f"Checking path: {str_path}")
    
    for white_path in WHITELIST_FOLDERS:
        if white_path.endswith('/'):
            # 如果是文件夹匹配
            if str_path.startswith(white_path):
                print(f"Matched folder whitelist: {white_path}")
                return True
        else:
            # 如果是具体文件匹配
            if str_path.endswith(white_path):
                print(f"Matched file whitelist: {white_path}")
                return True
    return False
def generate_key(password: str) -> bytes:
    """从密码生成加密密钥"""
    salt = b'static_salt_for_blog'
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(password.encode())

def encrypt_url(url: str, key: bytes) -> str:
    """加密URL"""
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, url.encode(), None)
    combined = nonce + ciphertext
    return base64.urlsafe_b64encode(combined).decode()

def process_markdown_content(content: str, key: bytes) -> str:
    """处理Markdown内容中的链接"""
    processed_content = content
    
    # 1. 处理markdown格式的链接 [text](url)
    link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    
    def encrypt_link(match):
        text = match.group(1)
        url = match.group(2)
        
        # 如果是图片链接或已加密链接，直接返回原内容
        if url.endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg')) or url.startswith('encrypted:'):
            return match.group(0)
            
        # 如果是 http/https/magnet 链接，进行加密
        if url.startswith(('http://', 'https://', 'magnet:')):
            encrypted_url = encrypt_url(url, key)
            # 检查链接文本是否包含提取码
            extract_code_match = re.search(r'提取码[：:]\s*([A-Za-z0-9]{4,6})', text)
            if extract_code_match:
                extract_code = extract_code_match.group(1)
                return f'[🔒 加密链接点击解密 提取码：{extract_code}](encrypted:{encrypted_url})'
            return f'[🔒 加密链接点击解密](encrypted:{encrypted_url})'
            
        return match.group(0)
    
    processed_content = re.sub(link_pattern, encrypt_link, processed_content)
    
    # 2. 处理纯文本中的url链接（在提取码之前的链接）
    def process_url_with_code(match):
        full_text = match.group(0)
        
        # 先检查是否包含提取码
        extract_code_match = re.search(r'提取码[：:]\s*([A-Za-z0-9]{4,6})', full_text)
        extract_code = extract_code_match.group(1) if extract_code_match else None
        
        # 匹配链接部分（https或magnet开头到空格或者"提取码"之前的部分）
        url_pattern = r'(https?://[^\s提取码]+|magnet:\?[^\s提取码]+)'
        
        def replace_url(url_match):
            url = url_match.group(1)
            encrypted_url = encrypt_url(url, key)
            if extract_code:
                return f'[🔒 加密链接点击解密 提取码：{extract_code}](encrypted:{encrypted_url})'
            return f'[🔒 加密链接点击解密](encrypted:{encrypted_url})'
        
        return re.sub(url_pattern, replace_url, full_text)
    
    # 匹配包含链接和可能的提取码的完整文本块
    url_block_pattern = r'[^\n.]*(https?://[^\s]+|magnet:\?[^\s]+)[^\n]*(?:提取码[：:]\s*[A-Za-z0-9]{4,6})?'
    processed_content = re.sub(url_block_pattern, process_url_with_code, processed_content)
    
    return processed_content

def process_source_markdown():
    """处理源目录中的markdown文件进行加密"""
    PASSWORD = "suxingchahui"  # 加密密码
    key = generate_key(PASSWORD)
    
    src_dir = Path('src/posts')
    
    # 处理所有markdown文件
    for markdown_file in src_dir.rglob('*.md'):
        print(f'Processing markdown {markdown_file.relative_to(src_dir)}')
        
        # 检查文件是否在白名单中
        if is_whitelisted(markdown_file):
            print(f'Skipping whitelisted file: {markdown_file.relative_to(src_dir)}')
            continue
        
        # 读取文件
        post = frontmatter.load(markdown_file)
        
        # 处理内容
        post.content = process_markdown_content(post.content, key)
        
        # 写回文件
        with open(markdown_file, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(post))

def copy_images():
    """复制图片到public目录，只清理 posts 相关目录"""
    src_dir = Path('src/posts')
    public_posts_dir = Path('public/src/posts')
    
    # 只清理 posts 相关目录
    if public_posts_dir.exists():
        print(f'Cleaning directory: {public_posts_dir}')
        shutil.rmtree(public_posts_dir)
    
    # 确保目标目录存在
    public_posts_dir.mkdir(parents=True, exist_ok=True)
    
    # 遍历源目录中的图片文件
    image_extensions = {'.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'}
    for src_path in src_dir.rglob('*'):
        if not src_path.is_file() or src_path.suffix.lower() not in image_extensions:
            continue
            
        # 计算目标路径
        rel_path = src_path.relative_to(src_dir)
        dst_path = public_posts_dir / rel_path
        
        # 确保目标文件夹存在
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        print(f'Copying {rel_path} to {dst_path}')
        shutil.copy2(src_path, dst_path)

def main():
    """主函数，按顺序执行所有处理步骤"""
    print("Starting build process...")
    
    # 1. 处理 Markdown 文件加密
    print("\nProcessing markdown files...")
    process_source_markdown()
    
    # 2. 处理图片复制
    print("\nCopying images...")
    copy_images()
    
    print("\nBuild process completed successfully!")

if __name__ == '__main__':
    main()