# project proposal: c++ target integration in ffigen

**organization:** DART
**mentors:** @liamappelbe, @brianquinlan

## project summary
C++ suffers from a highly unstable application binary interface natively. linking dynamic libraries requires wrapping C++ headers utilizing standard extern "C" glue code logic. parsing intermediate abstract syntax trees directly from the libclang pipeline avoids external dependencies ensuring highly reliant codebase compilations. my top priority is building C++ memory bindings via FFIgen. this prevents the need for decoupled intermediate translation toolchains and drastically improves developer experience. these enhancements are crucial for bridging standard diagnostic limitations and strictly align with optimal developer experiences natively. 

## personal information
**Full Name**: Shaurya Mishra
**Email**: [0801cs231129@sgsits.ac.in](mailto:0801cs231129@sgsits.ac.in)
**GitHub**: [https://github.com/winshaurya](https://github.com/winshaurya)
**LinkedIn**: [https://linkedin.com/in/shaurya-mishra-win](https://linkedin.com/in/shaurya-mishra-win)
**University**: Shri G.S. Institute of Technology and Science (SGSITS), Indore (2023-2027)
**Year of Study**: 2023-2027, Pre-Final Year (Sophomore/Junior)
**Country Residence**: India
**TimeZone**: IST Asia/Kolkata | UTC+5:30
**Portfolio**: [https://winshaurya.github.io/](https://winshaurya.github.io/)

**Social Handles**: [https://twitter.com/winshaurya](https://twitter.com/winshaurya)

## questions & answers

### top project of choice:
My primary project of choice is **C++ Target Integration in FFIgen**. I am fascinated by the challenge of bridging the ABI instability of C++ using a generated "C hourglass" shim. This project allows me to leverage my strong C++ background to significantly enhance Dart's interoperability story, a domain I have been researching for 3 years.

### are you willing and able to work on other projects instead?
Yes, absolutely. I am flexible and possess the skills to contribute effectively to other projects within the Dart organization, such as the Analysis Server or DevTools.

### please describe your preferred coding languages and experience.
I have honed my skills in **Dart** and **C++** over the last 3 years, specifically focusing on systems programming.
* **Dart**: Developed complex offline-first applications and maintain active open-source packages.
* **C++**: Extensive experience with memory management, pointers, and ABI constraints (critical for this project).
* **Python**: Proficient in building automated agents and backend systems.

### what school do you attend and what is your specialty/major at the school?
I am a student at **Shri G.S. Institute of Technology and Science (SGSITS)** in Indore, India. My major is **Computer Science and Engineering**. I have chosen electives in **Compiler Design** and **Advanced Data Structures** to support my interest in language tooling.

### how many years have you attended there?
I have completed **3 years** of my studies and am currently in my pre-final year (Junior/Senior transition).

### what city/country will you be spending this summer in?
I will be residing in **Indore, India**, dedicating my summer entirely to GSoC.

### how much time do you expect to give per day to this project?
I am committed to **6-8 hours per day**, or roughly **40-45 hours per week**. My academic calendar is perfectly aligned with the GSoC schedule, ensuring zero distractions during the coding period.

### have you participated in any previous summer of code projects?
No, this is my **first time participating as a student**. However, I have been an active observer and unofficial contributor to the **Dart community for 3 consecutive years**. I have prepared extensively by analyzing the `ffigen` codebase and `libclang` bindings.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I am **exclusively applying to the Dart organization**. I am confident in my fit for this specific project and have dedicated all my preparation time to understanding the Dart SDK's FFI architecture.

### why are you well suited to perform this project and why are you interested in it?
I am well-suited because I understand both sides of the bridge: **Dart's FFI ecosystem** and **C++'s ABI complexities**.
I have spent the last **3 years** studying how languages interoperate. I have already experimented with manual `extern "C"` wrappers and understand exactly how to automate this process to solve issue #2644. My deep familiarity with `libclang` AST parsing gives me a head start on the implementation.

## my relevant experience (qualifications)
i have actively contributed to core infrastructural codebases across multiple domains.

### flutter / dart
i have been coding natively in dart for over 2 years and have built several complex applications natively.
* **dri survey application**: i developed a robust data collection tool featuring an extensive offline-first architecture, advanced state management, and dynamic complex form rendering for reliable field surveys in low-connectivity areas.
  * link: https://github.com/winshaurya/DRI_Survey
* **resumup**: a dynamic portfolio builder frontend and backend logic handling high-volume deployment parameter bindings seamlessly.

### python
i utilize python extensively for semantic parsing, orchestrating LLM agents, and server-level data hooks handling asynchronous calls.
* **multi-agent research machine**: built a production-grade AI research assistant using CrewAI extracting verifiable deep insights recursively natively.
  * link: https://github.com/winshaurya/multiagent-research--system-

### c / c++ / java
i have solidified core data structures and memory boundaries utilizing dynamic programming natively.
* tackled over 250 advanced memory and graph problems across leetcode configuring precise abstract syntax efficiently.
  * link: https://leetcode.com/u/winshaurya/

## project goals and deliverables

### issues to tackle
* **#2644**: Add C++ as a new experimental language in FFIgen.

### goals and deliverables
I will implement a robust pipeline to enable C++ interop in Dart via FFIgen. The project consists of three main components:

* **1. Extend FFIgen Parsing (LibClang)**:
  * Extend the existing `libclang`-based parser to recognize and traverse C++ AST nodes (starting with Classes and Methods).
  * Ensure the parser can distinguish between C and C++ contexts.

* **2. Enhance FFIgen AST**:
  * Update the internal Abstract Syntax Tree (AST) of FFIgen to represent C++ specific concepts like classes, member functions, and inheritance.

* **3. Generate C Glue Code**:
  * Implement code generation for an intermediate C layer (`extern "C"`) that wraps C++ instance methods and constructors.
  * This "glue code" bridges the ABI gap, allowing Dart to call C++ methods via standard C ABI symbols.

* **4. Generate Dart Bindings**:
  * Generate Dart classes that mirror the C++ API but internally invoke the generated C glue code.
  * Ensure the Dart API feels "native" to Dart developers (e.g., using Methods instead of flat functions).

## technical details / understanding
C++ generally lacks a stable ABI, making direct FFI signals unreliable across compilers. The solution is to generate a "C hourglass" interface:
`Dart <-> C Glue Code <-> C++ API`.
I will leverage `libclang` to parse the C++ headers, extract the class structure, and then generate both the C shim and the Dart wrapper in one go.

| feature | direct c++ ffi (impossible) | proposed ffigen solution |
| :--- | :--- | :--- |
| **abi stability** | Unstable (name mangling) | Stable (C ABI via `extern "C"`) |
| **invocation** | N/A | Dart calls C Shim -> C Shim calls C++ Method |
| **class mapping** | N/A | Dart Class wraps Pointer -> passes `this` to C Shim |

## test plan
### local development testing
* **Parsing Tests**: Create unit tests that feed simple C++ headers (e.g., a class with one method) to the parser and verify the AST.
* **Generation Tests**: Verify that the generated C code compiles with `clang`/`gcc` and that the generated Dart code is valid.

### integration testing
* **End-to-End**: Create a sample C++ library, run the modified FFIgen, build the glue code, and run a Dart script that calls a method on a C++ object.
* **Cross-Platform**: Verify the generated glue code works on both Linux/Windows/macOS.

## references / further reading
* **Tracking Issue #2644**: [https://github.com/dart-lang/native/issues/2644](https://github.com/dart-lang/native/issues/2644)
* **LibClang Documentation**: [https://clang.llvm.org/doxygen/group__CINDEX.html](https://clang.llvm.org/doxygen/group__CINDEX.html)
* **Dart FFI**: [https://dart.dev/guides/libraries/c-interop](https://dart.dev/guides/libraries/c-interop)

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding**: Read FFIgen source code, understand `libclang` Dart bindings, and experiment with manual C++ wrapping to finalizing the glue-code pattern. | Schema Finalized |
| May 25 - June 7 | **Parser Extension**: Extend FFIgen's parser to visit C++ cursors (Classes, Methods) and extract type information using `libclang`. | Parsing Logic |
| June 8 - June 21 | **AST Update**: Modify FFIgen's AST to store C++ class structures and method signatures. | AST Ready |
| June 22 - July 5 | **C Glue Generator**: Implement the generator for the `extern "C"` shim functions (handling `this` pointers and method dispatch). | Glue Code Gen |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | construct exhaustive unit tests checking ABI compliance across different compilers | regression passing |
| Aug 3 - Aug 17 | clean documentation and submit final production ready repository PR | PR merged |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |
