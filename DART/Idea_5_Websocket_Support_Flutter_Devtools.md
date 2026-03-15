# project proposal: add websocket/GRPC support to flutter devtools

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
My #1 priority is **Adding WebSocket/GRPC Support to Flutter DevTools (Network Panel)**.
I have personally struggled with debugging WebSocket connections in Flutter apps—often resorting to CLI logs because the Network panel was blind to them. I am passionate about solving this specific pain point and have spent the last **3 years** studying the DevTools architecture to propose a viable solution.

### are you willing and able to work on other projects instead?
Yes, I am flexible and capable of contributing to other tooling projects, such as the Object Inspector or Performance tooling.

### please describe your preferred coding languages and experience.
I have substantial experience in **Dart** (Flutter Framework & VM Service Protocol) and **Python**.
* **Dart**: 3+ years of native development. I have built complex real-time applications where WebSocket debugging was critical (leading to my interest in this project).
* **Python**: Backend development experience handling asynchronous streams.

### what school do you attend and what is your specialty/major at the school?
I am a student at **Shri G.S. Institute of Technology and Science (SGSITS)**, Indore, India. My major is **Computer Science and Engineering**. I specialize in **Frontend Tooling and Developer Experience (DX)**.

### how many years have you attended there?
I have completed **3 years** of my undergraduate degree.

### what city/country will you be spending this summer in?
I will be based in **Indore, India** for the duration of GSoC.

### how much time do you expect to give per day to this project?
I am committed to **6-8 hours per day** (40-45 hours/week). I have cleared my academic schedule to ensure I can treat this project with the professional dedication it requires.

### have you participated in any previous summer of code projects?
No. This is my **first official GSoC participation**. However, I consider myself a long-term community member, having followed the Dart organization's progress for **3 years**. I have analyzed the issue tracker extensively and am ready to contribute from Day 1.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I am **exclusively applying to the Dart organization**. I believe my focused preparation on DevTools makes me the best candidate for this role, and I do not want to dilute my efforts across multiple organizations.

### why are you well suited to perform this project and why are you interested in it?
I am well-suited because I understand the full stack of the problem: from the application layer (`dart:io` WebSockets) to the VM Service Protocol, and finally to the DevTools frontend.
I have spent **3 years** working with Flutter, and for this proposal, I have prototyped a `ProfileableWebSocket` wrapper that captures the exact metrics we need. I am not just proposing an idea; I have verified the technical feasibility required to close issue #9507.

## my relevant experience (qualifications)
i have explored and worked in multiple domains including low-latency backend development, application routing, and algorithmic problem solving.

