# ARCHITECTURE DECISION RECORD (ADR 0001)

# ADR 0001: Frontend Authentication Lifecycle, In-Memory Token Storage & Axios 401 Replay Queue

* **Trạng thái:** Accepted
* **Ngày quyết định:** 2026-08-29
* **Người phê duyệt:** Kỹ Sư Trưởng (User) & Software Architect (Gemini)
* **Phạm vi áp dụng:** `edu-workshop-app` (Frontend Core Architecture)

---

## 1. Bối Cảnh (Context)

Hệ thống Backend Staging (`edu-workshop-server` module IAM) triển khai kiến trúc bảo mật Stateless JWT với cơ chế **Pure JSON Bearer Token**:

1. **Endpoint Đăng nhập (`POST /api/v1/iam/auth/login`):** Trả về JSON Body `AuthTokenResponse` gồm `{ accessToken, refreshToken, expiresInSeconds, mustChangePassword }`. Không sử dụng HTTP Cookie (`Set-Cookie: HttpOnly`).
2. **Xác thực yêu cầu:** Mọi API nghiệp vụ yêu cầu header `Authorization: Bearer <accessToken>`. Thời hạn sống của `accessToken` là 15 phút.
3. **Cơ chế Refresh Token Rotation (RTR):** Endpoint `POST /api/v1/iam/auth/refresh` yêu cầu body `{ refreshToken }`. Backend xác thực hash SHA-256 trong DB, thu hồi token cũ và phát hành cặp token hoàn toàn mới. Nếu phát hiện token đã dùng bị gửi lại, toàn bộ chuỗi phiên đăng nhập bị hủy.
4. **Đăng xuất (`POST /api/v1/iam/auth/logout`):** Nhận `{ refreshToken }` trong body và thu hồi phiên trên DB.
5. **Định dạng lỗi:** Backend trả về mã lỗi và chi tiết theo chuẩn `RFC 7807 (ProblemDetail)`.

**Thách thức đặt ra cho Frontend:**

* Cần ngăn ngừa tối đa nguy cơ XSS khi Backend không cấp `HttpOnly Cookie`.
* Xử lý hiện tượng **Race Condition / Concurrent 401**: Khi `accessToken` hết hạn, nhiều request API chạy song song đồng thời trả về `401 Unauthorized`. Nếu gửi nhiều request refresh cùng lúc, cơ chế RTR của Backend sẽ nhận diện là Token Reuse Attack và khóa tài khoản.

---

## 2. Quyết Định Kiến Trúc (Decisions)

### 2.1. Phân Tách Lưu Trữ Token (Hybrid Storage Strategy)

* **`accessToken` (Short-lived):** Lưu hoàn toàn trong **In-Memory runtime variable** (thông qua State Store/Module Memory). Tuyệt đối không ghi `accessToken` vào `localStorage`, `sessionStorage`, hay JS Cookie.
* **`refreshToken` (Long-lived):** Lưu trữ tại `localStorage` dưới định danh `edu_refresh_token` để duy trì phiên làm việc qua các lần tải lại trang hoặc mở tab mới.

### 2.2. Axios 401 Replay Queue Interceptor (`src/shared/api/client.ts`)

Triển khai cơ chế Semaphore / Promise Queue chặn mọi race condition khi refresh:

1. **Request Interceptor:** Tự động lấy `accessToken` từ Memory gán vào header `Authorization: Bearer <token>`.
2. **Response Interceptor:**
* Khi bắt được lỗi HTTP `401 Unauthorized` và request chưa đánh dấu `_retry`:
* Đánh dấu `originalRequest._retry = true`.
* Nếu cờ `isRefreshing === true`: Đẩy callback resolve/reject của request vào mảng `failedQueue` và trả về `Promise` treo.
* Nếu cờ `isRefreshing === false`:
1. Đặt `isRefreshing = true`.
2. Lấy `refreshToken` từ storage gọi `POST /api/v1/iam/auth/refresh`.
3. Khi refresh thành công: Lưu `accessToken` mới vào Memory, lưu `refreshToken` mới vào storage. Duyệt `failedQueue` để giải phóng các request đang chờ với token mới, sau đó replay chính `originalRequest`.
4. Khi refresh thất bại: Reject toàn bộ `failedQueue`, dọn sạch storage & memory, điều hướng về `/_auth/login`.
5. Cuối cùng, reset `isRefreshing = false`.







### 2.3. Vòng Đời Khởi Tạo Ứng Dụng (App Bootstrap Silent Refresh)

Khi ứng dụng khởi động (F5 / tải trang lần đầu), `accessToken` trong Memory bị reset về `null`:

* Trước khi render route chính hoặc trong Router Loader ban đầu, ứng dụng kiểm tra sự tồn tại của `refreshToken` trong storage.
* Nếu có: Thực hiện Silent Refresh ngầm để nạp lại `accessToken` vào Memory và lấy profile user hiện tại (`GET /api/v1/iam/users/me`).
* Nếu không có hoặc thất bại: Xác lập trạng thái khách (Anonymous/Unauthenticated).

### 2.4. Phân Lớp Auth Guard Với TanStack Router

* **Router Context (`src/routes/__root.tsx`):** Truyền `auth: AuthContextType` và `queryClient` xuống toàn bộ cây route.
* **Public Route Layout (`src/routes/_auth.tsx`):** Dùng cho login, register. `beforeLoad` kiểm tra nếu `context.auth.isAuthenticated` thì tự động redirect về `/` (Dashboard).
* **Protected Route Layout (`src/routes/_authenticated.tsx`):** Bọc toàn bộ các trang nội bộ (`workshops`, `rooms`, `users`). `beforeLoad` kiểm tra nếu chưa xác thực thì ném lỗi chuyển hướng `throw redirect({ to: '/login', search: { redirect: location.href } })`.

### 2.5. Chuẩn Hóa Lỗi RFC 7807

Tất cả các response lỗi từ Backend được parse thành cấu trúc chuẩn:

```typescript
export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

```

Axios Client đảm bảo mọi rejection trả về đều chuẩn hóa đối tượng lỗi này để React Query và Form Validation (React Hook Form / Zod) tiêu thụ trực tiếp.

---

## 3. Hệ Quả (Consequences)

* **Ưu điểm:**
* Triệt tiêu hoàn toàn nguy cơ rò rỉ `accessToken` qua XSS.
* Tương thích 100% với cơ chế RTR nghiêm ngặt của Backend Staging, loại bỏ nguy cơ tài khoản bị khóa do gửi refresh đồng thời.
* Phân tách ranh giới rõ ràng: Router chỉ quản lý điều hướng, Axios Interceptor quản lý token refresh, Feature Store quản lý state người dùng.


* **Nhược điểm & Đánh đổi:**
* Mỗi lần tải lại trang (Hard Refresh) cần tốn 1 round-trip Silent Refresh API trước khi ứng dụng vào trạng thái Authenticated đầy đủ. Cần có UI Skeleton/Splash Screen nhẹ để tránh hiện tượng màn hình nhấp nháy (FOUC).