#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""티스토리 "스킨 등록"에 올릴 zip 을 만든다.

    python3 build_release.py

index.xml 에서 버전을 읽어 dist/DevLog-Vault-vX.Y.Z.zip 을 만든다.
README·문서·빌드 스크립트는 빼고, 티스토리가 요구하는 파일만 담는다.
"""
import os
import re
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, 'dist')

# 티스토리 스킨 등록에 필요한 파일 (없으면 경고만 하고 넘어간다)
FILES = [
    'skin.html',
    'style.css',
    'index.xml',
    'images/script.js',
    'preview.gif',       # 112×84
    'preview256.jpg',    # 256×192
    'preview560.jpg',    # 560×420
    'preview1600.jpg',   # 1600×1200
]

REQUIRED = {'skin.html', 'style.css', 'index.xml', 'images/script.js'}


def read_version():
    path = os.path.join(HERE, 'index.xml')
    with open(path, encoding='utf-8') as f:
        m = re.search(r'<version>\s*([^<]+?)\s*</version>', f.read())
    return m.group(1) if m else '0.0.0'


def main():
    version = read_version()
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, 'DevLog-Vault-v%s.zip' % version)

    missing = []
    packed = []
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in FILES:
            src = os.path.join(HERE, name)
            if not os.path.exists(src):
                missing.append(name)
                continue
            z.write(src, name)
            packed.append((name, os.path.getsize(src)))

    print('DevLog Vault v%s' % version)
    print('-' * 46)
    for name, size in packed:
        print('  %-22s %8s bytes' % (name, format(size, ',')))
    print('-' * 46)
    print('완료 → %s' % os.path.relpath(out, HERE))

    hard = [m for m in missing if m in REQUIRED]
    if missing:
        print()
        for m in missing:
            print('  ! 빠짐: %s%s' % (m, '  ← 필수' if m in REQUIRED else ''))
    if hard:
        print('\n필수 파일이 빠져 있어 티스토리에 등록할 수 없습니다.')
        return 1

    print('\n관리자 > 꾸미기 > 스킨 변경 > 스킨 등록 에서 이 zip 을 올리세요.')
    print('※ 이미 쓰고 있는 스킨을 업데이트하는 것이라면, index.xml 이 함께 올라가')
    print('   스킨 편집에 저장해 둔 옵션 값이 초기화될 수 있습니다.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
