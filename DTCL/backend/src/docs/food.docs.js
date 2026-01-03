/**
 * @swagger
 * /food:
 *   get:
 *     summary: Lấy danh sách thực phẩm trong nhóm
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thực phẩm
 *
 *   post:
 *     summary: Tạo thực phẩm mới
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - foodCategoryName
 *               - unitName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Thịt heo
 *               foodCategoryName:
 *                 type: string
 *                 example: Thịt
 *               unitName:
 *                 type: string
 *                 example: kg
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo thành công
 *
 *   put:
 *     summary: Cập nhật thực phẩm
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               newName:
 *                 type: string
 *               newCategory:
 *                 type: string
 *               newUnit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     summary: Xóa thực phẩm
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *
 * /fridge:
 *   get:
 *     summary: Lấy danh sách thực phẩm trong tủ lạnh
 *     tags: [Fridge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách trong tủ lạnh
 *
 *   post:
 *     summary: Thêm thực phẩm vào tủ lạnh
 *     tags: [Fridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - foodName
 *             properties:
 *               foodName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               useWithin:
 *                 type: number
 *                 description: Số ngày trước khi hết hạn
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 *
 *   put:
 *     summary: Cập nhật thực phẩm trong tủ lạnh
 *     tags: [Fridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *               newQuantity:
 *                 type: number
 *               newNote:
 *                 type: string
 *               newUseWithin:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     summary: Xóa thực phẩm khỏi tủ lạnh
 *     tags: [Fridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
