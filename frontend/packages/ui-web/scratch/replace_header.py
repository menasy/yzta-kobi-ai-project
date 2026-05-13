import sys

filepath = '/home/menasy/Desktop/yzta-kobi-ai-project/frontend/packages/ui-web/components/shared/AppHeader.tsx'
with open(filepath, 'r') as f:
    lines = f.readlines()

start_line = 59 - 1
end_line = 69 - 1

new_code = """  const getDashArray = (index: number | null) => {
    if (index === null || navItems.length === 0) return "0 0 10 40 10 40";
    const w = 45.95;
    const h = 4.05;
    const dashLen = 8;
    const p = (2 * index + 1) / (2 * navItems.length);
    const topPos = p * w;
    const bottomPos = (w + h) + (1 - p) * w;
    const gap1 = Math.max(0, topPos - dashLen / 2);
    const gap2 = Math.max(0, bottomPos - (topPos + dashLen / 2) - dashLen);
    const gap3 = Math.max(0, 100 - (bottomPos + dashLen / 2));
    return `0 ${gap1} ${dashLen} ${gap2} ${dashLen} ${gap3}`;
  };\n"""

lines[start_line:end_line+1] = [new_code]

with open(filepath, 'w') as f:
    f.writelines(lines)
