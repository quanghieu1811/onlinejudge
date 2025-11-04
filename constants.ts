
export const SUPPORTED_LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "Go",
  "Rust",
];

export const DEFAULT_CODE: { [key: string]: string } = {
    Python: `def solve():
    # Read input
    # Process and print output
    pass

solve()`,
    JavaScript: `function solve() {
    // Read input from process.stdin or use a predefined reader
    // Process and console.log(output)
}

solve();`,
    TypeScript: `function solve(): void {
    // Read input
    // Process and console.log(output)
}

solve();`,
    "C++": `#include <iostream>
#include <vector>
#include <string>

void solve() {
    // Your code here
}

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    solve();
    return 0;
}`,
    Java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
    Go: `package main

import "fmt"

func main() {
    // Your code here
}`,
    Rust: `fn main() {
    // Your code here
}`,
};
