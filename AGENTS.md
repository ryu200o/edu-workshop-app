<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@tanstack/devtools#devtools-app-setup"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-app-setup"
    for: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
  - id: "@tanstack/devtools#devtools-marketplace"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-marketplace"
    for: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
  - id: "@tanstack/devtools#devtools-plugin-panel"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-plugin-panel"
    for: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
  - id: "@tanstack/devtools#devtools-production"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-production"
    for: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
  - id: "@tanstack/devtools-event-client#devtools-bidirectional"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-bidirectional"
    for: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
  - id: "@tanstack/devtools-event-client#devtools-event-client"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-event-client"
    for: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
  - id: "@tanstack/devtools-event-client#devtools-instrumentation"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-instrumentation"
    for: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
  - id: "@tanstack/devtools-vite#devtools-vite-plugin"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-vite#devtools-vite-plugin"
    for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
  - id: "@tanstack/router-core#router-core"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core"
    for: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
  - id: "@tanstack/router-core#router-core/auth-and-guards"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/auth-and-guards"
    for: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
  - id: "@tanstack/router-core#router-core/code-splitting"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/code-splitting"
    for: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
  - id: "@tanstack/router-core#router-core/data-loading"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading"
    for: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
  - id: "@tanstack/router-core#router-core/navigation"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/navigation"
    for: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
  - id: "@tanstack/router-core#router-core/not-found-and-errors"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/not-found-and-errors"
    for: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
  - id: "@tanstack/router-core#router-core/path-params"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/path-params"
    for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
  - id: "@tanstack/router-core#router-core/search-params"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/search-params"
    for: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
  - id: "@tanstack/router-core#router-core/ssr"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/ssr"
    for: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
  - id: "@tanstack/router-core#router-core/type-safety"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/type-safety"
    for: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
  - id: "@tanstack/router-plugin#router-plugin"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-plugin#router-plugin"
    for: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
  - id: "@tanstack/virtual-file-routes#virtual-file-routes"
    run: "pnpm dlx @tanstack/intent@latest load @tanstack/virtual-file-routes#virtual-file-routes"
    for: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
<!-- intent-skills:end -->

<!-- ========================================================================== -->
<!-- WORKFLOW, GOVERNANCE & IMPLEMENTATION CONVENTIONS (FRONTEND TEAM)           -->
<!-- ========================================================================== -->

## Task Lifecycle & Planning Protocol (Plan-Before-Code)

Mọi thay đổi mã nguồn trong dự án bắt buộc phải tuân thủ chu trình kiểm soát 4 bước sau:

[SA + Lead Engineer]
   │  (Thảo luận & ban hành Task Directive / ADR)
   ▼
[Coding Agent]
   │  (Phân tích OpenAPI, cấu trúc, lập Plan + OQ vào .llm/)
   ▼
[SA + Lead Engineer Review]
   │  (Duyệt plan & giải đáp OQ -> Phát lệnh "PLAN PASSED")
   ▼
[Coding Agent Execution]
   │  (Thi công theo Slices: Types -> Hooks -> UI -> Route)
   ▼
[Quality Gate Check & Commit] (Biome check + tsc pass 100%)

### 1. Task Ingestion & ADR Reference

* Kỹ Sư Trưởng và Software Architect thảo luận nghiệp vụ, thống nhất giải pháp và ban hành yêu cầu kỹ thuật.
* Đối với các quyết định kỹ thuật quan trọng (State management, Caching strategy, Auth flow, Interceptor rules), giải pháp sẽ được lưu vết dưới dạng **ADR** tại `docs/architecture/adr/`.

### 2. Implementation Planning (`.llm/` directory)

* Khi tiếp nhận task, Agent **KHÔNG ĐƯỢC PHÉP** chỉnh sửa bất kỳ file nào trong `src/` hoặc configs ngay.
* Agent phải tạo file kế hoạch thi công tại `.llm/plans/<task-id>-plan.md` bao gồm:
* **Mục tiêu & Phạm vi (Scope):** Các màn hình/component/route bị ảnh hưởng.
* **Contract Delta:** Endpoint OpenAPI sử dụng, kiểu dữ liệu cần trích xuất.
* **Lát cắt thi công (Slices Breakdown):** Kế hoạch chia commit theo 4 lát cắt chuẩn.
* **Open Questions (OQ):** Danh sách các điểm chưa rõ về giao diện, luồng UX, ranh giới dữ liệu hoặc hành vi biên (edge cases).



### 3. Review Gate: `PLAN PASSED`

* Lead Engineer và SA sẽ trực tiếp thẩm định plan và giải đáp các OQ.
* Agent **CHỈ ĐƯỢC PHÉP** bắt tay vào viết code khi và chỉ khi nhận được lệnh:
> **`PLAN PASSED`**



### 4. Slice-based Execution & Commit Policy

* Phân tách việc thực thi thành 4 lát cắt (slices) độc lập:
1. **Contract & Types:** Codegen OpenAPI (`pnpm run codegen:types`) hoặc Zod Schemas.
2. **Data Layer:** Thiết lập Axios client method và React Query hooks (`useQuery` / `useMutation`) trong feature module.
3. **UI Layer:** Xây dựng UI components, xử lý Loading skeleton, Empty state và RFC 7807 Error binding.
4. **Route Integration & Guards:** Gắn vào `src/routes/`, thiết lập `beforeLoad` auth guards và search param validations.


* **Mỗi lát cắt = 1 commit**. Mỗi commit phải đảm bảo build/typecheck/lint xanh trước khi sang lát cắt tiếp theo.

---

## Architectural Boundaries & Module Isolation

### 1. Feature-Driven Layering (`src/features/<module>/`)

Mỗi domain module (`auth`, `workshops`, `rooms`, `attendance`) là một ranh giới độc lập (High Cohesion):

* `api/`: API call functions và React Query hooks chuyên biệt cho module.
* `components/`: UI components phục vụ riêng cho nghiệp vụ module.
* `hooks/`: Local hooks phục vụ state/logic nội bộ module.
* `types/`: Domain-specific types mở rộng từ OpenAPI schema.
* **Cross-module Boundary:** Module A **tuyệt đối không** import trực tiếp thành phần nội bộ của Module B. Các thành phần dùng chung phải được đưa vào `src/shared/`.

### 2. Route Layer (`src/routes/`)

* Quản lý cấu trúc URL, breadcrumbs, search param parsing (`zod`), và data prefetching.
* Tuyệt đối không viết trực tiếp logic mutation phức tạp hay raw Axios calls tại route components.
* File `src/routeTree.gen.ts` do TanStack Router tự động sinh ra, được đánh dấu **Read-Only** — không chỉnh sửa thủ công.

### 3. Shared Kernel (`src/shared/`)

* `api/client.ts`: Axios instance trung tâm, tích hợp 401 Replay Queue Interceptor và parser RFC 7807.
* `components/ui/`: UI primitives dùng chung cho toàn bộ hệ thống.
* `lib/`: Utility functions thuần túy (date formatting, token storage, cn helper).

---

## API Contract, Error Handling & Quality Gates

* **Source of Truth:** `../edu-workshop-server/docs/api/openapi.json`.
* **Command:** `pnpm run codegen:types`.
* **RFC 7807 Standard:** Backend trả về `ProblemDetail` payload. Client bóc tách `detail`/`title` cho global notification và `errors[]` cho form/field error context.
* **Auth & Refresh:** Silent Refresh xử lý tập trung tại Axios Interceptor (hàng đợi 401). Khi refresh thất bại, dọn sạch session và redirect về `/_auth/login`.
* **Quality Gates (Pre-commit & CI):**
  * Formatter & Linter: `pnpm biome check --write` (0 errors, 0 warnings).
  * Type Safety: `pnpm tsc --noEmit` (0 errors).
  * Automated E2E Testing: `pnpm test:e2e` (100% test pass).
  * Regression Prevention Rule: Mọi tính năng, màn hình giao diện, hoặc luồng xác thực mới bắt buộc phải đi kèm kiểm thử hồi quy tự động (Playwright E2E test specs). Tuyệt đối không bàn giao mã nguồn hoặc mở Pull Request khi chưa có kiểm thử tự động xanh.
  * CI Protection: Mọi Pull Request đều phải vượt qua toàn bộ các bước kiểm thử tự động trên GitHub Actions runner trước khi được phép merge vào `main`.