# project proposal: inspect native memory in DART devtools

**organization:** DART
**mentors:** @dacoharkes, @bkonyi

## project summary
the DART VM service protocol currently exposes native memory pointers as opaque values. when debugging a Pointer<X> inside the flutter devtools, encountering unmapped dynamic memory invokes an operating system hardware trap. this abruptly crashes the target execution and breaks the IDE debugger. safely inspecting FFI heaps requires integration with POSIX signal handlers directly inside the virtual machine boundary. my top priority is the implementation of native memory inspection targeting Pointer<X> nodes inside the flutter devtools. resolving this constraint requires extracting raw memory addresses safely across the DART VM boundaries without triggering fatal hardware exceptions. these enhancements are crucial for bridging standard diagnostic limitations and strictly align with optimal developer experiences natively. 

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
My absolute top priority is **Inspect Native Memory in Dart DevTools**. I am deeply invested in solving the hardware trap issues when debugging `Pointer<X>` types. This project aligns perfectly with my long-term goal of improving low-level debugging for the Dart ecosystem. I have already begun analyzing the VM Service Protocol code structure to prepare for this implementation.

### are you willing and able to work on other projects instead?
Yes, I am open to working on other projects within the Dart organization. I have a strong grasp of the entire tooling suite, including FFIgen and the Analysis Server, so I can adapt quickly if needed.

### please describe your preferred coding languages and experience.
I have been coding natively in **Dart and Flutter for over 3 years**, building robust architectures for complex applications. My experience extends to **C++** for low-level memory management and **Python** for backend orchestration.
* **Dart/Flutter**: Built offline-first survey tools and dynamic portfolio builders (ResumUp).
* **C++**: Solved 250+ advanced memory/graph problems on LeetCode; strong grasp of pointers and memory layouts.
* **Python**: Developed multi-agent research systems using CrewAI.

### what school do you attend and what is your specialty/major at the school?
I am currently attending **Shri G.S. Institute of Technology and Science (SGSITS)** in Indore, M.P., India. I am pursuing my **B.Tech in Computer Science and Engineering**. My specialization focuses on **Systems Programming and Compiler Design**, which directly applies to this project.

### how many years have you attended there?
I have completed **3 years** of my 4-year degree program. I am entering my final year with a strong GPA and a focus on open-source contributions.

### what city/country will you be spending this summer in?
I will be based in **Indore, Madhya Pradesh, India** for the entire duration of the program.

### how much time do you expect to give per day to this project?
I can dedicate **6-8 hours daily**, amounting to **40-45 hours per week**. My semester examinations conclude perfectly before the GSoC coding period begins, leaving my summer (May-July) entirely free for this project. I treat GSoC as a full-time professional commitment.

### have you participated in any previous summer of code projects?
This is my **first official participation** in Google Summer of Code. However, I have been actively following and contributing to the **Dart organization for 3 consecutive years**, studying the codebase and preparing specifically for this opportunity. I am not new to the community, just to the formal program.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I have decided to focus **exclusively on the Dart organization**. I believe in depth over breadth, and my preparation has been entirely centered around Dart's tooling ecosystem.

### why are you well suited to perform this project and why are you interested in it?
I am uniquely suited for this project because I possess the rare combination of **high-level Dart experience** and **low-level C++ systems knowledge**. Most developers know one or the other, but this project requires bridging that gap (VM Service Protocol <-> Dart DevTools).
I have been preparing for this specific role for **3 years**, analyzing the Dart SDK internals. My ability to navigate complex C++ segfault handlers while maintaining a clean Dart API makes me the ideal candidate to finally solve the "unmapped memory crash" issue for the community.

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
* #48882: safe pointer inspection
### issues to tackle
* **#48882**: Safe pointer inspection implementation.
* **#1034**: Object references structural mapping.

### goals and deliverables
Based on the project requirements, I will deliver the following key components:

* **1. VM Service Protocol Extension**:
  * Implement a new `Instance` type for `Pointer<X>` in the Dart VM Service Protocol.
  * Ensure the protocol can transmit raw memory addresses and structural data for inspection.
  
* **2. Update Dart DevTools and DAP**:
  * Extend the **Debug Adapter Protocol (DAP)** to handle the new `Pointer` instance type.
  * Integrate this new type into the Dart DevTools frontend to allow seamless visualization.

* **3. Extend Object Inspector**:
  * Enhance the existing Object Inspector in DevTools to utilize the new `Pointer` type.
  * Allow developers to expand `Pointer<X>` nodes to view their referenced memory content.

* **4. Safe Signal Interception (SIGSEGV)**:
  * Implement a mechanism to intercept segmentation faults (signals) within the VM.
  * Ensure that inspecting unmapped memory does not crash the application but instead reports a safe error or null value to DevTools.

## technical details / understanding
The default SDK currently relies on untracked pointer bindings which require manual memory resolution offline. Inspecting arbitrary native memory is dangerous because accessing unmapped pages causes a hardware trap (SIGSEGV). To solve this, I will implement a signal handler that catches these faults during inspection and converts them into a Dart exception or protocol error response, ensuring the debug session remains active.

| feature | current dart VM | proposed inspection | implementation strategy |
| :--- | :--- | :--- | :--- |
| memory deref | hardware trap / fatal crash | caught signal / error response | POSIX signal handler integration |
| DAP routing | opaque address | structured Pointer instance | VM Service Protocol extension |
| IDE visualization | generated address string | expandable memory graph | DevTools Object Inspector update |

## test plan
### local development testing
* **Unit Tests**: comprehensive tests for the new `Instance` type in the VM.
* **Fuzz Testing**: Attempting to inspect random/invalid pointers to verify the `SIGSEGV` interception logic.

### integration testing
* **DevTools Integration**: Verifying that the UI correctly displays the passed `Pointer` structures.
* **DAP Compliance**: ensuring the new implementation doesn't break existing DAP clients.

## references / further reading
* **DAP Protocol**: [https://microsoft.github.io/debug-adapter-protocol/](https://microsoft.github.io/debug-adapter-protocol/)
* **VM Service Protocol**: [https://github.com/dart-lang/sdk/blob/main/runtime/vm/service/service.md](https://github.com/dart-lang/sdk/blob/main/runtime/vm/service/service.md)
* **Tracking Issue #48882**: [https://github.com/dart-lang/sdk/issues/48882](https://github.com/dart-lang/sdk/issues/48882)
* **DevTools Issue #1034**: [https://github.com/dart-lang/webdev/issues/1034](https://github.com/dart-lang/webdev/issues/1034)

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding Period**: Review existing VM Service Protocol code (runtime/vm/service), discuss signal handling strategy with mentors. | Design finalized |
| May 25 - June 7 | **Setup & Initial VM Work**: Setup SDK build environment. Implement initial `Pointer` Instance type in `instance.cc` and expose via VM Service. | VM Support Added |
| June 8 - June 21 | **DAP Integration**: implementing the DAP translation layer to convert VM `Pointer` instances into DAP `Variables`. | DAP Protocol Ready |
| June 22 - July 5 | **Signal Handling (Core Task)**: Implement the SIGSEGV signal interceptor in the VM to catch invalid memory access during inspection. | Safe Dereferencing |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | execute initial segfault signal traps inside isolated C threads | virtual exceptions active |
| Aug 3 - Aug 17 | resolve code reviews from maintainers and integrate finalized PR | merged to core |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |
