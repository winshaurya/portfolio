# project proposal: migrate intellij plugins off weberknecht library

**organization:** DART
**mentors:** @philquitslund, @helinshiah

## project summary
the current intellij DART plugin heavily depends on the deprecated weberknecht java websocket library. idle background connections toward the dart tooling daemon (DTD) are aggressively closed by strict antivirus constraints mimicking standard tcp drop policies. these unexpected socket drops cause silent timeouts across the development client. my top priority revolves around overhauling the network sockets for DART IDE connections. fixing these network bottlenecks natively optimizes background developer operations gracefully. these enhancements are crucial for bridging standard diagnostic limitations and strictly align with optimal developer experiences natively. 

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
My top priority is the **Migration of IntelliJ Plugins off Weberknecht Library**. As someone who has faced the frustration of erratic socket behavior on Windows environments firsthand, I am determined to fix this. My approach is not just to patch the code but to completely modernize the networking stack, ensuring robustness for all developers.

### are you willing and able to work on other projects instead?
I am absolutely open to other projects within the Dart & Flutter organization. I have invested significantly in understanding the ecosystem's tooling layer.

### please describe your preferred coding languages and experience.
I have utilized **Java** and **Kotlin** (for IntelliJ Plugin development) alongside my core expertise in **Dart**.
* **Dart**: 3+ years of experience contributing to open-source packages and building applications.
* **Java/Kotlin**: Strong familiarity with the IntelliJ Platform SDK, which I have been studying to solve this specific migration problem.

### what school do you attend and what is your specialty/major at the school?
I am enrolled at **Shri G.S. Institute of Technology and Science (SGSITS)**, Indore, India. I am pursuing a B.Tech in **Computer Science and Engineering**, specializing in **Software Engineering and Networking**.

### how many years have you attended there?
I have attended for **3 years** and am currently in my pre-final year.

### what city/country will you be spending this summer in?
I will be spending my summer in **Indore, India**.

### how much time do you expect to give per day to this project?
I can devote **6-8 hours daily** (approx. 40 hours/week). I have arranged my schedule to prioritize GSoC above all other commitments during the summer.

### have you participated in any previous summer of code projects?
No. This is my **first official participation**. However, I have been preparing for a role in the Dart organization for **3 consecutive years**. I have followed the mailing lists, analyzed PRs, and built a deep understanding of the codebase to ensure my first proposal is successful.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I am **exclusively applying to Dart**. My goal is to become a long-term maintainer, and I believe focusing on a single organization is the best way to deliver high-quality work.

### why are you well suited to perform this project and why are you interested in it?
I am well-suited because I have specific experience with **Java networking APIs** and the **IntelliJ Platform SDK**.
I have spent the last **3 years** digging into the Dart plugin's source code. I understand exactly where the legacy `weberknecht` library is being used and have already prototyped a replacement using `java.net.http.WebSocket`. My proactive preparation means I can hit the ground running on Day 1.

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
* **#208**: Migrate IntelliJ Plugins off weberknecht web socket library.

### goals and deliverables
* **1. Remove Weberknecht Dependency**:
  * completely decouple the `dart-intellij-plugin` from the unmaintained `weberknecht` library.
  
* **2. Implement Modern WebSocket Client**:
  * Replace the legacy implementation with a robust, modern alternative such as the standard `java.net.http.WebSocket` (available in JDK 11+, which JBR supports) or the IntelliJ Platform's built-in WebSocket capabilities.
  
* **3. Resolve Anti-Virus Conflicts**:
  * The primary driver for this migration is that `weberknecht` triggers false positives in Windows Anti-Virus software, causing connection drops. The new implementation must be verified to eliminate this issue.

* **4. Cross-Platform Validation**:
  * Ensure consistent behavior across Windows, macOS, and Linux, particularly focusing on persistent connections required for the Dart Analysis Server.

## technical details / understanding
The current implementation relies on `weberknecht`, which is severely outdated. Its connection behavior is often flagged by heuristic-based Anti-Virus software on Windows as suspicious, leading to silent socket termination. This breaks the link between the IDE and the Analysis Server/DevTools.
By migrating to the standard Java HTTP Client or the IntelliJ Platform's network stack, we gain:
* **Compliance**: Trusted, signed libraries are less likely to be flagged.
* **Stability**: Modern libraries handle keep-alive pings and reconnection logic more robustly.
* **Maintainability**: Removing a third-party legacy dependency reduces technical debt.

| driver | weberknecht (legacy) | modern java/platform client |
| :--- | :--- | :--- |
| **status** | unmaintained / deprecated | active / standard library |
| **windows av** | flagged as suspicious | trusted component |
| **protocol** | older websocket spec | rfc 6455 compliant |

## test plan
### local development testing
* **Unit Tests**: Create a mock WebSocket server to verify the new client's handshake, message sending, and receiving logic.
* **Reconnection Tests**: Simulate network interruptions to ensure the plugin attempts validation and reconnection.

### integration testing
* **Windows Environment**: validatign the fix on a Windows machine with active Windows Defender/common AV software to confirm no disconnections occur.
* **IDE workflows**: verifying that debugging, analysis, and hot reload continue to function without latency spikes.

## references / further reading
* **Tracking Issue #208**: [https://github.com/flutter/dart-intellij-third-party/issues/208](https://github.com/flutter/dart-intellij-third-party/issues/208)
* **Java 11 WebSocket Doc**: [https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/WebSocket.html](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/WebSocket.html)

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding**: Audit the existing `weberknecht` usage in the plugin source. Evaluate `java.net.http.WebSocket` vs IntelliJ Platform APIs. | Selection Made |
| May 25 - June 7 | **Architecture Design**: Design the adapter layer for the new WebSocket client. Create a POC connecting to a local echo server. | Design Approved |
| June 8 - June 21 | **Implementation**: Replace `weberknecht` calls with the chosen library. Implement handshake and message loop. | Migration Core |
| June 22 - July 5 | **Error Handling & Keep-Alive**: Implement robust error handling (unexpected closure) and keep-alive ping/pong mechanisms. | Robustness Added |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | test payload persistence against simulated local windows firewall drops | dropped tests passing |
| Aug 3 - Aug 17 | perform documentation checks and merge the active network replacement PR | merged to core |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |
