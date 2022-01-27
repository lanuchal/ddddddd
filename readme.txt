get "/product" แสดง product ทั้งหมด

get "/producttype" แสดง product type

get "/producthome" แสดง product ตามเกรด user
get "/productcate/:id" แสดง product ตาม type

post "/login" เช็คการ login
{
    "user_username": 157,
    "user_password":  "1234"
}

post "/register" สมัครวมาชิก
{
    "name": 157,
    "user_username": 157,
    "user_password":  "1234"
    addr"12345" ;
}

get "/user/:id" แสดงข้อมูล user 

put "/updatepass" แก้ไขรหัสผ่าน user
{
    "id": 157,
    "old_password":  "1234"
    "new_password":  "12345" ;
}

post "/upload1" อัปโหลดรูป img1 ( รูปที่อยู่ 1 )
{
    "id": 157,
    "profile1":  ไฟล์
}

post "/upload2" อัปโหลดรูป img 2 ( รูปที่อยู่ 2 )
{
    "id": 157,
    "profile2":  ไฟล์
}

put "/updateuser"   แก้ไข้ข้อมูล user
{
    "id": 157,
    "name": "aaa",
    "addr": "bbb",
    "user_tel": "ccc",
    "addr_lat": "ddd",
    "addr_long": "eee"
}

post "/select-product" เลือกสินค้า
{
    "id": 157,
    "product_id": 4,
    "price_id": 2,
    "pro_req_amount": 3
}

get "/order/:id" ดูรายการสินค้า

put "/submitorder" ยืนยันเลือกสินค้า
{
    "bill_id": 157
}

put "/upamountproduct"  อัปเดตจำนวนสินค้า
{
    "product_id": 1,
    "product_amount": 2
}
delete "/deleteoder/:id(pro_req_id)" ลบออเดอร์ตามรายการ

delete "/deletebill/:id(bill_id)" ลบออเดอร์ตามรายการ


/// แสดงสินตาม gread 
SELECT * FROM `product_price` WHERE product_id = 2576 ORDER BY price_id DESC LIMIT 0,1

SELECT a.* , product.product_name,product.product_amount FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id WHERE product.product_id IS NOT NULL GROUP BY a.product_id

SELECT a.* , product.product_name,product.product_amount,product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id WHERE product.product_id IS NOT NULL GROUP BY a.price_date

SELECT a.* ,product_category.cate_id,product_category.cate_name, product.product_name,product.product_amount,product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id LEFT JOIN `product_category` ON product.product_cate = product_category.cate_id WHERE product.product_id IS NOT NULL  GROUP BY a.price_date

SELECT a.* ,product_category.cate_id,product_category.cate_name, product.product_name,product.product_amount,product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id LEFT JOIN `product_category` ON product.product_cate = product_category.cate_id WHERE product_category.cate_id = 1  GROUP BY a.price_date