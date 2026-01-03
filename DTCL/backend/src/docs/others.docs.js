/**
 * @swagger
 * /shopping/list:
 *   get:
 *     summary: Lấy danh sách shopping lists
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách shopping lists
 *
 *   post:
 *     summary: Tạo shopping list cho ngày
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Tạo thành công
 *
 *   delete:
 *     summary: Xóa shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *             properties:
 *               listId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *
 * /shopping/task/{listId}:
 *   get:
 *     summary: Lấy danh sách tasks trong shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách tasks
 *
 * /shopping/task:
 *   post:
 *     summary: Thêm task vào shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - foodName
 *             properties:
 *               listId:
 *                 type: string
 *               foodName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               assignedTo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 *
 *   put:
 *     summary: Cập nhật task
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *               newFoodName:
 *                 type: string
 *               newQuantity:
 *                 type: number
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     summary: Xóa task
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *
 * /meal-plan:
 *   get:
 *     summary: Lấy kế hoạch bữa ăn
 *     tags: [MealPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày
 *     responses:
 *       200:
 *         description: Danh sách meal plans
 *
 *   post:
 *     summary: Tạo kế hoạch bữa ăn
 *     tags: [MealPlan]
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
 *               - timestamp
 *               - name
 *             properties:
 *               foodName:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               name:
 *                 type: string
 *                 enum: [sáng, trưa, tối]
 *     responses:
 *       201:
 *         description: Tạo thành công
 *
 *   put:
 *     summary: Cập nhật kế hoạch bữa ăn
 *     tags: [MealPlan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *               newFoodName:
 *                 type: string
 *               newTimestamp:
 *                 type: string
 *                 format: date-time
 *               newName:
 *                 type: string
 *                 enum: [sáng, trưa, tối]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     summary: Xóa kế hoạch bữa ăn
 *     tags: [MealPlan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *
 * /recipe:
 *   get:
 *     summary: Lấy danh sách công thức
 *     tags: [Recipe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: foodId
 *         schema:
 *           type: string
 *         description: Lọc theo food ID
 *     responses:
 *       200:
 *         description: Danh sách công thức
 *
 *   post:
 *     summary: Tạo công thức mới
 *     tags: [Recipe]
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
 *               - name
 *             properties:
 *               foodName:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               htmlContent:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 *
 *   put:
 *     summary: Cập nhật công thức
 *     tags: [Recipe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - recipeId
 *             properties:
 *               recipeId:
 *                 type: string
 *               newFoodName:
 *                 type: string
 *               newName:
 *                 type: string
 *               newDescription:
 *                 type: string
 *               newHtmlContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     summary: Xóa công thức
 *     tags: [Recipe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - recipeId
 *             properties:
 *               recipeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