### flutter/dart
my core expertise involves maintaining complex declarative UI hierarchies and bridging system level abstractions.
* resumup - a dynamic portfolio builder frontend and backend logic handling high-volume deployment parameter bindings seamlessly. [resumup repository](https://github.com/TiDB-Hacks/ResumUp)

### python
i utilize python extensively for semantic parsing and server-level data hooks handling asynchronous calls.
* rag system via fastapi - deployed a production-grade backend processing complex asynchronous data pipeline streams securely. [wshaurya active github](https://github.com/winshaurya)

### c / c++ / java
i have solidified core data structures and memory boundaries utilizing dynamic programming natively.
* problem solving track - tackled over 250 advanced memory and graph problems across leetcode configuring precise abstract syntax efficiently. [w shaurya leetcode](https://leetcode.com/u/winshaurya/)

### typescript / javascript
worked natively with single page applications ensuring optimization and dynamic UI routing correctness.
* leadgs leaderboard - mapped pure visual tree structures calculating heavily scaled node paths precisely avoiding graphical lag. [leadgs repository](https://github.com/winshaurya/LeadGS)

## personal information details

### please describe any windows, unix or mac os x development experience relevant to your chosen project
i primarily operate a windows-centric machine leveraging windows subsystem for linux (WSL), executing strict ubuntu binaries natively. i have extensive experience executing docker across linux containers.

### please describe any previous dart project or dart related development experience, including details of any patches, code or ideas you may have previously submitted
my prior flutter engagements center entirely around application rendering logic. while this will be my first low-level infrastructural patch tracing the DART SDK boundary, my rigorous algorithmic mapping capabilities natively provide the backbone necessary to parse the DART virtual machine's standard memory protocols safely.

### what school do you attend and what is your specialty/major at the school?
i attend shri g.s. institute of technology and science (SGSITS), indore. i am pursuing my B.Tech uniquely specializing fully in computer science engineering.

### how many years have you attended there?
i have attended strictly for 3 years, approaching my final graduation sequence securely.

### what city/country will you be spending this summer in?
indore, madhya pradesh, india.

### how much time do you expect to give per day to this project?
i can constantly commit 6-8 continuous execution hours daily representing around 40-45 hours per week mapping precisely against optimal core development trajectories spanning the entire GSOC timeline.

### have you participated in any previous summer of code projects?
this perfectly represents my initial debut participating explicitly traversing external global massive monolithic repositories natively.

### have you applied for (or intend to apply for) any other google summer of code 2026 projects?
i exclusively plan on rooting proposals strictly analyzing DART system configurations bridging internal compilation routines correctly natively.

### if you have a url for your resume/cv, please list it here
* email: [0801cs231129@sgsits.ac.in](mailto:0801cs231129@sgsits.ac.in)
* github: [w shaurya github profile](https://github.com/winshaurya)
* resume: [w shaurya resume](https://github.com/winshaurya)

## project details

### background
The Dart & Flutter DevTools Network panel currently only supports HTTP requests, leaving developers blind to **WebSocket** and **gRPC** traffic. This is a significant limitation for modern applications that rely on persistent connections. As outlined in [issue #9507](https://github.com/flutter/devtools/issues/9507), the goal is to bring first-class support for these protocols to the Network panel.

### objectives
* **1. Extend VM Service Protocol**:
  * Update the VM Service to support reporting WebSocket and gRPC traffic.
* **2. Implement `ProfileableWebSocket`**:
  * Create a wrapper class in `dart:io` or `dart:developer` that intercepts `WebSocket` creation, as well as `add()` and `listen()` events, to record traffic metrics (timestamp, size, payload type).
* **3. Update DevTools UI**:
  * Modify the Network panel frontend to display persistent connection entries and a detail view for their message history (frames).

### tasks / implementation plan
**1. Core Instrumentation (`dart:io` / `dart:developer`)**
* Implement a `ProfileableWebSocket` wrapper that implements `dart:io`'s `WebSocket` interface.
* Instrument the `add` method to capture outgoing frames and the `listen` stream to capture incoming frames.
* Buffer strict traffic logs (time, size, type) efficiently to minimize overhead.

**2. VM Service & Protocol**
* Expose the buffered traffic data via new VM Service extensions (e.g., `ext.dart.io.getWebSocketInfo`).

**3. DevTools Network Panel**
* Add a filter/tab for "WebSockets".
* Implement a detailed view that lists frames sent/received for a selected connection, similar to the browser's Network tab.

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding**: Review `dart:io` WebSocket implementation and DevTools Network panel source code. Discuss gRPC scope with mentors. | Architecture Finalized |
| May 25 - June 7 | **Instrumentation (Part 1)**: Implement `ProfileableWebSocket` wrapper in the SDK. Verify interception of `add`/`listen` in a sample CLI app. | Traffic Intercepted |
| June 8 - June 21 | **VM Service Extension**: Connect the instrumentation to the VM Service, allowing external tools to query active sockets and their logs. | Protocol Ready |
| June 22 - July 5 | **DevTools UI (Part 1)**: Update the Network panel to list WebSocket connections alongside HTTP requests. | Connection List |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | **DevTools UI (Part 2)**: Implement the "Frames" detail view to show individual messages (payload, timing). | Frame Inspection |
| Aug 3 - Aug 17 | **gRPC Support (Stretch Goal)**: Apply the same instrumentation pattern to gRPC transport (HTTP/2) if schedule permits. | gRPC Support |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |

## references / further reading
* **Design & Sizing**: [https://github.com/flutter/devtools/issues/9507](https://github.com/flutter/devtools/issues/9507)
* **Dart VM Service Protocol**: [https://github.com/dart-lang/sdk/blob/main/runtime/vm/service/service.md](https://github.com/dart-lang/sdk/blob/main/runtime/vm/service/service.md)
* **DevTools Network Panel**: [https://docs.flutter.dev/tools/devtools/network](https://docs.flutter.dev/tools/devtools/network)

## deliverables
1. `ProfileableWebSocket` class in Dart SDK.
2. Updated VM Service Protocol to support stream-based traffic.
3. DevTools Network panel support for inspecting WebSocket frames.
2. DevTools integration tracing live memory limits spanning TCP loops.
3. visual data charts processing websocket graph bounds cleanly.

## why are you well suited to perform this project and why are you interested in it?
resolving obscure internal limits smoothly building safe execution loops perfectly fits my analytical problem solving patterns. my experience mapping low latency constraints and handling heavily restricted computational algorithms scales efficiently toward the core DART language boundaries safely natively.
