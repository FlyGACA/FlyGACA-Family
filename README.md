<div align="center">
  <img src=".github/readme/hero.png" alt="Fly GACA ecosystem: a network of learning, study, support and planning icons above a coastal runway at sunset" width="560">
</div>

![The Fly GACA Family](.github/readme/banner.png)


<a id="the-fly-gaca-family"></a>

# The Fly GACA Family

**Find the right product, codebase and source of truth.**

[FlyGACA](https://flygaca.com) · [Captain Adel](https://captadel.com) · [GitHub](https://github.com/FlyGACA)

The public directory for Fly GACA's aviation learning ecosystem. Start with the product you need, then use its own repository guide for setup, architecture and release status.

> [!IMPORTANT]
> Fly GACA is an independent educational platform, not affiliated with, endorsed by, or operated
> by GACA or the Government of Saudi Arabia. GACA (gaca.gov.sa) is always the authoritative
> source; both apps cite it and defer to it.
> Educational use only. Verify current official publications before relying on any aviation information.
![FlyGACA-Family project overview: capabilities, source locations and verification](.github/readme/overview.svg)

<a id="choose-your-destination"></a>

<details>
<summary>On this page</summary>

- [Choose your destination](#choose-your-destination)
- [Ecosystem at a glance](#ecosystem-at-a-glance)
- [How the pieces connect](#how-the-pieces-connect)
- [Source-of-truth rules](#source-of-truth-rules)
- [Brand marks](#brand-marks)
- [Hugging Face](#hugging-face)
- [Direction for 2027](#direction-for-2027)
- [Processing and rights](#processing-and-rights)
- [بالعربية](#بالعربية)
- [Keep this guide healthy](#keep-this-guide-healthy)

</details>

## Find the owning repository

See the [public repository directory](REPOSITORIES.md) for each public repository’s purpose and lifecycle.

Use **Choose your destination** to find the product or team workspace. If an update spans products, check **Source-of-truth rules** before editing shared facts or assets.

## Where a change belongs

```mermaid
flowchart LR
    Content["Regulatory content"] --> Web["FlyGACA web"]
    Content --> Apps["iOS apps"]
    Service["Chat behavior"] --> Adel["Captain Adel"]
    Policy["Company facts and decisions"] --> Office["Office"]
    Office --> Contract["Shared family contract"]
    Contract --> Web
    Contract --> Adel
```

## Choose your destination

| Audience | Destination | Purpose |
| --- | --- | --- |
| Student pilots and instructors | [FlyGACA](https://flygaca.com) | Regulatory reference, study and flight tools |
| Learners with a question | [Captain Adel](https://captadel.com) | Bilingual explanations with source evidence |
| Native-app developers | `iOS` (private) | SwiftUI study apps and the separate Captain Adel app |
| Product developers | `FlyGACA` (private) | Web app, API and content exports |
| AI-service developers | `Captain-Adel` (private) | Retrieval, grounding, tools and evaluations |
| Authorized operators | `Office` (private) | Internal strategy, governance and operating documents |

Some repositories are private. A link in this directory does not grant access.

<a id="ecosystem-at-a-glance"></a>

## Ecosystem at a glance

| Surface | Domain | Repository | Owner | What it covers |
| --- | --- | --- | --- | --- |
| FlyGACA web | [flygaca.com](https://flygaca.com) | `FlyGACA` (private) | @FlyGACA | Regulatory reference, study and flight tools |
| Captain Adel | [captadel.com](https://captadel.com) | `Captain-Adel` (private) | @FlyGACA | Bilingual explanations with source evidence |
| Native apps | — | `iOS` (private) | @FlyGACA | SwiftUI study apps and the separate Captain Adel app |
| Office | — | `Office` (private) | @FlyGACA | Internal strategy, governance and operating documents |

<a id="how-the-pieces-connect"></a>

## How the pieces connect

```mermaid
flowchart TD
    Official["Official publications"] --> Web["FlyGACA content and web"]
    Web --> Native["Native study apps"]
    Web <-. "Shared chat contract" .-> Adel["Captain Adel service"]
    Office["Office: entity facts and decisions"] --> Contract["Versioned family contract"]
    Contract --> Web
    Contract --> Adel
```

<a id="source-of-truth-rules"></a>

## Source-of-truth rules

| Item | Owner | Consumer responsibility |
| --- | --- | --- |
| Web corpus and study exports | FlyGACA | Native apps validate content and update behaviour |
| Chat contract | FlyGACA | Both services keep required fields compatible |
| Entity facts and repository roster | Office | Consumers preserve the stamped contract |
| App project and release state | iOS | Verify schemes, signing, device QA and store status |

The family contract is mirrored in Office, FlyGACA and Captain-Adel. Change it at the owning source, re-stamp it and coordinate the consumer updates. This directory carries no fourth contract copy.

<a id="brand-marks"></a>

## Brand marks

Every app shares one falcon mark. The upper wing stays blue and only the lower wing's gradient changes per app. The source, the full-size variants and the generator live in `Office` (private) (`11-brand/logos/` and `tools/brand/`); the copies here are for reference.

| Mark | App | Lower wing |
| --- | --- | --- |
| <img src="brand/mark-flygaca.png" alt="FlyGACA" width="56"> | FlyGACA | Original green |
| <img src="brand/mark-elpt.png" alt="ELPT" width="56"> | ELPT | Desert gold |
| <img src="brand/mark-aip.png" alt="AIP" width="56"> | AIP | Terracotta |
| <img src="brand/mark-ppl.png" alt="PPL" width="56"> | PPL | Soft indigo |
| <img src="brand/mark-cpl.png" alt="CPL" width="56"> | CPL | Dusty rose |
| <img src="brand/mark-ir.png" alt="IR" width="56"> | IR | Aqua teal |
| <img src="brand/mark-atpl.png" alt="ATPL" width="56"> | ATPL | Platinum |
| <img src="brand/mark-captain-adel.png" alt="Captain Adel" width="56"> | Captain Adel | Fresh lime |

The marks connect to their public surfaces and repositories; Office owns the shared contract:

```mermaid
flowchart LR
    Brand["Falcon mark"] --> WebMark["FlyGACA: original green"]
    Brand --> AdelMark["Captain Adel: fresh lime"]
    Brand --> StudyMarks["ELPT, AIP, PPL, CPL, IR, ATPL"]
    WebMark --> WebSite["flygaca.com"]
    AdelMark --> AdelSite["captadel.com"]
    StudyMarks --> IOSRepo["iflygaca/iOS"]
    WebSite --> WebRepo["iflygaca/FlyGACA"]
    AdelSite --> AdelRepo["iflygaca/Captain-Adel"]
    WebRepo --> Contract["Family contract"]
    AdelRepo --> Contract
    Contract --> OfficeRepo["iflygaca/Office"]
```

<a id="hugging-face"></a>

## Hugging Face

[The flygaca namespace](https://huggingface.co/flygaca) hosts related retrieval and evaluation assets. Their source and publishing instructions live in `Captain-Adel/huggingface` (private). Check the Hub card and latest workflow before describing an asset as live or a model as trained.

<a id="direction-for-2027"></a>

## Direction for 2027

Make the journey between reference, practice and explanation easier while keeping ownership explicit. App convergence and unified purchases are delivery milestones, not guarantees made by this directory. Read the current roadmaps and Office decision log.

<a id="processing-and-rights"></a>

## Processing and rights

Deployments, databases and inference providers can use different regions. Consult each product's configuration and hosting notes; this ecosystem should not be described as Saudi-only. Each repository has its own license. GACAR text retains GACA's rights.

<a id="بالعربية"></a>

## بالعربية

فلاي قاكا منظومة تعليمية مستقلة لطلاب الطيران والمدربين، وهي غير تابعة لهيئة الطيران المدني (GACA) وغير مرتبطة بها ولا معتمدة منها، والهيئة هي المصدر الرسمي. يقدم الموقع المراجع والدراسة والأدوات، ويقدم الكابتن عادل الشرح المستند إلى المصادر، ويحتوي مستودع iOS على التطبيقات الأصلية. وثائق التشغيل في Office مخصصة للمصرح لهم. تحقق من حالة الإصدار في مستودع المنتج، ومن النص التنظيمي في المصدر الرسمي.

## Keep this guide healthy

Run the dependency-free documentation check from the repository root:

```bash
node .github/scripts/check-readmes.mjs
```

It checks tracked README links to repository paths and sections on the same page. Review external URLs, screenshots and Mermaid diagrams separately. Update feature claims only when the source and release evidence support them.


---

<div align="center">

<sub dir="rtl">🇸🇦 صنع في المملكة العربية السعودية</sub><br />
<sub>Crafted with excellence in Saudi Arabia</sub>

</div>

[GACAR and Saudi AIP cross-reference](REGULATORY-CROSSWALK.md) — repository topics, official sections, editions and review gaps.
