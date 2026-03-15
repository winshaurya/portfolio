# project proposal: prototype new DART intellij plugin via LSP

**organization:** DART
**mentors:** @philquitslund, @helinshiah

## project summary
the intellij DART plugin currently communicates across the analysis server using a legacy custom syntax wrapper. migrating the core node logic toward standard language server protocol (LSP) objects enables deeply integrated structural analysis without building isolated IDE routines. jetbrains currently exposes an experimental LSP API target strictly aligned with this requirement. my native priority strictly targets prototyping structurally the generic language server protocol (LSP) boundaries bridging flawless IDE limits correctly. these enhancements are crucial for bridging standard diagnostic limitations and strictly align with optimal developer experiences natively. 

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
My primary project of choice is to **Prototype a New Dart IntelliJ Plugin using LSP**. I have identified that the current custom protocol is a major bottleneck for feature parity with VS Code. Migrating to LSP is the future of Dart tooling, and I am driven to build the proof-of-concept that makes this transition possible.

### are you willing and able to work on other projects instead?
Yes, definitely. My skillset in Dart tooling is transferable. I would be happy to contribute to any project that improves the developer experience, such as the Analysis Server or FFIgen.

### please describe your preferred coding languages and experience.
I have specialized in **Dart** and **Kotlin/Java** to prepare for this exact project.
* **Dart**: 3+ years of experience with the language and its tooling ecosystem (Analysis Server).
* **Kotlin**: Proficient in IntelliJ Plugin development, having studied the JetBrains LSP API documentation extensively.

### what school do you attend and what is your specialty/major at the school?
I attend **Shri G.S. Institute of Technology and Science (SGSITS)**, Indore, India. I am majoring in **Computer Science and Engineering**, with a strong focus on **IDE Tooling and Language Servers**.

### how many years have you attended there?
I have completed **3 years** of my B.Tech degree.

### what city/country will you be spending this summer in?
I will be in **Indore, India** for the entire summer.

### how much time do you expect to give per day to this project?
I plan to dedicate **6-8 hours daily** (40+ hours/week). GSoC will be my primary occupation during the summer break.

### have you participated in any previous summer of code projects?
No, this is my **first official participation**. However, I have been building up to this moment for **3 consecutive years** by following the Dart team's work, studying the LSP spec, and contributing to open-source Dart projects.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I am **exclusively applying to Dart**. I have spent months preparing specifically for the IntelliJ LSP migration task and am fully committed to its success.

### why are you well suited to perform this project and why are you interested in it?
I am well-suited because I share the Dart team's vision for a unified tooling ecosystem based on LSP.
I have spent the last **3 years** analyzing the discrepancies between the VS Code (LSP) and IntelliJ (Legacy) experiences. I have deep knowledge of the **Dart Analysis Server's LSP implementation** and have already experimented with the **JetBrains Experimental LSP API**. This unique combination of domain knowledge allows me to architect a prototype that is not just a hack, but a solid foundation for the future.

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
* **#207**: Prototype New Dart IntelliJ plugin using LSP for Analysis Server Connection.

### goals and deliverables
* **1. Prototype LSP-based Plugin**:
  * Create a new (or branch of the existing) IntelliJ plugin that communicates with the Dart Analysis Server via **LSP** (Language Server Protocol) instead of the legacy custom JSON protocol.

* **2. Leverage JetBrains LSP API**:
  * Utilize the experimental **LSP API** provided by the IntelliJ Platform to reduce the amount of custom glue code required.

* **3. Feature Parity Assessment**:
  * Implement core features (Diagnostics/Errors, Code Completion, Navigation) and compare their quality/performance against the existing legacy implementation.

* **4. Architecture Modernization**:
  * Demonstrate how switching to LSP aligns the IntelliJ plugin with the VS Code extension (which already uses LSP), reducing the maintenance burden on the Dart team.

## technical details / understanding
The Dart Analyzer supports two protocols: the legacy **Analysis Server Protocol** and the industry-standard **LSP**.
Currently, the IntelliJ plugin uses the legacy protocol, forcing the Dart team to maintain two distinct code paths for IDE support (VS Code = LSP, IntelliJ = Legacy).
Migrating IntelliJ to LSP (via the new JetBrains LSP support) will unify the tooling ecosystem.
I will focus on:
* **Lifecycle Management**: Starting/Stopping the Analysis Server in LSP mode.
* **Synchronization**: Implementing `textDocument/didOpen`, `didChange`, `didClose`.
* **Features**: Mapping LSP `textDocument/publishDiagnostics` to IntelliJ Inspections.

| feature | legacy plugin | proposed lsp prototype | benefit |
| :--- | :--- | :--- | :--- |
| **protocol** | Custom JSON-RPC | Standard LSP | Shared logic with VS Code |
| **maintenance** | High (IntelliJ specific) | Low (Generic LSP client) | Faster updates |
| **platform support** | Custom implementation | JetBrains LSP API | Native IDE integration |

## test plan
### local development testing
* **Mock Server**: Test the plugin against a mock LSP server to verify client-side logic.
* **Dart SDK Integration**: Point the prototype to the real Dart Analysis Server (started with `--lsp`).

### integration testing
* **Side-by-Side Comparison**: Run the new prototype alongside the stable plugin to visually compare diagnostic latency and completion results.

## references / further reading
* **Tracking Issue #207**: [https://github.com/flutter/dart-intellij-third-party/issues/207](https://github.com/flutter/dart-intellij-third-party/issues/207)
* **Dart LSP Implementation**: [https://github.com/dart-lang/sdk/tree/main/pkg/analysis_server/lib/src/lsp](https://github.com/dart-lang/sdk/tree/main/pkg/analysis_server/lib/src/lsp)
* **JetBrains LSP Support**: [https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html](https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html)

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding**: Analyze the `analysis_server` LSP implementation and the IntelliJ Platform LSP API documentation. | Architecture Plan |
| May 25 - June 7 | **Plugin Setup**: Initialize a new Gradle-based IntelliJ Plugin project. Implement the process runner to launch `dart language-server`. | Server Launch |
| June 8 - June 21 | **Document Sync**: Implement `textDocument/didOpen` and `didChange` to ensure the server tracks file state. | Sync Working |
| June 22 - July 5 | **Diagnostics & Highlights**: Map `publishDiagnostics` to IntelliJ annotations. Implement semantic highlighting if time permits. | Basic Features |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | implement custom code actions resolving targeted analyzer quick fixes | replacement done |
| Aug 3 - Aug 17 | polish repository syntax and integrate structural PR | completion merged |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |
