# Inventory & Product Enhancements

## 3. Quản Lý Kho Hàng & Sản Phẩm Nâng Cao (Inventory & Product Enhancements)

### 3.1. Kiểm Soát Số Lượng Tồn Kho (Inventory Management)

#### Mục tiêu

Xây dựng hệ thống quản lý tồn kho nhằm đảm bảo số lượng sản phẩm luôn được cập nhật chính xác sau mỗi giao dịch, đồng thời ngăn người dùng đặt mua các sản phẩm đã hết hàng.

---

### Chức năng

#### 1. Thêm số lượng tồn kho cho sản phẩm

Bổ sung thuộc tính `stockQuantity` vào bảng `Product`.

Ví dụ:

| Thuộc tính    | Kiểu dữ liệu | Mô tả            |
| ------------- | ------------ | ---------------- |
| id            | Long         | Mã sản phẩm      |
| name          | String       | Tên sản phẩm     |
| price         | Double       | Giá bán          |
| description   | String       | Mô tả            |
| stockQuantity | Integer      | Số lượng tồn kho |

---

#### 2. Tự động cập nhật tồn kho sau khi thanh toán

Sau khi đơn hàng được thanh toán thành công:

* Kiểm tra số lượng tồn kho của từng sản phẩm.
* Nếu tồn kho đủ:

  * Trừ số lượng tương ứng.
  * Cập nhật lại dữ liệu trong cơ sở dữ liệu.
* Nếu không đủ:

  * Hủy quá trình thanh toán.
  * Trả về thông báo lỗi cho người dùng.

Ví dụ:

```text
Sản phẩm A:
Tồn kho: 15

Khách mua: 3

↓

Tồn kho còn lại: 12
```

---

#### 3. Kiểm tra tồn kho khi thêm vào giỏ hàng

Trước khi thêm sản phẩm vào giỏ hàng:

* Kiểm tra `stockQuantity`.
* Nếu bằng 0:

  * Không cho phép thêm vào giỏ hàng.
  * Hiển thị thông báo:

```text
Out of Stock
```

hoặc

```text
Sản phẩm hiện đã hết hàng.
```

---

#### 4. Hiển thị trạng thái sản phẩm

Frontend cần hiển thị trạng thái theo số lượng tồn kho.

| Điều kiện         | Hiển thị     |
| ----------------- | ------------ |
| stockQuantity > 0 | In Stock     |
| stockQuantity = 0 | Out of Stock |

Nếu hết hàng:

* Disable nút **Add to Cart**
* Hiển thị nhãn màu đỏ **Out of Stock**

---

## 3.2. Phân Trang, Tìm Kiếm & Lọc Nâng Cao (Pagination, Search & Filter)

### Mục tiêu

Tối ưu hiệu năng khi số lượng sản phẩm lớn và giúp người dùng dễ dàng tìm kiếm sản phẩm mong muốn.

---

### 1. Phân trang (Pagination)

Sử dụng `Pageable` của Spring Data JPA.

Ví dụ:

```http
GET /api/products?page=0&size=10
```

Trong đó:

* page: số trang
* size: số sản phẩm mỗi trang

Response:

```json
{
  "content": [],
  "totalPages": 12,
  "totalElements": 118,
  "currentPage": 0
}
```

---

### 2. Tìm kiếm sản phẩm

Cho phép tìm kiếm theo:

* Tên sản phẩm
* Mô tả sản phẩm

Sử dụng:

* SQL LIKE
* Hoặc Hibernate Search

Ví dụ:

```http
GET /api/products/search?keyword=iphone
```

Kết quả:

```text
iPhone 13
iPhone 14
iPhone 15
```

---

### 3. Bộ lọc theo khoảng giá

Cho phép lọc:

```text
100 - 300

300 - 500

500+
```

API:

```http
GET /api/products?minPrice=100&maxPrice=300
```

---

