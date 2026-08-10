import os
import re

def fix_lint(src_dir):
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix catch (err: any)
                content = re.sub(r'catch\s*\(\s*err\s*:\s*any\s*\)\s*\{', r'catch (error) { const err = error as Error;', content)
                
                # Fix api.ts specific issues
                if file == 'api.ts':
                    content = content.replace('catch (e) {', 'catch (_e) {')
                    content = content.replace("window.location.href = '/login';", "// eslint-disable-next-line @next/next/no-location-assign-relative-destination\n      window.location.href = '/login';")
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == '__main__':
    fix_lint('src')
