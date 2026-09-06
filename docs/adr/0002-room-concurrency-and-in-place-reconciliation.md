# ARCHITECTURE DECISION RECORD (ADR 0002)

# ADR 0002: HTTP Conditional Requests (RFC 9110 If-Match), Atomic Composite Mutation & In-Place Conflict Reconciliation for Room Module

* **Trạng thái:** PROPOSED
* **Ngày cập nhật:** 2026-09-06
* **Người đề xuất:** Đội Kỹ Thuật Frontend (FE Team)
* **Người phê duyệt:** Kỹ Sư Trưởng (User) & Software Architect (Gemini)
* **Phạm vi áp dụng:** Phân hệ Quản lý Phòng học (`edu-workshop-app/src/features/rooms`)

---

## 1. Bối Cảnh (Context)

Phân hệ `Room` (Phòng học & Cơ sở vật chất) là tài nguyên quản trị dùng chung giữa nhiều Quản trị viên (Admins / Facility Managers), tiềm ẩn rủi ro Ghi đè mất dữ liệu (Lost Update) nếu nhiều phiên chỉnh sửa cùng diễn ra đồng thời.

Tại commit `0e8bb42` (PR #93) trên Backend Staging (`100.83.71.112:8080`), kiến trúc Backend đã hoàn tất chuẩn hóa chuyển dịch toàn diện sang mô hình **HTTP Conditional Requests (RFC 9110 / RFC 7232)** và **Atomic Composite Mutation**, chính thức bãi bỏ mô hình DTO body versioning và granular micro-endpoints cũ:

1. **Bãi bỏ DTO Body Versioning (`expectedVersion`):** Backend không còn chấp nhận `expectedVersion` trong body JSON của mutation request.
2. **Chuẩn hóa HTTP Header `If-Match`:** Client bắt buộc truyền header `If-Match: "{version}"` (ví dụ: `If-Match: "0"`) cho các thao tác cập nhật trạng thái/dữ liệu phòng.
3. **Phân tách rạch ròi mã lỗi HTTP 412 và 409:**
   * **`HTTP 412 Precondition Failed`:** Kích nổ khi phiên bản `If-Match` không khớp với `version` hiện hành của phòng trong DB (ProblemDetail trả về `"code": "OPTIMISTIC_LOCK_FAILED"`). Đây là **trigger duy nhất** kích hoạt luồng hòa giải xung đột In-place Reconciliation.
   * **`HTTP 409 Conflict`:** Dành riêng cho vi phạm ràng buộc toàn vẹn dữ liệu nghiệp vụ (trùng tên phòng hoặc trùng mã phòng theo tọa độ tòa nhà/tầng). Lỗi này được map trực tiếp vào React Hook Form field errors (`setError`), tuyệt đối không kích hoạt banner hòa giải tương tranh.
   * **`HTTP 428 Precondition Required`:** Trả về nếu Client gửi request cập nhật mà thiếu header `If-Match`.
4. **Hợp nhất Endpoint Nguyên Tử (Atomic Composite Mutation):** Bãi bỏ 4 endpoint lẻ (`/rename`, `/relocate`, `/code`, `/capacity`). Thay thế bằng endpoint duy nhất: **`PUT /api/v1/rooms/{id}`** với payload đầy đủ 5 trường (`name`, `building`, `floor`, `code`, `capacity`), trả về **`HTTP 204 No Content`** khi thành công.

---

## 2. Quyết Định Kiến Trúc (Decisions)

### 2.1. Chuẩn Hóa HTTP Conditional Requests (`If-Match`) theo RFC 9110

* **Tuân thủ chuẩn HTTP:** Mọi request cập nhật phòng (`PUT /api/v1/rooms/{id}`, `POST /reactivate`, `POST /deactivate`, `POST /maintenance-schedules`) phải đính kèm header:
  ```http
  If-Match: "{version}"
  ```
  *(Ví dụ: Khi phòng có `version = 0`, header gửi đi là `If-Match: "0"`).*
* **Bảo vệ tính toàn vẹn:** Nếu Client quên gửi header `If-Match`, Backend trả về `HTTP 428 Precondition Required`. Client phải bắt lỗi này để cảnh báo dev/log lỗi.

### 2.2. Atomic Composite Mutation & Vai Trò Của `dirtyFields`

* **Chuyển dịch sang Single Composite Endpoint:**
  * Toàn bộ thao tác cập nhật hồ sơ phòng học được hợp nhất vào `PUT /api/v1/rooms/{id}` với payload:
    ```typescript
    export interface UpdateRoomProfileRequest {
      name: string;
      building: string;
      floor: number;
      code: number;
      capacity: number;
    }
    ```
  * Khi người dùng nhấn "Lưu Thay Đổi", Frontend luôn đóng gói đủ 5 trường của form để gửi lên server.
  * Phản hồi thành công là **`HTTP 204 No Content`**. Sau khi nhận `204`, Frontend thực hiện invalidate cache TanStack Query cho danh sách và chi tiết phòng học.
* **Tái định vị vai trò của `dirtyFields`:**
  * Thay vì dùng `dirtyFields` để phân nhánh gọi các micro-endpoints như trước, cơ chế `dirtyFields` của React Hook Form nay được **sử dụng thuần túy ở tầng UI/Presentation** để phục vụ việc so sánh, bóc tách khác biệt trong Ma trận 3 giá trị (`baseValue` vs `clientValue` vs `serverValue`).

### 2.3. Tái Định Nghĩa Ma Trận Xử Lý Lỗi (Error Matrix Separation)

Hệ thống xử lý lỗi tại tầng Data Client và Form Component được phân định nghiêm ngặt:

| Mã Lỗi HTTP | Ý Nghĩa Nghiệp Vụ | ProblemDetail Code | Hành Vi Xử Lý Ở Frontend |
| :--- | :--- | :--- | :--- |
| **`412 Precondition Failed`** | Xung đột phiên bản dữ liệu (Optimistic Lock Mismatch) | `OPTIMISTIC_LOCK_FAILED` | **Trigger In-Place Reconciliation**: Giữ nguyên form data, kích hoạt Silent Re-fetch `GET /api/v1/rooms/{id}`, hiển thị `ConflictBanner` màu hổ phách. |
| **`409 Conflict`** | Vi phạm tính duy nhất nghiệp vụ (Trùng tên hoặc mã phòng) | `DUPLICATE_ROOM_NAME` / `DUPLICATE_ROOM_CODE` / `RESOURCE_CONFLICT` | **Map Form Error**: Đẩy lỗi vào `setError("name" \| "code")` của React Hook Form, hiển thị inline dưới input field. **Tuyệt đối không kích hoạt ConflictBanner**. |
| **`428 Precondition Required`** | Thiếu header `If-Match` | `PRECONDITION_REQUIRED` | Báo lỗi hệ thống kỹ thuật qua Toast notification. |
| **`400 Bad Request`** | Vi phạm validation schema | `VALIDATION_FAILED` | Map lỗi vào các trường form qua `ProblemDetail.errors[]`. |

### 2.4. Mô Hình Hòa Giải Tại Chỗ (In-Place Reconciliation with 3-Value Matrix)

Khi nhận mã lỗi **`HTTP 412 Precondition Failed`**:

1. **Bảo Toàn Tuyệt Đối Trạng Thái Form:**
   * **Tuyệt đối không gọi `form.reset()`** và không reload trang.
   * Từng ký tự người dùng đang nhập dở trên form (`form.getValues()`) phải được bảo lưu nguyên vẹn 100%.

2. **Kéo Dữ Liệu Mới Trong Im Lặng (Silent Re-fetch):**
   * Trong catch block / `onError` của mutation khi status = `412`, kích hoạt ngầm `queryClient.fetchQuery` gọi `GET /api/v1/rooms/{id}` để kéo bản ghi `RoomDetailView` mới nhất từ Server.
   * Bóc tách `serverData.version` mới cùng toàn bộ giá trị trường hiện tại dưới cơ sở dữ liệu.

3. **Cơ Chế Theo Dõi 3 Trạng Thái Dữ Liệu (The 3-Value Matrix):**
   * **`baseValue`:** Giá trị ban đầu khi người dùng mở form (phiên bản gốc lúc bắt đầu sửa, tương ứng `baseVersion = 0`).
   * **`serverValue`:** Giá trị vừa fetch ngầm từ server về sau khi nhận mã 412 (phiên bản mới do người khác cập nhật, ví dụ `version = 1`).
   * **`clientValue`:** Giá trị người dùng hiện tại đang gõ dở trong ô input.

4. **Trực Quan Hóa Khác Biệt (Visual Inline Diff Banner):**
   * Hiển thị Banner cảnh báo màu hổ phách ngay trên Form:
     * **Đụng độ trực tiếp (Direct Collision):** Xảy ra khi trường người dùng sửa (`clientValue !== baseValue`) cũng vừa bị người khác thay đổi trên server (`serverValue !== baseValue`).  
       *Hiển thị:* `~~baseValue~~` $\rightarrow$ `serverValue` (Bạn đang nhập: `clientValue`).
     * **Đụng độ gián tiếp (Non-colliding Drift):** Xảy ra khi trường người dùng không sửa (`clientValue === baseValue`) nhưng trên server đã bị người khác đổi (`serverValue !== baseValue`).  
       *Hiển thị:* Thông báo rõ ràng trường nào vừa bị đổi ngầm (ví dụ: *"Sức chứa vừa được đổi thành 40 bởi người khác"*), đồng thời xác nhận trường người dùng đang sửa (ví dụ: Tên phòng) vẫn được giữ nguyên vẹn.

5. **Hai Hành Vi Hòa Giải Dứt Khoát:**
   * **[Hủy & Đồng bộ] (Discard & Sync):**
     * Thao tác Client-side thuần túy: Reset form về `serverData` mới nhất.
     * Xóa trạng thái dirty, đóng banner cảnh báo.
     * **Tuyệt đối không gửi bất kỳ mutation request nào lên server**.
   * **[Ghi đè bằng dữ liệu của tôi] (Force Overwrite):**
     * Giữ nguyên dữ liệu người dùng đang nhập dở.
     * Cập nhật `baseVersion = serverData.version`.
     * Gửi lại `PUT /api/v1/rooms/{id}` với toàn bộ 5 trường hiện tại kèm header `If-Match: "${serverData.version}"`.

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### 3.1. Điểm Tích Cực (Positive Impacts)
* **Chuẩn hóa quốc tế (RFC 9110 / RFC 7232):** Sử dụng đúng semantics của giao thức HTTP với `If-Match`, `412 Precondition Failed` và `428 Precondition Required`.
* **Phân tách trách nhiệm rành mạch:** Tách bạch 100% giữa lỗi tương tranh (412 $\rightarrow$ Conflict Reconciliation) và lỗi nghiệp vụ (409 $\rightarrow$ Validation Message).
* **Đơn giản hóa Data Layer:** Khai tử việc quản lý chuỗi gọi tuần tự phức tạp của 4 granular micro-endpoints, chuyển sang 1 atomic call `PUT /api/v1/rooms/{id}` nhận `204 No Content`.
* **Trải nghiệm người dùng thượng hạng:** Bảo toàn dữ liệu đang gõ dở, hiển thị diff rõ ràng giữa 3 mốc thời gian.

### 3.2. Điểm Đánh Đổi (Trade-offs)
* Vì gửi toàn bộ 5 trường trong `PUT /api/v1/rooms/{id}`, khi người dùng chọn "Ghi đè bằng dữ liệu của tôi", các trường không bị dirty trong form sẽ cần lấy dữ liệu mới từ `serverData` để tránh vô tình ghi đè giá trị cũ (`baseValue`) lên giá trị mà người khác vừa cập nhật (`serverValue`) đối với các trường trôi dạt (Non-colliding Drift).
  * *Nguyên tắc hòa giải:* Khi Force Overwrite, payload gửi đi sẽ merge:
    * Trường dirty: Lấy `clientValue` (dữ liệu người dùng muốn ép ghi đè).
    * Trường không dirty: Lấy `serverValue` mới nhất (tiếp thu thay đổi hợp lệ của người khác).
    * Header: `If-Match: "${serverData.version}"`.

---

## 4. Trạng Thái Phê Duyệt (Approval Status)
* Bản ADR này được cập nhật ở trạng thái `PROPOSED`, đệ trình lên Kỹ Sư Trưởng và Solution Architect để thẩm định song song với Bản Kế Hoạch Kỹ Thuật (Technical Implementation Plan).