### 4. Bộ lọc theo đánh giá

Cho phép hiển thị:

* 5 sao
* 4 sao trở lên
* 3 sao trở lên

Ví dụ:

```http
GET /api/products?rating=4
```

---

### 5. Sắp xếp sản phẩm

Hỗ trợ:

* Giá tăng dần
* Giá giảm dần
* Mới nhất
* Đánh giá cao nhất

Ví dụ:

```http
GET /api/products?sort=price,asc
```

hoặc

```http
GET /api/products?sort=createdAt,desc
```

---

## 3.3. Đánh Giá & Nhận Xét Sản Phẩm (Product Reviews & Ratings)

### Mục tiêu

Cho phép khách hàng chia sẻ trải nghiệm sau khi mua hàng, đồng thời tăng độ tin cậy của sản phẩm thông qua hệ thống đánh giá.

---

### Chức năng

#### 1. Chỉ khách đã mua mới được đánh giá

Điều kiện:

* Đã đăng nhập.
* Đã mua sản phẩm.
* Đơn hàng ở trạng thái Completed.

Nếu chưa mua:

```text
Bạn cần mua sản phẩm trước khi đánh giá.
```

---

#### 2. Gửi đánh giá

Khách hàng có thể gửi:

* Điểm đánh giá từ 1 đến 5 sao.
* Nội dung nhận xét.
* Hình ảnh thực tế.

Ví dụ:

```text
★★★★★

"Sản phẩm đúng mô tả, giao hàng nhanh."
```

---

### Cấu trúc Review

| Thuộc tính | Kiểu dữ liệu  |
| ---------- | ------------- |
| id         | Long          |
| productId  | Long          |
| userId     | Long          |
| rating     | Integer       |
| comment    | String        |
| imageUrl   | String        |
| createdAt  | LocalDateTime |

---

#### 3. Hiển thị đánh giá

Trang chi tiết sản phẩm hiển thị:

* Điểm trung bình
* Tổng số lượt đánh giá
* Danh sách bình luận
* Hình ảnh do khách hàng đăng

Ví dụ:

```text
⭐ 4.8 (356 Reviews)

★★★★★

"Sản phẩm rất tốt."

★★★★★

"Giao hàng nhanh."

★★★★☆

"Đóng gói đẹp."
```

---

#### 4. Tự động cập nhật điểm đánh giá

Sau mỗi lần thêm hoặc chỉnh sửa đánh giá:

Backend sẽ tự động tính lại:

* Rating trung bình (`rating`)
* Tổng số lượt đánh giá (`reviewCount`)

Ví dụ:

```text
Review 1: 5

Review 2: 4

Review 3: 5

↓

Rating = 4.67

Review Count = 3
```

Thông tin này sẽ được lưu trực tiếp trong bảng `Product` để tối ưu hiệu năng khi hiển thị danh sách sản phẩm.

---

## Kết quả mong đợi

Sau khi hoàn thành module **Inventory & Product Enhancements**, hệ thống sẽ đáp ứng các chức năng sau:

* Quản lý chính xác số lượng tồn kho của từng sản phẩm.
* Tự động cập nhật tồn kho sau khi thanh toán thành công.
* Ngăn người dùng mua hoặc thêm vào giỏ hàng các sản phẩm đã hết hàng.
* Hỗ trợ phân trang giúp tối ưu hiệu năng khi số lượng sản phẩm lớn.
* Cho phép tìm kiếm sản phẩm theo tên hoặc mô tả.
* Hỗ trợ lọc sản phẩm theo khoảng giá, đánh giá trung bình và sắp xếp theo nhiều tiêu chí.
* Cho phép khách hàng đã mua sản phẩm gửi đánh giá, nhận xét và hình ảnh thực tế.
* Tự động tính toán điểm đánh giá trung bình và số lượng đánh giá để hiển thị trên trang danh sách và trang chi tiết sản phẩm.
