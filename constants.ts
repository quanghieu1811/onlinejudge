export const SUPPORTED_LANGUAGES = [
  "Python",
  "C++",
];

export const DEFAULT_CODE: { [key: string]: string } = {
    Python: `def solve():
    # Đọc input
    # Xử lý và in ra output
    pass

solve()`,
    "C++": `#include <iostream>
#include <vector>
#include <string>

void solve() {
    // Viết code của bạn ở đây
}

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    solve();
    return 0;
}`,
};
