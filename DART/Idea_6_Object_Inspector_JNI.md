# project proposal: devtools object inspector JNI leak tracking

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
My top priority is **DevTools Object Inspector: JNI Leak Tracking**. This project is a natural extension of my deep interest in preventing memory leaks in cross-language boundaries. I have specifically chosen this over higher-level feature work because I want to solve the silent OOM crashes that plague complex Flutter applications.

### are you willing and able to work on other projects instead?
Yes, absolutely. I am versatile and happy to work on other internal tooling projects, such as FFIgen or the Native Memory Inspector.

### please describe your preferred coding languages and experience.
I have a strong command of **C++** and **Java** (specifically JNI/JVMTI), which are prerequisites for this project, alongside my **Dart** expertise.
* **C++**: Extensive experience with pointers and memory management (LeetCode 250+).
* **Java/JNI**: I have been experimenting with JNI hooks for **3 years** to understand how Dart interacts with the Android runtime.

### what school do you attend and what is your specialty/major at the school?
I am a student at **Shri G.S. Institute of Technology and Science (SGSITS)**, Indore, India. I am majoring in **Computer Science and Engineering**, specializing in **Systems Programming**.

### how many years have you attended there?
I have completed **3 years** of my degree program.

### what city/country will you be spending this summer in?
I will be residing in **Indore, India** for the entire summer.

### how much time do you expect to give per day to this project?
I am committed to **6-8 hours daily** (40-45 hours/week). My academic schedule is free during the summer, allowing me to treat GSoC as a full-time job.

### have you participated in any previous summer of code projects?
No, this is my **first official participation**. However, I have been preparing for this specific role for **3 years**, studying the Dart runtime's JNI bridge implementation and identifying gaps in the developer tooling.

### have you applied for (or intend to apply for) any other google summer of code 2025 projects?
No. I am **exclusively applying to the Dart organization**. I am laser-focused on contributing to Dart's native interop story.

### why are you well suited to perform this project and why are you interested in it?
I am well-suited because I possess the niche skill set required: **JNI internals knowledge** combined with **Dart DevTools experience**.
Most developers avoid JNI because it is complex and error-prone. I thrive in this complexity. I have spent the last **3 years** analyzing how cross-language references cause leaks. I have already prototyped a basic interceptor for `NewGlobalRef`, proving that I can deliver this project successfully.

## 1. introduction
### problem statement
Dart's garbage collector handles Dart memory, but when interacting with Java via JNI (Java Native Interface), Dart code creates JNI Global and Local references. If these references are not explicitly released, they cause memory leaks on the Java side that the Dart GC cannot see or collect. This leads to silent memory exhaustion (OOM) in Android/Flutter apps.

### expected outcomes
* **JNI Reference Tracking**: precise tracking of JNI Global/Local reference creation and deletion.
* **DevTools Integration**: A new view in Dart DevTools to visualize active JNI references.
* **Leak Detection**: Automated identification of references that have been active for an unusually long time (integration with LeakTracker).

## 2. project specification
I will implement a JNI bridge interceptor that wraps standard JNI functions (`NewGlobalRef`, `DeleteGlobalRef`). This interceptor will log the allocation stack trace and associate it with the Dart object holding the reference. This data will be sent to the Dart DevTools to allow developers to see exactly which Dart code is holding onto Java memory.

## 3. tech stack
* **Languages**: Dart, C++ (for JNI hooks), Java.
* **Tools**: Dart DevTools, Android Profiler.

## 4. progress on prototype
I have experimented with basic JNI wrapping and can intercept `NewGlobalRef` calls in a sample Android project.

## timeline

> **Note:** I will be in my summer break during this period, so I will be working above expected hours to reach these goals positively.

| date | description | milestone |
| :--- | :--- | :--- |
| May 1 - May 24 | **Community Bonding**: Research JNI tooling APIs (JVMTI) and existing Dart FFI/JNI implementation. | Architecture Plan |
| May 25 - June 7 | **JNI Interception**: Implement C++ hooks for JNI reference creation/deletion. | Hooks Active |
| June 8 - June 21 | **Dart Binding**: Expose the JNI usage statistics to Dart code via a native extension. | Stats Available |
| June 22 - July 5 | **DevTools Extension**: Build a prototype UI in DevTools to list active JNI references. | UI Prototype |
| July 6 - July 10 | **midterm evaluation submission** | **midterm passed** |
| July 11 - Aug 2 | **Leak Detection Logic**: Implement heuristics to flag potential leaks (e.g., growing reference counts). | Smart Alerts |
| Aug 3 - Aug 17 | **Documentation & Testing**: Create sample apps with intentional leaks and verify detection. | Validation |
| Aug 17 - Aug 24 | **final work submission** | **final evaluation** |
| Aug 24 - Nov 2 | extended support and maintenance | post-gsoc contributions |

## 7. deployment strategies
The tool will be shipped as a developer-only dependency (via `pubspec.yaml`) that injects the monitoring hooks only in debug mode, ensuring zero overhead in production.

## 8. motivation
Debugging JNI memory leaks usually requires complex native profiling tools (like Android Studio Profiler) which are disconnected from the Dart code. Bridging this gap will save Flutter developers hours of debugging time.

## 9. acknowledgments
I thank the Dart organization for the opportunity to improve the ecosystem's tooling.
